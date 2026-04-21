import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, UserCircle, ShieldAlert } from "lucide-react";
import { clsx } from "clsx";

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, role: "user" },
        { label: "Admin Console", path: "/admin", icon: ShieldAlert, role: "admin" },
    ];

    return (
        <div className="flex h-screen bg-transparent overflow-hidden">
            {/* Sidebar - Glassmorphism */}
            <aside className="w-64 flex flex-col p-4 m-4 glass border-r border-white/10 z-10 shrink-0">
                <div className="flex items-center gap-3 px-2 mb-8 mt-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                        <ShieldAlert color="white" size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        SmartInbox
                    </h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => {
                        if (item.role === "admin" && user?.role !== "admin") return null;
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                    active
                                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                )}
                            >
                                {active && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-sky-500 rounded-r-md blur-[1px]"></span>
                                )}
                                <item.icon size={20} className={active ? "text-sky-400" : "group-hover:text-slate-300 transition-colors"} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-4 mt-auto border-t border-white/10 flex flex-col gap-2">
                    <div className="px-3 py-2 flex items-center gap-3">
                        <UserCircle size={28} className="text-slate-400" />
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-white max-w-[140px] truncate">{user?.username}</span>
                            <span className="text-xs text-sky-400 font-medium capitalize">{user?.role}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={20} />
                        Check Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto pt-6 pb-6 pr-6">
                <div className="relative h-full flex flex-col">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
