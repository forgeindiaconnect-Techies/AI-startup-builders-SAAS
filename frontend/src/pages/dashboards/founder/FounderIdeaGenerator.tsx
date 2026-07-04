import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, ArrowRight, RefreshCw, Rocket, Target, Briefcase } from 'lucide-react';

const baseIdeas = [
  {
    title: 'AI-Powered Legal Contract Reviewer',
    problem: 'Small businesses spend thousands on lawyers to review basic contracts.',
    solution: 'An LLM-based platform that instantly reviews, flags risks, and suggests edits in plain English.',
    market: '$18B Legal Tech market',
    score: 91,
  },
  {
    title: 'Micro-SaaS Marketplace for Freelancers',
    problem: 'Freelancers lack tools to package and sell their expertise as scalable products.',
    solution: 'A marketplace where freelancers build, list and monetise mini-SaaS tools using no-code templates.',
    market: '$455B Freelance market',
    score: 87,
  },
  {
    title: 'B2B Employee Wellness AI Coach',
    problem: 'Companies struggle to measure and improve employee mental wellbeing at scale.',
    solution: 'An AI coach that conducts weekly check-ins, identifies burnout patterns, and suggests interventions.',
    market: '$20.4B Corporate Wellness market',
    score: 84,
  },
];

const FounderIdeaGenerator: React.FC = () => {
  const [startupName, setStartupName] = useState('');
  const [elevatorPitch, setElevatorPitch] = useState('');
  const [targetCustomers, setTargetCustomers] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState(baseIdeas);

  // Check localStorage for a recently added startup
  useEffect(() => {
    const recent = localStorage.getItem('recentStartup');
    if (recent) {
      try {
        const parsed = JSON.parse(recent);
        
        // Auto-fill form
        if (parsed.name) setStartupName(parsed.name);
        if (parsed.description) setElevatorPitch(parsed.description);
        if (parsed.customers) setTargetCustomers(parsed.customers);
        if (parsed.businessModel) setBusinessModel(parsed.businessModel);

        // Prepend as an "AI-generated" or "AI-refined" idea
        const refinedIdea = {
          title: parsed.name || 'Untitled Startup',
          problem: parsed.description || 'No pitch provided.',
          solution: `An AI-optimized solution for ${parsed.customers || 'target market'} utilizing a ${parsed.businessModel || 'scalable'} business model.`,
          market: parsed.customers ? `Targeting: ${parsed.customers}` : 'Market undefined',
          score: Math.floor(Math.random() * 10) + 85, // Random score between 85 and 95
        };

        setIdeas([refinedIdea, ...baseIdeas]);
      } catch (e) {
        console.error('Failed to parse recent startup from local storage', e);
      }
    }
  }, []);

  const generate = () => {
    setLoading(true);
    setTimeout(() => { 
      setLoading(false); 
      setGenerated(true); 
    }, 1200);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Idea Generator</h1>
        <p className="text-gray-500 mt-1">Provide your startup concept — our AI will generate validated startup ideas, pivots, and improvements.</p>
      </div>

      {/* Input Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                <Rocket size={16} className="text-[#5B21B6]" /> Startup Name
              </label>
              <input 
                type="text"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="e.g. EcoPackage Hub"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Target size={16} className="text-[#5B21B6]" /> Target Customers
                </label>
                <input 
                  type="text"
                  value={targetCustomers}
                  onChange={(e) => setTargetCustomers(e.target.value)}
                  placeholder="e.g. D2C Brands"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Briefcase size={16} className="text-[#5B21B6]" /> Business Model
                </label>
                <select
                  value={businessModel}
                  onChange={e => setBusinessModel(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors"
                >
                  <option value="">Select...</option>
                  <option value="B2B SaaS">B2B SaaS</option>
                  <option value="B2C Subscription">B2C Subscription</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Enterprise / Sales-led">Enterprise / Sales-led</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
              <Lightbulb size={16} className="text-[#5B21B6]" /> Elevator Pitch
            </label>
            <textarea
              value={elevatorPitch}
              onChange={e => setElevatorPitch(e.target.value)}
              placeholder="What problem does it solve and for whom?"
              className="w-full h-[124px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={generate}
            disabled={loading || (!startupName && !elevatorPitch)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Sparkles size={18} className="mr-2" />}
            {loading ? 'Refining with AI...' : 'Generate & Refine Ideas with AI'}
          </button>
        </div>
      </div>

      {/* Results */}
      {generated && (
        <div className="space-y-5 animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={20} className="text-[#5B21B6]" /> AI Generated Concepts for <span className="text-[#5B21B6]">{startupName || 'Your Startup'}</span>
          </h2>
          {ideas.map((idea, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              {i === 0 && startupName && (
                <div className="absolute top-0 right-0 bg-purple-100 text-[#5B21B6] text-[10px] font-black uppercase px-3 py-1.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                  <Sparkles size={10} /> AI Refined from your input
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900 pr-32">{idea.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-extrabold ${idea.score >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {idea.score}/100 Score
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Core Problem / Pitch</p>
                  <p className="text-sm text-gray-800 font-medium">{idea.problem}</p>
                </div>
                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
                  <p className="text-xs font-bold text-[#5B21B6] mb-1.5 uppercase tracking-wide">AI Suggested Solution</p>
                  <p className="text-sm text-gray-800 font-medium">{idea.solution}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-sm text-gray-500 font-bold flex items-center gap-2">
                   <Target size={16} className="text-gray-400" /> {idea.market}
                </span>
                <button className="flex items-center text-sm font-bold text-[#5B21B6] hover:text-[#7C3AED] transition-colors">
                  Build Business Plan <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FounderIdeaGenerator;
