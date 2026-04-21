import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  Download, 
  Filter, 
  Search, 
  FileText, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { getHistory, exportHistory } from "../../api/spamApi";
import { toast } from "react-hot-toast";

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, size: 8, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filterSpam, setFilterSpam] = useState(null);

  useEffect(() => {
    fetchData();
  }, [page, filterSpam]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const histData = await getHistory(page, 8, filterSpam);
      setHistory(histData.items || []);
      setPagination({
        total: histData.total || 0,
        page: histData.page || 1,
        size: histData.size || 8,
        totalPages: Math.ceil((histData.total || 0) / (histData.size || 8)),
      });
    } catch (err) {
      toast.error("Failed to load telemetry logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportHistory({ isSpam: filterSpam });
      toast.success("Intelligence report exported.");
    } catch {
      toast.error("Export sequence failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-cyan-400"
          >
            <Sparkles size={14} /> Historical Telemetry
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Detection <span className="neon-text-blue">Logs</span>
          </h1>
          <p className="text-slate-400 max-w-xl font-medium">
            Archived analysis reports and real-time classification stream.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={isExporting}
            className="btn-premium flex items-center gap-2 px-6 h-12 disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Download size={18} />}
            <span className="text-xs font-black tracking-widest uppercase">Export CSV</span>
          </motion.button>
          <button 
            onClick={fetchData}
            className="glass p-3 rounded-xl border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Logs Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative"
      >
        {/* Table Controls */}
        <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-white/[0.02]">
          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
            {[
              { label: "All Logs", val: null },
              { label: "Spam Only", val: true },
              { label: "Clean Only", val: false }
            ].map(f => (
              <button
                key={f.label}
                onClick={() => { setFilterSpam(f.val); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${filterSpam === f.val ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Total Records: <span className="text-white ml-1">{pagination.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-6 px-8 py-4 bg-white/5 border-b border-white/5 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
          <div className="col-span-6">Content Matrix</div>
          <div className="col-span-3 text-center">Verdict</div>
          <div className="col-span-3 text-right">Probability</div>
        </div>

        {/* Table Body */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[400px] flex items-center justify-center"
              >
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              </motion.div>
            ) : history.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="divide-y divide-white/5"
              >
                {history.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={msg.id}
                    className="grid grid-cols-12 gap-6 px-8 py-6 items-center hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="col-span-6 flex gap-5 items-start">
                      <div className={`p-3 rounded-2xl ${msg.is_spam ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"} transition-colors`}>
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate leading-snug group-hover:text-cyan-400 transition-colors">
                          "{msg.text}"
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                          <Zap size={10} className="text-cyan-500" />
                          Engine v{msg.model_version} • {format(new Date(msg.predicted_at), "MMM d, HH:mm:ss")}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${msg.is_spam ? "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"} text-[10px] font-black tracking-widest uppercase`}>
                        {msg.is_spam ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                        {msg.is_spam ? "Spam" : "Clean"}
                      </div>
                    </div>

                    <div className="col-span-3 flex flex-col items-end gap-2">
                      <span className="text-sm font-black text-white">{(msg.probability * 100).toFixed(0)}%</span>
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${msg.probability * 100}%` }}
                          className={`h-full ${msg.is_spam ? "bg-rose-500" : "bg-emerald-500"} shadow-[0_0_8px_currentColor]`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-500 gap-4">
                <FileText size={48} className="opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">No logs detected in matrix</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 glass border-white/10 rounded-xl disabled:opacity-30 hover:text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 glass border-white/10 rounded-xl disabled:opacity-30 hover:text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
