"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  CreditCard,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function ManageSubscriptionPage() {
  const { user, subscription, isTrialActive, isSubscriptionActive, trialTimeRemaining } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!user) router.replace("/auth/login");
  }, [user, router]);

  if (!user || !subscription) return null;

  const formatDate = (d: string | null) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout title="Subscription">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>

        {/* Current Plan */}
        <div className={`p-6 sm:p-8 rounded-2xl border-2 ${
          isSubscriptionActive
            ? "border-emerald-200 bg-emerald-50/50"
            : isTrialActive
            ? "border-amber-200 bg-amber-50/50"
            : "border-red-200 bg-red-50/50"
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Plan</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1 capitalize">
                {subscription.plan === "free_trial"
                  ? "1-Day Free Trial"
                  : subscription.plan === "monthly"
                  ? "Monthly Plan"
                  : subscription.plan === "yearly"
                  ? "Yearly Plan"
                  : "No Plan"}
              </h2>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              isSubscriptionActive
                ? "bg-emerald-100 text-emerald-700"
                : isTrialActive
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}>
              {isSubscriptionActive ? (
                <><CheckCircle className="w-4 h-4" /> Active</>
              ) : isTrialActive ? (
                <><Clock className="w-4 h-4" /> Trial Active</>
              ) : (
                <><AlertTriangle className="w-4 h-4" /> {subscription.status === "trial_expired" ? "Trial Expired" : "Expired"}</>
              )}
            </span>
          </div>

          {isTrialActive && trialTimeRemaining && (
            <div className="p-4 bg-white rounded-xl border border-amber-200 mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time Remaining</p>
                  <p className="text-lg font-bold text-amber-600">{trialTimeRemaining}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white">
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {formatDate(subscription.trialStart || subscription.subscriptionStart)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white">
              <p className="text-xs text-gray-500">End Date</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {formatDate(subscription.trialEnd || subscription.subscriptionEnd)}
              </p>
            </div>
            {subscription.renewalDate && (
              <div className="p-3 rounded-xl bg-white col-span-2">
                <p className="text-xs text-gray-500">Renewal Date</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {formatDate(subscription.renewalDate)}
                </p>
              </div>
            )}
          </div>

          {(!isSubscriptionActive || subscription.status === "expired" || subscription.status === "trial_expired") && (
            <Link
              href="/subscription/upgrade"
              className="mt-6 w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Upgrade Plan
            </Link>
          )}
        </div>

        {/* Details */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
          <div className="space-y-3">
            {[
              { label: "Status", value: subscription.status.replace("_", " ").toUpperCase() },
              { label: "Plan Type", value: subscription.plan === "free_trial" ? "Free Trial" : subscription.plan === "monthly" ? "Monthly" : "Yearly" },
              { label: "Trial Used", value: subscription.trialUsed ? "Yes" : "No" },
              { label: "Subscription Start", value: formatDate(subscription.subscriptionStart) },
              { label: "Subscription End", value: formatDate(subscription.subscriptionEnd) },
              { label: "Renewal Date", value: formatDate(subscription.renewalDate) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
