"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getPlansForRole } from "@/lib/constants";
import { SubscriptionPlan, PlanDetails } from "@/lib/types";
import { Check, Star, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UpgradePage() {
  const { user, upgradeSubscription, subscription } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!user) router.replace("/auth/login");
  }, [user, router]);

  if (!user) return null;

  const plans = getPlansForRole(user.role).filter((p) => p.id !== "free_trial");

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    await upgradeSubscription(selectedPlan);
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <DashboardLayout title="Upgrade">
        <div className="max-w-md mx-auto text-center py-16 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Upgrade Successful! 🎉
          </h1>
          <p className="text-gray-500 mb-8">
            Your plan has been upgraded. Enjoy full access to all features!
          </p>
          <Link
            href={`/dashboard/${user.role}`}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base"
          >
            Go to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Upgrade Plan">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/${user.role}`}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h1>
            <p className="text-gray-500 mt-1">
              Choose the plan that works best for you as a {user.role}
            </p>
          </div>
        </div>

        {subscription?.status === "trial_expired" && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-4">
            <Zap className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Your trial has expired</p>
              <p className="text-sm text-amber-600">
                Upgrade to unlock AI features and continue building your startup.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isCurrent = subscription?.plan === plan.id && (subscription?.status === "active");
            return (
              <div
                key={plan.id}
                onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                className={`plan-card ${isSelected ? "selected" : ""} ${
                  plan.highlighted ? "highlighted" : ""
                } ${isCurrent ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/25">
                      <Star className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-400 text-sm ml-1">/ {plan.period}</span>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-0.5 bg-gray-300 rounded" />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {!isCurrent && (
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      isSelected
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select Plan"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {selectedPlan && (
          <div className="text-center">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="btn-primary px-12 py-3.5 text-base"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Upgrade to ${selectedPlan === "monthly" ? "Monthly" : "Yearly"} Plan`
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
