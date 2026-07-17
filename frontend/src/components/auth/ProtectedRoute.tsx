import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"><div className="w-10 h-10 border-4 border-[#6C4CF1] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!isAuthenticated || !user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to their respective dashboard
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  if (user.role === 'founder' && user.subscriptionStatus === 'expired') {
    const isAllowedPath = location.pathname.includes('/billing') || location.pathname.includes('/profile');
    if (!isAllowedPath) {
      return <Navigate to="/dashboard/founder/billing" replace state={{ expired: true }} />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
