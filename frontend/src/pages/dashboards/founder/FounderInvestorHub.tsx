import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, ClipboardList, Inbox, CalendarClock, Wallet } from 'lucide-react';
import FounderInvestorMarketplace from './FounderInvestorMarketplace';
import FounderInvestmentRequests from './FounderInvestmentRequests';
import FounderInvestorMessages from './FounderInvestorMessages';
import FounderInvestorMeetings from './FounderInvestorMeetings';
import FounderFundingTransactions from './FounderFundingTransactions';

const INVESTOR_TABS = [
  { id: 'marketplace', label: 'Investor Marketplace', path: '/dashboard/founder/investors', icon: Building2, component: FounderInvestorMarketplace },
  { id: 'investment-requests', label: 'Founder Requests', path: '/dashboard/founder/investment-requests', icon: ClipboardList, component: FounderInvestmentRequests },
  { id: 'messages', label: 'Messages', path: '/dashboard/founder/messages', icon: Inbox, component: FounderInvestorMessages },
  { id: 'meetings', label: 'Meetings', path: '/dashboard/founder/meetings', icon: CalendarClock, component: FounderInvestorMeetings },
  { id: 'funding-transactions', label: 'Funding & Transactions', path: '/dashboard/founder/funding-transactions', icon: Wallet, component: FounderFundingTransactions },
];

const FounderInvestorHub: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  // Determine active tab index
  const currentTab = INVESTOR_TABS.find(t => 
    currentPath === t.path || 
    currentPath.startsWith(t.path + '/') ||
    (t.id === 'marketplace' && (currentPath.includes('/founder/investors') || currentPath.endsWith('/founder/investors'))) ||
    (t.id === 'investment-requests' && currentPath.includes('/founder/investment-requests')) ||
    (t.id === 'messages' && currentPath.includes('/founder/messages')) ||
    (t.id === 'meetings' && currentPath.includes('/founder/meetings')) ||
    (t.id === 'funding-transactions' && (currentPath.includes('/founder/funding-transactions') || currentPath.includes('/founder/funding')))
  ) || INVESTOR_TABS[0];

  const ActiveComponent = currentTab.component;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Tab Bar matching Image 1 due diligence tab style */}
      <div className="bg-white rounded-2xl border-b border-gray-200 shadow-xs px-4 pt-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {INVESTOR_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab.id === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`px-5 py-3 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 relative ${
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

export default FounderInvestorHub;
