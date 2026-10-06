import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Inbox, CalendarClock, Wallet, ScrollText } from 'lucide-react';

const SUB_NAV_TABS = [
  { id: 'requests',     label: 'Founder Requests',       path: '/dashboard/investor/requests',    icon: ClipboardList },
  { id: 'messages',    label: 'Messages',                path: '/dashboard/investor/messages',    icon: Inbox },
  { id: 'meetings',    label: 'Meetings',                path: '/dashboard/investor/meetings',    icon: CalendarClock },
  { id: 'agreement',   label: 'Agreement',               path: '/dashboard/investor/agreement',   icon: ScrollText },
  { id: 'transactions',label: 'Transactions',  path: '/dashboard/investor/transactions', icon: Wallet },
];

interface InvestorSubNavProps {
  activeTab: 'requests' | 'messages' | 'meetings' | 'agreement' | 'transactions';
}

const InvestorSubNav: React.FC<InvestorSubNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border-b border-gray-200 shadow-xs px-4 pt-3 overflow-x-auto mb-6">
      <div className="flex gap-2 min-w-max">
        {SUB_NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
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

export default InvestorSubNav;
