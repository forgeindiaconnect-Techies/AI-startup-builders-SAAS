"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import StepIndicator from "@/components/auth/StepIndicator";
import OTPInput from "@/components/auth/OTPInput";
import { useAuth } from "@/lib/auth-context";
import { Mail, RotateCcw } from "lucide-react";

export default function VerifyOTPPage() {
  const router = useRouter();
  const { confirmOTP, sendOTP } = useAuth();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendAvailable, setResendAvailable] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("asb_register_email");
    const role = sessionStorage.getItem("asb_register_role");
    if (!storedEmail || !role) {
      router.replace("/auth/register");
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

  const handleVerify = () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      const valid = confirmOTP(email, otp);
      setLoading(false);

      if (valid) {
        router.push("/auth/register/create-password");
      } else {
        setError("Invalid OTP. Please check the code and try again.");
        setOtp("");
      }
    }, 600);
  };

  const handleResend = () => {
    if (!resendAvailable) return;
    sendOTP(email);
    setResendTimer(60);
    setResendAvailable(false);
    setError("");
    setOtp("");
  };

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
        <p className="text-gray-500 mb-8">
          Enter the 6-digit code sent to
        </p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100 mb-8">
          <Mail className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-700">{email}</span>
        </div>

        <StepIndicator currentStep={4} totalSteps={4} labels={["Role", "Plan", "Details", "Verify"]} />

        <div className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-slide-down">
              {error}
            </div>
          )}

          <OTPInput value={otp} onChange={setOtp} />

          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="btn-primary w-full py-3.5 text-base"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={!resendAvailable}
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                resendAvailable
                  ? "text-purple-500 hover:text-purple-700"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${!resendAvailable ? "animate-spin" : ""}`} />
              {resendAvailable
                ? "Resend OTP"
                : `Resend in ${resendTimer}s`}
            </button>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-6 py-2"
        >
          ← Go Back
        </button>
      </div>
    </AuthLayout>
  );
}
