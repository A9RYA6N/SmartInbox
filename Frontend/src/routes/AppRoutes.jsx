import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute";
import { DashboardLayout } from "../layout/DashboardLayout";

// Public pages
import { LandingPage }    from "../pages/LandingPage";
import { Login }          from "../pages/auth/Login";
import { Register }       from "../pages/auth/Register";

// Dashboard pages
import { UserDashboard }  from "../pages/dashboard/UserDashboard";
import { AdminDashboard } from "../pages/dashboard/AdminDashboard";
import { ScanPage }       from "../pages/dashboard/ScanPage";
import { ResultsPage }    from "../pages/dashboard/ResultsPage";
import { HistoryPage }    from "../pages/dashboard/HistoryPage";
import { AnalyticsPage }  from "../pages/dashboard/AnalyticsPage";
import { BatchUploadPage } from "../pages/dashboard/BatchUploadPage";

// Admin-specific pages
import { AdminUsersPage }    from "../pages/dashboard/AdminUsersPage";
import { AdminMessagesPage } from "../pages/dashboard/AdminMessagesPage";
import { AdminLogsPage }     from "../pages/dashboard/AdminLogsPage";
import { useAuth }           from "../context/AuthContext";

// ── Smart catch-all: redirect based on auth state ─────────────────────────────
const SmartRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public (redirect out if already logged in) ─────────────────── */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <LandingPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* ── Protected User Routes ──────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/scan"      element={<ScanPage />}      />
        <Route path="/results"   element={<ResultsPage />}   />
        <Route path="/history"   element={<HistoryPage />}   />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/batch"     element={<BatchUploadPage />} />
      </Route>

      {/* ── Protected Admin Routes ─────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute requireAdmin={true}>
            <DashboardLayout isAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="/admin"          element={<AdminDashboard />}  />
        <Route path="/admin/users"    element={<AdminUsersPage />}  />
        <Route path="/admin/messages" element={<AdminMessagesPage />} />
        <Route path="/admin/logs"     element={<AdminLogsPage />}   />
      </Route>

      {/* ── Catch-all: smart redirect based on auth ───────────────────── */}
      <Route path="*" element={<SmartRedirect />} />
    </Routes>
  );
};
