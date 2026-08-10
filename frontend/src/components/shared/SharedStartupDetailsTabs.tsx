import React, { useState } from 'react';
import { Lightbulb, Sparkles, FileText, BarChart3, Search, Scale, ClipboardList, MessageSquare, Lock, ShieldCheck, Target, Layers, IndianRupee, Send } from 'lucide-react';
import FounderIdeaGenerator from '../../pages/dashboards/founder/FounderIdeaGenerator';
import FounderIdeaValidation from '../../pages/dashboards/founder/FounderIdeaValidation';
import FounderCompetitorAnalysis from '../../pages/dashboards/founder/FounderCompetitorAnalysis';
import FounderMVPPlanner from '../../pages/dashboards/founder/FounderMVPPlanner';
import FounderFinancialPlan from '../../pages/dashboards/founder/FounderFinancialPlan';
import FounderGTMStrategy from '../../pages/dashboards/founder/FounderGTMStrategy';
import FounderBranding from '../../pages/dashboards/founder/FounderBranding';
import FounderBusinessPlan from '../../pages/dashboards/founder/FounderBusinessPlan';
import FounderPitchDeck from '../../pages/dashboards/founder/FounderPitchDeck';
import FounderMarketResearch from '../../pages/dashboards/founder/FounderMarketResearch';
import FounderLegalDocs from '../../pages/dashboards/founder/FounderLegalDocs';
import FounderReports from '../../pages/dashboards/founder/FounderReports';
import FounderAIChat from '../../pages/dashboards/founder/FounderAIChat';
import PlanGate, { usePlanAccess } from '../shared/PlanGate';

interface Props {
  startupData: any;
}

const tabs = [
  { id: 'idea',                label: 'AI Idea Generator',    icon: Lightbulb,     component: FounderIdeaGenerator },
  { id: 'idea_validation',     label: 'Idea Validation',      icon: ShieldCheck,   component: FounderIdeaValidation },
  { id: 'competitor_analysis', label: 'Competitor Analysis',  icon: Target,        component: FounderCompetitorAnalysis },
  { id: 'mvp_planner',         label: 'MVP Planner',          icon: Layers,        component: FounderMVPPlanner },
  { id: 'financial_plan',      label: 'Financial Plan',       icon: IndianRupee,   component: FounderFinancialPlan },
  { id: 'gtm_strategy',        label: 'Go-To-Market Strategy', icon: Send,         component: FounderGTMStrategy },
  { id: 'branding',            label: 'Logo & Branding',      icon: Sparkles,      component: FounderBranding, plans: ['pro', 'premium_startup_builder'] },
  { id: 'plan',                label: 'Business Plan',        icon: FileText,      component: FounderBusinessPlan },
  { id: 'pitch',               label: 'Pitch Deck',           icon: BarChart3,     component: FounderPitchDeck },
  { id: 'market',              label: 'Market Research',      icon: Search,        component: FounderMarketResearch },
  { id: 'legal',               label: 'Legal & Documents',    icon: Scale,         component: FounderLegalDocs },
  { id: 'reports',             label: 'AI Reports',           icon: ClipboardList, component: FounderReports },
  { id: 'chat',                label: 'AI Chat',              icon: MessageSquare, component: FounderAIChat, plans: ['pro', 'premium_startup_builder'] },
];

const SharedStartupDetailsTabs: React.FC<Props> = ({ startupData }) => {
  const [activeTab, setActiveTab] = useState('idea');
  const { canAccess } = usePlanAccess();

  const activeTabDef = tabs.find(t => t.id === activeTab) || tabs[0];
  const ActiveComponent = activeTabDef.component;

  return (
    <div className="w-full flex flex-col read-only-view">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border border-gray-100 bg-gray-50/50 p-2 rounded-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isLocked = tab.plans ? !canAccess(tab.plans) : false;
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
              {isLocked && <Lock size={13} className="ml-2 text-amber-500" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full relative">
        {/* We pass a dummy setStartupData since it's read-only */}
        {activeTabDef.plans ? (
          <PlanGate requiredPlans={activeTabDef.plans}>
            <ActiveComponent startupData={startupData} setStartupData={() => {}} />
          </PlanGate>
        ) : (
          <ActiveComponent startupData={startupData} setStartupData={() => {}} />
        )}
      </div>
    </div>
  );
};

export default SharedStartupDetailsTabs;
