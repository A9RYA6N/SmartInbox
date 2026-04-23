import React, { useState, memo } from "react";
import { Sidebar } from "./Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { Command } from "lucide-react";
import { CommandPalette } from "../components/ui/CommandPalette";
import { NotificationBell } from "../components/ui/NotificationBell";
import { Outlet, useLocation } from "react-router-dom";

export const DashboardLayout = memo(() => {
  const location = useLocation();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      <CommandPalette isOpen={isCommandOpen} onClose={setIsCommandOpen} />

      <Sidebar />

      <main className="flex-1 relative overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Minimal Header */}
        <div className="sticky top-0 z-40 px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-end">
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-all group"
            >
              <Command size={14} className="group-hover:text-indigo-600 transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Command</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 p-8 min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
});
