import React, { memo } from "react";
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  ChevronRight,
  Brain,
  ArrowUpRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import { getUserStats, getSpamTrends, getThreatReport } from "../../api/spamApi";
import { DashboardSkeleton } from "../../components/ui/SkeletonLoaders";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-sm">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900">{payload[0].value.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-zinc-400 uppercase">scans</span>
        </div>
      </div>
    );
  }
  return null;
};

const CompactStat = memo(({ label, value, trend, icon: Icon, color }) => (
  <div className="flex items-center gap-4 p-5 bg-white border border-zinc-200 rounded-2xl transition-all">
    <div className={`p-2 rounded-lg bg-zinc-50 text-zinc-900 border border-zinc-100`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-zinc-900">{value}</span>
        {trend && (
          <span className="text-[9px] font-bold text-zinc-900 bg-zinc-50 px-1.5 py-0.5 rounded-md border border-zinc-100">
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
));

const ThreatBadge = ({ level }) => {
  const cfg = {
    critical: "bg-zinc-900 text-white",
    high: "bg-zinc-100 text-zinc-900",
    medium: "bg-zinc-50 text-zinc-600",
    low: "bg-zinc-50 text-zinc-400",
  };
  const style = cfg[level?.toLowerCase()] || cfg.low;
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${style}`}>
      {level || "Low"}
    </span>
  );
};

export const UserDashboard = () => {
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => getUserStats(),
  });

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ["spamTrends"],
    queryFn: () => getSpamTrends(30),
  });

  const { data: threatReport, isLoading: threatLoading } = useQuery({
    queryKey: ["threatReport"],
    queryFn: () => getThreatReport(),
  });

  const trends = (trendsData?.points || []).map(p => ({
    date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    total: p.total
  }));

  if (statsLoading || trendsLoading || threatLoading) return <DashboardSkeleton />;
  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in pb-12">
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-zinc-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-400 font-medium">
            Status for <span className="text-zinc-900 font-bold">{user?.username}</span>: <span className="text-zinc-900">Optimal</span>
          </p>
        </div>

        <button
          onClick={() => navigate("/scan")}
          className="bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-zinc-800 transition-all"
        >
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStat label="Scanned" value={stats.total_scanned.toLocaleString()} trend={stats.trends.total !== "0" ? stats.trends.total : null} icon={TrendingUp} />
        <CompactStat label="Blocked" value={stats.spam_blocked.toLocaleString()} trend={stats.trends.spam !== "0" ? stats.trends.spam : null} icon={ShieldCheck} />
        <CompactStat label="Threat" value={stats.threat_level} icon={AlertTriangle} />
        <CompactStat label="Accuracy" value="99.1%" icon={Brain} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} /> Traffic Density
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">30D</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#18181b" strokeWidth={2} fillOpacity={0.05} fill="#18181b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 text-white flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Health</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-lg font-bold">Stable</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Systems Nominal</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold uppercase">
                <span className="text-zinc-500">Integrity</span>
                <span>99.9%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[99%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold uppercase">
                <span className="text-zinc-500">Latency</span>
                <span>Instant</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[100%]" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate("/history")}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            Intelligence Log <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Threat Intercepts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {(threatReport?.recent_threats || []).slice(0, 5).map((t, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-zinc-700 truncate max-w-[200px]">{t.text}</p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{new Date(t.predicted_at).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <ThreatBadge level={t.threat_level} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate("/results", { state: { result: t } })} className="text-zinc-400 hover:text-zinc-900">
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
