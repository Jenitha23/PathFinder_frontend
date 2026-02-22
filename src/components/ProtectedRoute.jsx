import { Navigate } from "react-router-dom";
import { getAuth } from "../services/auth";

export default function ProtectedRoute({ children, allowRole }) {
  const { token, role } = getAuth();
  if (!token) return <Navigate to="/" replace />;

  if (allowRole && role !== allowRole) return <Navigate to="/" replace />;
  return children;
}