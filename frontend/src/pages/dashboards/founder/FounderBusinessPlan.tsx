import React, { useState } from 'react';
import { FileText, CheckCircle2, Lock, ChevronRight } from 'lucide-react';

const sections = [
  { id: 1, title: 'Executive Summary', desc: 'Overview of your startup, vision, and value proposition.', done: true },
  { id: 2, title: 'Problem & Solution', desc: 'Define the problem and how your product solves it uniquely.', done: true },
  { id: 3, title: 'Market Opportunity', desc: 'TAM, SAM, SOM analysis and market sizing.', done: false },
  { id: 4, title: 'Product & Features', desc: 'Core product features, roadmap, and technology stack.', done: false },
  { id: 5, title: 'Business Model', desc: 'Revenue streams, pricing strategy, and unit economics.', done: false },
  { id: 6, title: 'Go-to-Market Strategy', desc: 'Customer acquisition channels and launch plan.', done: false },
  { id: 7, title: 'Competitive Analysis', desc: 'Competitor landscape and your defensible moat.', done: false },
  { id: 8, title: 'Team', desc: 'Founding team bios and key advisors.', done: false },
  { id: 9, title: 'Financial Projections', desc: '3-year revenue forecast, burn rate, and break-even.', done: false },
  { id: 10, title: 'Funding Ask', desc: 'Amount raised, use of funds, and investor returns.', done: false },
];

const FounderBusinessPlan: React.FC = () => {
  const [activeSection, setActiveSection] = useState(3);
  const [content, setContent] = useState('');

  const completed = sections.filter(s => s.done).length;
  const progress = Math.round((completed / sections.length) * 100);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Plan Builder</h1>
        <p className="text-gray-500 mt-1">Build a comprehensive, investor-ready business plan section by section with AI assistance.</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-700">Plan Completion</p>
          <p className="text-sm font-bold text-[#5B21B6]">{completed}/{sections.length} Sections</p>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-[#5B21B6] to-[#7C3AED]" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{progress}% complete</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all text-sm ${activeSection === s.id ? 'bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {s.done
                ? <CheckCircle2 size={16} className={activeSection === s.id ? 'text-[#FBBF24]' : 'text-emerald-500'} />
                : <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${activeSection === s.id ? 'border-white/50' : 'border-gray-300'}`} />
              }
              <span className="font-medium truncate">{s.title}</span>
              <ChevronRight size={14} className="ml-auto flex-shrink-0 opacity-60" />
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {sections.filter(s => s.id === activeSection).map(s => (
            <div key={s.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">{s.title}</h2>
                {s.done && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Completed</span>}
              </div>
              <p className="text-sm text-gray-500 mb-6">{s.desc}</p>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`Write your ${s.title} here, or click 'Generate with AI' to auto-fill...`}
                className="w-full h-52 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow">
                  ✨ Generate with AI
                </button>
                <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-colors">
                  Save Section
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FounderBusinessPlan;
