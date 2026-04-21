import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download, 
  X, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  HelpCircle,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
  History
} from "lucide-react";
import { predictBatchCSV } from "../../api/spamApi";
import { toast } from "react-hot-toast";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE    = MAX_FILE_SIZE_MB * 1024 * 1024;

const VerdictBadge = ({ verdict }) => {
  if (!verdict) return null;
  const cfg = {
    SPAM:      { cls: "bg-rose-500/10 text-rose-400 border-rose-500/20",    icon: ShieldAlert,  label: "SPAM"      },
    HAM:       { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: ShieldCheck,  label: "HAM"  },
    UNCERTAIN: { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: HelpCircle,   label: "UNCERTAIN" },
  }[verdict] || { cls: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: HelpCircle, label: verdict };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${cfg.cls}`}>
      <cfg.icon size={12} />
      {cfg.label}
    </span>
  );
};

export const BatchUploadPage = () => {
  const [file,          setFile]          = useState(null);
  const [isDragging,    setIsDragging]    = useState(false);
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [uploadPct,     setUploadPct]     = useState(0);
  const [results,       setResults]       = useState(null);
  const [fileError,     setFileError]     = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (f) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setFileError("Invalid format. CSV required.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError(`File too large (Max ${MAX_FILE_SIZE_MB}MB)`);
      return;
    }
    setFileError("");
    setFile(f);
    setResults(null);
  };

  const onDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop      = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setUploadPct(0);
    try {
      const data = await predictBatchCSV(file, (evt) => {
        if (evt.total) setUploadPct(Math.round((evt.loaded / evt.total) * 100));
      });
      setResults(data);
      toast.success("Batch classification sequence completed.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Processing failed.");
    } finally {
      setIsProcessing(false);
      setUploadPct(0);
    }
  };

  const downloadResultsCSV = () => {
    if (!results) return;
    const rows = results.results || [];
    const header = ["Row", "Message", "Verdict", "Probability (%)"];
    const lines  = [header.join(",")];
    rows.forEach((r) => {
      lines.push([r.row, `"${(r.message || "").replace(/"/g, '""')}"`, r.verdict || "", (r.probability * 100).toFixed(1)].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartinbox_batch_${Date.now()}.csv`;
    a.click();
    toast.success("Intelligence report downloaded.");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-amber-400">
            <Layers size={14} /> Batch Processing
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Intelligence <span className="neon-text-blue">Ingestion</span>
          </h1>
          <p className="text-slate-400 max-w-xl font-medium">
            Upload large datasets for automated neural classification and deep threat analysis.
          </p>
        </div>
      </div>

      {!results ? (
        <div className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-20 cursor-pointer transition-all duration-500 ${isDragging ? "bg-cyan-500/10 border-cyan-500/30" : "hover:bg-white/[0.02]"}`}
          >
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 ${file ? "bg-emerald-500/20 scale-110" : "bg-white/5"}`}>
              {file ? <CheckCircle size={40} className="text-emerald-400" /> : <Upload size={40} className="text-slate-500" />}
            </div>

            {file ? (
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">{file.name}</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{(file.size / 1024).toFixed(1)} KB • READY FOR INGESTION</p>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-rose-400 hover:text-rose-300 transition-colors text-xs font-black uppercase tracking-widest pt-4">Remove File</button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-black text-white tracking-tight">Drop Intelligence Matrix</h3>
                <p className="text-slate-500 font-medium">Drag & drop CSV or click to browse filesystem</p>
                <div className="flex gap-4 justify-center pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <Database size={12} /> CSV Only
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <Sparkles size={12} /> Max 5MB
                  </div>
                </div>
              </div>
            )}

            {fileError && <div className="mt-8 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><XCircle size={14} /> {fileError}</div>}
          </div>

          {file && !fileError && (
            <div className="p-8 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <RefreshCw className={`text-cyan-400 ${isProcessing ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">Neural pipeline standby</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Ready to process {file.name}</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProcess} 
                disabled={isProcessing} 
                className="btn-premium flex items-center gap-3 px-12 h-14 w-full sm:w-auto disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm font-black tracking-widest uppercase">Processing {uploadPct}%</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-black tracking-widest uppercase">Initialize Ingestion</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: "Total Rows", value: results.total_rows, color: "blue" },
              { label: "Spam Detected", value: results.spam_count, color: "rose" },
              { label: "Clean Verified", value: results.ham_count, color: "emerald" },
              { label: "Uncertain", value: results.uncertain_count, color: "amber" },
              { label: "Processing Errors", value: results.errors, color: "rose" }
            ].map((s, i) => (
              <div key={i} className="glass-card p-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                <p className={`text-3xl font-black text-${s.color}-400 mt-1 tracking-tight`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white">Ingestion Results</h3>
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadResultsCSV} 
                  className="glass border-white/10 px-6 h-10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all"
                >
                  <Download size={16} /> Export Results
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/history")} 
                  className="glass border-white/10 px-6 h-10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all"
                >
                  <History size={16} /> View Full History
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setResults(null)} 
                  className="btn-premium px-6 h-10 text-xs font-black uppercase tracking-widest"
                >
                  New Ingestion
                </motion.button>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5 no-scrollbar">
              {results.results.map((row) => (
                <div key={row.row} className="grid grid-cols-12 gap-6 px-8 py-6 items-center hover:bg-white/[0.02] transition-colors group">
                  <div className="col-span-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">#{row.row}</div>
                  <div className="col-span-7">
                    <p className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors leading-relaxed">"{row.message}"</p>
                  </div>
                  <div className="col-span-4 flex justify-end">
                    {row.error ? (
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                        Error: {row.error}
                      </span>
                    ) : (
                      <VerdictBadge verdict={row.verdict} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
