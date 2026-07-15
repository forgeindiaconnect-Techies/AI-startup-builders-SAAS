"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import {
  ArrowRight,
  Users,
  TrendingUp,
  Lightbulb,
  Star,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      const routes: Record<string, string> = {
        founder: "/dashboard/founder",
        mentor: "/dashboard/mentor",
        investor: "/dashboard/investor",
        admin: "/dashboard/admin",
      };
      router.replace(routes[user.role] || "/unauthorized");
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />

      {/* Roles Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone in the Startup Ecosystem
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Whether you&apos;re building, advising, or investing &mdash; we have the
              tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "For Founders",
                desc: "AI-powered tools to create pitch decks, business plans, and market analysis in minutes.",
                color: "from-purple-500 to-purple-600",
                features: ["AI Pitch Deck Generator", "Business Plan Builder", "Mentor Matching"],
              },
              {
                icon: Users,
                title: "For Mentors",
                desc: "Share your expertise, guide founders, and earn while making an impact.",
                color: "from-amber-400 to-amber-500",
                features: ["Session Management", "Earnings Dashboard", "Founder Matching"],
              },
              {
                icon: TrendingUp,
                title: "For Investors",
                desc: "Discover promising AI startups and manage your investment portfolio.",
                color: "from-emerald-400 to-emerald-500",
                features: ["Startup Discovery", "Portfolio Tracking", "Deal Flow Analytics"],
              },
            ].map((role) => (
              <div
                key={role.title}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {role.title}
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">{role.desc}</p>
                <ul className="space-y-2">
                  {role.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-lg text-purple-100 mb-10 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who are leveraging AI to transform
            their startup ideas into reality.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-purple-600 bg-white rounded-2xl hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-400">
            &copy; 2024 AI Startup Builder. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
