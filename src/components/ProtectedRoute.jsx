/**
 * File: src/components/ProtectedRoute.jsx
 * Purpose: Reusable UI component used across pages.
 */
import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "../services/auth";

// Renders the ProtectedRoute component.
export default function ProtectedRoute({ children, allowRole, allowRoles }) {
  const location = useLocation();
  const { token, role } = getAuth();

  const isAdminPath = location.pathname.startsWith("/admin");
  const loginPath = isAdminPath ? "/admin/login" : "/";

  if (!token) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  const allowed = allowRoles || (allowRole ? [allowRole] : null);
  if (allowed && !allowed.includes(role)) {
    return <Navigate to={isAdminPath ? "/admin/login" : "/"} replace />;
  }

  return children;
}

