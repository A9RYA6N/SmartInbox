import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Clock, 
  ArrowUpRight,
  Sparkles,
  Search,
  BarChart3,
  RefreshCw,
  Activity
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserStats, getSpamTrends } from "../../api/spamApi";
import { toast } from "react-hot-toast";

const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
          <ArrowUpRight size={14} />
          {trend}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
    </div>
    <div className="shimmer absolute inset-0 rounded-2xl pointer-events-none opacity-50" />
  </motion.div>
);

export const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_scanned: 0,
    spam_blocked: 0,
    threat_level: "Low",
    trends: { total: "0", spam: "0" }
  });
  const [trends, setTrends] = useState([]);
  const [lookback, setLookback] = useState(14);
  const [loading, setLoading] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async () => {
    setLoadingTrends(true);
    try {
      const data = await getSpamTrends(lookback);
      setTrends(data.points || []);
    } catch (err) {
      console.error("Failed to fetch trends", err);
    } finally {
      setLoadingTrends(false);
    }
  }, [lookback]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="neon-text-blue">{user?.username || "Commander"}</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Your intelligence dashboard is live and monitoring.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast("Press ⌘K to open the command palette", { icon: "⌨️" })}
            className="glass border-white/10 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2"
          >
            <Search size={18} />
            <span className="text-sm font-bold">Quick Search</span>
            <kbd className="hidden sm:inline-block bg-white/10 px-1.5 py-0.5 rounded text-[10px] ml-2">⌘K</kbd>
          </button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/scan")}
            className="btn-premium flex items-center gap-2"
          >
            <Zap size={18} />
            <span>New Scan</span>
          </motion.button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Scanned" 
          value={loading ? "..." : stats.total_scanned.toLocaleString()} 
          icon={TrendingUp} 
          color="blue" 
          trend={stats.trends.total !== "0" ? stats.trends.total : null} 
        />
        <StatsCard 
          title="Spam Blocked" 
          value={loading ? "..." : stats.spam_blocked.toLocaleString()} 
          icon={ShieldCheck} 
          color="purple" 
          trend={stats.trends.spam !== "0" ? stats.trends.spam : null} 
        />
        <StatsCard 
          title="Threat Level" 
          value={loading ? "..." : stats.threat_level} 
          icon={AlertTriangle} 
          color={stats.threat_level === "High" ? "rose" : stats.threat_level === "Medium" ? "amber" : "cyan"} 
        />
        <StatsCard 
          title="Uptime" 
          value="99.9%" 
          icon={Clock} 
          color="pink" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="text-cyan-400 w-5 h-5" />
                  {lookback === 365 ? '1-Year' : `${lookback}-Day`} Traffic Telemetry
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Daily classification density breakdown</p>
              </div>
              
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {[
                  { label: "7D", value: 7 },
                  { label: "14D", value: 14 },
                  { label: "30D", value: 30 },
                  { label: "1Y", value: 365 }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLookback(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      lookback === opt.value 
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[350px] w-full">
              {loadingTrends ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                </div>
              ) : trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="dashSpam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="dashHam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(str) => {
                        const d = new Date(str);
                        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "10px" }}
                    />
                    <Area type="monotone" dataKey="spam_count" name="Spam" stroke="#f43f5e" fillOpacity={1} fill="url(#dashSpam)" strokeWidth={2} />
                    <Area type="monotone" dataKey="ham_count" name="Clean" stroke="#06b6d4" fillOpacity={1} fill="url(#dashHam)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <BarChart3 className="text-slate-600 w-8 h-8" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">No telemetry data available for this period.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - AI Insights & Activity */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 border-l-4 border-l-cyan-500"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-cyan-400 w-5 h-5" />
              <h2 className="text-lg font-bold text-white">AI Insights</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              "We noticed an 18% increase in phishing attempts from 'unverified' senders in the last 24 hours. Consider updating your filter threshold to 0.75 for better protection."
            </p>
            <button 
              onClick={() => toast.success("Threshold updated to 0.75")}
              className="mt-4 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              Apply Recommendation <ArrowUpRight size={12} />
            </button>
          </motion.div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {[
                { time: "2m ago", text: "Spam message blocked from +1 (202) 555-0122", type: "blocked" },
                { time: "15m ago", text: "New model version v2.4 deployed", type: "system" },
                { time: "1h ago", text: "Security audit completed - 0 threats", type: "success" },
                { time: "3h ago", text: "Batch upload: 500 messages scanned", type: "info" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`mt-1.5 w-2 h-2 rounded-full ${
                    item.type === 'blocked' ? 'bg-rose-500' : 
                    item.type === 'system' ? 'bg-cyan-500' : 
                    item.type === 'success' ? 'bg-emerald-500' : 'bg-slate-500'
                  } shadow-[0_0_8px_currentColor]`} />
                  <div>
                    <p className="text-sm text-slate-300 font-medium">{item.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate("/history")}
              className="w-full mt-6 py-2 bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


