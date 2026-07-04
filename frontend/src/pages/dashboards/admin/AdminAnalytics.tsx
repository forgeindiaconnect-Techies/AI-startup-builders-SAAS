import React from 'react';
import { TrendingUp, Users, Rocket, DollarSign, BarChart2, PieChart, Activity } from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const metrics = [
    { label: 'Total Users', val: '2,840', change: '+12%', up: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Startups', val: '512', change: '+8%', up: true, icon: Rocket, color: 'text-[#5B21B6]', bg: 'bg-purple-50' },
    { label: 'Monthly Revenue', val: '$42,500', change: '+15%', up: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Churn Rate', val: '3.2%', change: '-0.5%', up: false, icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const topStartups = [
    { name: 'EcoPackage Hub', sector: 'ClimateTech', score: 94, mrr: '$12k' },
    { name: 'AI Legal Reviewer', sector: 'LegalTech', score: 88, mrr: '$8k' },
    { name: 'DataSync Pro', sector: 'SaaS', score: 85, mrr: '$22k' },
    { name: 'Fintech Micro-SaaS', sector: 'FinTech', score: 91, mrr: '$85k' },
  ];

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Analytics</h1>
        <p className="text-gray-500 mt-1">Platform-wide insights, user growth, and revenue analytics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                <m.icon size={20} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{m.change}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">{m.label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{m.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-6"><BarChart2 size={18} className="text-[#5B21B6]" /> Monthly Revenue (2026)</h2>
          <div className="flex items-end gap-2 h-40">
            {[18, 24, 22, 31, 28, 35, 42].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-[#5B21B6] to-[#7C3AED] transition-all" style={{ height: `${(v / 42) * 100}%` }} />
                <span className="text-[10px] text-gray-400 font-medium">{['Jan','Feb','Mar','Apr','May','Jun','Jul'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-6"><PieChart size={18} className="text-[#5B21B6]" /> User Roles</h2>
          <div className="space-y-3">
            {[
              { role: 'Founders', pct: 58, color: 'bg-[#5B21B6]' },
              { role: 'Investors', pct: 22, color: 'bg-emerald-500' },
              { role: 'Mentors', pct: 15, color: 'bg-blue-500' },
              { role: 'Admins', pct: 5, color: 'bg-amber-400' },
            ].map(r => (
              <div key={r.role}>
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1">
                  <span>{r.role}</span><span>{r.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Startups */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5"><Activity size={18} className="text-[#5B21B6]" /> Top Performing Startups</h2>
        <div className="divide-y divide-gray-50">
          {topStartups.map((s, i) => (
            <div key={s.name} className="flex items-center gap-4 py-3">
              <span className="text-sm font-extrabold text-gray-400 w-5">#{i + 1}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                <p className="text-xs text-gray-500">{s.sector}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-emerald-600">{s.mrr} MRR</p>
                <p className="text-xs text-gray-400">AI Score: {s.score}/100</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
