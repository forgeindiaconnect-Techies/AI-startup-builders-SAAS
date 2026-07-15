"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import StepIndicator from "@/components/auth/StepIndicator";
import { getPlansForRole } from "@/lib/constants";
import { UserRole, SubscriptionPlan, PlanDetails } from "@/lib/types";
import { Check, Zap, Star } from "lucide-react";

export default function PlansPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(null);
  const [plans, setPlans] = useState<PlanDetails[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("asb_register_role") as UserRole | null;
    if (!stored || stored === "admin") {
      router.replace("/auth/register");
      return;
    }
    setRole(stored);
    setPlans(getPlansForRole(stored));
  }, [router]);

  const handleContinue = () => {
    if (!selectedPlan || !role) return;
    sessionStorage.setItem("asb_register_plan", selectedPlan);
    router.push("/auth/register/details");
  };

  if (!role) return null;

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose your plan</h1>
        <p className="text-gray-500 mb-8">
          Select the plan that best fits your needs as a{" "}
          <span className="capitalize font-medium text-purple-600">{role}</span>
        </p>

        <StepIndicator currentStep={2} totalSteps={4} labels={["Role", "Plan", "Details", "Verify"]} />

        <div className="space-y-4 mb-8">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`plan-card ${isSelected ? "selected" : ""} ${
                  plan.highlighted ? "highlighted" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/25">
                      {plan.id === "free_trial" ? (
                        <Zap className="w-3 h-3" />
                      ) : (
                        <Star className="w-3 h-3" />
                      )}
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-500"
                        : "border-gray-200"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-400 text-sm ml-1">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
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
                      <span
                        className={`text-sm ${
                          feature.included ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="btn-primary w-full py-3.5 text-base"
        >
          Continue
        </button>

        <button
          onClick={() => router.back()}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4 py-2"
        >
          ← Go Back
        </button>
      </div>
    </AuthLayout>
  );
}
