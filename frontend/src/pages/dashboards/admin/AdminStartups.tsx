import React from 'react';
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle2, Building2 } from 'lucide-react';

const startups = [
  { id: 1, name: 'EcoPackage Hub', founder: 'Sarah Jenkins', industry: 'ClimateTech', status: 'Active', plan: 'Growth', joined: 'Jan 15, 2026' },
  { id: 2, name: 'AI Legal Reviewer', founder: 'James Park', industry: 'LegalTech', status: 'Under Review', plan: 'Starter', joined: 'Jun 28, 2026' },
  { id: 3, name: 'Fintech Micro-SaaS', founder: 'Tom Chen', industry: 'FinTech', status: 'Active', plan: 'Scale', joined: 'Mar 10, 2026' },
  { id: 4, name: 'DataSync Pro', founder: 'Mark Voltas', industry: 'SaaS', status: 'Suspended', plan: 'Starter', joined: 'May 05, 2026' },
];

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  'Under Review': 'bg-amber-50 text-amber-600 border border-amber-100',
  Suspended: 'bg-red-50 text-red-600 border border-red-100',
};

const AdminStartups: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Manage Startups</h1>
      <p className="text-gray-500 mt-1">View, edit, and moderate all startups on the platform.</p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search startups..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Under Review</option>
            <option>Suspended</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
            <option>All Industries</option>
            <option>ClimateTech</option>
            <option>LegalTech</option>
            <option>FinTech</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Startup</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Founder</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {startups.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Building2 size={16} className="text-gray-400" /> {s.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.founder}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.industry}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[s.status]}`}>{s.status}</span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-700">{s.plan}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.joined}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminStartups;
