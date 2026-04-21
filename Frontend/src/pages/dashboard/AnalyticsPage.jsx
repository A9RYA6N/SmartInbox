import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Calendar,
  Filter,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { getSpamTrends, getUserStats } from "../../api/spamApi";
import { toast } from "react-hot-toast";

const COLORS = ["#06b6d4", "#8b5cf6", "#3b82f6", "#f43f5e"];

export const AnalyticsPage = () => {
  const [trends, setTrends] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lookback, setLookback] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [lookback]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [trendData, statData] = await Promise.all([
        getSpamTrends(lookback),
        getUserStats()
      ]);
      setTrends(trendData.points || []);
      setStats(statData);
    } catch (err) {
      toast.error("Intelligence feed interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-12 pb-24"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-cyan-400"
          >
            <Activity size={14} /> Intelligence Nexus
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Threat <span className="neon-text-blue">Analytics</span>
          </h1>
          <p className="text-slate-400 max-w-xl font-medium">
            Real-time telemetry and pattern recognition analysis from the SmartInbox neural core.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
            {[
              { l: "7D", v: 7 },
              { l: "14D", v: 14 },
              { l: "30D", v: 30 },
              { l: "1Y", v: 365 }
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => setLookback(opt.v)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${lookback === opt.v ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
              >
                {opt.l}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchAnalytics}
            className="glass p-3 rounded-xl border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Detection Velocity */}
        <motion.div variants={cardVariants} className="lg:col-span-2 glass-card p-8 group">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-cyan-400" />
                Detection Velocity
              </h2>
              <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-widest">Signal ingestion over time</p>
            </div>
            <Sparkles className="text-slate-700 group-hover:text-cyan-500/50 transition-colors" />
          </div>
          
          <div className="h-[350px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorSpam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="spam_count" name="Spam" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSpam)" />
                  <Area type="monotone" dataKey="ham_count" name="Clean" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorHam)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Threat Distribution */}
        <motion.div variants={cardVariants} className="glass-card p-8 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-rose-400" />
              Threat Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-widest">Composition Analysis</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {loading ? (
               <div className="w-10 h-10 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            ) : stats ? (
              <>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Spam", value: stats.spam_blocked },
                          { name: "Clean", value: stats.total_scanned - stats.spam_blocked }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#f43f5e" />
                        <Cell fill="#06b6d4" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Spam Ratio</p>
                    <p className="text-2xl font-black text-rose-400">
                      {stats.total_scanned > 0 ? ((stats.spam_blocked / stats.total_scanned) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <p className={`text-2xl font-black ${stats.threat_level === "High" ? "text-rose-400" : stats.threat_level === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>
                      {stats.threat_level}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500 italic">No telemetry data</p>
            )}
          </div>
        </motion.div>

        {/* Intelligence Insights */}
        <motion.div variants={cardVariants} className="lg:col-span-3 glass-card p-8">
           <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-cyan-500/10 rounded-xl">
               <Zap className="text-cyan-400 w-6 h-6" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white">Neural Insights</h2>
               <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Model Performance Telemetry</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Inference Latency</span>
                  <span className="text-cyan-400">24ms avg</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Model Confidence</span>
                  <span className="text-purple-400">98.2%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "98%" }} className="h-full bg-purple-500 shadow-[0_0_10px_#8b5cf6]" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Resource Utilization</span>
                  <span className="text-blue-400">Optimal</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                </div>
              </div>
           </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
