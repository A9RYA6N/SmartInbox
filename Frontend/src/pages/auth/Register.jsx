import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ShieldCheck, Zap, ChevronRight } from "lucide-react";
import { registerUser } from "../../api/authApi";
import { toast } from "react-hot-toast";

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(formData);
      toast.success("Identity established.");
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail) 
        ? detail.map(d => d.msg).join(", ") 
        : detail || "Registration failed.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white p-10 rounded-[2.5rem] border border-zinc-200"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="p-4 bg-zinc-900 rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Create Identity</h1>
          <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mt-3">
            Join the SmartInbox Network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase ml-1">Username</label>
            <div className="relative group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="text" 
                required 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all"
                placeholder="agent_smartinbox"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase ml-1">Email</label>
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all"
                placeholder="agent@smartinbox.ai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase ml-1">Passphrase</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 mt-4 bg-zinc-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Initialize
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-10 text-center">
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
             Already authorized? {" "}
             <Link to="/login" className="text-zinc-900 hover:underline transition-colors ml-1">
               Return to Login
             </Link>
           </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 text-[9px] font-bold text-zinc-300 uppercase tracking-[0.2em] border-t border-zinc-100 pt-10">
          <span className="flex items-center gap-2"><Lock size={12} /> TLS 1.3</span>
          <span className="flex items-center gap-2"><ShieldCheck size={12} /> Verified</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
