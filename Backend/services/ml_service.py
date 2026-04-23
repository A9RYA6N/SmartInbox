"""
app/services/ml_service.py
--------------------------
Thin adapter that bridges the FastAPI app with the ML-layer
SpamDetectorService.

The SpamDetectorService lives in ml/service.py and is completely
framework-agnostic. This module:
  • Adds ml/ to sys.path at import time (once).
  • Exposes get_spam_detector() as a FastAPI dependency that
    returns the singleton SpamDetectorService.
  • Translates ML-layer exceptions into FastAPI HTTPExceptions.
"""

import sys
from pathlib import Path
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status

# ── Add ml/ to sys.path so we can import ml.service ──────────────────────────
_ML_DIR = Path(__file__).resolve().parents[2] / "ml"
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

# These imports resolve from ml/
import sys
import os
import requests
from service import SpamDetectorService, ServiceError, InvalidInputError, ModelNotLoadedError  # noqa: E402

from app.core.config import get_settings

settings = get_settings()

# ── Module-level singleton (loaded once at startup) ───────────────────────────
_detector: Optional[SpamDetectorService] = None


def init_spam_detector() -> SpamDetectorService:
    """
    Initialise the SpamDetectorService singleton.
    Called once from app lifespan, not per-request.
    """
    global _detector
    if _detector is None:
        model_url = os.environ.get("MODEL_URL")
        detector = SpamDetectorService(
            model_version=settings.MODEL_VERSION,
            auto_load=False, # We load manually to handle potential download
        )
        
        # Ensure model exists or download it
        tag = settings.MODEL_VERSION
        model_path = _ML_DIR / "models" / f"model_{tag}.pkl"
        
        if not model_path.exists() and model_url:
            print(f"[ML] Model missing. Downloading from {model_url}...")
            try:
                os.makedirs(model_path.parent, exist_ok=True)
                response = requests.get(model_url, stream=True)
                response.raise_for_status()
                with open(model_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"[ML] Download complete: {model_path}")
            except Exception as e:
                print(f"[ML] Download failed: {e}")
        
        detector._load()
        _detector = detector
    return _detector


def get_spam_detector() -> SpamDetectorService:
    """
    FastAPI dependency: return the already-initialised SpamDetectorService.
    Raises 503 if the model was never loaded (startup failure).
    """
    if _detector is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model is not loaded. The service may still be starting up.",
        )
    return _detector


MLService = Annotated[SpamDetectorService, Depends(get_spam_detector)]


# ── Exception translator ──────────────────────────────────────────────────────

def translate_ml_error(exc: Exception) -> HTTPException:
    """Convert ML-layer exceptions to appropriate FastAPI HTTPExceptions."""
    if isinstance(exc, ModelNotLoadedError):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    if isinstance(exc, InvalidInputError):
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    if isinstance(exc, ServiceError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected error occurred.",
    )
