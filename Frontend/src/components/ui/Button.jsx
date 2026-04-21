import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

export const Button = ({ children, variant = "primary", isLoading, className, disabled, ...props }) => {
  const baseClasses = "flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 shadow-lg active:scale-95";

  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white shadow-cyan-500/25 focus:ring-cyan-500/50",
    secondary: "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 focus:ring-white/20",
    danger: "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/25 focus:ring-rose-500/50",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 shadow-none border border-transparent hover:text-white",
  };

  return (
    <button
      className={clsx(baseClasses, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
};
