import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_URL } from '../config/api';

export type UserRole = 'founder' | 'mentor' | 'investor' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  status?: string;
  approvalStatus?: string;
  [key: string]: any;
}

export interface SubscriptionData {
  planType: string;
  subscriptionStatus: string;
  trialUsed: boolean;
  trialStart?: string;
  trialEnd?: string;
}

interface AuthContextType {
  user: User | null;
  subscription: SubscriptionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string; subscriptionStatus?: string }>;
  logout: () => void;
  checkAuth: () => Promise<{ subscriptionStatus?: string; role?: string } | null>;
  getToken: () => string | null;
  getPendingApprovals: () => any[];
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  getLoginLogs: () => any[];
  getAllUsers: () => any[];
  updateUserStatus: (userId: string, status: string) => void;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string) => void;
  refreshUsers: () => void;
  updateUserSubscription: (userId: string, data: { plan?: string; status?: string; paymentStatus?: string }) => Promise<void>;
}

const TOKEN_KEY = 'ai_startup_builder_jwt';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
  const removeToken = () => localStorage.removeItem(TOKEN_KEY);

  const fetchAllUsers = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.users) {
        const mapped = data.users.map((u: any) => ({
          id: u._id,
          name: u.fullName,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          status: u.status || 'active',
          approvalStatus: u.approvalStatus || 'approved',
          signupDate: u.createdAt,
          lastLoginAt: u.lastLoginAt || null,
          loginCount: u.loginCount || 0,
          plan: u.plan || 'none',
          subscriptionStatus: u.subscriptionStatus || 'none',
          paymentStatus: u.paymentStatus || '',
          trialEndDate: u.trialEndDate || null,
          subscriptionStartDate: u.subscriptionStartDate || null,
          subscriptionEndDate: u.subscriptionEndDate || null,
          // Common contact details (from signup)
          mobile: u.mobile || '',
          location: u.location || '',
          // Founder fields
          startupName: u.startupName || '',
          currentRole: u.currentRole || '',
          startupStage: u.startupStage || '',
          industry: u.industry || '',
          // Mentor fields (from signup)
          expertise: u.expertise || '',
          experienceYears: u.experienceYears || '',
          linkedin: u.linkedin || '',
          bio: u.bio || '',
          aadharNumber: u.aadharNumber || '',
          aadharDocUrl: u.aadharDocUrl || '',
          panNumber: u.panNumber || '',
          panDocUrl: u.panDocUrl || '',
          otherDocType: u.otherDocType || '',
          otherDocNumber: u.otherDocNumber || '',
          otherDocUrl: u.otherDocUrl || '',
          // Investor fields
          companyName: u.companyName || '',
          investorType: u.investorType || '',
          preferredIndustry: u.preferredIndustry || '',
          minInvestment: u.minInvestment || '',
          maxInvestment: u.maxInvestment || '',
        }));
        setAllUsers(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    }
  };

  const checkAuth = async (): Promise<{ subscriptionStatus?: string; role?: string } | null> => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      setUser(null);
      setSubscription(null);
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setUser({
          id: data.user._id,
          fullName: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
          isVerified: data.user.isVerified,
          status: data.user.status,
          approvalStatus: data.user.approvalStatus,
          // Login tracking fields
          lastLoginAt: data.user.lastLoginAt,
          loginCount: data.user.loginCount || 0,
          signupDate: data.user.createdAt,
          // Contact details (shared across roles)
          mobile: data.user.mobile,
          location: data.user.location,
          // Mentor profile fields (from mentor signup)
          expertise: data.user.expertise,
          experienceYears: data.user.experienceYears,
          linkedin: data.user.linkedin,
          bio: data.user.bio,
          // Mentor KYC / proof documents
          aadharNumber: data.user.aadharNumber,
          aadharDocUrl: data.user.aadharDocUrl,
          panNumber: data.user.panNumber,
          panDocUrl: data.user.panDocUrl,
          otherDocType: data.user.otherDocType,
          otherDocNumber: data.user.otherDocNumber,
          otherDocUrl: data.user.otherDocUrl,
          // Founder profile fields
          currentRole: data.user.currentRole,
          startupName: data.user.startupName,
          startupStage: data.user.startupStage,
          industry: data.user.industry,
          // Investor profile fields
          companyName: data.user.companyName,
          investorType: data.user.investorType,
          preferredIndustry: data.user.preferredIndustry,
          minInvestment: data.user.minInvestment,
          maxInvestment: data.user.maxInvestment,
          // Subscription fields flattened from API
          plan: data.user.plan,
          subscriptionStatus: data.user.subscriptionStatus,
          paymentStatus: data.user.paymentStatus,
          trialUsed: data.user.trialUsed,
          trialStartDate: data.user.trialStartDate,
          trialEndDate: data.user.trialEndDate,
        });
        if (data.subscription) {
          setSubscription(data.subscription);
        }
        if (data.user.role === 'admin') {
          fetchAllUsers();
        }
        return { subscriptionStatus: data.user.subscriptionStatus, role: data.user.role };
      } else {
        removeToken();
        setUser(null);
        setSubscription(null);
        setAllUsers([]);
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeToken();
      setUser(null);
      setSubscription(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: string; subscriptionStatus?: string }> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setToken(data.token);
        const authData = await checkAuth(); // Fetch full user & subscription data and update state
        return {
          success: true,
          role: authData?.role || data.user?.role,
          subscriptionStatus: authData?.subscriptionStatus || data.user?.subscriptionStatus
        };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      subscription,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      checkAuth,
      getToken,
      getPendingApprovals: () => allUsers.filter((u: any) => u.approvalStatus === 'pending'),
      approveUser: async (userId: string) => {
        const token = getToken();
        if (!token) return;
        try {
          await fetch(`${API_URL}/auth/admin/users/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId, action: 'approve' })
          });
          fetchAllUsers();
        } catch {}
      },
      rejectUser: async (userId: string) => {
        const token = getToken();
        if (!token) return;
        try {
          await fetch(`${API_URL}/auth/admin/users/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId, action: 'reject' })
          });
          fetchAllUsers();
        } catch {}
      },
      getLoginLogs: () => [],
      getAllUsers: () => allUsers,
      updateUserStatus: async (userId: string, status: string) => {
        const token = getToken();
        if (!token) return;
        try {
          await fetch(`${API_URL}/auth/admin/users/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId, action: 'updateStatus', status })
          });
          fetchAllUsers();
        } catch {}
      },
      deleteUser: async (userId: string) => {
        const token = getToken();
        if (!token) return;
        try {
          await fetch(`${API_URL}/auth/admin/users/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId, action: 'delete' })
          });
          fetchAllUsers();
        } catch {}
      },
      resetUserPassword: (_userId: string) => {},
      refreshUsers: () => { fetchAllUsers(); },
      updateUserSubscription: async (userId: string, data: { plan?: string; status?: string; paymentStatus?: string }) => {
        const token = getToken();
        if (!token) return;
        try {
          await fetch(`${API_URL}/auth/admin/users/subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId, ...data })
          });
          fetchAllUsers();
        } catch {}
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
