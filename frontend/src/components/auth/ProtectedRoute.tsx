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

  const effectiveRole = ((user.role as string) === 'user' || !user.role) ? 'founder' : user.role;

  if (allowedRoles && !allowedRoles.includes(effectiveRole as UserRole)) {
    // Role not authorized, redirect to their respective dashboard
    return <Navigate to={`/dashboard/${effectiveRole}`} replace />;
  }

  if (effectiveRole === 'founder' && user.subscriptionStatus !== 'active') {
    const isAllowedPath = location.pathname.includes('/billing') || location.pathname.includes('/profile') || location.pathname.includes('/ai-builder') || location.pathname.includes('/ai_builder') || location.pathname.includes('/startups') || location.pathname.includes('/documents') || location.pathname.includes('/roadmap') || location.pathname.includes('/notifications') || location.pathname.includes('/funding') || location.pathname.includes('/mentors') || location.pathname.includes('/originality-check') || location.pathname.includes('/originality_check') || location.pathname.includes('/plagiarism');
    if (!isAllowedPath && !location.pathname.endsWith('/founder')) {
      return <Navigate to="/dashboard/founder/billing" replace state={{ expired: true }} />;
    }
  }

  if (effectiveRole === 'investor') {
    const isApproved = user.approvalStatus === 'approved' || user.approvalStatus === 'APPROVED';
    if (!isApproved) {
      return <Navigate to="/pending-approval?role=investor" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
