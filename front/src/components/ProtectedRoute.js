// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;

  return children;
}
