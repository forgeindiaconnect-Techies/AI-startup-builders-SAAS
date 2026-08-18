import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, ClipboardList, Inbox, CalendarClock, Wallet } from 'lucide-react';
import InvestorMarketplace from './InvestorMarketplace';
import InvestorRequests from './InvestorRequests';
import FounderInvestorMessages from '../founder/FounderInvestorMessages';
import InvestorMeetings from './InvestorMeetings';
import InvestorTransactions from './InvestorTransactions';

const INVESTOR_HUB_TABS = [
  { id: 'marketplace', label: 'Startup Marketplace', path: '/dashboard/investor/marketplace', icon: Building2, component: InvestorMarketplace },
  { id: 'requests', label: 'Investment Requests', path: '/dashboard/investor/requests', icon: ClipboardList, component: InvestorRequests },
  { id: 'messages', label: 'Messages', path: '/dashboard/investor/messages', icon: Inbox, component: FounderInvestorMessages },
  { id: 'meetings', label: 'Meetings', path: '/dashboard/investor/meetings', icon: CalendarClock, component: InvestorMeetings },
  { id: 'transactions', label: 'Funding & Transactions', path: '/dashboard/investor/transactions', icon: Wallet, component: InvestorTransactions },
];

const InvestorHub: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  // Determine active tab index
  const currentTab = INVESTOR_HUB_TABS.find(t => 
    currentPath === t.path || 
    currentPath.startsWith(t.path + '/') ||
    (t.id === 'marketplace' && currentPath.includes('/investor/marketplace')) ||
    (t.id === 'requests' && currentPath.includes('/investor/requests')) ||
    (t.id === 'messages' && (currentPath.includes('/investor/inbox') || currentPath.includes('/investor/messages'))) ||
    (t.id === 'meetings' && currentPath.includes('/investor/meetings')) ||
    (t.id === 'transactions' && currentPath.includes('/investor/transactions'))
  ) || INVESTOR_HUB_TABS[1];

  const ActiveComponent = currentTab.component;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Tab Bar matching Image 1 tab style */}
      <div className="bg-white rounded-2xl border-b border-gray-200 shadow-xs px-4 pt-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {INVESTOR_HUB_TABS.map((tab) => {
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

      {/* Render selected view content */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  );
};

export default InvestorHub;
