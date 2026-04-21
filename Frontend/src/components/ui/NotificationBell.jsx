import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldAlert, Info, Check } from "lucide-react";
import { axiosClient } from "../../api/axiosClient";

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifs = async () => {
    try {
      const { data } = await axiosClient.get("/notifications");
      setNotifications(data.items || []);
    } catch (err) {
      console.error("Failed to sync notifications.");
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleRead = async (id) => {
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to update notification status.");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-2xl border transition-all relative group ${isOpen ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white shadow-lg'}`}
      >
        <Bell size={18} className={`${unreadCount > 0 ? 'animate-[swing_2s_ease-in-out_infinite]' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] border-2 border-[#020617]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 glass border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Bell size={14} className="text-cyan-400" />
                  Security Alerts
                </h4>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div 
                      key={n.id}
                      className={`p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors relative group ${!n.is_read ? 'bg-cyan-500/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${n.type === 'security' ? 'bg-rose-500/10 text-rose-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                          {n.type === 'security' ? <ShieldAlert size={16} /> : <Info size={16} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{n.title}</p>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1 line-clamp-3">{n.message}</p>
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-2">
                            {new Date(n.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {!n.is_read && (
                        <button 
                          onClick={() => handleRead(n.id)}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/5 rounded-md text-emerald-400 hover:bg-emerald-500/20"
                          title="Mark as Read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-500">
                    <p className="text-xs italic font-medium">No alerts detected.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
