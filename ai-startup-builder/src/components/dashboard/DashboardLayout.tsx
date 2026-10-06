"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { ROLE_INFO } from "@/lib/constants";
import {
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  X,
  Check,
} from "lucide-react";

export default function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const { user, notifications, logout, markNotificationRead, markAllRead } =
    useAuth();
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const roleInfo = user ? ROLE_INFO[user.role] : null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                AI Startup Builder
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifs(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-scale-in overflow-hidden">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllRead();
                            }}
                            className="text-xs text-purple-500 hover:text-purple-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notif.read ? "bg-purple-50/30" : ""
                              }`}
                              onClick={() => {
                                markNotificationRead(notif.id);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                    notif.read ? "bg-transparent" : "bg-purple-500"
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(notif.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.fullName?.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {user?.fullName}
                  </p>
                  <p className="text-[11px] text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <button
                className="sm:hidden p-2 rounded-xl hover:bg-gray-100"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <div className="space-y-1.5">
                  <div className="w-5 h-0.5 bg-gray-600 rounded-full" />
                  <div className="w-5 h-0.5 bg-gray-600 rounded-full" />
                  <div className="w-3.5 h-0.5 bg-gray-600 rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {showMobileMenu && (
          <div className="sm:hidden border-t border-gray-100 bg-white p-4 animate-slide-down">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
