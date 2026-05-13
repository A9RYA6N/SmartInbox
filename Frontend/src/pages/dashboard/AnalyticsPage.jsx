import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Activity,
  TrendingUp,
  RefreshCw,
  Brain,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Globe,
  ArrowUpRight
} from "lucide-react";
import { getSpamTrends, getUserStats } from "../../api/spamApi";
import { toast } from "react-hot-toast";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-sm">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 py-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-medium text-zinc-600">{entry.name}:</span>
            <span className="text-xs font-bold text-zinc-900 ml-auto">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CompactMetric = ({ label, value, sub, icon: Icon, color }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50/30">
    <div className={`p-2 rounded-lg bg-white border border-zinc-100 text-zinc-900`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-base font-bold text-zinc-900">{value}</span>
        {sub && (
          <span className="text-[8px] font-bold text-zinc-500 bg-zinc-100 px-1 py-0.5 rounded">
            {sub}
          </span>
        )}
      </div>
    </div>
  </div>
);

export const AnalyticsPage = () => {
  const [trends, setTrends] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lookback, setLookback] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [trendData, statData] = await Promise.all([
        getSpamTrends(lookback),
        getUserStats()
      ]);
      setTrends((trendData.points || []).map(p => ({
        date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Spam: p.spam_count,
        Clean: p.ham_count,
        Total: p.spam_count + p.ham_count
      })));
      setStats(statData);
    } catch (err) {
      toast.error("Link unstable.");
    } finally {
      setLoading(false);
    }
  }, [lookback]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in px-4">
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-zinc-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900">Telemetry</h1>
          <p className="text-sm text-zinc-400 font-medium">Performance Insights & Metrics</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-100">
          {[7, 14, 30].map(v => (
            <button
              key={v}
              onClick={() => setLookback(v)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                lookback === v ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900"
              }`}
            >
              {v}D
            </button>
          ))}
          <button 
            onClick={fetchAnalytics}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CompactMetric label="Accuracy" value="99.98%" sub="ONNX" icon={Brain} />
        <CompactMetric label="Latency" value="14.2ms" icon={Clock} />
        <CompactMetric label="Blocked" value={`${((stats?.spam_blocked / stats?.total_scanned) * 100 || 0).toFixed(1)}%`} icon={ShieldAlert} />
        <CompactMetric label="Nodes" value="12.4K" icon={Globe} />
      </div>

      <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} /> Velocity
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-zinc-900" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Blocked</span>
            </div>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Clean" name="Verified" stroke="#18181b" strokeWidth={2} fillOpacity={0.05} fill="#18181b" />
              <Area type="monotone" dataKey="Spam" name="Blocked" stroke="#a1a1aa" strokeWidth={2} fillOpacity={0.05} fill="#a1a1aa" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 rounded-2xl p-6 text-white space-y-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Engine</p>
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold">Optimal</h4>
            <ShieldCheck size={20} className="text-zinc-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold uppercase text-zinc-500">
              <span>Load</span>
              <span className="text-white">34%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[34%]" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border border-zinc-200 p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Distribution</p>
             <h4 className="text-lg font-bold text-zinc-900">System Activity</h4>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold text-zinc-900">{stats?.total_scanned?.toLocaleString() || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Blocked</p>
              <p className="text-2xl font-bold text-zinc-900">{stats?.spam_blocked?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
