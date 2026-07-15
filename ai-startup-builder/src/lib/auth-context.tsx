"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  User,
  Subscription,
  Notification,
  UserRole,
  SubscriptionPlan,
} from "./types";
import {
  getUserByEmail,
  getUserById,
  getSubscriptionByUserId,
  getNotificationsByUserId,
  createSubscription,
  updateSubscription,
  checkAndExpireTrials,
  createNotification,
  setCurrentUser,
  getCurrentUserId,
  hashPassword,
  verifyPassword,
  createUser,
  verifyUserEmail,
  updateUser,
  generateOTP,
  verifyOTP,
  generateResetOTP,
  verifyResetOTP,
} from "./store";
import { getDashboardRoute } from "./constants";

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  notifications: Notification[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (fullName: string, email: string, password: string, role: UserRole, plan: SubscriptionPlan) => Promise<{ success: boolean; error?: string }>;
  sendOTP: (email: string) => string;
  confirmOTP: (email: string, otp: string) => boolean;
  sendResetOTP: (email: string) => string;
  confirmResetOTP: (email: string, otp: string) => boolean;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  refreshSubscription: () => void;
  refreshNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  hasFeatureAccess: (feature: string) => boolean;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  trialTimeRemaining: string | null;
  upgradeSubscription: (plan: SubscriptionPlan) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(() => {
    if (!user) return;
    checkAndExpireTrials();
    const sub = getSubscriptionByUserId(user.id);
    setSubscription(sub || null);
  }, [user]);

  const refreshNotifications = useCallback(() => {
    if (!user) return;
    const notifs = getNotificationsByUserId(user.id);
    setNotifications(notifs);
  }, [user]);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      const foundUser = getUserById(userId);
      if (foundUser && !foundUser.suspended) {
        setUser(foundUser);
        const sub = getSubscriptionByUserId(foundUser.id);
        setSubscription(sub || null);
        const notifs = getNotificationsByUserId(foundUser.id);
        setNotifications(notifs);
      } else {
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshSubscription();
      }, 30000);
      refreshSubscription();
      refreshNotifications();
      return () => clearInterval(interval);
    }
  }, [user, refreshSubscription, refreshNotifications]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const foundUser = getUserByEmail(email);
    if (!foundUser) {
      return { success: false, error: "No account found with this email address." };
    }

    if (foundUser.suspended) {
      return { success: false, error: "Your account has been suspended. Please contact support." };
    }

    if (!foundUser.emailVerified) {
      return { success: false, error: "Please verify your email before logging in." };
    }

    const passwordValid = await verifyPassword(password, foundUser.password);
    if (!passwordValid) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    setUser(foundUser);
    setCurrentUser(foundUser.id);
    const sub = getSubscriptionByUserId(foundUser.id);
    setSubscription(sub || null);
    const notifs = getNotificationsByUserId(foundUser.id);
    setNotifications(notifs);

    checkAndExpireTrials();
    const refreshedSub = getSubscriptionByUserId(foundUser.id);
    setSubscription(refreshedSub || null);

    return { success: true };
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    plan: SubscriptionPlan
  ): Promise<{ success: boolean; error?: string }> => {
    const existing = getUserByEmail(email);
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const hashedPassword = await hashPassword(password);
    const newUser = createUser(fullName, email, hashedPassword, role);

    verifyUserEmail(newUser.id);

    if (plan) {
      createSubscription(newUser.id, plan);
    }

    createNotification(
      newUser.id,
      "Welcome to AI Startup Builder! 🎉",
      `Welcome aboard, ${fullName}! Your ${role} account has been created successfully. Start exploring the platform today.`,
      "welcome"
    );

    return { success: true };
  };

  const sendOTP = (email: string): string => {
    return generateOTP(email);
  };

  const confirmOTP = (email: string, otp: string): boolean => {
    return verifyOTP(email, otp);
  };

  const sendResetOTP = (email: string): string => {
    return generateResetOTP(email);
  };

  const confirmResetOTP = (email: string, otp: string): boolean => {
    return verifyResetOTP(email, otp);
  };

  const resetPassword = async (
    email: string,
    newPassword: string
  ): Promise<boolean> => {
    const foundUser = getUserByEmail(email);
    if (!foundUser) return false;
    const hashed = await hashPassword(newPassword);
    updateUser(foundUser.id, { password: hashed });
    return true;
  };

  const logout = () => {
    setUser(null);
    setSubscription(null);
    setNotifications([]);
    setCurrentUser(null);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    if (!user) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === user.id ? { ...n, read: true } : n))
    );
  };

  const isTrialActive =
    subscription?.status === "trial_active" &&
    subscription.trialEnd !== null &&
    new Date(subscription.trialEnd) > new Date();

  const isSubscriptionActive =
    subscription?.status === "active" &&
    subscription.subscriptionEnd !== null &&
    new Date(subscription.subscriptionEnd) > new Date();

  const trialTimeRemaining = (() => {
    if (!isTrialActive || !subscription?.trialEnd) return null;
    const diff = new Date(subscription.trialEnd).getTime() - Date.now();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  })();

  const hasFeatureAccess = (feature: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "mentor") {
      const aiFeatures = ["ai", "pitch deck", "business plan", "market analysis"];
      if (aiFeatures.some((f) => feature.toLowerCase().includes(f))) return false;
    }
    if (isSubscriptionActive) return true;
    if (isTrialActive) return true;
    return false;
  };

  const upgradeSubscription = async (plan: SubscriptionPlan) => {
    if (!user || !plan) return;
    const now = new Date().toISOString();
    const end =
      plan === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    updateSubscription(user.id, {
      plan,
      subscriptionStart: now,
      subscriptionEnd: end,
      status: "active",
      renewalDate: end,
    });

    createNotification(
      user.id,
      "Subscription Activated! 🎉",
      `Your ${plan === "monthly" ? "Monthly" : "Yearly"} plan is now active. Enjoy full access to all features!`,
      "subscription_success"
    );

    refreshSubscription();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        notifications,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        register,
        sendOTP,
        confirmOTP,
        sendResetOTP,
        confirmResetOTP,
        resetPassword,
        refreshSubscription,
        refreshNotifications,
        markNotificationRead,
        markAllRead,
        hasFeatureAccess,
        isTrialActive,
        isSubscriptionActive,
        trialTimeRemaining,
        upgradeSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
