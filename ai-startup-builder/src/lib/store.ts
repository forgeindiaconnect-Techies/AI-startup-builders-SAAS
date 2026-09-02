import { User, Subscription, Notification, UserRole, SubscriptionPlan } from "./types";

export const STORAGE_KEYS = {
  USERS: "asb_users",
  SUBSCRIPTIONS: "asb_subscriptions",
  NOTIFICATIONS: "asb_notifications",
  CURRENT_USER: "asb_current_user",
};

export function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const item = localStorage.getItem(key);
  if (!item) return [];
  try {
    return JSON.parse(item);
  } catch {
    return [];
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Users
export function getUsers(): User[] {
  return getFromStorage<User>(STORAGE_KEYS.USERS);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function createUser(user: Omit<User, "id" | "createdAt">): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);
  return newUser;
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  saveToStorage(STORAGE_KEYS.USERS, users);
  return users[index];
}

export function verifyUserEmail(userId: string): void {
  updateUser(userId, { emailVerified: true });
}

// Subscriptions
export function getSubscriptions(): Subscription[] {
  return getFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
}

export function getSubscriptionByUserId(userId: string): Subscription | undefined {
  return getSubscriptions().find((s) => s.userId === userId);
}

export function createSubscription(
  userId: string,
  plan: SubscriptionPlan
): Subscription {
  const subs = getSubscriptions();
  const now = new Date();

  let status: Subscription["status"] = "active";
  let trialStart: string | undefined;
  let trialEnd: string | undefined;
  let subscriptionStart: string | undefined;
  let subscriptionEnd: string | undefined;

  if (plan === "free_trial") {
    status = "trial_active";
    trialStart = now.toISOString();
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    trialEnd = endDate.toISOString();
  } else if (plan === "monthly") {
    status = "active";
    subscriptionStart = now.toISOString();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    subscriptionEnd = endDate.toISOString();
  } else if (plan === "yearly") {
    status = "active";
    subscriptionStart = now.toISOString();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);
    subscriptionEnd = endDate.toISOString();
  }

  const newSub: Subscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    plan,
    status,
    createdAt: now.toISOString(),
    trialStart,
    trialEnd,
    subscriptionStart,
    subscriptionEnd,
  };

  const existingIndex = subs.findIndex((s) => s.userId === userId);
  if (existingIndex !== -1) {
    subs[existingIndex] = newSub;
  } else {
    subs.push(newSub);
  }
  saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subs);
  return newSub;
}

export function updateSubscription(
  userId: string,
  updates: Partial<Subscription>
): Subscription | null {
  const subs = getSubscriptions();
  const index = subs.findIndex((s) => s.userId === userId);
  if (index === -1) return null;
  subs[index] = { ...subs[index], ...updates };
  saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subs);
  return subs[index];
}

export function checkAndExpireTrials(): void {
  const subs = getSubscriptions();
  const now = new Date();
  let changed = false;

  for (const sub of subs) {
    if (sub.status === "trial_active" && sub.trialEnd) {
      if (new Date(sub.trialEnd) <= now) {
        sub.status = "trial_expired";
        changed = true;
      }
    }
    if (sub.status === "active" && sub.subscriptionEnd) {
      if (new Date(sub.subscriptionEnd) <= now) {
        sub.status = "expired";
        changed = true;
      }
    }
  }

  if (changed) {
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subs);
  }
}

// Notifications
export function getNotifications(userId?: string): Notification[] {
  const all = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  if (!userId) return all;
  return all.filter((n) => n.userId === userId);
}

export function addNotification(
  userId: string,
  title: string,
  message: string
): Notification {
  const notifications = getNotifications();
  const newNotif: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(newNotif);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  return newNotif;
}

export function markNotificationRead(notificationId: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    notifications[index].read = true;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
}

export function markAllNotificationsRead(userId: string): void {
  const notifications = getNotifications();
  notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

// Current Session
export function setCurrentUser(userId: string | null): void {
  if (typeof window === "undefined") return;
  if (userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

// OTP Storage (simulated)
const otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

export function generateOTP(email: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  console.log(`[OTP for ${email}]: ${otp}`);
  return otp;
}

export function verifyOTP(email: string, otp: string): boolean {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  if (record.otp !== otp) return false;
  otpStore.delete(email.toLowerCase());
  return true;
}

// Password reset OTP
const resetOtpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

export function generateResetOTP(email: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  resetOtpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  console.log(`[Reset OTP for ${email}]: ${otp}`);
  return otp;
}

export function verifyResetOTP(email: string, otp: string): boolean {
  const record = resetOtpStore.get(email.toLowerCase());
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    resetOtpStore.delete(email.toLowerCase());
    return false;
  }
  if (record.otp !== otp) return false;
  resetOtpStore.delete(email.toLowerCase());
  return true;
}

// Password hashing simulation
export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return btoa(password);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}
