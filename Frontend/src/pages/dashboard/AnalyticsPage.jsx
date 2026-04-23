import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  Activity,
  TrendingUp,
  ShieldAlert,
  Zap,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { getSpamTrends, getUserStats } from "../../api/spamApi";
import { toast } from "react-hot-toast";

export const AnalyticsPage = () => {
  const storeTrends = useStore((state) => state.trends);
  const storeStats = useStore((state) => state.stats);

  const [trends, setTrends] = useState([]);
  const [stats, setStats] = useState(storeStats);
  const [loading, setLoading] = useState(true);
  const [lookback, setLookback] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [trendData, statData] = await Promise.all([
        getSpamTrends(lookback),
        getUserStats()
      ]);
      setTrends((trendData.points || []).map(p => ({
        date: p.date,
        spam: p.spam_count,
        ham: p.ham_count
      })));
      setStats(statData);
    } catch (err) {
      toast.error("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [lookback]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Intelligence Analytics</h1>
          <p className="text-slate-500 text-sm">Real-time telemetry and pattern recognition.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
          {[7, 14, 30].map(v => (
            <button 
              key={v}
              onClick={() => setLookback(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium ${lookback === v ? "bg-slate-900 text-white" : "text-slate-500"}`}
            >
              {v}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={cardVariants} className="lg:col-span-2 minimal-card p-6 h-[400px]">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={18} /> Detection Velocity
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="spam" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
              <Area type="monotone" dataKey="ham" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={cardVariants} className="minimal-card p-6 h-[400px]">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <ShieldAlert size={18} /> Threat Matrix
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Spam", value: stats?.spam_blocked || 0 },
                  { name: "Clean", value: (stats?.total_scanned || 0) - (stats?.spam_blocked || 0) }
                ]}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill="#f43f5e" />
                <Cell fill="#3b82f6" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};
