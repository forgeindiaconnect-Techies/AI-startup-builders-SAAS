import { PlanDetails, UserRole } from "./types";

export const ROLE_INFO: Record<
  UserRole,
  { label: string; description: string; icon: string; color: string }
> = {
  founder: {
    label: "Founder",
    description: "Build and scale your AI startup with powerful tools and mentorship",
    icon: "🚀",
    color: "#6C4CF1",
  },
  mentor: {
    label: "Mentor",
    description: "Guide the next generation of founders and earn while sharing expertise",
    icon: "🎓",
    color: "#D4AF37",
  },
  investor: {
    label: "Investor",
    description: "Discover promising AI startups and manage your investment portfolio",
    icon: "💰",
    color: "#22C55E",
  },
  admin: {
    label: "Admin",
    description: "Manage the platform and oversee all operations",
    icon: "⚙️",
    color: "#6C4CF1",
  },
};

export const FOUNDER_PLANS: PlanDetails[] = [
  {
    id: "free_trial",
    name: "1-Day Free Trial",
    price: 0,
    period: "24 hours",
    badge: "One-Time Only",
    features: [
      { text: "Full AI Startup Builder access", included: true },
      { text: "AI-powered pitch deck generator", included: true },
      { text: "AI business plan creation", included: true },
      { text: "Market analysis tools", included: true },
      { text: "Mentor matching", included: true },
      { text: "Investor introductions", included: true },
      { text: "Priority support", included: false },
      { text: "Custom branding", included: false },
    ],
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 49,
    period: "month",
    highlighted: true,
    features: [
      { text: "Full AI Startup Builder access", included: true },
      { text: "AI-powered pitch deck generator", included: true },
      { text: "AI business plan creation", included: true },
      { text: "Market analysis tools", included: true },
      { text: "Mentor matching", included: true },
      { text: "Investor introductions", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding", included: false },
    ],
  },
  {
    id: "yearly",
    name: "Yearly Plan",
    price: 399,
    period: "year",
    badge: "Save 32%",
    features: [
      { text: "Full AI Startup Builder access", included: true },
      { text: "AI-powered pitch deck generator", included: true },
      { text: "AI business plan creation", included: true },
      { text: "Market analysis tools", included: true },
      { text: "Mentor matching", included: true },
      { text: "Investor introductions", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding", included: true },
    ],
  },
];

export const MENTOR_PLANS: PlanDetails[] = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 29,
    period: "month",
    highlighted: true,
    features: [
      { text: "Founder request management", included: true },
      { text: "Unlimited chat", included: true },
      { text: "Notifications", included: true },
      { text: "Session management", included: true },
      { text: "Earnings management", included: true },
      { text: "Profile management", included: true },
      { text: "AI-powered insights", included: false },
      { text: "Featured mentor badge", included: false },
    ],
  },
  {
    id: "yearly",
    name: "Yearly Plan",
    price: 249,
    period: "year",
    badge: "Save 29%",
    features: [
      { text: "Founder request management", included: true },
      { text: "Unlimited chat", included: true },
      { text: "Notifications", included: true },
      { text: "Session management", included: true },
      { text: "Earnings management", included: true },
      { text: "Profile management", included: true },
      { text: "AI-powered insights", included: false },
      { text: "Featured mentor badge", included: true },
    ],
  },
];

export const INVESTOR_PLANS: PlanDetails[] = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 39,
    period: "month",
    highlighted: true,
    features: [
      { text: "Startup discovery feed", included: true },
      { text: "Founder connections", included: true },
      { text: "Investment tracking", included: true },
      { text: "Portfolio management", included: true },
      { text: "Notifications", included: true },
      { text: "Deal flow analytics", included: true },
      { text: "Priority deal access", included: false },
      { text: "Custom reports", included: false },
    ],
  },
  {
    id: "yearly",
    name: "Yearly Plan",
    price: 349,
    period: "year",
    badge: "Save 26%",
    features: [
      { text: "Startup discovery feed", included: true },
      { text: "Founder connections", included: true },
      { text: "Investment tracking", included: true },
      { text: "Portfolio management", included: true },
      { text: "Notifications", included: true },
      { text: "Deal flow analytics", included: true },
      { text: "Priority deal access", included: true },
      { text: "Custom reports", included: true },
    ],
  },
];

export function getPlansForRole(role: UserRole): PlanDetails[] {
  switch (role) {
    case "founder":
      return FOUNDER_PLANS;
    case "mentor":
      return MENTOR_PLANS;
    case "investor":
      return INVESTOR_PLANS;
    default:
      return [];
  }
}

export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case "founder":
      return "/dashboard/founder";
    case "mentor":
      return "/dashboard/mentor";
    case "investor":
      return "/dashboard/investor";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/unauthorized";
  }
}

export function getRoleFeatures(role: UserRole): string[] {
  switch (role) {
    case "founder":
      return [
        "AI Pitch Deck Generator",
        "Business Plan Builder",
        "Market Analysis",
        "Mentor Matching",
        "Investor Introductions",
        "Startup Analytics",
      ];
    case "mentor":
      return [
        "Founder Request Management",
        "Session Scheduling",
        "Earnings Dashboard",
        "Chat & Messaging",
        "Profile Management",
        "Notifications",
      ];
    case "investor":
      return [
        "Startup Discovery",
        "Investment Tracking",
        "Portfolio Management",
        "Founder Connections",
        "Deal Flow Analytics",
        "Notifications",
      ];
    case "admin":
      return [
        "User Management",
        "Platform Analytics",
        "Subscription Oversight",
        "Content Moderation",
        "System Settings",
        "Reports",
      ];
    default:
      return [];
  }
}
