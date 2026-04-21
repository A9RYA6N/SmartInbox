import React, { useEffect, useRef, useState } from "react";
import { Sidebar } from "./Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { Command } from "lucide-react";
import { CommandPalette } from "../components/ui/CommandPalette";
import { NotificationBell } from "../components/ui/NotificationBell";
import { Outlet, useLocation } from "react-router-dom";

// ── Cursor glow rendered via direct DOM style – zero React state updates ───────
const CursorGlow = () => {
  const glowRef = useRef(null);
  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;
    let raf;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, rgba(59,130,246,0.13), transparent 80%)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed inset-0 z-30 opacity-60 transition-none"
    />
  );
};

export const DashboardLayout = () => {
  const location = useLocation();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden relative">
      <CursorGlow />

      <CommandPalette isOpen={isCommandOpen} onClose={setIsCommandOpen} />

      <Sidebar />

      <main className="flex-1 relative overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Decorative Background Blobs */}
        <div className="blob w-[500px] h-[500px] bg-purple-600/10 top-[-10%] right-[-10%]" />
        <div className="blob w-[400px] h-[400px] bg-blue-600/10 bottom-[-10%] left-[-10%] animate-float" />

        {/* Top bar for Command Palette trigger */}
        <div className="sticky top-0 z-40 px-8 py-4 bg-[#020617]/50 backdrop-blur-md border-b border-white/5 flex justify-end">
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-500 cursor-pointer hover:border-white/20 transition-all group"
            >
              <Command size={14} className="group-hover:text-cyan-400 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Command</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-8 min-h-[calc(100vh-64px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
