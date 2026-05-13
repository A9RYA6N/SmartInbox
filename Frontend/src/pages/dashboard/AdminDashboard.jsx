import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, 
  Activity, 
  Settings,
  TrendingUp, 
  Users,
  ShieldCheck,
  RefreshCw,
  Server,
  Network
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getModelInfo, updateThreshold, getFeatureImportance,
  getAdminAnalytics, getAdminStats, getAdminUsers
} from "../../api/adminApi";
import { useStore } from "../../store/useStore";
import { toast } from "react-hot-toast";
import { D3LineChart, D3BarChart, D3DonutChart } from "../../components/charts/D3Charts";
import { DashboardSkeleton } from "../../components/ui/SkeletonLoaders";

const StatCard = memo(({ label, value, icon: Icon, color }) => (
  <div className="bg-white border border-zinc-200 p-5 rounded-2xl relative overflow-hidden transition-all hover:border-zinc-300">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg bg-zinc-50 text-zinc-900 border border-zinc-100`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
    <h3 className="text-2xl font-bold text-zinc-900 mt-1">{value}</h3>
  </div>
));

const TabButton = memo(({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
      active 
        ? "bg-zinc-900 text-white shadow-sm" 
        : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
    }`}
  >
    <Icon size={14} />
    {label}
  </button>
));

export const AdminDashboard = () => {
  const [tab, setTab] = useState("model");
  const [threshold, setThreshold] = useState(0.5);
  const queryClient = useQueryClient();

  const { data: modelInfo, isLoading: modelLoading } = useQuery({
    queryKey: ["modelInfo"],
    queryFn: async () => {
      const info = await getModelInfo();
      setThreshold(info?.threshold || 0.5);
      return info;
    },
  });

  const { data: importanceData, isLoading: importanceLoading } = useQuery({
    queryKey: ["featureImportance"],
    queryFn: () => getFeatureImportance(20),
  });

  const { data: quickStats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: () => getAdminAnalytics(30),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => getAdminUsers(1, 10),
  });

  const importance = useMemo(() => 
    (importanceData?.features || []).slice(0, 8).map(f => ({
      label: f.feature.replace("feat_", ""),
      value: f.importance
    })), [importanceData]);

  const trafficData = useMemo(() => 
    (analytics?.recent_activity || []).map(p => ({
      label: p.date,
      value: p.total
    })), [analytics]);

  const userDist = useMemo(() => 
    (usersData?.items || []).slice(0, 5).map(u => ({
      label: u.username,
      value: u.prediction_count
    })), [usersData]);

  const mutation = useMutation({
    mutationFn: updateThreshold,
    onSuccess: () => {
      toast.success("Synchronized.");
      queryClient.invalidateQueries({ queryKey: ["modelInfo"] });
    },
    onError: () => {
      toast.error("Failed.");
    }
  });

  if (modelLoading || statsLoading || analyticsLoading) return <DashboardSkeleton />;

  const handleUpdateThreshold = () => {
    mutation.mutate({ threshold });
  };

  const isUpdating = mutation.isLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in pb-12">
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-zinc-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900">Control Center</h1>
          <p className="text-sm text-zinc-400 font-medium">Model Management & Oversight</p>
        </div>

        <div className="flex gap-2 p-1 bg-zinc-50 border border-zinc-100 rounded-xl">
          <TabButton active={tab === "model"} onClick={() => setTab("model")} icon={Cpu} label="Engine" />
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")} icon={Activity} label="Traffic" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Users" value={quickStats?.total_users || 0} icon={Users} />
        <StatCard label="Inferences" value={quickStats?.total_messages || 0} icon={Activity} />
        <StatCard label="Spam" value={quickStats?.spam_count || 0} icon={ShieldCheck} />
        <StatCard label="Rate" value={`${quickStats?.spam_rate || 0}%`} icon={TrendingUp} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {tab === "model" ? (
            <>
              <div className="lg:col-span-1 bg-white border border-zinc-200 p-6 rounded-2xl space-y-8">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Configuration</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">v{modelInfo?.model_version}</p>
                </div>

                <div className="space-y-6 pt-6 border-t border-zinc-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Threshold</span>
                    <span className="text-xl font-bold text-zinc-900 font-mono">{threshold.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="0.9" step="0.01" 
                    value={threshold} 
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-zinc-900 border border-zinc-100"
                  />
                  <button 
                    onClick={handleUpdateThreshold}
                    disabled={isUpdating}
                    className="w-full h-12 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <RefreshCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                    Sync Engine
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-2xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider">Neural Weights</h3>
                <div className="h-64">
                  <D3BarChart data={importance} width={650} height={250} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-2xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider">Throughput</h3>
                <div className="h-80">
                  <D3LineChart data={trafficData} width={650} height={300} />
                </div>
              </div>

              <div className="lg:col-span-1 bg-white border border-zinc-200 p-6 rounded-2xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider">Distribution</h3>
                <div className="h-80 flex items-center justify-center">
                  <D3DonutChart data={userDist} size={240} />
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
