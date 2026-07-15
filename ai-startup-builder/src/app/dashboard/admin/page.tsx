"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDashboardRoute } from "@/lib/constants";
import {
  Users,
  BarChart3,
  CreditCard,
  Shield,
  Settings,
  FileText,
  UserCheck,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Admin Panel ⚙️
            </h1>
            <p className="text-purple-100 text-sm sm:text-base max-w-lg">
              Manage users, monitor platform health, and oversee all operations.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Users", value: "12,847", change: "+234 this week" },
            { icon: CreditCard, label: "Active Subs", value: "8,234", change: "+89 this week" },
            { icon: TrendingUp, label: "Revenue", value: "$248K", change: "+12% this month" },
            { icon: AlertTriangle, label: "Issues", value: "3", change: "Open tickets" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
            >
              <stat.icon className="w-5 h-5 text-gray-400 mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Admin Tools */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Administration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Users, title: "User Management", desc: "View, edit, and manage all platform users" },
              { icon: BarChart3, title: "Analytics", desc: "Platform metrics, growth, and insights" },
              { icon: CreditCard, title: "Subscriptions", desc: "Monitor all subscriptions and billing" },
              { icon: Shield, title: "Security", desc: "Access controls, audit logs, and security" },
              { icon: Settings, title: "Settings", desc: "Platform configuration and preferences" },
              { icon: FileText, title: "Reports", desc: "Generate and export platform reports" },
            ].map((tool) => (
              <div
                key={tool.title}
                className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
              >
                <tool.icon className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold text-gray-900">{tool.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Role</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Plan</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Sarah Chen", email: "sarah@example.com", role: "Founder", plan: "Monthly", status: "Active" },
                    { name: "Alex Rivera", email: "alex@example.com", role: "Mentor", plan: "Yearly", status: "Active" },
                    { name: "James Park", email: "james@example.com", role: "Investor", plan: "Monthly", status: "Active" },
                    { name: "Maria Garcia", email: "maria@example.com", role: "Founder", plan: "Trial", status: "Trial" },
                  ].map((u, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-semibold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.plan}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
