"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import StepIndicator from "@/components/auth/StepIndicator";
import { ROLE_INFO } from "@/lib/constants";
import { UserRole } from "@/lib/types";
import { Check } from "lucide-react";

const roles: UserRole[] = ["founder", "mentor", "investor"];

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    sessionStorage.setItem("asb_register_role", selectedRole);
    router.push("/auth/register/plans");
  };

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
        <p className="text-gray-500 mb-8">Choose your role to get started</p>

        <StepIndicator currentStep={1} totalSteps={4} labels={["Role", "Plan", "Details", "Verify"]} />

        <div className="space-y-4 mb-8">
          {roles.map((role) => {
            const info = ROLE_INFO[role];
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`role-card w-full text-left flex items-center gap-4 ${
                  isSelected ? "selected" : ""
                }`}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${info.color}15` }}
                >
                  {info.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {info.label}
                  </h3>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-500"
                      : "border-gray-200"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="btn-primary w-full py-3.5 text-base"
        >
          Continue
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-purple-500 font-semibold hover:text-purple-700">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
