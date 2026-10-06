import React from 'react';
import { Plus, Mail, Globe, Briefcase, MoreVertical, Crown } from 'lucide-react';

const members: { name: string; role: string; avatar: string; gradient: string; email: string; joined: string; access: string }[] = [];

const accessColors: Record<string, string> = {
  Owner: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  Admin: 'bg-purple-50 text-purple-700 border-purple-100',
  Editor: 'bg-blue-50 text-blue-700 border-blue-100',
};

const FounderTeam: React.FC = () => (
  <div className="animate-fade-in-up">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-500 mt-1">Manage your co-founders and team. Invite collaborators to your startup.</p>
      </div>
      <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
        <Plus size={16} className="mr-2" /> Invite Member
      </button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
        <p className="text-3xl font-extrabold text-gray-900">4</p>
        <p className="text-sm text-gray-500 font-medium mt-1">Total Members</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
        <p className="text-3xl font-extrabold text-[#5B21B6]">1</p>
        <p className="text-sm text-gray-500 font-medium mt-1">Pending Invite</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
        <p className="text-3xl font-extrabold text-emerald-600">3</p>
        <p className="text-sm text-gray-500 font-medium mt-1">Active Roles</p>
      </div>
    </div>

    {/* Invite box */}
    <div className="bg-gradient-to-r from-[#4C1D95]/10 to-[#5B21B6]/5 border border-[#5B21B6]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 mb-8">
      <div className="flex-1">
        <p className="font-bold text-gray-800">Invite a Team Member</p>
        <p className="text-sm text-gray-500">They'll receive an email to join your workspace.</p>
      </div>
      <div className="flex w-full sm:w-auto gap-2">
        <input type="email" placeholder="colleague@email.com" className="flex-1 sm:w-64 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
        <button className="px-4 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl text-sm hover:bg-[#7C3AED] transition-colors flex items-center gap-2">
          <Mail size={15} /> Send
        </button>
      </div>
    </div>

    {/* Team cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {members.map((m, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white font-black text-lg shadow-md`}>
            {m.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-gray-900 text-sm">{m.name}</p>
              {m.access === 'Owner' && <Crown size={14} className="text-yellow-500" />}
            </div>
            <p className="text-xs text-gray-500 mb-2">{m.role}</p>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${accessColors[m.access]}`}>{m.access}</span>
              <button className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"><Globe size={16} /></button>
              <button className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"><Briefcase size={16} /></button>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 flex-shrink-0"><MoreVertical size={18} /></button>
        </div>
      ))}
    </div>
  </div>
);

export default FounderTeam;
