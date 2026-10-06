"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDashboardRoute } from "@/lib/constants";
import {
  Search,
  Users,
  TrendingUp,
  Briefcase,
  Bell,
  Star,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";

export default function InvestorDashboard() {
  const { user, subscription } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user && user.role !== "investor") {
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <DashboardLayout title="Investor Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {user.fullName.split(" ")[0]}! 💰
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-lg">
              Discover promising AI startups and manage your investment portfolio.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Search, label: "Startups Viewed", value: "47", color: "purple" },
            { icon: Users, label: "Connections", value: "15", color: "blue" },
            { icon: DollarSign, label: "Total Invested", value: "$125K", color: "emerald" },
            { icon: TrendingUp, label: "Portfolio Return", value: "+32%", color: "amber" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
            >
              <stat.icon className="w-5 h-5 text-gray-400 mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tools */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Search, title: "Startup Discovery", desc: "Browse AI startups seeking investment", badge: "12 new" },
              { icon: Users, title: "Founder Connections", desc: "Connect with promising founders", badge: "5 pending" },
              { icon: Briefcase, title: "Investment Tracking", desc: "Monitor your investments in real-time", badge: "3 active" },
              { icon: TrendingUp, title: "Portfolio", desc: "Manage and track your startup portfolio", badge: "View" },
              { icon: Bell, title: "Notifications", desc: "Get alerts on new startups and updates", badge: "8" },
              { icon: Star, title: "Deal Flow", desc: "Access curated deal flow analytics", badge: "Premium" },
            ].map((tool) => (
              <div
                key={tool.title}
                className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
              >
                <tool.icon className="w-8 h-8 text-emerald-500 mb-3" />
                <h3 className="font-semibold text-gray-900">{tool.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
                <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {tool.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Startups */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Trending Startups</h2>
          <div className="space-y-3">
            {[
              { name: "NeuralFlow", desc: "AI-powered workflow automation", stage: "Series A", raised: "$2.5M", score: 92 },
              { name: "DataSense", desc: "Real-time analytics for SMBs", stage: "Pre-Seed", raised: "$500K", score: 88 },
              { name: "CodePilot", desc: "AI pair programming assistant", stage: "Seed", raised: "$1.2M", score: 85 },
            ].map((startup) => (
              <div
                key={startup.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {startup.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{startup.name}</h3>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {startup.stage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{startup.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900">{startup.raised}</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                    <Star className="w-3 h-3" />
                    <span>{startup.score}/100</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
