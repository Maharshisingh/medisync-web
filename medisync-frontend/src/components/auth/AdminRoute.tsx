// src/components/auth/AdminRoute.tsx
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  // If a user exists and their role is 'admin', show the page.
  // Otherwise, redirect them to the homepage.
  if (user && user.role === 'admin') {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
};

export default AdminRoute;