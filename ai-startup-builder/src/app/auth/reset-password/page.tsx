"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import OTPInput from "@/components/auth/OTPInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { confirmResetOTP, resetPassword } = useAuth();
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendAvailable, setResendAvailable] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("asb_reset_email");
    if (!storedEmail) {
      router.replace("/auth/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendAvailable(true);
    }
  }, [resendTimer]);

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      const valid = confirmResetOTP(email, otp);
      setLoading(false);
      if (valid) {
        setStep("password");
        setError("");
      } else {
        setError("Invalid OTP. Please check and try again.");
        setOtp("");
      }
    }, 600);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, password);
    setLoading(false);

    if (result) {
      setSuccess(true);
      sessionStorage.removeItem("asb_reset_email");
      setTimeout(() => router.replace("/auth/login"), 2500);
    } else {
      setError("Failed to reset password. Please try again.");
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
            Password Reset Successfully!
          </h1>
          <p className="text-gray-500">
            Redirecting to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

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

        {step === "otp" ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h1>
            <p className="text-gray-500 mb-8">
              Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>
            </p>

            <div className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-slide-down">
                  {error}
                </div>
              )}

              <OTPInput value={otp} onChange={setOtp} />

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full py-3.5 text-base"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <div className="text-center">
                <button
                  onClick={() => {
                    if (resendAvailable) {
                      setResendTimer(60);
                      setResendAvailable(false);
                    }
                  }}
                  disabled={!resendAvailable}
                  className={`text-sm font-medium ${
                    resendAvailable ? "text-purple-500 hover:text-purple-700" : "text-gray-400"
                  }`}
                >
                  {resendAvailable ? "Resend Code" : `Resend in ${resendTimer}s`}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create new password</h1>
            <p className="text-gray-500 mb-8">Enter your new password below</p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-slide-down">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input-field pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    placeholder="Confirm new password"
                    className="input-field pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
