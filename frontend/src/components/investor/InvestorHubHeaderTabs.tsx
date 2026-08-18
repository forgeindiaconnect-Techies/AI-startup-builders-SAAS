import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, ClipboardList, Inbox, CalendarClock, Wallet } from 'lucide-react';

const INVESTOR_TABS = [
  { id: 'marketplace', label: 'Investor Marketplace', path: '/dashboard/investor/marketplace', icon: Building2 },
  { id: 'requests', label: 'Founder Requests', path: '/dashboard/investor/requests', icon: ClipboardList },
  { id: 'messages', label: 'Messages', path: '/dashboard/investor/inbox', icon: Inbox },
  { id: 'meetings', label: 'Meetings', path: '/dashboard/investor/meetings', icon: CalendarClock },
  { id: 'funding-transactions', label: 'Funding & Transactions', path: '/dashboard/investor/transactions', icon: Wallet },
];

export const InvestorHubHeaderTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const currentTab = INVESTOR_TABS.find(t =>
    currentPath === t.path ||
    currentPath.startsWith(t.path + '/') ||
    (t.id === 'marketplace' && (currentPath.includes('/investor/marketplace') || currentPath.includes('/investor/investors'))) ||
    (t.id === 'requests' && (currentPath.includes('/investor/requests') || currentPath.includes('/investor/investment-requests'))) ||
    (t.id === 'messages' && (currentPath.includes('/investor/inbox') || currentPath.includes('/investor/messages'))) ||
    (t.id === 'meetings' && currentPath.includes('/investor/meetings')) ||
    (t.id === 'funding-transactions' && (currentPath.includes('/investor/transactions') || currentPath.includes('/investor/funding')))
  ) || INVESTOR_TABS[1];

  return (
    <div className="bg-white rounded-2xl border-b border-gray-200 shadow-xs px-4 pt-3 overflow-x-auto mb-6 font-sans">
      <div className="flex gap-2 min-w-max">
        {INVESTOR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab.id === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-5 py-3 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 relative cursor-pointer ${
                isActive
                  ? 'bg-white text-[#6C4CF1] border-t-2 border-l border-r border-[#6C4CF1] border-b-transparent shadow-xs -mb-[1px] font-black'
                  : 'text-gray-500 hover:text-gray-800 bg-gray-50/60 hover:bg-gray-100/70 border border-transparent font-semibold'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#6C4CF1]' : 'text-gray-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InvestorHubHeaderTabs;
