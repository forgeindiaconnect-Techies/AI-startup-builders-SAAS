import React, { useState } from 'react';
import { UserCog, CreditCard } from 'lucide-react';
import FounderProfile from './FounderProfile';
import FounderBilling from './FounderBilling';

const tabs = [
  { id: 'profile', label: 'Profile Settings', icon: UserCog, component: FounderProfile },
  { id: 'billing', label: 'Subscription & Billing', icon: CreditCard, component: FounderBilling },
];

const FounderProfileBilling: React.FC = () => {
  const [active, setActive] = useState('profile');
  const ActiveComponent = tabs.find(t => t.id === active)!.component;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile & Billing</h1>
        <p className="text-gray-500 mt-1">Manage your account and subscription settings.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-7 w-fit">
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

export default FounderProfileBilling;
