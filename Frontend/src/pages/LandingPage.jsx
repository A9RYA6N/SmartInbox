import React, { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield, Activity, Cpu, Lock,
  ArrowRight, Zap, ChevronRight, CheckCircle2,
  Globe, Sparkles, TrendingUp
} from "lucide-react";
import { useStore } from "../store/useStore";
import { toast } from "react-hot-toast";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const login = useStore((state) => state.login);
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const handleDemoAccess = async () => {
    setIsDemoLoading(true);
    try {
      // Use the verified demo credentials from the database
      await login("demo@example.com", "demo1234");
      toast.success("Intelligence access granted. Initializing demo environment.");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Demo authentication failed. Please try manual login.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Vibrant Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-100/30 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg shadow-indigo-200">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">SmartInbox</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate("/login")} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Access</button>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
            >
              Initialize
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"></span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] text-slate-900">
              Neutralize<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-gradient-x pb-2">
                Threats
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Deploy advanced neural interceptors designed to identify, isolate, and eliminate malicious SMS traffic before it breaches your perimeter.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <button
              onClick={() => navigate("/register")}
              className="group flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95"
            >
              Secure Access
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleDemoAccess}
              disabled={isDemoLoading}
              className="group flex items-center gap-3 bg-white px-10 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isDemoLoading ? (
                <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <Sparkles size={0} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
              )}
              Quick Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Neural Shield",
              color: "bg-indigo-50 text-indigo-600 border-indigo-100",
              desc: "4-layer hybrid intelligence combining ML ensemble and LLM semantic analysis."
            },
            {
              icon: Activity,
              title: "Real-time Matrix",
              color: "bg-emerald-50 text-emerald-600 border-emerald-100",
              desc: "Instant telemetry and threat mapping with sub-10ms response times."
            },
            {
              icon: Lock,
              title: "Vault Protocol",
              color: "bg-rose-50 text-rose-600 border-rose-100",
              desc: "End-to-end encrypted audit logs with decentralized data sovereignty."
            }
          ].map((feature, i) => (
            <div key={i} className="group bg-slate-50 border border-slate-100 p-10 rounded-[2.5rem] hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className={`p-4 rounded-2xl w-fit mb-8 border ${feature.color}`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <TrendingUp size={200} className="text-white rotate-12" />
          </div>

          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              Secure your communication matrix today.
            </h2>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-indigo-600 px-12 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-black/10"
            >
              Deploy Matrix
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          &copy;
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
