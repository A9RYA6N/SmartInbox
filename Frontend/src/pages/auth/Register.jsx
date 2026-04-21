import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ShieldCheck, Zap, ChevronRight, Sparkles } from "lucide-react";
import { registerUser } from "../../api/authApi";
import { toast } from "react-hot-toast";
import { Hero3D } from "../../components/3d/Hero3D";

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "" 
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerUser(formData);
      toast.success("Identity established. Access protocols initialized.");
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail) 
        ? detail.map(d => d.msg).join(", ") 
        : detail || "Registration sequence failed.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-[#020617]">
      <Hero3D />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] z-10"
      >
        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 mb-4"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              CREATE IDENTITY
            </h1>
            <p className="text-slate-500 text-xs font-bold tracking-[0.3em] mt-2 uppercase">
              Join the SmartInbox Network
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase ml-1">Username</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  required 
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-premium w-full pl-12 h-14"
                  placeholder="agent_alpha"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase ml-1">Neural Access Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-premium w-full pl-12 h-14"
                  placeholder="agent@smartinbox.ai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase ml-1">Security Passphrase</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-premium w-full pl-12 h-14 tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-premium w-full h-14 mt-4 flex items-center justify-center gap-3 text-sm font-black tracking-[0.2em] uppercase disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Initialize Account
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               Already have access? {" "}
               <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors ml-1">
                 Return to Login
               </Link>
             </p>
          </div>

          {/* Footer Info */}
          <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Lock size={12} /> Encrypted</span>
            <span className="flex items-center gap-2"><ShieldCheck size={12} /> Verified</span>
          </div>
        </div>

        {/* AI Hint Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass p-4 rounded-2xl flex items-center gap-4 border border-white/10"
        >
          <div className="p-2 bg-cyan-500/10 rounded-xl">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium italic">
            "Identity creation protocols in progress. Encrypted keys generated on device."
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
