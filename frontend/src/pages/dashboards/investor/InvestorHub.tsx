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
  { id: 'transactions', label: 'Transactions', path: '/dashboard/investor/transactions', icon: Wallet, component: InvestorTransactions },
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
      {/* Render selected view content */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  );
};

export default InvestorHub;
