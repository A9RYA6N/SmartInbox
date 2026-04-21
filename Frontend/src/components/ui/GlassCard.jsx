import { motion } from "framer-motion";
import { clsx } from "clsx";

export const GlassCard = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={clsx(
        "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl relative overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
