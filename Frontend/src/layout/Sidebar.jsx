import React, { useState } from "react";
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
import { useAuth } from "../context/AuthContext";

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => {
  return (
    <Link to={path}>
      <div
        className={`relative flex items-center p-2.5 mb-1.5 rounded-lg transition-all duration-200 group
          ${active 
            ? "bg-slate-100 text-slate-900 font-medium" 
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
      >
        <Icon className={`w-4 h-4 ${active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-600"} transition-colors`} />
        
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
              className="ml-3 text-sm whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
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
      animate={{ width: collapsed ? 70 : 240 }}
      className="relative h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-50 shrink-0"
    >
      {/* Logo Section */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="p-1.5 bg-slate-50 rounded-md">
                <Zap className="w-4 h-4 text-slate-900" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  SmartInbox
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-600 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
        <div className="mb-6">
          {!collapsed && (
            <h4 className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 mb-2 px-2">
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
              <h4 className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 mb-2 px-2">
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
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.username || "User"}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-medium">{user?.role || "USER"}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={logout}
          className="w-full mt-3 flex items-center justify-center gap-2 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
        >
          <LogOut size={16} />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
