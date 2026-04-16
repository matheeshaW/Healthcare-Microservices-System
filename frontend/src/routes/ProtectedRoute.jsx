import { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { Spinner } from "../components/ui";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" variant="primary" label="Loading..." />
      </div>
    );
  }

  if (roles && !roles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-3 text-sm text-slate-600">
            You don&apos;t have permission to access this page.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Required role: <span className="font-semibold">{roles.join(" or ")}</span>
          </p>
          <p className="text-sm text-slate-500">
            Your role: <span className="font-semibold">{user?.role || "unknown"}</span>
          </p>
          <Link
            to="/dashboard"
            className="mt-5 inline-block rounded-lg bg-cyan-600 px-5 py-2.5 font-semibold text-white transition hover:bg-cyan-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
