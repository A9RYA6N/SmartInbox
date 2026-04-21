import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ShieldCheck, Zap, Lock, Sparkles, ChevronRight, Search, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { predictText } from "../../api/spamApi";
import { toast } from "react-hot-toast";

export const ScanPage = () => {
  const [text, setText] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const navigate = useNavigate();

  const handlePredict = async () => {
    if (!text.trim()) return;
    setIsPredicting(true);
    try {
      const data = await predictText(text);
      navigate("/results", { state: { result: data } });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Neural analysis interrupted.");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-cyan-400"
        >
          <Search size={14} /> Threat Intel Scan
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tighter">
          Instant <span className="neon-text-blue">Message Analysis</span>
        </h1>
        <p className="text-slate-400 max-w-2xl font-medium leading-relaxed">
          Input suspicious SMS content into our neural gateway. Our model will perform deep vector analysis and pattern recognition to detect malicious intent.
        </p>
      </div>

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/5 rounded-lg">
              <FileText size={18} className="text-slate-400" />
            </div>
            <span className="text-xs font-black tracking-widest text-slate-300 uppercase">Input Stream</span>
          </div>
          <div className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-[10px] font-bold text-slate-500">
            {text.length} / 1000 CHARS
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste message content here for real-time analysis..."
          maxLength={1000}
          className="w-full h-64 bg-slate-900/30 border border-white/10 rounded-2xl p-6 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all resize-none font-medium tracking-tight"
        />

        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <div className="flex items-center gap-3 text-slate-500">
            <Lock size={16} />
            <span className="text-[10px] font-bold tracking-widest uppercase">E2EE Privacy Shield Active</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePredict}
            disabled={!text.trim() || isPredicting}
            className="btn-premium flex items-center justify-center gap-3 px-12 h-14 w-full sm:w-auto disabled:opacity-50"
          >
            {isPredicting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm font-black tracking-widest uppercase">Analyzing...</span>
              </div>
            ) : (
              <>
                <span className="text-sm font-black tracking-widest uppercase">Start Analysis</span>
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Cpu, title: "Neural Core", desc: "RandomForest pipeline trained on 2M+ validated message vectors.", color: "cyan" },
          { icon: ShieldCheck, title: "Defanging", desc: "Automatic neutralization of malicious links and phishing hooks.", color: "blue" },
          { icon: Sparkles, title: "Zero Retention", desc: "Processing in volatile memory only. No data is persisted post-scan.", color: "purple" }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="glass-card p-6"
          >
            <div className={`p-3 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 w-fit mb-4`}>
              <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
