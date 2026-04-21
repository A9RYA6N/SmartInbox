import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui/Spinner";

/**
 * PublicOnlyRoute
 * ---------------
 * Wraps public pages (/, /login) so that already-authenticated users
 * are automatically bounced into the app instead of seeing the public page.
 *
 * - isLoading      → show spinner (auth state not yet resolved)
 * - admin user     → /admin
 * - regular user   → /dashboard
 * - unauthenticated → render children (show the public page)
 */
export const PublicOnlyRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex bg-[#060b13] h-screen w-screen items-center justify-center">
        <Spinner size={48} className="text-cyan-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};
