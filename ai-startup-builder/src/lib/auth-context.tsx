"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Subscription, Notification, UserRole, SubscriptionPlan } from "./types";
import {
  getUserByEmail,
  getUserById,
  createUser,
  getSubscriptionByUserId,
  createSubscription,
  updateSubscription,
  getNotifications,
  addNotification,
  markNotificationRead as markNotifRead,
  markAllNotificationsRead as markAllNotifsRead,
  getCurrentUserId,
  setCurrentUser,
  generateOTP,
  verifyOTP,
  generateResetOTP,
  verifyResetOTP,
  hashPassword,
  verifyPassword,
  updateUser,
  checkAndExpireTrials,
} from "./store";

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  notifications: Notification[];
  isAuthenticated: boolean;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  trialTimeRemaining: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    plan: SubscriptionPlan
  ) => Promise<{ success: boolean; error?: string }>;
  sendOTP: (email: string) => string;
  confirmOTP: (email: string, otp: string) => boolean;
  sendResetOTP: (email: string) => string;
  confirmResetOTP: (email: string, otp: string) => boolean;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  upgradeSubscription: (plan: SubscriptionPlan) => Promise<{ success: boolean; error?: string }>;
  markNotificationRead: (notificationId: string) => void;
  markAllRead: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trialTimeRemaining, setTrialTimeRemaining] = useState<string | null>(null);

  const refreshState = useCallback(() => {
    checkAndExpireTrials();
    const currentId = getCurrentUserId();
    if (!currentId) {
      setUser(null);
      setSubscription(null);
      setNotifications([]);
      setTrialTimeRemaining(null);
      return;
    }

    const u = getUserById(currentId);
    if (!u) {
      setCurrentUser(null);
      setUser(null);
      setSubscription(null);
      setNotifications([]);
      setTrialTimeRemaining(null);
      return;
    }

    setUser(u);
    const sub = getSubscriptionByUserId(u.id) || null;
    setSubscription(sub);
    setNotifications(getNotifications(u.id));
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Trial countdown timer
  useEffect(() => {
    if (!subscription || subscription.status !== "trial_active" || !subscription.trialEnd) {
      setTrialTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const end = new Date(subscription.trialEnd!).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        checkAndExpireTrials();
        refreshState();
        setTrialTimeRemaining(null);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const formatted = `${hours.toString().padStart(2, "0")}h ${minutes
        .toString()
        .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;

      setTrialTimeRemaining(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [subscription, refreshState]);

  const login = async (email: string, password: string) => {
    const u = getUserByEmail(email);
    if (!u) {
      return { success: false, error: "No account found with this email address." };
    }

    const valid = await verifyPassword(password, u.passwordHash);
    if (!valid) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    setCurrentUser(u.id);
    refreshState();
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setUser(null);
    setSubscription(null);
    setNotifications([]);
    setTrialTimeRemaining(null);
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    plan: SubscriptionPlan
  ) => {
    const existing = getUserByEmail(email);
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(password);
    const newUser = createUser({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role,
      emailVerified: true,
    });

    createSubscription(newUser.id, plan);
    addNotification(
      newUser.id,
      "Welcome to AI Startup Builder!",
      `Your account has been created successfully with the ${plan} plan.`
    );

    setCurrentUser(newUser.id);
    refreshState();
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

  const resetPassword = async (email: string, newPassword: string) => {
    const u = getUserByEmail(email);
    if (!u) {
      return { success: false, error: "Account not found." };
    }

    const passwordHash = await hashPassword(newPassword);
    updateUser(u.id, { passwordHash });
    return { success: true };
  };

  const upgradeSubscription = async (plan: SubscriptionPlan) => {
    if (!user) {
      return { success: false, error: "You must be logged in." };
    }

    const newSub = createSubscription(user.id, plan);
    setSubscription(newSub);
    addNotification(
      user.id,
      "Subscription Updated",
      `Your subscription has been updated to ${plan}.`
    );
    refreshState();
    return { success: true };
  };

  const markNotificationRead = (notificationId: string) => {
    markNotifRead(notificationId);
    if (user) {
      setNotifications(getNotifications(user.id));
    }
  };

  const markAllRead = () => {
    if (user) {
      markAllNotifsRead(user.id);
      setNotifications(getNotifications(user.id));
    }
  };

  const isAuthenticated = !!user;
  const isTrialActive = subscription?.status === "trial_active";
  const isSubscriptionActive =
    subscription?.status === "active" || subscription?.status === "trial_active";

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        notifications,
        isAuthenticated,
        isTrialActive,
        isSubscriptionActive,
        trialTimeRemaining,
        login,
        logout,
        register,
        sendOTP,
        confirmOTP,
        sendResetOTP,
        confirmResetOTP,
        resetPassword,
        upgradeSubscription,
        markNotificationRead,
        markAllRead,
        refreshUser: refreshState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
