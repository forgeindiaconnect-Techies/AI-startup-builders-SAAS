"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import StepIndicator from "@/components/auth/StepIndicator";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { useAuth } from "@/lib/auth-context";
import { UserRole, SubscriptionPlan } from "@/lib/types";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";

export default function CreatePasswordPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem("asb_register_role");
    const plan = sessionStorage.getItem("asb_register_plan");
    const email = sessionStorage.getItem("asb_register_email");
    const name = sessionStorage.getItem("asb_register_name");
    if (!role || !plan || !email || !name) {
      router.replace("/auth/register");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const role = sessionStorage.getItem("asb_register_role") as UserRole;
    const plan = sessionStorage.getItem("asb_register_plan") as SubscriptionPlan;
    const email = sessionStorage.getItem("asb_register_email") || "";
    const name = sessionStorage.getItem("asb_register_name") || "";

    const result = await register(name, email, password, role, plan);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      sessionStorage.removeItem("asb_register_role");
      sessionStorage.removeItem("asb_register_plan");
      sessionStorage.removeItem("asb_register_email");
      sessionStorage.removeItem("asb_register_name");
      setTimeout(() => {
        router.replace("/auth/login");
      }, 2500);
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="animate-scale-in text-center py-12">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Account Created Successfully!
          </h1>
          <p className="text-gray-500 mb-2">
            Your account has been set up. Redirecting to login...
          </p>
          <div className="mt-6">
            <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                style={{
                  animation: "shrink 2.5s linear forwards",
                }}
              />
            </div>
          </div>
          <style jsx>{`
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create password</h1>
        <p className="text-gray-500 mb-8">
          Set a strong password to secure your account
        </p>

        <StepIndicator currentStep={4} totalSteps={4} labels={["Role", "Plan", "Details", "Verify"]} />

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-slide-down">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="input-field pl-12 pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="input-field pl-12 pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
              <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
