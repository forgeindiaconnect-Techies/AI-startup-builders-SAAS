import React, { useState } from 'react';
import { MessageSquare, Bell } from 'lucide-react';
import FounderMessages from './FounderMessages';
import FounderNotifications from './FounderNotifications';

const tabs = [
  { id: 'messages', label: 'Messages', icon: MessageSquare, component: FounderMessages },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: FounderNotifications },
];

const SharedInbox: React.FC = () => {
  const [active, setActive] = useState('messages');
  const ActiveComponent = tabs.find(t => t.id === active)!.component;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="text-gray-500 mt-1">Your messages and alerts all in one unified communication hub.</p>
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

export default SharedInbox;
