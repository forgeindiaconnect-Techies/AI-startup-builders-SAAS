"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getDashboardRoute } from "@/lib/constants";
import { Sparkles } from "lucide-react";

export default function LoadingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      setTimeout(() => {
        router.replace(getDashboardRoute(user.role));
      }, 1200);
    } else {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/80 via-white to-amber-50/30">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-sm text-gray-500 mt-4">Setting up your dashboard...</p>
      </div>
    </div>
  );
}
