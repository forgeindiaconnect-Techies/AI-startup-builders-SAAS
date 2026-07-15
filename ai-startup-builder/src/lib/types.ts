export type UserRole = "founder" | "mentor" | "investor" | "admin";

export type SubscriptionPlan = "free_trial" | "monthly" | "yearly" | null;

export type SubscriptionStatus =
  | "none"
  | "trial_active"
  | "trial_expired"
  | "active"
  | "expired"
  | "cancelled";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  emailVerified: boolean;
  suspended: boolean;
  createdAt: string;
}

export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  trialUsed: boolean;
  trialStart: string | null;
  trialEnd: string | null;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  status: SubscriptionStatus;
  renewalDate: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "welcome" | "otp" | "trial_ending" | "trial_expired" | "subscription_success" | "subscription_renewal" | "subscription_expired" | "info";
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  notifications: Notification[];
  isAuthenticated: boolean;
  currentStep: number;
  selectedRole: UserRole | null;
  selectedPlan: SubscriptionPlan;
  registrationEmail: string;
  registrationName: string;
}

export type PlanFeature = {
  text: string;
  included: boolean;
};

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: string;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}
