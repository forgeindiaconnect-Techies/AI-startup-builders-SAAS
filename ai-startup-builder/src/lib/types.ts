export type UserRole = "founder" | "mentor" | "investor" | "admin";
export type SubscriptionPlan = "free_trial" | "monthly" | "yearly" | null;

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: "trial_active" | "trial_expired" | "active" | "expired" | "cancelled";
  createdAt: string;
  trialStart?: string;
  trialEnd?: string;
  trialUsed?: boolean;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  renewalDate?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: string;
  badge?: string;
  highlighted?: boolean;
  features: PlanFeature[];
}
