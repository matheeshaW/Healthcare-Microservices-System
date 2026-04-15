import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  // If roles are specified, check role
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;