import React from 'react';
import { Users, UserPlus, Shield, MoreVertical } from 'lucide-react';

const users: { id: number; name: string; email: string; role: string; status: string }[] = [];

const AdminRoles: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-500 mt-1">Manage platform users and their access levels.</p>
      </div>
      <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
        <UserPlus size={16} className="mr-2" /> Add Staff User
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {['Super Admin', 'Staff', 'Mentors', 'Investors'].map((role, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-500 mb-1">{role}s</p>
          <p className="text-2xl font-extrabold text-gray-900">{Math.floor(Math.random() * 50) + 5}</p>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Users size={18} className="text-[#5B21B6]" /> Platform Directory</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    u.role.includes('Admin') ? 'bg-purple-100 text-[#5B21B6]' :
                    u.role === 'Founder' ? 'bg-yellow-100 text-yellow-700' :
                    u.role === 'Mentor' ? 'bg-blue-100 text-blue-700' :
                    u.role === 'Investor' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.role.includes('Admin') && <Shield size={10} />} {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{u.status}</span>
                </td>
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

export default AdminRoles;
