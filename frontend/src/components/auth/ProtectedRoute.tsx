import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';

// Returns true if founder's trial has expired AND they have no active paid subscription
const isTrialExpired = (user: any): boolean => {
  if (!user || (user.role !== 'founder' && user.role !== 'user')) return false;
  const hasActivePaidSub = (
    user.subscriptionStatus === 'active' &&
    user.plan &&
    user.plan !== 'free_trial' &&
    user.plan !== 'none'
  );
  if (hasActivePaidSub) return false;
  if (!user.trialEndDate) return false;
  return new Date(user.trialEndDate) < new Date();
};

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.status === 'suspended' || user.status === 'inactive') {
    // Account suspended or inactive, redirect to login
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = ((user.role as string) === 'user' || !user.role) ? 'founder' : user.role;

  if (allowedRoles && !allowedRoles.includes(effectiveRole as UserRole)) {
    // Role not authorized, redirect to their respective dashboard
    return <Navigate to={`/dashboard/${effectiveRole}`} replace />;
  }

  // Founder role check - allow access to founder dashboard pages

  if (effectiveRole === 'investor' || effectiveRole === 'mentor' || effectiveRole === 'founder') {
    const isApproved = user.approvalStatus === 'approved' || user.approvalStatus === 'APPROVED';
    if (!isApproved) {
      return <Navigate to={`/pending-approval?role=${effectiveRole}`} replace />;
    }
  }

  // ── Trial expiry gate for founders ──────────────────────────────
  if (effectiveRole === 'founder') {
    const expired = isTrialExpired(user);
    const isBillingPath = location.pathname === '/dashboard/founder/billing' ||
                          location.pathname.startsWith('/dashboard/founder/billing');
    if (expired && !isBillingPath) {
      return <Navigate to="/dashboard/founder/billing" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
