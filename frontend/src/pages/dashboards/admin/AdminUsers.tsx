import React, { useState } from 'react';
import { Search, MoreVertical, Mail, Shield, UserCheck, UserX, BadgeCheck, Filter } from 'lucide-react';

const users = [
  { id: 1, name: 'Sarah Jenkins', email: 'sarah@startup.ai', role: 'Founder', status: 'Active', plan: 'Growth', joined: 'Jan 15, 2026', avatar: 'S', color: 'from-[#7C3AED] to-[#FBBF24]' },
  { id: 2, name: 'Alex Rivera', email: 'alex@startup.ai', role: 'Mentor', status: 'Active', plan: 'N/A', joined: 'Feb 10, 2026', avatar: 'A', color: 'from-blue-500 to-indigo-600' },
  { id: 3, name: 'Capital Ventures', email: 'cv@invest.com', role: 'Investor', status: 'Active', plan: 'N/A', joined: 'Mar 5, 2026', avatar: 'C', color: 'from-emerald-500 to-teal-600' },
  { id: 4, name: 'Tom Chen', email: 'tom@startup.ai', role: 'Founder', status: 'Suspended', plan: 'Starter', joined: 'Apr 2, 2026', avatar: 'T', color: 'from-orange-500 to-red-500' },
  { id: 5, name: 'Maria Lopez', email: 'maria@invest.io', role: 'Investor', status: 'Pending', plan: 'N/A', joined: 'Jun 20, 2026', avatar: 'M', color: 'from-pink-500 to-rose-600' },
  { id: 6, name: 'James Park', email: 'james@startup.ai', role: 'Founder', status: 'Active', plan: 'Scale', joined: 'May 12, 2026', avatar: 'J', color: 'from-cyan-500 to-blue-500' },
];

const roleColors: Record<string, string> = {
  Founder: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Mentor: 'bg-blue-100 text-blue-700 border border-blue-200',
  Investor: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Admin: 'bg-purple-100 text-[#5B21B6] border border-purple-200',
};

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  Suspended: 'bg-red-50 text-red-600 border border-red-100',
  Pending: 'bg-amber-50 text-amber-600 border border-amber-100',
};

const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = users.filter(u =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">View and manage all platform users across every role.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="px-3 py-1.5 bg-purple-100 text-[#5B21B6] rounded-lg">{users.length} Total</span>
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">{users.filter(u => u.status === 'Active').length} Active</span>
          <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">{users.filter(u => u.status === 'Pending').length} Pending</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search users..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
          </div>
          <div className="flex gap-2">
            {['All', 'Founder', 'Mentor', 'Investor'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${roleFilter === r ? 'bg-[#5B21B6] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-sm font-black shadow flex-shrink-0`}>
                      {u.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[u.status]}`}>{u.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{u.plan}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Email"><Mail size={15} /></button>
                      {u.status === 'Active'
                        ? <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Suspend"><UserX size={15} /></button>
                        : <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Activate"><UserCheck size={15} /></button>
                      }
                      <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"><MoreVertical size={15} /></button>
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

export default AdminUsers;
