import { useState, useCallback, memo } from "react";
import { FileText, ShieldCheck, Zap, Lock, Search, Cpu, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { predictText } from "../../api/spamApi";
import { toast } from "react-hot-toast";

const FEATURES = [
  { icon: Cpu,        title: "ML Pipeline",     desc: "RandomForest classifier with TF-IDF feature extraction, preloaded into memory for instant inference." },
  { icon: ShieldCheck, title: "Smart Filtering", desc: "Detects phishing patterns, suspicious links, and malicious content with high confidence scoring." },
  { icon: Sparkles,   title: "Instant Results",  desc: "Sub-30ms predictions returned directly to you with probability scores and confidence metrics." },
];

const FeatureCard = memo(({ icon: Icon, title, desc }) => (
  <div className="card p-5">
    <div className="p-2 bg-slate-100 rounded-xl w-fit mb-3">
      <Icon className="w-4 h-4 text-slate-600" />
    </div>
    <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
));

export const ScanPage = () => {
  const [text, setText] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const navigate = useNavigate();

  const handlePredict = useCallback(async () => {
    if (!text.trim()) return;
    setIsPredicting(true);
    try {
      const data = await predictText(text);
      // Dispatch event so NotificationBell refreshes if a spam is detected
      if (data.is_spam) {
        window.dispatchEvent(new Event("notification:new"));
      }
      navigate("/results", { state: { result: data } });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Analysis failed. Please try again.");
    } finally {
      setIsPredicting(false);
    }
  }, [text, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePredict();
  }, [handlePredict]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 badge-blue">
          <Search size={11} /> Message Scanner
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Scan a Message</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Paste any SMS or message below. Our ML model will classify it instantly with probability scoring.
        </p>
      </div>

      {/* Input card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <FileText size={14} className="text-slate-500" />
            </div>
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Message Input</span>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">{text.length} / 1000</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste the message you want to analyse here…"
          maxLength={1000}
          className="w-full h-52 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900
                     placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2
                     focus:ring-blue-50 transition-all resize-none leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock size={13} />
            <span className="text-xs">Messages are not stored after analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">⌘ + Enter to scan</span>
            <button
              onClick={handlePredict}
              disabled={!text.trim() || isPredicting}
              className="btn-primary px-6 h-10 min-w-[140px]"
            >
              {isPredicting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Zap size={15} />
                  Scan Message
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skeleton preview while predicting */}
        {isPredicting && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        )}
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
};
