import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute";
import { DashboardLayout } from "../layout/DashboardLayout";
import { useStore } from "../store/useStore";
import { Spinner } from "../components/ui/Spinner";

// Public pages
const LandingPage = lazy(() => import("../pages/LandingPage"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const AdminLogin = lazy(() => import("../pages/auth/AdminLogin"));
const AdminRegister = lazy(() => import("../pages/auth/AdminRegister"));

// Dashboard pages
const UserDashboard = lazy(() => import("../pages/dashboard/UserDashboard"));
const AdminDashboard = lazy(() => import("../pages/dashboard/AdminDashboard"));
const ScanPage = lazy(() => import("../pages/dashboard/ScanPage"));
const ResultsPage = lazy(() => import("../pages/dashboard/ResultsPage"));
const HistoryPage = lazy(() => import("../pages/dashboard/HistoryPage"));
const AnalyticsPage = lazy(() => import("../pages/dashboard/AnalyticsPage"));
const BatchUploadPage = lazy(() => import("../pages/dashboard/BatchUploadPage"));

// Admin-specific pages
const AdminUsersPage = lazy(() => import("../pages/dashboard/AdminUsersPage"));
const AdminMessagesPage = lazy(() => import("../pages/dashboard/AdminMessagesPage"));
const AdminLogsPage = lazy(() => import("../pages/dashboard/AdminLogsPage"));

const SuspenseLayout = ({ children }) => (
  <Suspense fallback={
    <div className="flex h-64 w-full items-center justify-center">
      <Spinner size={32} className="text-indigo-600" />
    </div>
  }>
    {children}
  </Suspense>
);

const SmartRedirect = () => {
  const user = useStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
};

export const AppRoutes = () => (
  <Suspense fallback={
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <Spinner size={48} className="text-indigo-600" />
    </div>
  }>
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <SuspenseLayout>
              <LandingPage />
            </SuspenseLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <SuspenseLayout>
              <Login />
            </SuspenseLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <SuspenseLayout>
              <Register />
            </SuspenseLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/admin/login"
        element={
          <PublicOnlyRoute>
            <SuspenseLayout>
              <AdminLogin />
            </SuspenseLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/admin/register"
        element={
          <PublicOnlyRoute>
            <SuspenseLayout>
              <AdminRegister />
            </SuspenseLayout>
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<SuspenseLayout><UserDashboard /></SuspenseLayout>} />
        <Route path="/scan"      element={<SuspenseLayout><ScanPage /></SuspenseLayout>}      />
        <Route path="/results"   element={<SuspenseLayout><ResultsPage /></SuspenseLayout>}   />
        <Route path="/history"   element={<SuspenseLayout><HistoryPage /></SuspenseLayout>}   />
        <Route path="/analytics" element={<SuspenseLayout><AnalyticsPage /></SuspenseLayout>} />
        <Route path="/batch"     element={<SuspenseLayout><BatchUploadPage /></SuspenseLayout>} />
      </Route>

      <Route
        element={
          <ProtectedRoute requireAdmin={true}>
            <DashboardLayout isAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="/admin"          element={<SuspenseLayout><AdminDashboard /></SuspenseLayout>}  />
        <Route path="/admin/users"    element={<SuspenseLayout><AdminUsersPage /></SuspenseLayout>}  />
        <Route path="/admin/messages" element={<SuspenseLayout><AdminMessagesPage /></SuspenseLayout>} />
        <Route path="/admin/logs"     element={<SuspenseLayout><AdminLogsPage /></SuspenseLayout>}   />
      </Route>

      <Route path="*" element={<SmartRedirect />} />
    </Routes>
  </Suspense>
);
