"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              AI Startup Builder
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
