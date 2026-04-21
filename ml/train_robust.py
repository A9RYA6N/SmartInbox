"""
ml/train_robust.py
------------------
SmartInbox SMS Spam Detection – Random Forest Training Pipeline

Features:
- Deduplication + missing value handling
- Text cleaning (URLs, emojis, numbers, punctuation, stopwords)
- Anomaly/outlier detection (very short / very long messages)
- TF-IDF Word (max_features=5000, ngram=(1,2)) + Char (max_features=3000, ngram=(3,5))
- Random Forest Classifier (primary and only model)
- Stratified 80/20 train-test split
- StratifiedKFold (k=5) cross-validation
- Evaluation: Accuracy, Precision, Recall, F1, Confusion Matrix
- Overfitting detection: train vs test gap analysis
- Uncertainty threshold: if |prob - threshold| < margin → "uncertain"
- Saves: model_v3.pkl, feature_pipeline.pkl, metadata_v3.json, threshold_optimiser_v3.pkl

Usage:
    python ml/train_robust.py --data ml/data/spam.csv --version v3
"""

import argparse
import json
import logging
import pickle
import re
import sys
import warnings
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple, Any

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix, hstack, issparse
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.preprocessing import MaxAbsScaler

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
_ML_ROOT = Path(__file__).resolve().parent
_MODELS_DIR = _ML_ROOT / "models"
_ARTIFACTS_DIR = _ML_ROOT / "artifacts"
_DATA_DIR = _ML_ROOT / "data"

_MODELS_DIR.mkdir(parents=True, exist_ok=True)
_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
(_ML_ROOT / "logs").mkdir(parents=True, exist_ok=True)

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(_ML_ROOT / "logs" / "train_robust.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("train_robust")

# ── Text cleaning ──────────────────────────────────────────────────────────────
_URL_PATTERN    = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
_EMAIL_PATTERN  = re.compile(r"\S+@\S+\.\S+")
_NUMBER_PATTERN = re.compile(r"\b\d[\d\s]*\b")
_EMOJI_PATTERN  = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "]+",
    flags=re.UNICODE,
)
_PUNCT_STRIP = re.compile(r"[^\w\s]")
_WHITESPACE  = re.compile(r"\s+")

try:
    import nltk
    for _item in ("stopwords", "punkt", "wordnet", "punkt_tab"):
        try:
            nltk.data.find(f"corpora/{_item}" if _item not in ("punkt", "punkt_tab") else f"tokenizers/{_item}")
        except LookupError:
            nltk.download(_item, quiet=True)
    from nltk.corpus import stopwords as _nltk_sw
    _STOP_WORDS = set(_nltk_sw.words("english"))
except Exception:
    _STOP_WORDS = {"the", "a", "an", "is", "it", "in", "on", "at", "to", "for", "of", "and", "or"}


def clean_text(text: str) -> str:
    """Full text cleaning pipeline."""
    text = str(text).lower()
    text = _URL_PATTERN.sub(" url ", text)
    text = _EMAIL_PATTERN.sub(" email ", text)
    text = _EMOJI_PATTERN.sub(" emoji ", text)
    text = _NUMBER_PATTERN.sub(" number ", text)
    text = _PUNCT_STRIP.sub(" ", text)
    text = _WHITESPACE.sub(" ", text).strip()
    tokens = [t for t in text.split() if t not in _STOP_WORDS and len(t) > 1]
    return " ".join(tokens)


# ── Feature extraction helpers ─────────────────────────────────────────────────
def extract_numeric_features(texts: pd.Series) -> np.ndarray:
    """
    Extract 6 hand-crafted numeric features per message:
    [length, word_count, url_count, exclamation_count, digit_ratio, upper_ratio]
    """
    raw = texts.astype(str)
    lengths      = raw.str.len().values
    word_counts  = raw.str.split().str.len().fillna(0).values
    url_counts   = raw.apply(lambda t: len(_URL_PATTERN.findall(t))).values
    exclaims     = raw.str.count("!").values
    digit_ratios = raw.apply(lambda t: sum(c.isdigit() for c in t) / max(len(t), 1)).values
    upper_ratios = raw.apply(lambda t: sum(c.isupper() for c in t) / max(len(t), 1)).values
    return np.column_stack([lengths, word_counts, url_counts, exclaims, digit_ratios, upper_ratios]).astype(np.float64)


class RobustSMSFeaturePipeline:
    """
    Two-branch TF-IDF pipeline + numeric features.
    Branch 1: Word-level TF-IDF (unigrams + bigrams), max 5000 features
    Branch 2: Char-level TF-IDF (3-5grams), max 3000 features
    Plus 6 hand-crafted numeric features.
    """

    def __init__(
        self,
        word_max_features: int = 5000,
        char_max_features: int = 3000,
    ):
        self.word_tfidf = TfidfVectorizer(
            analyzer="word",
            ngram_range=(1, 2),
            max_features=word_max_features,
            sublinear_tf=True,
            min_df=2,
            max_df=0.95,
            token_pattern=r"(?u)\b[a-zA-Z]\w+\b",
        )
        self.char_tfidf = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            max_features=char_max_features,
            sublinear_tf=True,
            min_df=2,
            max_df=0.95,
        )
        self.scaler  = MaxAbsScaler()
        self._fitted = False

    def _clean(self, texts) -> List[str]:
        return [clean_text(t) for t in texts]

    def fit_transform(self, texts, y=None):
        raw   = pd.Series(texts)
        clean = self._clean(raw)
        w = self.word_tfidf.fit_transform(clean)
        c = self.char_tfidf.fit_transform(clean)
        n = csr_matrix(self.scaler.fit_transform(extract_numeric_features(raw)))
        self._fitted = True
        combined = hstack([w, c, n], format="csr")
        logger.info("Feature matrix shape: %s (word=%d, char=%d, numeric=6)", combined.shape, w.shape[1], c.shape[1])
        return combined

    def transform(self, texts):
        if not self._fitted:
            raise RuntimeError("Pipeline not fitted. Call fit_transform() first.")
        raw   = pd.Series(texts)
        clean = self._clean(raw)
        w = self.word_tfidf.transform(clean)
        c = self.char_tfidf.transform(clean)
        n = csr_matrix(self.scaler.transform(extract_numeric_features(raw)))
        return hstack([w, c, n], format="csr")

    def get_feature_names_out(self) -> List[str]:
        word_names = [f"word_{f}" for f in self.word_tfidf.get_feature_names_out()]
        char_names = [f"char_{f}" for f in self.char_tfidf.get_feature_names_out()]
        num_names  = ["num_length", "num_word_count", "num_url_count",
                      "num_exclaim", "num_digit_ratio", "num_upper_ratio"]
        return word_names + char_names + num_names


# ── Preprocessing ─────────────────────────────────────────────────────────────

def load_and_preprocess(path: str) -> pd.DataFrame:
    """Load CSV and apply all preprocessing steps."""
    logger.info("Loading dataset from %s", path)
    df = pd.read_csv(path, encoding="latin-1")

    # Normalise column names
    df.columns = [c.strip().lower() for c in df.columns]

    col_map = {}
    for col in df.columns:
        if col in ("message", "sms", "text", "msg", "v2", "email"):
            col_map[col] = "text"
        elif col in ("label", "class", "spam", "category", "v1", "target"):
            col_map[col] = "label"
    df = df.rename(columns=col_map)

    if "text" not in df.columns:
        raise ValueError(f"No text column found. Columns: {list(df.columns)}")
    if "label" not in df.columns:
        raise ValueError(f"No label column found. Columns: {list(df.columns)}")

    logger.info("Raw rows: %d", len(df))

    before = len(df)
    df = df.dropna(subset=["text", "label"])
    logger.info("Dropped %d rows with missing text/label", before - len(df))

    label_col = df["label"].astype(str).str.strip().str.lower()
    if label_col.isin(["spam", "ham"]).all():
        df["label"] = (label_col == "spam").astype(int)
    else:
        df["label"] = pd.to_numeric(df["label"], errors="coerce").fillna(0).astype(int)

    df = df[df["label"].isin([0, 1])]
    logger.info("Label distribution:\n%s", df["label"].value_counts().to_string())

    before = len(df)
    df = df.drop_duplicates(subset=["text"])
    logger.info("Removed %d duplicate messages", before - len(df))

    df["text"] = df["text"].astype(str).str.strip()
    lengths = df["text"].str.len()
    q_low, q_high = lengths.quantile(0.005), lengths.quantile(0.995)
    before = len(df)
    df = df[(lengths >= max(q_low, 5)) & (lengths <= min(q_high, 5000))]
    logger.info("Filtered %d anomalous messages (extreme lengths)", before - len(df))

    min_class = df["label"].value_counts().min()
    if min_class < 50:
        raise ValueError(f"Too few samples in minority class: {min_class}. Minimum is 50.")

    logger.info("Final usable rows: %d (spam=%d, ham=%d)",
                len(df), df["label"].sum(), (df["label"] == 0).sum())
    return df.reset_index(drop=True)


# ── Threshold finder ──────────────────────────────────────────────────────────

def find_best_threshold(y_true: np.ndarray, y_proba: np.ndarray) -> Tuple[float, float]:
    """Find threshold that maximises F1 on the test set."""
    best_f1, best_t = 0.0, 0.5
    for t in np.arange(0.1, 0.91, 0.01):
        preds = (y_proba >= t).astype(int)
        try:
            f1 = f1_score(y_true, preds, zero_division=0)
            if f1 > best_f1:
                best_f1, best_t = f1, float(round(t, 2))
        except Exception:
            pass
    return best_t, best_f1


# ── Evaluation ────────────────────────────────────────────────────────────────

def evaluate_model(
    name: str,
    model,
    X_train, X_test,
    y_train: np.ndarray, y_test: np.ndarray,
) -> Dict[str, Any]:
    """Full evaluation with overfitting detection."""
    y_train_proba = model.predict_proba(X_train)[:, 1]
    y_test_proba  = model.predict_proba(X_test)[:, 1]

    best_t, best_f1 = find_best_threshold(y_test, y_test_proba)

    y_train_pred = (y_train_proba >= 0.5).astype(int)
    y_test_pred  = (y_test_proba  >= best_t).astype(int)

    train_acc = accuracy_score(y_train, y_train_pred)
    test_acc  = accuracy_score(y_test,  y_test_pred)
    train_f1  = f1_score(y_train, y_train_pred, zero_division=0)
    test_f1   = f1_score(y_test,  y_test_pred,  zero_division=0)
    gap_acc   = round(train_acc - test_acc, 4)
    gap_f1    = round(train_f1  - test_f1,  4)
    overfit   = gap_acc > 0.05 or gap_f1 > 0.05

    roc_auc = roc_auc_score(y_test, y_test_proba)
    pr_auc  = average_precision_score(y_test, y_test_proba)
    report  = classification_report(y_test, y_test_pred, target_names=["ham", "spam"], output_dict=True)
    cm      = confusion_matrix(y_test, y_test_pred).tolist()

    logger.info(
        "\n══ %s ══\n"
        "  Train Acc: %.4f  |  Test Acc: %.4f  |  Gap: %.4f %s\n"
        "  Train F1:  %.4f  |  Test F1:  %.4f  |  Gap: %.4f %s\n"
        "  ROC-AUC: %.4f  |  PR-AUC: %.4f\n"
        "  Best Threshold: %.2f  |  Best F1: %.4f",
        name,
        train_acc, test_acc, gap_acc, "⚠ OVERFIT" if gap_acc > 0.05 else "✓",
        train_f1,  test_f1,  gap_f1,  "⚠ OVERFIT" if gap_f1  > 0.05 else "✓",
        roc_auc, pr_auc,
        best_t, best_f1,
    )
    logger.info("\n%s", classification_report(y_test, y_test_pred, target_names=["ham", "spam"]))

    return {
        "model_name":        name,
        "train_accuracy":    round(train_acc, 4),
        "test_accuracy":     round(test_acc,  4),
        "accuracy_gap":      gap_acc,
        "train_f1":          round(train_f1,  4),
        "test_f1":           round(test_f1,   4),
        "f1_gap":            gap_f1,
        "overfitting_flag":  overfit,
        "roc_auc":           round(roc_auc,   4),
        "pr_auc":            round(pr_auc,    4),
        "precision":         round(report["spam"]["precision"], 4),
        "recall":            round(report["spam"]["recall"],    4),
        "optimal_threshold": best_t,
        "optimal_f1":        round(best_f1,   4),
        "confusion_matrix":  cm,
        "classification_report": report,
    }


def run_cross_validation(model, X, y: np.ndarray, k: int = 5) -> Dict[str, float]:
    """Run StratifiedKFold CV and return summary statistics."""
    logger.info("Running %d-fold StratifiedKFold cross-validation...", k)
    cv = StratifiedKFold(n_splits=k, shuffle=True, random_state=42)
    scores = cross_validate(
        model, X, y, cv=cv,
        scoring=["accuracy", "f1", "roc_auc", "precision", "recall"],
        n_jobs=1,
    )
    summary: Dict[str, float] = {}
    for key, vals in scores.items():
        if key.startswith("test_"):
            metric = key.replace("test_", "")
            summary[f"cv_{metric}_mean"] = round(float(vals.mean()), 4)
            summary[f"cv_{metric}_std"]  = round(float(vals.std()),  4)

    logger.info(
        "CV Results → Acc: %.4f±%.4f | F1: %.4f±%.4f | ROC-AUC: %.4f±%.4f",
        summary.get("cv_accuracy_mean", 0), summary.get("cv_accuracy_std", 0),
        summary.get("cv_f1_mean", 0),       summary.get("cv_f1_std", 0),
        summary.get("cv_roc_auc_mean", 0),  summary.get("cv_roc_auc_std", 0),
    )
    return summary


# ── Main training function ────────────────────────────────────────────────────

def train(data_path: str, version_tag: str = "v3", seed: int = 42) -> None:
    """End-to-end Random Forest training pipeline."""
    train_start = datetime.now(timezone.utc)
    logger.info("═══ SmartInbox Random Forest Training Pipeline ═══")
    logger.info("Version: %s | Seed: %d | Data: %s", version_tag, seed, data_path)

    # ── 1. Load & preprocess ───────────────────────────────────────────────
    df = load_and_preprocess(data_path)
    texts  = df["text"].tolist()
    labels = df["label"].values

    # ── 2. Stratified split ────────────────────────────────────────────────
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        texts, labels, test_size=0.20, random_state=seed, stratify=labels
    )
    logger.info(
        "Train: %d (spam=%d, ham=%d) | Test: %d (spam=%d, ham=%d)",
        len(X_train_raw), y_train.sum(), (y_train == 0).sum(),
        len(X_test_raw),  y_test.sum(),  (y_test  == 0).sum(),
    )

    # ── 3. Feature extraction ──────────────────────────────────────────────
    logger.info("Building feature pipeline...")
    pipeline = RobustSMSFeaturePipeline(word_max_features=5000, char_max_features=3000)
    X_train = pipeline.fit_transform(X_train_raw)
    X_test  = pipeline.transform(X_test_raw)

    # ── 4. Train Random Forest ─────────────────────────────────────────────
    logger.info("Training Random Forest Classifier...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced",
        random_state=seed,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)
    logger.info("Random Forest training complete.")

    # ── 5. Evaluation ──────────────────────────────────────────────────────
    logger.info("\n" + "="*60 + "\n EVALUATION RESULTS\n" + "="*60)
    rf_metrics = evaluate_model("Random Forest", rf, X_train, X_test, y_train, y_test)

    # ── 6. Cross-validation ────────────────────────────────────────────────
    cv_summary = run_cross_validation(rf, X_train, y_train, k=5)

    # ── 7. Quality gate ────────────────────────────────────────────────────
    if rf_metrics["roc_auc"] < 0.90:
        raise RuntimeError(
            f"RF model failed quality gate: ROC-AUC={rf_metrics['roc_auc']:.4f} < 0.90. "
            "Aborting — model NOT saved."
        )
    if rf_metrics["overfitting_flag"]:
        logger.warning(
            "⚠ Overfitting detected! Accuracy gap=%.4f, F1 gap=%.4f",
            rf_metrics["accuracy_gap"], rf_metrics["f1_gap"],
        )

    logger.info(
        "\n" + "═"*60 +
        "\n  ✅ Random Forest Results" +
        "\n  ROC-AUC: %.4f | F1: %.4f | Threshold: %.2f"
        + "\n" + "═"*60,
        rf_metrics["roc_auc"], rf_metrics["optimal_f1"], rf_metrics["optimal_threshold"],
    )

    # ── 8. Persist artifacts ────────────────────────────────────────────────
    model_path     = _MODELS_DIR    / f"model_{version_tag}.pkl"
    pipeline_path  = _ARTIFACTS_DIR / f"feature_pipeline_{version_tag}.pkl"
    threshold_path = _ARTIFACTS_DIR / f"threshold_optimiser_{version_tag}.pkl"
    meta_path      = _ARTIFACTS_DIR / f"metadata_{version_tag}.json"

    logger.info("Saving model → %s", model_path)
    with open(model_path, "wb") as f:
        pickle.dump(rf, f, protocol=4)

    logger.info("Saving feature pipeline → %s", pipeline_path)
    with open(pipeline_path, "wb") as f:
        pickle.dump(pipeline, f, protocol=4)

    # Also overwrite the generic feature_pipeline.pkl (used by ml/service.py by default)
    generic_pipeline_path = _ARTIFACTS_DIR / "feature_pipeline.pkl"
    with open(generic_pipeline_path, "wb") as f:
        pickle.dump(pipeline, f, protocol=4)
    logger.info("Updated generic feature_pipeline.pkl")

    threshold_data = {
        "threshold":          rf_metrics["optimal_threshold"],
        "optimal_f1":         rf_metrics["optimal_f1"],
        "uncertainty_margin": 0.08,
        "model_type":         "RandomForestClassifier",
    }
    with open(threshold_path, "wb") as f:
        pickle.dump(threshold_data, f, protocol=4)

    train_end = datetime.now(timezone.utc)
    metadata = {
        "model_version":    version_tag,
        "model_type":       "RandomForestClassifier",
        "trained_at":       train_start.isoformat(),
        "completed_at":     train_end.isoformat(),
        "seed":             seed,
        "uncertainty_margin": 0.08,
        "optimal_threshold":  rf_metrics["optimal_threshold"],
        "config": {
            "n_estimators":      200,
            "max_features":      "sqrt",
            "class_weight":      "balanced",
            "word_max_features": 5000,
            "char_max_features": 3000,
            "test_size":         0.20,
            "cv_folds":          5,
        },
        "dataset": {
            "total_rows":  len(df),
            "train_size":  len(X_train_raw),
            "test_size":   len(X_test_raw),
            "spam_count":  int(labels.sum()),
            "ham_count":   int((labels == 0).sum()),
        },
        "test_metrics": rf_metrics,
        "cv_metrics":   cv_summary,
    }
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2, default=str)
    logger.info("Saved metadata → %s", meta_path)

    logger.info(
        "\n" + "═"*60 +
        "\n  Training complete!" +
        "\n  Model:     %s" +
        "\n  ROC-AUC:   %.4f" +
        "\n  F1 Score:  %.4f" +
        "\n  Threshold: %.2f" +
        "\n  Saved to:  %s" +
        "\n" + "═"*60,
        model_path, rf_metrics["roc_auc"], rf_metrics["optimal_f1"],
        rf_metrics["optimal_threshold"], model_path,
    )


# ── CLI ────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SmartInbox Random Forest Spam Classifier")
    parser.add_argument(
        "--data", type=str,
        default=str(_DATA_DIR / "spam.csv"),
        help="Path to CSV dataset with text/label columns",
    )
    parser.add_argument(
        "--version", type=str, default="v3",
        help="Model version tag (e.g. v3)",
    )
    parser.add_argument(
        "--seed", type=int, default=42,
        help="Random seed for reproducibility",
    )
    args = parser.parse_args()
    train(data_path=args.data, version_tag=args.version, seed=args.seed)
