import React, { memo } from "react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "../components/ui/NotificationBell";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const DashboardLayout = memo(() => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden relative">
      <Sidebar />

      <main className="flex-1 relative overflow-y-auto no-scrollbar">
        {/* Minimal Header */}
        <div className="sticky top-0 z-40 px-8 py-3 bg-white/50 backdrop-blur-sm border-b border-zinc-100 flex justify-end items-center">
          <NotificationBell />
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
