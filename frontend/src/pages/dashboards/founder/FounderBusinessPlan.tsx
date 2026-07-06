import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  startupData: any;
  setStartupData: (data: any) => void;
}

const sectionKeys = [
  { id: 1, key: 'executiveSummary', title: 'Executive Summary', desc: 'Overview of your startup, vision, and value proposition.' },
  { id: 2, key: 'problemAndSolution', title: 'Problem & Solution', desc: 'Define the problem and how your product solves it uniquely.' },
  { id: 3, key: 'productAndFeatures', title: 'Product & Features', desc: 'Core product features, roadmap, and technology stack.' },
  { id: 4, key: 'goToMarketStrategy', title: 'Go-to-Market Strategy', desc: 'Customer acquisition channels and launch plan.' },
  { id: 5, key: 'competitiveAnalysis', title: 'Competitive Analysis', desc: 'Competitor landscape and your defensible moat.' },
  { id: 6, key: 'teamSuggestion', title: 'Team', desc: 'Founding team bios and key advisors.' },
  { id: 7, key: 'financialProjection', title: 'Financial Projections', desc: '3-year revenue forecast, burn rate, and break-even.' },
  { id: 8, key: 'fundingAsk', title: 'Funding Ask', desc: 'Amount raised, use of funds, and investor returns.' },
];

const FounderBusinessPlan: React.FC<Props> = ({ startupData }) => {
  const [activeSection, setActiveSection] = useState(1);
  const [content, setContent] = useState('');

  const bpData = startupData?.aiGenerated?.businessPlan || {};

  useEffect(() => {
    const activeKey = sectionKeys.find(s => s.id === activeSection)?.key;
    if (activeKey && bpData[activeKey]) {
      setContent(bpData[activeKey]);
    } else {
      setContent('');
    }
  }, [activeSection, bpData]);

  const completed = sectionKeys.filter(s => bpData[s.key] && bpData[s.key].length > 0).length;
  const progress = Math.round((completed / sectionKeys.length) * 100);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Plan Builder</h1>
        <p className="text-gray-500 mt-1">Build a comprehensive, investor-ready business plan section by section with AI assistance.</p>
      </div>

      {!startupData ? (
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center">
          <p className="text-[#5B21B6] font-bold">Please generate a startup in the AI Idea Generator first.</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700">Plan Completion</p>
              <p className="text-sm font-bold text-[#5B21B6]">{completed}/{sectionKeys.length} Sections</p>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-[#5B21B6] to-[#7C3AED]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{progress}% complete</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Section list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-1">
              {sectionKeys.map(s => {
                const isDone = bpData[s.key] && bpData[s.key].length > 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all text-sm ${activeSection === s.id ? 'bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {isDone
                      ? <CheckCircle2 size={16} className={activeSection === s.id ? 'text-[#FBBF24]' : 'text-emerald-500'} />
                      : <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${activeSection === s.id ? 'border-white/50' : 'border-gray-300'}`} />
                    }
                    <span className="font-medium truncate">{s.title}</span>
                    <ChevronRight size={14} className="ml-auto flex-shrink-0 opacity-60" />
                  </button>
                );
              })}
            </div>

            {/* Editor */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
              {sectionKeys.filter(s => s.id === activeSection).map(s => (
                <div key={s.id} className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{s.title}</h2>
                    {bpData[s.key] && bpData[s.key].length > 0 && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Completed</span>}
                  </div>
                  <p className="text-sm text-gray-500 mb-6">{s.desc}</p>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`Write your ${s.title} here, or generate it with AI...`}
                    className="w-full flex-1 min-h-[400px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] resize-none"
                  />
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
                      Save Section
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-colors ml-auto">
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FounderBusinessPlan;
