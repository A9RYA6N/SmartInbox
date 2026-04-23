import React, { useState, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  History, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  MessageSquare,
  BarChart3,
  Search,
  Upload,
  Cpu,
  Users,
  ScrollText
} from "lucide-react";
import { useStore } from "../store/useStore";

const SidebarItem = memo(({ icon: Icon, label, path, active, collapsed }) => {
  return (
    <Link to={path}>
      <motion.div
        className={`relative flex items-center p-3 mb-1.5 rounded-xl transition-all group
          ${active 
            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={`w-5 h-5 ${active ? "text-white" : "group-hover:text-slate-900"} transition-colors`} />
        
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="ml-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
});

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const isAdmin = user?.role === "admin";

  const mainNav = [
    { label: "Dashboard",    path: "/dashboard",  icon: LayoutDashboard },
    { label: "New Scan",     path: "/scan",        icon: Search          },
    { label: "Batch Upload", path: "/batch",       icon: Upload          },
    { label: "History",      path: "/history",     icon: History         },
    { label: "Analytics",    path: "/analytics",   icon: BarChart3       },
  ];

  const adminNav = [
    { label: "smartinbox Core", path: "/admin",          icon: Cpu          },
    { label: "Nodes",      path: "/admin/users",    icon: Users        },
    { label: "Intercepts", path: "/admin/messages", icon: MessageSquare },
    { label: "Audits",     path: "/admin/logs",     icon: ScrollText   },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="relative h-screen bg-white border-r border-slate-200 flex flex-col transition-all z-50 shrink-0"
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="p-1.5 bg-slate-900 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg tracking-tighter text-slate-900">
                SmartInbox
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 mt-4 overflow-y-auto no-scrollbar">
        <div className="mb-8">
          {!collapsed && (
            <h4 className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 mb-4 px-3">
              Intelligence Matrix
            </h4>
          )}
          {mainNav.map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={location.pathname === item.path}
              collapsed={collapsed}
            />
          ))}
        </div>

        {isAdmin && (
          <div className="mb-6">
            {!collapsed && (
              <h4 className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 mb-4 px-3">
                SmartInbox Oversight
              </h4>
            )}
            {adminNav.map((item) => (
              <SidebarItem
                key={item.path}
                {...item}
                active={location.pathname === item.path}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-slate-900 truncate">{user?.username || "User"}</p>
              <p className="text-[9px] text-slate-400 truncate uppercase font-bold">{user?.role || "USER"}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={logout}
          className="w-full mt-4 flex items-center gap-3 p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
        >
          <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
          {!collapsed && <span className="font-bold text-[10px] uppercase tracking-widest">Disconnect</span>}
        </button>
      </div>
    </motion.aside>
  );
};

