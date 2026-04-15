/**
 * ProtectedRoute Component
 */

import { useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Spinner } from "../components/ui";

function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  // If no authentication token is present, redirect to login
  if (!token) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If token exists but user hasn't been loaded yet, show loading state
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" variant="primary" label="Loading..." />
      </div>
    );
  }

  // If specific roles are required, check if user has one of them
  if (roles && !roles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-lg text-slate-600">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-slate-500">
            Required role:{" "}
            <span className="font-semibold">{roles.join(" or ")}</span>
          </p>
          <p className="text-sm text-slate-500">
            Your role:{" "}
            <span className="font-semibold">{user?.role || "unknown"}</span>
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // If roles are specified, check role
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
