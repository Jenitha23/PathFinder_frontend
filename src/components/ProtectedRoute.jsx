import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "../services/auth";

// allowRole can be: "STUDENT" | "COMPANY" | "ADMIN"
// OR allowRoles can be: ["STUDENT","COMPANY"]
export default function ProtectedRoute({ children, allowRole, allowRoles }) {
  const location = useLocation();
  const { token, role } = getAuth();

  if (!token) return <Navigate to="/" replace state={{ from: location.pathname }} />;

  const allowed = allowRoles || (allowRole ? [allowRole] : null);
  if (allowed && !allowed.includes(role)) return <Navigate to="/" replace />;

  return children;
}