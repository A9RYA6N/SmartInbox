import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldCheck, Zap, ChevronRight } from "lucide-react";
import { useStore } from "../../store/useStore";
import { toast } from "react-hot-toast";

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success("Identity verified.");
      const redirectPath = data.role === "admin" ? "/admin" : "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail) 
        ? detail.map(d => d.msg).join(", ") 
        : detail || "Authentication failed.";
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
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">SmartInbox</h1>
          <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mt-3">
            Secure Intelligence Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                Identify
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-10 space-y-4 text-center">
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
             Need access? {" "}
             <Link to="/register" className="text-zinc-900 hover:underline transition-colors ml-1">
               Create Identity
             </Link>
           </p>
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
             Management? {" "}
             <Link to="/admin/login" className="text-zinc-900 hover:underline transition-colors ml-1">
               Admin Portal
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

export default Login;
