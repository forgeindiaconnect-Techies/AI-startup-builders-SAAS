"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDashboardRoute } from "@/lib/constants";
import {
  Rocket,
  CreditCard,
  Clock,
  TrendingUp,
  Users,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function FounderDashboard() {
  const { user, subscription, isTrialActive, isSubscriptionActive, trialTimeRemaining } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user && user.role !== "founder") {
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, router]);

  if (!user) return null;

  const hasAccess = isTrialActive || isSubscriptionActive;

  return (
    <DashboardLayout title="Founder Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {user.fullName.split(" ")[0]}! 🚀
            </h1>
            <p className="text-purple-100 text-sm sm:text-base max-w-lg">
              Your AI Startup Builder is ready. Let&apos;s turn your vision into reality.
            </p>

            {isTrialActive && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-xl text-sm font-medium backdrop-blur-sm">
                <Clock className="w-4 h-4" />
                Trial ends in {trialTimeRemaining}
              </div>
            )}

            {!hasAccess && subscription?.status === "trial_expired" && (
              <div className="mt-4">
                <Link
                  href="/subscription/upgrade"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Upgrade to Continue
                </Link>
              </div>
            )}
          </div>
        </div>

        {!hasAccess && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">AI Features Locked</h3>
              <p className="text-sm text-amber-600 mt-1">
                Your trial has expired. Upgrade your plan to access AI-powered tools.
              </p>
              <Link
                href="/subscription/upgrade"
                className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                View Plans <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Rocket, label: "Pitch Decks", value: hasAccess ? "12" : "—", color: "purple" },
            { icon: TrendingUp, label: "Growth Score", value: hasAccess ? "85%" : "—", color: "emerald" },
            { icon: Users, label: "Connections", value: hasAccess ? "28" : "—", color: "blue" },
            { icon: CreditCard, label: "Plan", value: subscription?.plan === "free_trial" ? "Trial" : subscription?.plan === "monthly" ? "Monthly" : subscription?.plan === "yearly" ? "Yearly" : "None", color: "amber" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
            >
              <stat.icon className="w-5 h-5 text-gray-400 mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Sparkles, title: "AI Pitch Deck", desc: "Generate a professional pitch deck with AI", enabled: hasAccess },
              { icon: Rocket, title: "Business Plan", desc: "Create a comprehensive business plan", enabled: hasAccess },
              { icon: TrendingUp, title: "Market Analysis", desc: "Analyze your target market", enabled: hasAccess },
              { icon: Users, title: "Find Mentors", desc: "Connect with expert mentors", enabled: hasAccess },
              { icon: CreditCard, title: "Subscription", desc: "Manage your plan and billing", enabled: true },
            ].map((action) => (
              <div
                key={action.title}
                className={`p-5 rounded-2xl border transition-all ${
                  action.enabled
                    ? "bg-white border-gray-100 hover:border-purple-200 hover:shadow-md cursor-pointer"
                    : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                }`}
              >
                <action.icon className={`w-8 h-8 mb-3 ${action.enabled ? "text-purple-500" : "text-gray-300"}`} />
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                {!action.enabled && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-600">
                    <CreditCard className="w-3 h-3" /> Requires active plan
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
