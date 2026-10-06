"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Access Denied
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          You don&apos;t have permission to access this page. Please log in with the appropriate account.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <Link
            href="/"
            className="btn-secondary px-6 py-3"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
