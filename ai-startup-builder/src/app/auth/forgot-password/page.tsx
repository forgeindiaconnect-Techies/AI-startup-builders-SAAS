"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { getUserByEmail } from "@/lib/store";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { sendResetOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const user = getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      setError("No account found with this email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      sendResetOTP(email.trim().toLowerCase());
      sessionStorage.setItem("asb_reset_email", email.trim().toLowerCase());
      setLoading(false);
      router.push("/auth/reset-password");
    }, 800);
  };

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
        <p className="text-gray-500 mb-8">
          Enter your email address and we&apos;ll send you a code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-slide-down">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-12"
                autoComplete="email"
              />
            </div>
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
                Sending code...
              </span>
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
