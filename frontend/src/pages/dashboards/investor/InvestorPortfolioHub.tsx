import React, { useState } from 'react';
import { Star, Briefcase, PieChart, Plus } from 'lucide-react';
import InvestorSavedStartups from './InvestorSaved';
import InvestorPortfolio from './InvestorPortfolio';
import InvestorReports from './InvestorReports';
import SendInvestmentOfferModal from '../../../components/shared/SendInvestmentOfferModal';

const tabs = [
  { id: 'saved', label: 'Saved Startups', icon: Star, component: InvestorSavedStartups },
  { id: 'investments', label: 'My Investments', icon: Briefcase, component: InvestorPortfolio },
  { id: 'reports', label: 'Reports', icon: PieChart, component: InvestorReports },
];

const InvestorPortfolioHub: React.FC = () => {
  const [active, setActive] = useState('investments');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const ActiveComponent = tabs.find(t => t.id === active)!.component;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Hub</h1>
          <p className="text-gray-500 mt-1">Manage your saved startups, active investments, and performance reports.</p>
        </div>
        {active === 'investments' && (
          <button 
            onClick={() => setIsOfferModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-colors shadow-sm shrink-0"
          >
            <Plus size={18} className="mr-2" />
            Send Investment Offer
          </button>
        )}
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

      <SendInvestmentOfferModal 
        isOpen={isOfferModalOpen} 
        onClose={() => setIsOfferModalOpen(false)} 
      />
    </div>
  );
};

export default InvestorPortfolioHub;
