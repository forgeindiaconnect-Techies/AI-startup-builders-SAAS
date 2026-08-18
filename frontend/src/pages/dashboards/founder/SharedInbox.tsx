import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import FounderNotifications from './FounderNotifications';
import { InvestorHubHeaderTabs } from '../../../components/investor/InvestorHubHeaderTabs';

const tabs = [
  { id: 'notifications', label: 'Notifications', icon: Bell, component: FounderNotifications },
];

const SharedInbox: React.FC = () => {
  const location = useLocation();
  const isInvestorPath = location.pathname.includes('/investor/');
  const [active, setActive] = useState(() => {
    return (location.state && location.state.activeTab) ? location.state.activeTab : 'notifications';
  });

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActive(location.state.activeTab);
    }
  }, [location.state]);

  const ActiveComponent = tabs.find(t => t.id === active)?.component || FounderNotifications;

  return (
    <div className="animate-fade-in-up">
      {isInvestorPath && <InvestorHubHeaderTabs />}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="text-gray-500 mt-1">Your notifications and alerts in one unified hub.</p>
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
