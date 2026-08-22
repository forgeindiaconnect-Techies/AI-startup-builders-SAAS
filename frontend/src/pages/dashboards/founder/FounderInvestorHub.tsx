import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, ClipboardList, Inbox, CalendarClock, Wallet, ScrollText } from 'lucide-react';
import FounderInvestorMarketplace from './FounderInvestorMarketplace';
import FounderInvestmentRequests from './FounderInvestmentRequests';
import FounderInvestorMessages from './FounderInvestorMessages';
import FounderInvestorMeetings from './FounderInvestorMeetings';
import FounderInvestorAgreement from './FounderInvestorAgreement';
import FounderFundingTransactions from './FounderFundingTransactions';

const INVESTOR_TABS = [
  { id: 'marketplace', label: 'Investor Marketplace', path: '/dashboard/founder/investors', icon: Building2, component: FounderInvestorMarketplace },
  { id: 'investment-requests', label: 'Founder Requests', path: '/dashboard/founder/investment-requests', icon: ClipboardList, component: FounderInvestmentRequests },
  { id: 'messages', label: 'Messages', path: '/dashboard/founder/messages', icon: Inbox, component: FounderInvestorMessages },
  { id: 'meetings', label: 'Meetings', path: '/dashboard/founder/meetings', icon: CalendarClock, component: FounderInvestorMeetings },
  { id: 'agreement', label: 'Agreement', path: '/dashboard/founder/agreement', icon: ScrollText, component: FounderInvestorAgreement },
  { id: 'funding-transactions', label: 'Transactions', path: '/dashboard/founder/funding-transactions', icon: Wallet, component: FounderFundingTransactions },
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
    (t.id === 'agreement' && currentPath.includes('/founder/agreement')) ||
    (t.id === 'funding-transactions' && (currentPath.includes('/founder/funding-transactions') || currentPath.includes('/founder/funding')))
  ) || INVESTOR_TABS[0];

  const ActiveComponent = currentTab.component;

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Top Navigation Sub-Tabs matching Image 1 exact layout & styling */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-2.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          {INVESTOR_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab.id === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#6C4CF1] border-2 border-[#6C4CF1] shadow-xs font-extrabold'
                    : 'bg-[#F8F9FA] text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 border border-gray-100 font-semibold'
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
