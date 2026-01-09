import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 🔹 Auth hâlâ kontrol ediliyorsa bekle
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 🔹 Giriş yoksa login'e at
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔹 Admin yetkisi gerekiyorsa
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 🔹 Her şey OK
  return <>{children}</>;
}
