import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Zap, 
  Shield, 
  Link2, 
  Clock,
  ChevronRight,
  ArrowLeft,
  Share2
} from "lucide-react";
import { RadialAnalytics } from "../../components/charts/RadialAnalytics";
import { toast } from "react-hot-toast";

export const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return <Navigate to="/scan" replace />;
  }

  const isSpam = result.prediction === 1;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-cyan-400"
        >
          <Zap size={14} /> Analysis Sequence Complete
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tighter">
          Intelligence <span className="neon-text-blue">Verdict</span>
        </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* Verdict Banner */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isSpam ? "via-rose-500" : "via-emerald-500"} to-transparent`} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Verdict & Details */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">Original Input</span>
              <div className="glass-card p-6 bg-black/20 border-white/5 italic text-slate-300 font-medium text-lg leading-relaxed">
                "{result.text}"
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="text-cyan-400 w-5 h-5" />
                Deep Vector Analysis
              </h3>
              <div className="space-y-4">
                {[
                  { 
                    title: isSpam ? "Malicious Intent Detected" : "Benign Pattern Verified",
                    desc: isSpam ? "Linguistic markers indicate high probability of social engineering or phishing." : "Message structure adheres to standard non-threatening communication protocols.",
                    icon: isSpam ? AlertTriangle : ShieldCheck,
                    color: isSpam ? "rose" : "emerald"
                  },
                  {
                    title: isSpam ? "Irregular Syntax" : "Verified Linguistics",
                    desc: isSpam ? "Irregular character distribution and obfuscated links detected." : "Natural language processing confirms authentic user-generated content.",
                    icon: Link2,
                    color: "blue"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className={`p-2 rounded-xl bg-${item.color}-500/10 h-fit`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Visualization */}
          <div className="flex flex-col items-center justify-center space-y-12 bg-white/5 rounded-3xl p-8 border border-white/5">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Verdict Confidence</span>
              <div className="relative">
                <RadialAnalytics 
                  percentage={(result.probability * 100).toFixed(0)} 
                  label={isSpam ? "Spam Confidence" : "Safety Confidence"} 
                  color={isSpam ? "#f43f5e" : "#10b981"} 
                />
              </div>
            </div>

            <div className="text-center">
              <h2 className={`text-6xl font-black tracking-tighter mb-2 ${isSpam ? "text-rose-500" : "text-emerald-500"} drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                {isSpam ? "SPAM" : "CLEAN"}
              </h2>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${isSpam ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"} text-[10px] font-black tracking-[0.2em] uppercase`}>
                {isSpam ? "Dangerous" : "Secure"}
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4">
              <div className="text-center p-4 glass rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Latency</p>
                <p className="text-xl font-black text-white">12ms</p>
              </div>
              <div className="text-center p-4 glass rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Model</p>
                <p className="text-xl font-black text-white">v2.4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 pt-12 border-t border-white/5">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/scan")}
            className="btn-premium flex items-center gap-3 px-12 h-14 w-full sm:w-auto"
          >
            <Zap size={18} />
            <span className="text-sm font-black tracking-widest uppercase">New Scan</span>
            <ChevronRight size={18} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!result) return;
              const header = ["Message", "Verdict", "Probability (%)", "Timestamp"];
              const verdictStr = isSpam ? "SPAM" : "HAM";
              const probStr = (result.probability * 100).toFixed(1);
              const timeStr = new Date().toISOString();
              const lines = [
                header.join(","),
                [`"${(result.text || "").replace(/"/g, '""')}"`, verdictStr, probStr, timeStr].join(",")
              ];
              const blob = new Blob([lines.join("\n")], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `smartinbox_report_${Date.now()}.csv`;
              a.click();
              toast.success("Intelligence report downloaded.");
            }}
            className="glass px-12 h-14 w-full sm:w-auto flex items-center justify-center gap-3 text-sm font-black tracking-widest uppercase hover:text-white transition-all"
          >
            <Share2 size={18} />
            Download Report
          </motion.button>

          <button 
            onClick={() => navigate("/dashboard")}
            className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 px-6"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Return to Base</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
