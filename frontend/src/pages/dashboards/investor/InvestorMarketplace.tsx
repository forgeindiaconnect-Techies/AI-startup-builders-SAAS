import React, { useState } from 'react';
import { Search, Filter, Cpu, ArrowRight, Bookmark, Target, X, CheckCircle2, AlertTriangle, Briefcase } from 'lucide-react';

const InvestorMarketplace: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeScore, setActiveScore] = useState('');
  const [activeStage, setActiveStage] = useState('');
  const [startups, setStartups] = React.useState<any[]>([]);
  const [selectedStartup, setSelectedStartup] = React.useState<any>(null);

  React.useEffect(() => {
    const keys = Object.keys(localStorage);
    const locals: any[] = [];
    keys.forEach(key => {
      if (key.startsWith('startup_')) {
        try {
          locals.push(JSON.parse(localStorage.getItem(key) || ''));
        } catch (e) {}
      }
    });
    locals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setStartups(locals);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Flow Marketplace</h1>
          <p className="text-gray-500 mt-1">Discover, filter, and evaluate AI-vetted startup opportunities.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
          <Bookmark size={20} className="mr-2" />
          Saved Deals (2)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by keyword, industry, or founder..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm transition-shadow"
            />
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm text-gray-700 font-medium bg-white outline-none">
              <option>All Industries</option>
              <option>SaaS / Enterprise</option>
              <option>FinTech</option>
              <option>HealthTech</option>
              <option>ClimateTech</option>
            </select>
            <button className="flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
              <Filter size={18} className="mr-2" />
              More Filters
            </button>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 self-center">AI Score:</span>
          <button 
            onClick={() => setActiveScore(activeScore === '90+' ? '' : '90+')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeScore === '90+' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}
          >
            90+ Score
          </button>
          <button 
            onClick={() => setActiveScore(activeScore === '80-89' ? '' : '80-89')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeScore === '80-89' ? 'bg-gray-200 border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
          >
            80-89 Score
          </button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-4 mr-2 self-center">Stage:</span>
          <button 
            onClick={() => setActiveStage(activeStage === 'Pre-Seed' ? '' : 'Pre-Seed')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeStage === 'Pre-Seed' ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
          >
            Pre-Seed
          </button>
          <button 
            onClick={() => setActiveStage(activeStage === 'Seed' ? '' : 'Seed')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeStage === 'Seed' ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
          >
            Seed
          </button>
        </div>
      </div>

      {/* Startups List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {startups.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
            No startups available in the marketplace yet.
          </div>
        ) : (
          startups.filter(s => {
            const score = s.aiGenerated?.aiReport?.investmentReadinessScore || 85;
            const stage = s.status === 'generated' ? 'Seed' : 'Idea Stage';
            if (search && !s.startupName.toLowerCase().includes(search.toLowerCase()) && !s.startupIdea.toLowerCase().includes(search.toLowerCase())) return false;
            if (activeScore === '90+' && score < 90) return false;
            if (activeScore === '80-89' && (score < 80 || score >= 90)) return false;
            if (activeStage && stage !== activeStage) return false;
            return true;
          }).map((startup, idx) => {
            const score = startup.aiGenerated?.aiReport?.investmentReadinessScore || 85;
            const stage = startup.status === 'generated' ? 'Seed' : 'Idea Stage';
            return (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#5B21B6]/40 hover:shadow-lg transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl shadow-sm from-blue-500 to-indigo-600`}>
                    {startup.startupName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{startup.startupName}</h3>
                    <p className="text-sm text-gray-500 font-medium">{startup.aiGenerated?.ideaAnalysis?.businessModel || 'Tech'} • {stage}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-lg ${score >= 90 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'}`}>
                    {score >= 90 ? <Cpu size={14} className="text-green-600" /> : <Target size={14} className="text-yellow-600" />}
                    <span className="font-bold text-sm">{score}/100</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">AI Rating</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow line-clamp-3">
                {startup.startupIdea}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Target Raise</p>
                  <p className="font-bold text-gray-900">$500k</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Valuation Cap</p>
                  <p className="font-bold text-gray-900">$2.5M</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Committed</p>
                  <p className={`font-bold text-gray-900`}>0%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Traction</p>
                  <p className="font-bold text-gray-900">Idea</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedStartup(startup)}
                  className="w-full py-3 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center group-hover:shadow-lg bg-[#5B21B6] hover:bg-[#7C3AED]"
                >
                  View Details
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            );
          })
        )}

      </div>

      {/* Modal Overlay */}
      {selectedStartup && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl animate-fade-in-up">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Startup Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">{selectedStartup.startupName}</p>
              </div>
              <button 
                onClick={() => setSelectedStartup(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-700 italic border-l-2 border-[#5B21B6] pl-3">"{selectedStartup.startupIdea}"</p>
              </div>
              
              {/* Score Section */}
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center bg-white shadow-sm shrink-0 ${selectedStartup.aiGenerated?.aiReport?.investmentReadinessScore >= 80 ? 'border-green-500 text-green-600' : 'border-yellow-500 text-yellow-600'}`}>
                  <span className="text-2xl font-bold text-gray-900">{selectedStartup.aiGenerated?.aiReport?.investmentReadinessScore || '85'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Investment Readiness Score</h3>
                  <p className="text-sm text-gray-600">AI evaluation of overall viability, market size, and structural robustness.</p>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center text-green-700">
                    <CheckCircle2 size={18} className="mr-2" /> Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {Array.isArray(selectedStartup.aiGenerated?.aiReport?.keyStrengths) 
                      ? selectedStartup.aiGenerated.aiReport.keyStrengths.map((s: any, i: number) => (
                        <li key={i} className="flex items-start text-sm text-gray-600 bg-green-50 p-3 rounded-xl border border-green-100">
                          <span className="font-bold mr-2 text-green-700">{i + 1}.</span> {typeof s === 'string' ? s : JSON.stringify(s)}
                        </li>
                      ))
                      : <li className="text-sm text-gray-500 bg-green-50 p-3 rounded-xl border border-green-100">Strong founder background and clear market need.</li>
                    }
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center text-orange-600">
                    <AlertTriangle size={18} className="mr-2" /> Risk Factors
                  </h3>
                  <ul className="space-y-3">
                    {Array.isArray(selectedStartup.aiGenerated?.aiReport?.riskFactors)
                      ? selectedStartup.aiGenerated.aiReport.riskFactors.map((r: any, i: number) => (
                        <li key={i} className="flex items-start text-sm text-gray-600 bg-orange-50 p-3 rounded-xl border border-orange-100">
                          <span className="font-bold mr-2 text-orange-700">{i + 1}.</span> {typeof r === 'string' ? r : JSON.stringify(r)}
                        </li>
                      ))
                      : <li className="text-sm text-gray-500 bg-orange-50 p-3 rounded-xl border border-orange-100">High competition in the current market sector.</li>
                    }
                  </ul>
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => { window.alert('Interest expressed to the founders!'); setSelectedStartup(null); }}
                  className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center"
                >
                  <Briefcase size={16} className="mr-2" /> Express Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorMarketplace;
