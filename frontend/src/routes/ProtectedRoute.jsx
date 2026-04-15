/**
 * ProtectedRoute Component
 */

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const ProtectedRoute = ({
  children,
  requiredRole = null,
  fallbackPath = "/login",
}) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  // While checking authentication, show loading spinner
  if (!token) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If user is not authenticated, redirect to login
  if (!user && !token) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If a specific role is required, check if user has it
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-lg text-slate-600">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-slate-500">
            Required role: <span className="font-semibold">{requiredRole}</span>
          </p>
          <p className="text-sm text-slate-500">
            Your role:{" "}
            <span className="font-semibold">{user?.role || "unknown"}</span>
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
