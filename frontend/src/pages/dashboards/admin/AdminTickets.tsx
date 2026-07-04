import React from 'react';
import { LifeBuoy, Clock, Search, MoreVertical } from 'lucide-react';

const tickets = [
  { id: '#1042', user: 'Sarah Jenkins', role: 'Founder', subject: 'Pitch Deck AI stuck on generation', status: 'Open', priority: 'High', time: '10m ago' },
  { id: '#1041', user: 'Alex Rivera', role: 'Mentor', subject: 'Payout not received for June', status: 'Pending', priority: 'Medium', time: '2h ago' },
  { id: '#1040', user: 'Capital Ventures', role: 'Investor', subject: 'Cannot access data room for EcoPackage', status: 'Resolved', priority: 'High', time: '1d ago' },
];

const priorityStyles: Record<string, string> = {
  High: 'text-red-600 bg-red-50',
  Medium: 'text-amber-600 bg-amber-50',
  Low: 'text-emerald-600 bg-emerald-50',
};

const AdminTickets: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
      <p className="text-gray-500 mt-1">Manage and resolve user issues across the platform.</p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search tickets..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-purple-50 text-[#5B21B6] font-bold rounded-lg text-sm border border-purple-100 shadow-sm">
            Unassigned (12)
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">{t.subject}</p>
                  <p className="text-xs text-gray-400 font-medium">{t.id}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-800">{t.user}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${priorityStyles[t.priority]}`}>{t.priority}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-700">{t.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1.5 mt-2">
                  <Clock size={14} className="text-gray-400" /> {t.time}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-bold text-[#5B21B6] hover:text-[#7C3AED] transition-colors">View Ticket</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminTickets;
