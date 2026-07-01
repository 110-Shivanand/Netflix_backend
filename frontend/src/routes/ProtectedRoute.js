import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner size="lg" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <Spinner size="lg" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.is_admin) return <Navigate to="/" replace />;
  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner size="lg" />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
