import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
  Activity
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserStats, getSpamTrends } from "../../api/spamApi";
import { toast } from "react-hot-toast";

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };
  
  const iconStyle = colors[color] || colors.blue;

  return (
    <div className="minimal-card p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-lg border ${iconStyle}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            <ArrowUpRight size={14} />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
    </div>
  );
};

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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Welcome back, {user?.username || "Commander"}. Here's what's happening today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast("Press ⌘K to open the command palette", { icon: "⌨️" })}
            className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            <Search size={16} />
            <span className="text-sm font-medium">Search</span>
            <kbd className="hidden sm:inline-block bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] ml-2 font-mono text-slate-500">⌘K</kbd>
          </button>
          <button 
            onClick={() => navigate("/scan")}
            className="btn-primary flex items-center gap-2"
          >
            <Zap size={16} />
            <span>New Scan</span>
          </button>
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
          color={stats.threat_level === "High" ? "rose" : stats.threat_level === "Medium" ? "amber" : "emerald"} 
        />
        <StatsCard 
          title="Uptime" 
          value="99.9%" 
          icon={Clock} 
          color="cyan" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2">
          <div className="minimal-card p-6 h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="text-slate-500 w-4 h-4" />
                  Traffic Telemetry
                </h2>
                <p className="text-xs text-slate-500 mt-1">Daily classification volume over time</p>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {[
                  { label: "7D", value: 7 },
                  { label: "14D", value: 14 },
                  { label: "30D", value: 30 },
                  { label: "1Y", value: 365 }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLookback(opt.value)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      lookback === opt.value 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              {loadingTrends ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                </div>
              ) : trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(str) => {
                        const d = new Date(str);
                        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      itemStyle={{ color: "#0f172a", fontWeight: 500 }}
                    />
                    <Area type="monotone" dataKey="spam_count" name="Spam" stroke="#f43f5e" fillOpacity={1} fill="url(#colorSpam)" strokeWidth={2} />
                    <Area type="monotone" dataKey="ham_count" name="Clean" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorHam)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                    <BarChart3 className="text-slate-500 w-5 h-5" />
                  </div>
                  <p className="text-slate-500 text-sm">No telemetry data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - AI Insights & Activity */}
        <div className="space-y-6">
          <div className="minimal-card p-6 border-l-4 border-l-blue-500 bg-blue-50/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-blue-500 w-4 h-4" />
              <h2 className="text-sm font-semibold text-slate-900">AI Insights</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              We noticed a minor increase in phishing attempts from unverified senders. We recommend keeping your filter threshold at 0.75 for optimal protection.
            </p>
            <button 
              onClick={() => toast.success("Threshold maintained")}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              Acknowledge <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="minimal-card p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-5">
              {[
                { time: "2m ago", text: "Spam blocked from +1 (202) 555-0122", type: "blocked" },
                { time: "15m ago", text: "System definitions updated", type: "system" },
                { time: "1h ago", text: "Daily security scan completed", type: "success" },
                { time: "3h ago", text: "Batch scan: 500 messages processed", type: "info" }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    item.type === 'blocked' ? 'bg-rose-500' : 
                    item.type === 'system' ? 'bg-blue-500' : 
                    item.type === 'success' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                  <div>
                    <p className="text-sm text-slate-700 leading-tight">{item.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate("/history")}
              className="w-full mt-5 py-2 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
