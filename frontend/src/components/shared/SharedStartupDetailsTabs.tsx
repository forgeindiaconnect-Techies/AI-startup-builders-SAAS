import React, { useState } from 'react';
import { Lightbulb, FileText, BarChart, Search, ClipboardList } from 'lucide-react';
import FounderIdeaGenerator from '../../pages/dashboards/founder/FounderIdeaGenerator';
import FounderBusinessPlan from '../../pages/dashboards/founder/FounderBusinessPlan';
import FounderPitchDeck from '../../pages/dashboards/founder/FounderPitchDeck';
import FounderMarketResearch from '../../pages/dashboards/founder/FounderMarketResearch';
import FounderReports from '../../pages/dashboards/founder/FounderReports';

interface Props {
  startupData: any;
}

const tabs = [
  { id: 'idea', label: 'AI Idea Generator', icon: Lightbulb, component: FounderIdeaGenerator },
  { id: 'plan', label: 'Business Plan', icon: FileText, component: FounderBusinessPlan },
  { id: 'deck', label: 'Pitch Deck', icon: BarChart, component: FounderPitchDeck },
  { id: 'research', label: 'Market Research', icon: Search, component: FounderMarketResearch },
  { id: 'reports', label: 'AI Reports', icon: ClipboardList, component: FounderReports },
];

const SharedStartupDetailsTabs: React.FC<Props> = ({ startupData }) => {
  const [activeTab, setActiveTab] = useState('idea');
  
  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || FounderIdeaGenerator;

  return (
    <div className="w-full flex flex-col read-only-view">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border border-gray-100 bg-gray-50/50 p-2 rounded-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-[#5B21B6] shadow-sm ring-1 ring-gray-200/50' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} className={`mr-2 ${isActive ? 'text-[#5B21B6]' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full relative">
        {/* We pass a dummy setStartupData since it's read-only */}
        <ActiveComponent startupData={startupData} setStartupData={() => {}} />
      </div>
    </div>
  );
};

export default SharedStartupDetailsTabs;
