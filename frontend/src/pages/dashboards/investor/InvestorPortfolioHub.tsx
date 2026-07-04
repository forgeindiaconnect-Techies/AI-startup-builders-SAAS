import React, { useState } from 'react';
import { Star, Briefcase, PieChart } from 'lucide-react';
import InvestorSavedStartups from './InvestorSaved';
import InvestorPortfolio from './InvestorPortfolio';
import InvestorReports from './InvestorReports';

const tabs = [
  { id: 'saved', label: 'Saved Startups', icon: Star, component: InvestorSavedStartups },
  { id: 'investments', label: 'My Investments', icon: Briefcase, component: InvestorPortfolio },
  { id: 'reports', label: 'Reports', icon: PieChart, component: InvestorReports },
];

const InvestorPortfolioHub: React.FC = () => {
  const [active, setActive] = useState('investments');
  const ActiveComponent = tabs.find(t => t.id === active)!.component;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Hub</h1>
        <p className="text-gray-500 mt-1">Manage your saved startups, active investments, and performance reports.</p>
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

export default InvestorPortfolioHub;
