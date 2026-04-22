import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Activity, 
  Clock, 
  Zap, 
  Lock, 
  ChevronRight,
  Shield,
  Search,
  BarChart3,
  Cpu,
  Layers,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import heroImg from "../assets/hero.png";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="glass-card p-8 group hover:shadow-xl hover:-translate-y-1 transition-all"
  >
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

export const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleStart = (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter an email to begin.");
    navigate("/login", { state: { email } });
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-grid-slate-200 pointer-events-none" />
      <div className="fixed inset-0 hero-gradient pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-slate-200/50 backdrop-blur-sm bg-white/50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">
            Smart<span className="text-indigo-600">Inbox</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors"
          >
            Agent Login
          </button>
          <button 
            onClick={() => navigate("/register")}
            className="btn-premium flex items-center gap-2 group"
          >
            Initialize Account
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase text-indigo-600 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Neural Core Online • v4.2.0
            </div>

            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] text-slate-900">
              Neutralize <br />
              <span className="gradient-text">SMS Threats.</span>
            </h1>

            <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-xl">
              Advanced neural interceptors designed to identify, isolate, and eliminate malicious SMS traffic before it reaches your inbox. 
            </p>

            <form onSubmit={handleStart} className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="relative flex-1 max-w-md group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="Enter corporate ID"
                  className="w-full pl-12 pr-4 h-16 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 shadow-xl shadow-slate-200/50 transition-all text-sm font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="h-16 px-10 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all"
              >
                Start Matrix Scan
              </button>
            </form>

            <div className="flex items-center gap-8 pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-50 bg-slate-200 flex items-center justify-center text-[10px] font-black">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Trusted by <span className="text-slate-900">12,000+</span> Security Analysts
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
            <img 
              src={heroImg} 
              alt="SmartInbox 3D Shield" 
              className="relative w-full drop-shadow-[0_35px_35px_rgba(79,70,229,0.15)] animate-float"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Defense Matrix Features</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em]">Precision • Intelligence • Speed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Shield} 
              title="Neural Intercept" 
              description="Real-time message filtering using state-of-the-art transformer models with 99.9% detection accuracy."
              delay={0.1}
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Threat Analytics" 
              description="Visualise spam trends and attack vectors through our high-performance D3-powered dashboard."
              delay={0.2}
            />
            <FeatureCard 
              icon={Cpu} 
              title="Sub-15ms Latency" 
              description="Optimized inference pipeline ensures that your protection never slows down your communication."
              delay={0.3}
            />
            <FeatureCard 
              icon={Layers} 
              title="Batch Telemetry" 
              description="Upload large datasets for historical analysis and threat pattern recognition in seconds."
              delay={0.4}
            />
            <FeatureCard 
              icon={Lock} 
              title="Zero-Knowledge" 
              description="Your data is encrypted end-to-end. Our models analyze patterns, not identities."
              delay={0.5}
            />
            <FeatureCard 
              icon={Activity} 
              title="Real-time Alerts" 
              description="Instant security notifications when malicious activity spikes are detected on your account."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-slate-900 rounded-[40px] p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.2),transparent)]" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl font-black text-white tracking-tighter">Ready to secure your communication?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Join the thousands of users protecting their mobile identity with the world's most advanced neural SMS filter.
            </p>
            <div className="flex justify-center pt-8">
              <button 
                onClick={() => navigate("/register")}
                className="bg-white text-slate-900 px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 hover:-translate-y-1 transition-all"
              >
                Initialize Secure Access
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3 opacity-50">
            <Zap className="w-5 h-5 text-slate-900" />
            <span className="font-black text-xl tracking-tighter text-slate-900">SmartInbox</span>
          </div>
          
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-900 transition-colors">API Reference</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Status</a>
          </div>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            © 2026 SmartInbox Systems • All Signals Encrypted
          </p>
        </div>
      </footer>
    </div>
  );
};

const Mail = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

