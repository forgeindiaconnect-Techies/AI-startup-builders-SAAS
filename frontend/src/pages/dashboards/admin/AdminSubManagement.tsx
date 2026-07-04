import React, { useState } from 'react';
import { Search, CreditCard, XCircle, RotateCcw, ChevronDown } from 'lucide-react';

const subs = [
  { id: 'SB-1042', user: 'Sarah Jenkins', email: 'sarah@startup.ai', plan: 'Growth', amount: '$49/mo', started: 'Jan 15, 2026', nextBilling: 'Aug 1, 2026', status: 'Active' },
  { id: 'SB-1041', user: 'Tom Chen', email: 'tom@startup.ai', plan: 'Scale', amount: '$149/mo', started: 'Mar 10, 2026', nextBilling: 'Aug 10, 2026', status: 'Active' },
  { id: 'SB-1040', user: 'James Park', email: 'james@startup.ai', plan: 'Starter', amount: 'Free', started: 'May 5, 2026', nextBilling: 'N/A', status: 'Active' },
  { id: 'SB-1039', user: 'Anna Kim', email: 'anna@startup.ai', plan: 'Growth', amount: '$49/mo', started: 'Apr 1, 2026', nextBilling: 'Cancelled', status: 'Cancelled' },
  { id: 'SB-1038', user: 'Peter Zhao', email: 'peter@startup.ai', plan: 'Scale', amount: '$149/mo', started: 'Jun 1, 2026', nextBilling: 'Aug 1, 2026', status: 'Past Due' },
];

const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  Cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
  'Past Due': 'bg-red-50 text-red-600 border border-red-100',
};

const AdminSubManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = subs.filter(s =>
    s.user.toLowerCase().includes(search.toLowerCase()) || s.email.includes(search)
  );

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-500 mt-1">View and manage active, cancelled, and overdue subscriptions.</p>
        </div>
        <div className="flex gap-2 text-sm font-bold">
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">4 Active</span>
          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">1 Past Due</span>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg">1 Cancelled</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search subscriptions..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
          </div>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]">
            <option>All Plans</option>
            <option>Starter</option>
            <option>Growth</option>
            <option>Scale</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Sub ID', 'Customer', 'Plan', 'Amount', 'Started', 'Next Billing', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{s.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">{s.user}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.plan}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{s.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.started}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.nextBilling}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {s.status === 'Active' && <button title="Cancel" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><XCircle size={15} /></button>}
                      {s.status === 'Cancelled' && <button title="Reactivate" className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"><RotateCcw size={15} /></button>}
                      <button title="View Details" className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"><CreditCard size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubManagement;
