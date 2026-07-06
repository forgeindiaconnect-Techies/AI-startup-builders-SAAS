import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, TrendingUp, Search, Filter } from 'lucide-react';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [startups, setStartups] = React.useState<any[]>([]);

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
                onClick={() => window.alert(`Opening deal room for ${startup.startupName}...`)}
                className="w-full py-2 bg-gray-50 group-hover:bg-[#10B981] text-gray-700 group-hover:text-white rounded-lg font-medium text-sm transition-colors"
              >
                View Deal Room
              </button>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
