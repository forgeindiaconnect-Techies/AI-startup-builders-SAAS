"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDashboardRoute } from "@/lib/constants";
import {
  Users,
  MessageSquare,
  Calendar,
  DollarSign,
  Bell,
  UserCheck,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function MentorDashboard() {
  const { user, subscription, isSubscriptionActive } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user && user.role !== "mentor") {
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <DashboardLayout title="Mentor Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {user.fullName.split(" ")[0]}! 🎓
            </h1>
            <p className="text-amber-100 text-sm sm:text-base max-w-lg">
              Share your expertise and help the next generation of founders succeed.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Active Founders", value: "8", color: "purple" },
            { icon: Calendar, label: "Sessions This Week", value: "5", color: "blue" },
            { icon: DollarSign, label: "Total Earnings", value: "$4,250", color: "emerald" },
            { icon: TrendingUp, label: "Rating", value: "4.9★", color: "amber" },
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

        {/* Features */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: UserCheck, title: "Founder Requests", desc: "Review and accept founder mentorship requests", count: "3 new" },
              { icon: MessageSquare, title: "Messages", desc: "Chat with founders and manage conversations", count: "12 unread" },
              { icon: Calendar, title: "Sessions", desc: "Schedule and manage mentorship sessions", count: "5 upcoming" },
              { icon: DollarSign, title: "Earnings", desc: "Track your earnings and payment history", count: "$4,250 total" },
              { icon: Bell, title: "Notifications", desc: "Stay updated with requests and messages", count: "8 new" },
              { icon: UserCheck, title: "Profile", desc: "Manage your profile and availability", count: "Edit" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer"
              >
                <feature.icon className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
                <span className="inline-block mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  {feature.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { text: "New mentorship request from Sarah Chen", time: "2 hours ago", icon: UserCheck },
              { text: "Session completed with Alex Rivera", time: "5 hours ago", icon: Calendar },
              { text: "Payment of $250 received", time: "1 day ago", icon: DollarSign },
              { text: "New message from James Park", time: "1 day ago", icon: MessageSquare },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <activity.icon className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
