import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'founder' | 'mentor' | 'investor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  fullName?: string;
  passwordHash?: string;
  startupName?: string;
  startupIdea?: string;
  status?: string;
  approvalStatus?: string;
  signupDate?: string;
  lastLoginAt?: string | null;
  loginCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  loginTime: string;
  status: 'success' | 'failed';
  message: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'signup' | 'login' | 'approval' | 'account';
  role: string;
  isRead: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    expertise?: string;
    experienceYears?: string;
    linkedin?: string;
    bio?: string;
    companyName?: string;
    typicalCheckSize?: string;
    sectorsOfInterest?: string;
    investmentThesis?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => User[];
  getLoginLogs: () => LoginLog[];
  getNotifications: () => AppNotification[];
  updateUserStatus: (userId: string, status: string) => void;
  resetUserPassword: (userId: string) => void;
  deleteUser: (userId: string) => void;
  getPendingApprovals: () => User[];
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  refreshUsers: () => void;
  getAllUsersRaw: () => any[];
  saveUsersRaw: (users: any[]) => void;
}

const USERS_KEY = 'ai_startup_builder_users';
const CURRENT_USER_KEY = 'ai_startup_builder_current_user';
const LOGIN_LOGS_KEY = 'ai_startup_builder_login_logs';
const NOTIFICATIONS_KEY = 'ai_startup_builder_notifications';

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(36);
}

function getStoredUsers(): any[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function setStoredUsers(users: any[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getStoredLogs(): LoginLog[] {
  try {
    const data = localStorage.getItem(LOGIN_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function addLog(log: LoginLog) {
  const logs = getStoredLogs();
  logs.unshift(log);
  localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(logs));
}

function getStoredNotifications(): AppNotification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function addNotification(notif: AppNotification) {
  const notifs = getStoredNotifications();
  notifs.unshift(notif);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
}

function seedDemoUsers() {
  const existing = getStoredUsers();
  const hasTestAccounts = existing.some((u: any) => u.id === 'admin_001');
  if (hasTestAccounts) return;

  const now = new Date().toISOString();
  const accounts = [
    { id: 'admin_001', fullName: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin', status: 'active', approvalStatus: 'approved' },
    { id: 'founder_001', fullName: 'Rahul Sharma', email: 'founder@test.com', password: 'founder123', role: 'founder', status: 'active', approvalStatus: 'approved' },
    { id: 'mentor_001', fullName: 'Priya Menon', email: 'mentor@test.com', password: 'mentor123', role: 'mentor', status: 'active', approvalStatus: 'approved' },
    { id: 'investor_001', fullName: 'Arjun Capital', email: 'investor@test.com', password: 'investor123', role: 'investor', status: 'active', approvalStatus: 'approved' },
  ];

  const users = accounts.map(d => ({
    id: d.id,
    fullName: d.fullName,
    email: d.email,
    role: d.role,
    passwordHash: hashPassword(d.password),
    startupName: '',
    startupIdea: '',
    status: d.status,
    approvalStatus: d.approvalStatus,
    signupDate: now,
    lastLoginAt: null,
    loginCount: 0,
    createdAt: now,
    updatedAt: now,
  }));

  setStoredUsers(users);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  });

  seedDemoUsers();

  const refreshUsers = () => {
    seedDemoUsers();
  };

  const toUser = (raw: any): User => ({
    id: raw.id,
    name: raw.fullName,
    fullName: raw.fullName,
    email: raw.email,
    role: raw.role,
    avatar: raw.avatar,
    passwordHash: raw.passwordHash,
    startupName: raw.startupName,
    startupIdea: raw.startupIdea,
    status: raw.status,
    approvalStatus: raw.approvalStatus,
    signupDate: raw.signupDate,
    lastLoginAt: raw.lastLoginAt,
    loginCount: raw.loginCount,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getStoredUsers();
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      addLog({
        id: 'log_' + Date.now(),
        userId: '',
        fullName: 'Unknown',
        email: email,
        role: '',
        loginTime: new Date().toISOString(),
        status: 'failed',
        message: 'No account found with this email address',
      });
      return { success: false, error: 'No account found with this email address.' };
    }

    const pwdHash = hashPassword(password);
    if (found.passwordHash !== pwdHash) {
      addLog({
        id: 'log_' + Date.now(),
        userId: found.id,
        fullName: found.fullName,
        email: found.email,
        role: found.role,
        loginTime: new Date().toISOString(),
        status: 'failed',
        message: 'Incorrect password',
      });
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    if (found.status === 'suspended') {
      addLog({
        id: 'log_' + Date.now(),
        userId: found.id,
        fullName: found.fullName,
        email: found.email,
        role: found.role,
        loginTime: new Date().toISOString(),
        status: 'failed',
        message: 'Account is suspended',
      });
      return { success: false, error: 'Your account has been suspended. Please contact support.' };
    }

    if (found.status === 'inactive') {
      addLog({
        id: 'log_' + Date.now(),
        userId: found.id,
        fullName: found.fullName,
        email: found.email,
        role: found.role,
        loginTime: new Date().toISOString(),
        status: 'failed',
        message: 'Account is inactive',
      });
      return { success: false, error: 'Your account is inactive. Please contact support.' };
    }

    if (found.approvalStatus === 'pending') {
      addLog({
        id: 'log_' + Date.now(),
        userId: found.id,
        fullName: found.fullName,
        email: found.email,
        role: found.role,
        loginTime: new Date().toISOString(),
        status: 'failed',
        message: 'Account pending approval',
      });
      return { success: false, error: 'Your account is pending admin approval. Please wait for verification.' };
    }

    if (found.approvalStatus === 'rejected') {
      addLog({
        id: 'log_' + Date.now(),
        userId: found.id,
        fullName: found.fullName,
        email: found.email,
        role: found.role,
        loginTime: new Date().toISOString(),
        status: 'failed',
        message: 'Account was rejected',
      });
      return { success: false, error: 'Your account request was rejected. Please contact support for more information.' };
    }

    const now = new Date().toISOString();
    const updatedUsers = users.map((u: any) => {
      if (u.id === found.id) {
        return { ...u, lastLoginAt: now, loginCount: (u.loginCount || 0) + 1, updatedAt: now };
      }
      return u;
    });
    setStoredUsers(updatedUsers);

    const updatedFound = updatedUsers.find((u: any) => u.id === found.id);
    const userObj = toUser(updatedFound);
    setUser(userObj);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));

    addLog({
      id: 'log_' + Date.now(),
      userId: found.id,
      fullName: found.fullName,
      email: found.email,
      role: found.role,
      loginTime: now,
      status: 'success',
      message: 'Login successful',
    });

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    expertise?: string;
    experienceYears?: string;
    linkedin?: string;
    bio?: string;
    companyName?: string;
    typicalCheckSize?: string;
    sectorsOfInterest?: string;
    investmentThesis?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const users = getStoredUsers();
    const exists = users.find((u: any) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (data.role !== 'founder' && data.role !== 'mentor' && data.role !== 'investor') {
      return { success: false, error: 'Invalid role selected.' };
    }

    const now = new Date().toISOString();
    const isMentor = data.role === 'mentor';
    const isInvestor = data.role === 'investor';

    const newUser: any = {
      id: 'user_' + Date.now(),
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      role: data.role,
      passwordHash: hashPassword(data.password),
      status: 'inactive',
      approvalStatus: 'pending',
      signupDate: now,
      lastLoginAt: null,
      loginCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (isMentor) {
      newUser.expertise = data.expertise || '';
      newUser.experienceYears = data.experienceYears || '';
      newUser.linkedin = data.linkedin || '';
      newUser.bio = data.bio || '';
    }

    if (isInvestor) {
      newUser.companyName = data.companyName || '';
      newUser.typicalCheckSize = data.typicalCheckSize || '';
      newUser.sectorsOfInterest = data.sectorsOfInterest || '';
      newUser.investmentThesis = data.investmentThesis || '';
      newUser.kycStatus = 'pending';
    }

    const updatedUsers = [...users, newUser];
    setStoredUsers(updatedUsers);

    const notifTitle = 'New ' + data.role.charAt(0).toUpperCase() + data.role.slice(1) + ' Registration';
    const notifMsg = `${data.fullName} (${data.email}) has signed up as a ${data.role}.`;

    addNotification({
      id: 'notification_' + Date.now(),
      title: notifTitle,
      message: notifMsg,
      type: 'signup',
      role: 'admin',
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  };

  const getAllUsers = (): User[] => {
    seedDemoUsers();
    return getStoredUsers().map(toUser);
  };

  const getAllUsersRaw = (): any[] => {
    seedDemoUsers();
    return getStoredUsers();
  };

  const saveUsersRaw = (users: any[]) => {
    setStoredUsers(users);
  };

  const getLoginLogs = (): LoginLog[] => {
    return getStoredLogs();
  };

  const getNotifications = (): AppNotification[] => {
    return getStoredNotifications();
  };

  const updateUserStatus = (userId: string, status: string) => {
    const users = getStoredUsers();
    const updated = users.map((u: any) => {
      if (u.id === userId) return { ...u, status, updatedAt: new Date().toISOString() };
      return u;
    });
    setStoredUsers(updated);
  };

  const resetUserPassword = (userId: string) => {
    const users = getStoredUsers();
    const newPwd = 'reset123';
    const updated = users.map((u: any) => {
      if (u.id === userId) return { ...u, passwordHash: hashPassword(newPwd), updatedAt: new Date().toISOString() };
      return u;
    });
    setStoredUsers(updated);
    const target = users.find((u: any) => u.id === userId);
    addNotification({
      id: 'notification_' + Date.now(),
      title: 'Password Reset',
      message: target ? `Password for ${target.fullName} has been reset by Admin. New password: ${newPwd}` : 'Password has been reset.',
      type: 'account',
      role: 'admin',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteUser = (userId: string) => {
    const users = getStoredUsers();
    const filtered = users.filter((u: any) => u.id !== userId);
    setStoredUsers(filtered);
  };

  const getPendingApprovals = (): User[] => {
    seedDemoUsers();
    const users = getStoredUsers();
    return users
      .filter((u: any) => (u.role === 'mentor' || u.role === 'investor') && u.approvalStatus === 'pending')
      .map(toUser);
  };

  const approveUser = (userId: string) => {
    const users = getStoredUsers();
    const updated = users.map((u: any) => {
      if (u.id === userId) return { ...u, approvalStatus: 'approved', status: 'active', updatedAt: new Date().toISOString() };
      return u;
    });
    setStoredUsers(updated);
    const target = updated.find((u: any) => u.id === userId);
    if (target) {
      addNotification({
        id: 'notification_' + Date.now(),
        title: 'Account Approved',
        message: `Your ${target.role} account has been approved by Admin. You can now log in.`,
        type: 'approval',
        role: target.role,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const rejectUser = (userId: string) => {
    const users = getStoredUsers();
    const updated = users.map((u: any) => {
      if (u.id === userId) return { ...u, approvalStatus: 'rejected', updatedAt: new Date().toISOString() };
      return u;
    });
    setStoredUsers(updated);
    const target = updated.find((u: any) => u.id === userId);
    if (target) {
      addNotification({
        id: 'notification_' + Date.now(),
        title: 'Account Rejected',
        message: `Your ${target.role} account request has been rejected by Admin.`,
        type: 'approval',
        role: target.role,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      signup,
      getAllUsers,
      getLoginLogs,
      getNotifications,
      updateUserStatus,
      resetUserPassword,
      deleteUser,
      getPendingApprovals,
      approveUser,
      rejectUser,
      refreshUsers,
      getAllUsersRaw,
      saveUsersRaw,
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
