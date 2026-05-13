import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ShieldCheck, Zap, Lock, ChevronRight,
  Search, Cpu, Sparkles, Brain, Eye, AlertTriangle, ToggleLeft, ToggleRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { predictText, analyzeAiSpam, getJobStatus } from "../../api/spamApi";
import { toast } from "react-hot-toast";

const LAYER_CARDS = [
  {
    icon: Cpu,
    title: "ML Ensemble",
    desc: "5-model soft-vote ensemble: RandomForest, XGBoost, LightGBM, LogReg, NB. ROC-AUC 0.99.",
    color: "indigo",
    layer: "01",
  },
  {
    icon: Eye,
    title: "Heuristic Engine",
    desc: "Rule-based patterns: prompt-injection, crypto scams, KYC fraud, urgency markers.",
    color: "rose",
    layer: "02",
  },
  {
    icon: Sparkles,
    title: "Intelligence Decision",
    desc: "Multi-layer statistical correlation: combines ensemble probability with heuristic risk matrices.",
    color: "emerald",
    layer: "03",
  },
];

const LayerCard = memo(({ icon: Icon, title, desc, color, layer }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 relative overflow-hidden group"
  >
    <div className={`absolute -top-1 -right-1 w-16 h-16 bg-${color}-50/50 rounded-bl-[2rem] flex items-center justify-center`}>
      <span className={`text-[10px] font-black text-${color}-400 uppercase tracking-widest`}>
        L{layer}
      </span>
    </div>
    
    <div className={`w-14 h-14 rounded-2xl bg-${color}-50 text-${color}-600 border border-${color}-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner`}>
      <Icon size={24} />
    </div>
    
    <h4 className="text-base font-black text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
  </motion.div>
));

export const ScanPage = () => {
  const [text, setText] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [deepMode, setDeepMode] = useState(true); // deep = synchronous full hybrid
  const navigate = useNavigate();

  const handlePredict = useCallback(async () => {
    if (!text.trim()) return;
    setIsPredicting(true);

    if (deepMode) {
      // Synchronous full 4-layer pipeline
      try {
        const result = await analyzeAiSpam(text.trim());
        navigate("/results", { state: { result } });
      } catch (err) {
        toast.error(err.response?.data?.detail || "Deep analysis failed. Try standard mode.");
        setIsPredicting(false);
      }
    } else {
      // Standard async job-based pipeline
      try {
        const { job_id } = await predictText(text);
        setJobId(job_id);
      } catch (err) {
        toast.error(err.response?.data?.detail || "Analysis failed.");
        setIsPredicting(false);
      }
    }
  }, [text, deepMode, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePredict();
  }, [handlePredict]);

  // Poll job for standard mode
  useEffect(() => {
    if (!jobId) return;
    const iv = setInterval(async () => {
      try {
        const job = await getJobStatus(jobId);
        if (job.status === "completed") {
          clearInterval(iv);
          navigate("/results", { state: { result: job.result } });
        } else if (job.status === "failed") {
          clearInterval(iv);
          toast.error(job.error || "Neural processing failed.");
          setIsPredicting(false);
          setJobId(null);
        }
      } catch {
        clearInterval(iv);
        setIsPredicting(false);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [jobId, navigate]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
          <Search size={12} /> Neural Gateway
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Instant Analysis</h1>
        <p className="text-sm text-slate-500 font-medium">

        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <FileText size={14} /> Payload Stream
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste the suspicious SMS message here…"
          maxLength={2000}
          className="w-full h-56 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-base text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 transition-all resize-none font-medium"
        />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Lock size={13} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted</span>
            </div>
            <span className="text-[10px] font-bold text-slate-300 tabular-nums">{text.length} / 2000</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePredict}
            disabled={!text.trim() || isPredicting}
            className="btn-premium flex items-center justify-center gap-3 px-10 h-12 w-full sm:w-auto disabled:opacity-50"
          >
            {isPredicting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  {deepMode ? "Analyzing…" : "Queuing…"}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  {deepMode ? "Deep Scan" : "Start Analysis"}
                </span>
                <ChevronRight size={16} />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* 4-layer architecture cards */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={11} /> Detection Architecture
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LAYER_CARDS.map((card, i) => (
            <LayerCard key={i} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
