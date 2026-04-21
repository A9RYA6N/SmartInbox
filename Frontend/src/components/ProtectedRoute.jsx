import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui/Spinner";

/**
 * ProtectedRoute
 * --------------
 * @param {boolean} requireAdmin  - if true, redirects non-admins to /dashboard
 *
 * Rules:
 *  - Not authenticated             → /login
 *  - requireAdmin && not admin     → /dashboard (403-style redirect)
 *  - requireAdmin=false && admin   → /admin (admin shouldn't use user routes)
 *  - Otherwise                     → render children
 */
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex bg-[#060b13] h-screen w-screen items-center justify-center">
        <Spinner size={48} className="text-cyan-500" />
      </div>
    );
  }

  // Not logged in → send to login, preserving destination
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Trying to access admin routes without admin role
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Non-admin user trying to access admin routes (shouldn't happen with proper requireAdmin, but belt & suspenders)
  if (!requireAdmin && user.role === "admin") {
    // Allow admins to access user-area pages (for analytics etc.) — don't force redirect
    // Just let them through so they can optionally use user features too
    return children;
  }

  return children;
};
