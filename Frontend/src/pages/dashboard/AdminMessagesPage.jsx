import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, 
  RefreshCw, 
  Trash2, 
  Download, 
  Search,
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  User,
  Clock
} from "lucide-react";
import {
  getAdminMessages, deleteAdminPrediction, exportAdminPredictions
} from "../../api/adminApi";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export const AdminMessagesPage = () => {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, search]);
  const [deleting, setDeleting] = useState(null);
  const [exporting, setExporting] = useState(false);

  const PAGE_SIZE = 15;

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminMessages({
        page,
        size: PAGE_SIZE,
        isSpam: filter,
        q: search || null,
      });
      setData(res);
    } catch {
      toast.error("Telemetry stream retrieval failed.");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleDelete = async (predId) => {
    setDeleting(predId);
    try {
      await deleteAdminPrediction(predId);
      toast.success("Packet purged from matrix.");
      fetchMessages();
    } catch {
      toast.error("Purge sequence failed.");
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAdminPredictions({ isSpam: filter });
      toast.success("Intelligence report exported.");
    } catch {
      toast.error("Export sequence failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-rose-400">
            <MessageSquare size={14} /> Packet Monitoring
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            Global <span className="text-purple-600 font-semibold">Intercepts</span>
          </h1>
          <p className="text-slate-500 max-w-xl font-medium">
            Real-time monitoring of all neural classifications across the ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary flex items-center gap-2 px-6 h-12 disabled:opacity-50"
          >
            {exporting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Download size={18} />}
            <span className="text-xs font-black tracking-widest uppercase">Export CSV</span>
          </button>
          <button 
            onClick={() => fetchMessages()}
            className=" p-3 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/[0.02] p-6 rounded-3xl border border-slate-100">
        <div className="flex bg-slate-50 rounded-2xl p-1 border border-slate-100">
          {[
            { label: "All Packets", val: null },
            { label: "Spam Only", val: true },
            { label: "Clean Only", val: false }
          ].map(f => (
            <button
              key={String(f.val)}
              onClick={() => { setFilter(f.val); setPage(1); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${filter === f.val ? "bg-slate-100 text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-600"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            placeholder="Filter by content..."
            className=" w-full pl-11 pr-4 h-12 rounded-xl border-slate-200 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className=" rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="grid grid-cols-12 gap-6 px-8 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
          <div className="col-span-6">Payload Matrix</div>
          <div className="col-span-2 text-center">Entity Origin</div>
          <div className="col-span-2 text-center">Neural Confidence</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="h-[500px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.items.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.prediction_id}
                    className="grid grid-cols-12 gap-6 px-8 py-6 items-center hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="col-span-6 flex gap-5 items-start">
                      <div className={`p-3 rounded-2xl ${item.is_spam ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"} transition-colors`}>
                        {item.is_spam ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-cyan-400 transition-colors">
                          "{item.message_text}"
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                          <Clock size={10} className="text-cyan-500" />
                          {format(new Date(item.predicted_at), "MMM d, HH:mm:ss")}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-slate-500" />
                        <span className="text-xs font-bold text-slate-900">{item.username}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-full px-4">{item.user_email}</span>
                    </div>

                    <div className="col-span-2 flex flex-col items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{(item.probability * 100).toFixed(0)}%</span>
                      <div className="w-24 h-1 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.probability * 100}%` }}
                          className={`h-full ${item.is_spam ? "bg-rose-500" : "bg-emerald-500"} shadow-[0_0_8px_currentColor]`}
                        />
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <button 
                        onClick={() => handleDelete(item.prediction_id)}
                        className="p-3 rounded-xl border border-slate-100 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-white/[0.02] border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Page {page} of {data.pages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2  border-slate-200 rounded-xl disabled:opacity-30 hover:text-slate-900 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
              className="p-2  border-slate-200 rounded-xl disabled:opacity-30 hover:text-slate-900 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
