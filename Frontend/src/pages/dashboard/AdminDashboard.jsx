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
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${active ? "bg-slate-50 text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
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
      toast.success(`Threshold updated: ${data.new_threshold.toFixed(4)}`);
    } catch {
      toast.error("Threshold update failed.");
    } finally { setIsUpdating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Advanced Controls */}
        <div className="lg:col-span-1 minimal-card p-6 space-y-6">
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="text-slate-500 w-5 h-5" />
              Model Configuration
            </h4>
            <p className="text-xs text-slate-500">Manage threshold and active model selection.</p>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Active Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
              >
                <option value="neural_vector_v1">NeuralVector v1.0 (Active)</option>
                <option value="svm_optimized">SVM Optimized (Legacy)</option>
                <option value="transformer_beta">Transformer v2.0-beta</option>
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">Decision Threshold</span>
                <span className="text-sm font-semibold text-slate-900 font-mono">{globalThreshold.toFixed(4)}</span>
              </div>
              <input 
                type="range" min="0.1" max="0.9" step="0.01" 
                value={globalThreshold} 
                onChange={(e) => setGlobalThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <button 
                onClick={handleUpdateThreshold}
                disabled={isUpdating}
                className="w-full py-2 bg-slate-50 text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck size={16} />}
                Update Threshold
              </button>
            </div>
          </div>
        </div>

        {/* Feature Importance Graph */}
        <div className="lg:col-span-2 minimal-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-slate-500 w-5 h-5" />
              Feature Importance
            </h4>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={importance.slice(0, 10)} layout="vertical" margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="feature" 
                  type="category" 
                  stroke="#64748b" 
                  fontSize={11} 
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.replace("feat_", "").replace(/_/g, " ")}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#0f172a", fontWeight: 500 }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                  {importance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#0ea5e9"} />
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
        toast.error("Dashboard data load failed.");
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
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase text-emerald-700">
            <Server size={12} /> Systems Operational
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Control Panel
          </h1>
          <p className="text-slate-500 text-sm">
            Overview of model performance, traffic, and platform entities.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <TabButton active={tab === "model"} onClick={() => setTab("model")} icon={Cpu} label="Model Overview" />
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")} icon={Activity} label="Analytics" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="minimal-card p-6 space-y-5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">System Health</h4>
            <div className="space-y-4">
              {[
                { label: "CPU Usage", val: sysHealth.cpu.toFixed(0), color: "blue" },
                { label: "Memory", val: sysHealth.ram.toFixed(0), color: "purple" },
                { label: "Storage", val: sysHealth.storage, color: "slate" },
              ].map((s, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="text-slate-900">{s.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.val}%` }}
                      className={`h-full bg-${s.color}-500 rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="minimal-card p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Recent Threats</h4>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              {recentThreats.length > 0 ? recentThreats.map((threat, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1 h-auto bg-rose-500 rounded-full flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-800 font-medium truncate">
                      {threat.message_text}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(threat.predicted_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-500">No recent threats detected.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "model" && <ModelPanel modelInfo={modelInfo} importance={importance} latency={latency} />}
              
              {tab === "analytics" && (
                <div className="space-y-6">
                  <div className="minimal-card p-6 space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Network className="text-slate-500 w-5 h-5" />
                          Traffic Analytics
                        </h4>
                        <p className="text-xs text-slate-500">Classification volume across all users.</p>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-md">
                        {[
                          { l: '7D', v: 7 },
                          { l: '14D', v: 14 },
                          { l: '1M', v: 30 }
                        ].map(t => (
                          <button
                            key={t.v}
                            onClick={() => setAnalyticsDays(t.v)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              analyticsDays === t.v 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {t.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData} margin={{ left: -20 }}>
                          <defs>
                            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                          />
                          <Area type="monotone" dataKey="traffic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2} />
                          <Area type="monotone" dataKey="threats" stroke="#f43f5e" fillOpacity={1} fill="url(#colorThreats)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="minimal-card p-6 space-y-6">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Users className="text-slate-500 w-4 h-4" />
                        Platform Entities
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: "Active Users", count: quickStats?.active_users || 0, pct: quickStats?.total_users ? ((quickStats?.active_users || 0)/(quickStats?.total_users || 1))*100 : 0, color: "emerald" },
                          { label: "Inactive Users", count: (quickStats?.total_users || 0) - (quickStats?.active_users || 0), pct: quickStats?.total_users ? (((quickStats?.total_users || 0) - (quickStats?.active_users || 0))/(quickStats?.total_users || 1))*100 : 0, color: "slate" },
                          { label: "Spam Intercepts", count: quickStats?.spam_count || 0, pct: quickStats?.total_messages ? ((quickStats?.spam_count || 0)/(quickStats?.total_messages || 1))*100 : 0, color: "rose" },
                          { label: "Clean Transmissions", count: quickStats?.ham_count || 0, pct: quickStats?.total_messages ? ((quickStats?.ham_count || 0)/(quickStats?.total_messages || 1))*100 : 0, color: "blue" },
                        ].map((g, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-slate-600">{g.label}</span>
                              <span className="text-slate-900">{g.count.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full bg-${g.color}-500 rounded-full`} style={{ width: `${g.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="minimal-card p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="text-slate-500 w-4 h-4" />
                            Most Vulnerable Target
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">User receiving most spam.</p>
                        </div>
                      </div>

                      {topTarget ? (
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 h-[220px]">
                          <p className="text-xs font-semibold text-slate-700 mb-2">{topTarget.name}</p>
                          <div className="h-[120px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Spam', value: topTarget.spam, color: '#f43f5e' },
                                    { name: 'Clean', value: topTarget.ham, color: '#3b82f6' }
                                  ]}
                                  innerRadius={35}
                                  outerRadius={50}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {[0, 1].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#3b82f6'} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "11px" }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="text-center mt-2">
                            <h5 className="text-lg font-bold text-slate-900">{((topTarget.spam / (topTarget.total || 1)) * 100).toFixed(1)}%</h5>
                            <p className="text-[10px] font-medium text-slate-500 uppercase">Spam Ratio</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[220px] text-slate-500">
                          <Users className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-sm">No data available</span>
                        </div>
                      )}
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
