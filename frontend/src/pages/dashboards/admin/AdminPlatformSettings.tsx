import React, { useState } from 'react';
import { KeyRound, IndianRupee } from 'lucide-react';
import AdminRoles from './AdminRoles';
import AdminMentorPaymentSettings from './AdminMentorPaymentSettings';

const tabs = [
  { id: 'roles', label: 'Roles & Permissions', icon: KeyRound, component: AdminRoles },
  { id: 'payments', label: 'Mentor Payment Settings', icon: IndianRupee, component: AdminMentorPaymentSettings },
];

const AdminPlatformSettings: React.FC = () => {
  const [active, setActive] = useState('roles');
  const ActiveComponent = tabs.find(t => t.id === active)?.component || tabs[0].component;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Configure user roles, AI LLM providers, view live system logs, and general preferences.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-7 overflow-x-auto flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              active === t.id ? 'bg-white text-[#5B21B6] shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
};

export default AdminPlatformSettings;
