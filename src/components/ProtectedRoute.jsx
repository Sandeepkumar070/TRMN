import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function PageGuard({ accessKey, children }) {
  const { isAuthenticated, hasAccess, firstAllowedPath } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess(accessKey)) {
    return <Navigate to={firstAllowedPath()} replace />;
  }

  return children;
}
