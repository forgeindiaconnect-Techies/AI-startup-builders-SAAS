"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, Rocket } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white to-amber-50/30" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-sm font-medium mb-8 animate-fade-in">
          <Zap className="w-4 h-4" />
          <span>AI-Powered Startup Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6 animate-slide-up">
          Build Your AI Startup
          <br />
          <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 bg-clip-text text-transparent">
            From Idea to Scale
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
          The all-in-one platform for founders, mentors, and investors.
          Leverage AI to create pitch decks, business plans, and connect with
          the right people to bring your vision to life.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link
            href="/auth/register"
            className="group inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl hover:shadow-xl hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 transition-all"
          >
            I Have an Account
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mb-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {[
            { value: "10K+", label: "Founders" },
            { value: "2.5K+", label: "Mentors" },
            { value: "$50M+", label: "Funded" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          {[
            {
              icon: Rocket,
              title: "AI Pitch Decks",
              desc: "Generate professional pitch decks with AI in minutes",
              color: "from-purple-500 to-purple-600",
            },
            {
              icon: Shield,
              title: "Smart Matching",
              desc: "Get matched with the right mentors and investors",
              color: "from-amber-400 to-amber-500",
            },
            {
              icon: Sparkles,
              title: "Growth Tools",
              desc: "Business plans, market analysis, and more",
              color: "from-emerald-400 to-emerald-500",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all text-left group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
