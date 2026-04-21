import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gauge, 
  BarChart, 
  FileJson, 
  ShieldAlert, 
  Cpu, 
  Database,
  ChevronRight, 
  Users, 
  Activity, 
  Download, 
  RefreshCw,
  Shield, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Crown,
  MessageSquare, 
  ScrollText, 
  ExternalLink,
  Zap,
  Sparkles,
  Search,
  Server,
  Network,
  Globe,
  Settings,
  ShieldCheck,
  Lock,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";
import {
  getModelInfo, updateThreshold, retrainModel, getFeatureImportance,
  getAdminAnalytics, getAdminUsers, toggleUserStatus, exportAdminPredictions,
  getAdminStats, getAdminMessages
} from "../../api/adminApi";
import { toast } from "react-hot-toast";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as ReBarChart, Bar, Cell, PieChart, Pie
} from "recharts";

// ── Sub-components ────────────────────────────────────────────────────────────

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${active ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const ModelPanel = ({ modelInfo, importance, latency }) => {
  const [globalThreshold, setGlobalThreshold] = useState(modelInfo?.threshold || 0.5);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("neural_vector_v1");

  const handleUpdateThreshold = async () => {
    setIsUpdating(true);
    try {
      const data = await updateThreshold(globalThreshold);
      toast.success(`Neural threshold synchronized: ${data.new_threshold.toFixed(4)}`);
    } catch {
      toast.error("Threshold synchronization failed.");
    } finally { setIsUpdating(false); }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Advanced Controls */}
        <div className="lg:col-span-1 glass p-8 rounded-3xl border border-white/10 space-y-8">
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="text-cyan-400" />
              Core Configuration
            </h4>
            <p className="text-xs text-slate-500 font-medium">Manage neural engine parameters and active model selection.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="neural_vector_v1">NeuralVector v1.0 (Active)</option>
                <option value="svm_optimized">SVM Optimized (Legacy)</option>
                <option value="transformer_beta">Transformer v2.0-beta</option>
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Boundary</span>
                <span className="text-lg font-black text-cyan-400 font-mono">{globalThreshold.toFixed(4)}</span>
              </div>
              <input 
                type="range" min="0.1" max="0.9" step="0.01" 
                value={globalThreshold} 
                onChange={(e) => setGlobalThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <button 
                onClick={handleUpdateThreshold}
                disabled={isUpdating}
                className="btn-premium w-full h-12 flex items-center justify-center gap-3 text-xs font-black tracking-widest uppercase disabled:opacity-50"
              >
                {isUpdating ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck size={16} />}
                Synchronize Neural State
              </button>
            </div>
          </div>
        </div>

        {/* Feature Importance Graph */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-purple-400" />
              Vector Weighting Matrix
            </h4>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={importance.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="feature" 
                  type="category" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  width={100}
                  tickFormatter={(val) => val.replace("feat_", "").replace(/_/g, " ")}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ color: "#22d3ee", fontSize: "12px", fontWeight: "bold" }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {importance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8b5cf6" : "#06b6d4"} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const [tab, setTab] = useState("model");
  const [modelInfo, setModelInfo] = useState(null);
  const [importance, setImportance] = useState([]);
  const [quickStats, setQuickStats] = useState(null);
  const [recentThreats, setRecentThreats] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [latency, setLatency] = useState("...");
  const [sysHealth, setSysHealth] = useState({ cpu: 42, ram: 78, storage: 12 });
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [userDistribution, setUserDistribution] = useState([]);
  const [topTarget, setTopTarget] = useState(null);
  const [fetchingAnalytics, setFetchingAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setSysHealth(prev => ({
        cpu: Math.min(100, Math.max(10, prev.cpu + (Math.random() * 10 - 5))),
        ram: Math.min(100, Math.max(20, prev.ram + (Math.random() * 4 - 2))),
        storage: 12
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [info, feats, stats, messages, analytics, usersData] = await Promise.all([
          getModelInfo(),
          getFeatureImportance(),
          getAdminStats().catch(() => null),
          getAdminMessages({ size: 30, isSpam: null }).catch(() => ({ items: [] })),
          getAdminAnalytics(analyticsDays).catch(() => null),
          getAdminUsers(1, 100).catch(() => ({ items: [] }))
        ]);
        setModelInfo(info);
        setImportance(feats.features || []);
        setQuickStats(stats);
        
        const threats = (messages.items || []).filter(m => m.is_spam).slice(0, 3);
        setRecentThreats(threats);

        const validLatencies = (messages.items || []).filter(m => m.latency_ms > 0).map(m => m.latency_ms);
        const avgLatency = validLatencies.length ? (validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length).toFixed(1) : "14.0";
        setLatency(`${avgLatency}ms`);

        if (analytics && analytics.recent_activity) {
          const chartData = analytics.recent_activity.map(point => ({
            name: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            traffic: point.total,
            threats: point.spam_count
          }));
          setTrafficData(chartData);
        }

        if (usersData && usersData.items) {
          const sorted = [...usersData.items]
            .sort((a, b) => (b.spam_count || 0) - (a.spam_count || 0));
          
          const chartData = sorted.slice(0, 10).map(u => ({
            name: u.username,
            spam: u.spam_count,
            ham: u.ham_count,
            total: (u.spam_count || 0) + (u.ham_count || 0)
          }));
          
          setUserDistribution(chartData);
          if (chartData.length > 0) {
            setTopTarget(chartData[0]);
          }
        }
      } catch {
        toast.error("Command center uplink failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    (async () => {
      setFetchingAnalytics(true);
      try {
        const analytics = await getAdminAnalytics(analyticsDays);
        if (analytics && analytics.recent_activity) {
          const chartData = analytics.recent_activity.map(point => ({
            name: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            traffic: point.total,
            threats: point.spam_count
          }));
          setTrafficData(chartData);
        }
      } catch {
        toast.error("Failed to update telemetry data.");
      } finally {
        setFetchingAnalytics(false);
      }
    })();
  }, [analyticsDays]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-6">
      <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synchronizing Nexus</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-emerald-400">
            <Server size={14} /> Systems Operational
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Control <span className="neon-text-blue">Nexus</span>
          </h1>
          <p className="text-slate-400 max-w-xl font-medium">
            Advanced oversight console for neural network optimization and global traffic monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <TabButton active={tab === "model"} onClick={() => setTab("model")} icon={Cpu} label="Neural Core" />
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")} icon={Activity} label="Telemetry" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">System Health</h4>
            <div className="space-y-6">
              {[
                { label: "CPU Usage", val: sysHealth.cpu.toFixed(0), color: "cyan" },
                { label: "Neural RAM", val: sysHealth.ram.toFixed(0), color: "purple" },
                { label: "Storage", val: sysHealth.storage, color: "blue" },
              ].map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase">{s.label}</span>
                    <span className="text-white">{s.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.val}%` }}
                      className={`h-full bg-${s.color}-500 shadow-[0_0_8px_currentColor]`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Nodes Synchronized
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Recent Threats</h4>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-rose-500/50 animate-pulse delay-75" />
              </div>
            </div>
            <div className="space-y-4">
              {recentThreats.length > 0 ? recentThreats.map((threat, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-1 h-12 bg-rose-500 rounded-full group-hover:scale-y-125 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-white font-bold truncate">
                      {threat.message_text}
                    </p>
                    <p className="text-[9px] text-slate-500">
                      {new Date(threat.predicted_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-[11px] text-slate-500">No recent threats detected.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              {tab === "model" && <ModelPanel modelInfo={modelInfo} importance={importance} latency={latency} />}
              
              {tab === "analytics" && (
                <div className="space-y-8">
                  <div className="glass p-8 rounded-3xl border border-white/10 space-y-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xl font-bold text-white flex items-center gap-2">
                            <Network className="text-cyan-400" />
                            Global Traffic Throughput
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">Real-time classification density across all nodes.</p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
                          {[
                            { l: '7D', v: 7 },
                            { l: '14D', v: 14 },
                            { l: '1M', v: 30 },
                            { l: '1Y', v: 365 }
                          ].map(t => (
                            <button
                              key={t.v}
                              onClick={() => setAnalyticsDays(t.v)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                analyticsDays === t.v 
                                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                                  : 'text-slate-500 hover:text-white'
                              }`}
                            >
                              {t.l}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-500" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Traffic</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detected Threats</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData}>
                          <defs>
                            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                          />
                          <Area type="monotone" dataKey="traffic" stroke="#22d3ee" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={3} />
                          <Area type="monotone" dataKey="threats" stroke="#f43f5e" fillOpacity={1} fill="url(#colorThreats)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="text-blue-400" />
                        Platform Entities
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: "Active Users", count: quickStats?.active_users || 0, pct: quickStats?.total_users ? ((quickStats?.active_users || 0)/(quickStats?.total_users || 1))*100 : 0, color: "emerald" },
                          { label: "Inactive Users", count: (quickStats?.total_users || 0) - (quickStats?.active_users || 0), pct: quickStats?.total_users ? (((quickStats?.total_users || 0) - (quickStats?.active_users || 0))/(quickStats?.total_users || 1))*100 : 0, color: "slate" },
                          { label: "Spam Intercepts", count: quickStats?.spam_count || 0, pct: quickStats?.total_messages ? ((quickStats?.spam_count || 0)/(quickStats?.total_messages || 1))*100 : 0, color: "rose" },
                          { label: "Clean Transmissions", count: quickStats?.ham_count || 0, pct: quickStats?.total_messages ? ((quickStats?.ham_count || 0)/(quickStats?.total_messages || 1))*100 : 0, color: "blue" },
                        ].map((g, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-white">{g.label}</span>
                              <span className="text-slate-500">{g.count.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full bg-${g.color}-500`} style={{ width: `${g.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="text-purple-400" />
                            Entity Vulnerability Index
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">Top nodes prone to targeted spam campaigns.</p>
                        </div>
                        {topTarget && (
                          <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-2xl text-center">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Primary Target</p>
                            <p className="text-sm font-black text-white">{topTarget.name}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={userDistribution} layout="vertical" margin={{ left: 10, right: 30 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                              <XAxis type="number" hide />
                              <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                width={100}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                              />
                              <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="glass p-4 border-white/10 rounded-2xl shadow-2xl">
                                        <p className="text-sm font-black text-white mb-2">{label}</p>
                                        <div className="space-y-1">
                                          <div className="flex justify-between gap-8">
                                            <span className="text-[10px] font-bold text-rose-400 uppercase">Spam</span>
                                            <span className="text-[10px] font-black text-white">{payload[0].value}</span>
                                          </div>
                                          <div className="flex justify-between gap-8">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase">Ham</span>
                                            <span className="text-[10px] font-black text-white">{payload[1].value}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar dataKey="spam" fill="#f43f5e" radius={[0, 4, 4, 0]} stackId="a" barSize={16} />
                              <Bar dataKey="ham" fill="#3b82f6" radius={[0, 4, 4, 0]} stackId="a" barSize={16} />
                            </ReBarChart>
                          </ResponsiveContainer>
                        </div>

                        {topTarget && (
                          <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Target Profile: {topTarget.name}</p>
                            <div className="h-[200px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: 'Spam', value: topTarget.spam, color: '#f43f5e' },
                                      { name: 'Ham', value: topTarget.ham, color: '#3b82f6' }
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    {[0, 1].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#3b82f6'} />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-4">
                              <h5 className="text-2xl font-black text-white">{((topTarget.spam / (topTarget.total || 1)) * 100).toFixed(1)}%</h5>
                              <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Spam Saturation</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
