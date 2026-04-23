import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { 
  Download, RefreshCw, ShieldAlert, ShieldCheck, 
  FileText, ChevronLeft, ChevronRight, Clock
} from "lucide-react";
import { getHistory, exportHistory } from "../../api/spamApi";
import { toast } from "react-hot-toast";

const SkeletonRow = () => (
  <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100">
    <div className="col-span-6 flex gap-3 items-center">
      <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-1/3 rounded" />
      </div>
    </div>
    <div className="col-span-3 flex justify-center">
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
    <div className="col-span-3 flex flex-col items-end gap-2">
      <div className="skeleton h-3 w-10 rounded" />
      <div className="skeleton h-1.5 w-20 rounded" />
    </div>
  </div>
);

const FILTERS = [
  { label: "All", val: null },
  { label: "Spam", val: true },
  { label: "Clean", val: false },
];

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, size: 10, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filterSpam, setFilterSpam] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHistory(page, 10, filterSpam);
      setHistory(data.items || []);
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        size: data.size || 10,
        totalPages: Math.ceil((data.total || 0) / (data.size || 10)),
      });
    } catch {
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, [page, filterSpam]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportHistory({ isSpam: filterSpam });
      toast.success("Export downloaded.");
    } catch {
      toast.error("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 badge-gray">
            <Clock size={11} /> Scan History
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Detection Logs</h1>
          <p className="text-sm text-slate-500">Paginated history of all your message scans.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-secondary p-2.5" title="Refresh">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleExport} disabled={isExporting} className="btn-secondary gap-2">
            {isExporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
            {FILTERS.map(f => (
              <button
                key={f.label}
                onClick={() => { setFilterSpam(f.val); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${filterSpam === f.val
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">
            {pagination.total.toLocaleString()} record{pagination.total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100
                        text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          <div className="col-span-6">Message</div>
          <div className="col-span-3 text-center">Verdict</div>
          <div className="col-span-3 text-right">Probability</div>
        </div>

        {/* Rows */}
        <div className="min-h-[400px] divide-y divide-slate-100">
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            : history.length > 0
              ? history.map((msg) => (
                  <div
                    key={msg.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="col-span-6 flex gap-3 items-start min-w-0">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${msg.is_spam ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-800 truncate font-medium">"{msg.text}"</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {format(new Date(msg.predicted_at), "MMM d, HH:mm")} · v{msg.model_version}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${msg.is_spam ? "badge-red" : "badge-green"}`}>
                        {msg.is_spam ? <ShieldAlert size={11} /> : <ShieldCheck size={11} />}
                        {msg.is_spam ? "Spam" : "Clean"}
                      </span>
                    </div>

                    <div className="col-span-3 flex flex-col items-end gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">
                        {(msg.probability * 100).toFixed(1)}%
                      </span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${msg.is_spam ? "bg-red-500" : "bg-emerald-500"}`}
                          style={{ width: `${msg.probability * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <FileText size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">No scan history yet</p>
                  <p className="text-xs mt-1 text-slate-400">Run your first scan to see results here.</p>
                </div>
              )
          }
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary p-1.5 disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary p-1.5 disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
