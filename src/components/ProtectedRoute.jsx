// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

function hasAdminRole(user) {
  if (!user) return false;

  const roles = [];

  if (Array.isArray(user.roles)) {
    roles.push(...user.roles);
  } else if (user.roles) {
    roles.push(user.roles);
  }

  if (user.role) roles.push(user.role);
  if (user.papel) roles.push(user.papel);

  const normalized = roles
    .filter(Boolean)
    .map((r) => String(r).toUpperCase());

  return (
    normalized.some((r) => r.includes("ADMIN")) || user.admin === true
  );
}

export default function ProtectedRoute({ children }) {
  const { user } = useUser();

  // Visitante ou não logado
  if (!user || user.isVisitor) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = hasAdminRole(user);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
