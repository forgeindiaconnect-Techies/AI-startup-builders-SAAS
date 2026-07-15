import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  getToken: () => string | null;
  // Legacy Admin stubs to prevent build errors
  getPendingApprovals: () => any[];
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  getLoginLogs: () => any[];
  getAllUsers: () => any[];
  updateUserStatus: (userId: string, status: string) => void;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string) => void;
  refreshUsers: () => void;
}

const TOKEN_KEY = 'ai_startup_builder_jwt';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
  const removeToken = () => localStorage.removeItem(TOKEN_KEY);

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      setUser(null);
      setSubscription(null);
      return;
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
          approvalStatus: data.user.approvalStatus
        });
        if (data.subscription) {
          setSubscription(data.subscription);
        }
      } else {
        removeToken();
        setUser(null);
        setSubscription(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeToken();
      setUser(null);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setToken(data.token);
        await checkAuth(); // Fetch full user & subscription data
        return { success: true, role: data.user?.role };
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
      getPendingApprovals: () => [],
      approveUser: () => {},
      rejectUser: () => {},
      getLoginLogs: () => [],
      getAllUsers: () => [],
      updateUserStatus: () => {},
      deleteUser: () => {},
      resetUserPassword: () => {},
      refreshUsers: () => {}
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
