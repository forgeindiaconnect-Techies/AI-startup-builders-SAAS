import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, TrendingUp, Search, Filter, X, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Discover, evaluate, and invest in AI-validated startups.</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-sm text-white">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Deployed Capital</p>
          <p className="text-3xl font-bold">$1.2M</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Investments</p>
              <p className="text-3xl font-bold text-gray-900">4</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Briefcase size={20}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Portfolio Avg ROI</p>
              <p className="text-3xl font-bold text-green-500">+24%</p>
            </div>
            <div className="p-2 bg-green-50 text-green-500 rounded-lg"><TrendingUp size={20}/></div>
          </div>
        </div>
      </div>

      {/* Startup Marketplace */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-bold text-gray-900">Startups Marketplace</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search startups..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500">
              No startups available in the marketplace yet.
            </div>
          ) : (
            startups
            .filter(startup => startup.startupName.toLowerCase().includes(search.toLowerCase()) || startup.startupIdea.toLowerCase().includes(search.toLowerCase()))
            .map((startup, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:border-[#10B981] transition-all hover:shadow-md group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl bg-indigo-100 text-indigo-600">{startup.startupName.charAt(0)}</div>
                {startup.status === 'generated' && <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md border border-green-100">Seed</span>}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{startup.startupName}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow line-clamp-3">{startup.startupIdea}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-medium">AI Score</p>
                  <p className="font-bold text-gray-900">{startup.aiGenerated?.aiReport?.investmentReadinessScore || '85'}/100</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Revenue Model</p>
                  <p className="font-bold text-gray-900 text-sm line-clamp-1">{startup.aiGenerated?.ideaAnalysis?.businessModel || 'Tech'}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedStartup(startup)}
                className="w-full py-2 bg-gray-50 group-hover:bg-[#10B981] text-gray-700 group-hover:text-white rounded-lg font-medium text-sm transition-colors"
              >
                View Details
              </button>
            </div>
            ))
          )}
        </div>
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
                <p className="text-sm text-gray-700 italic border-l-2 border-[#10B981] pl-3">"{selectedStartup.startupIdea}"</p>
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
                  className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center"
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

export default InvestorDashboard;
