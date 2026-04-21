import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  History, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  MessageSquare,
  BarChart3,
  User,
  Search,
  Upload,
  Cpu,
  Users,
  ScrollText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => {
  return (
    <Link to={path}>
      <motion.div
        className={`relative flex items-center p-3 mb-2 rounded-xl transition-all duration-300 group
          ${active 
            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-white/10" 
            : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={`w-5 h-5 ${active ? "text-cyan-400" : "group-hover:text-cyan-400"} transition-colors`} />
        
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 font-medium whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {active && (
          <motion.div
            layoutId="active-pill"
            className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const mainNav = [
    { label: "Dashboard",    path: "/dashboard",  icon: LayoutDashboard },
    { label: "New Scan",     path: "/scan",        icon: Search          },
    { label: "Batch Upload", path: "/batch",       icon: Upload          },
    { label: "History",      path: "/history",     icon: History         },
    { label: "Analytics",    path: "/analytics",   icon: BarChart3       },
  ];

  const adminNav = [
    { label: "Control Panel", path: "/admin",          icon: Cpu          },
    { label: "User Management", path: "/admin/users",  icon: Users        },
    { label: "Messages",      path: "/admin/messages", icon: MessageSquare },
    { label: "Audit Logs",    path: "/admin/logs",     icon: ScrollText   },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="relative h-screen glass border-r border-white/5 flex flex-col transition-all duration-300 z-50 shrink-0"
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
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  SmartInbox
                </span>
                <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                  Intelligence Suite
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 mt-4 overflow-y-auto no-scrollbar">
        <div className="mb-6">
          {!collapsed && (
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4 px-3">
              Main Menu
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
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4 px-3">
                Admin Console
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
      <div className="p-4 border-t border-white/5 bg-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.username || "User"}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-bold">{user?.role || "USER"}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={logout}
          className="w-full mt-4 flex items-center gap-3 p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          {!collapsed && <span className="font-bold text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
