import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, TrendingUp, Search, X, ArrowLeft, Mail, Calendar, LogIn, ShieldCheck } from 'lucide-react';
import SharedStartupDetailsTabs from '../../components/shared/SharedStartupDetailsTabs';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [startups, setStartups] = React.useState<any[]>([]);
  const [selectedStartup, setSelectedStartup] = React.useState<any>(null);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return dateStr; }
  };

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
      {/* User Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0">
            {(user?.fullName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{user?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                {user?.role}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                user?.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                user?.status === 'suspended' ? 'bg-red-50 text-red-600 border border-red-100' :
                'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                {user?.status || 'active'}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
              <Mail size={14} className="text-gray-400" /> {user?.email}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" /> Signed up {formatDate(user?.signupDate)}
              </span>
              <span className="flex items-center gap-1">
                <LogIn size={13} className="text-gray-400" /> Last login {user?.lastLoginAt ? formatDate(user.lastLoginAt) : <span className="italic">Never</span>}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-gray-400" /> Login count {user?.loginCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-sm text-white">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Deployed Capital</p>
          <p className="text-3xl font-bold">₹1.2M</p>
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
            .filter(startup => startup.startupName?.toLowerCase().includes(search.toLowerCase()) || startup.startupIdea?.toLowerCase().includes(search.toLowerCase()))
            .map((startup, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:border-[#10B981] transition-all hover:shadow-md group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl bg-indigo-100 text-indigo-600">{startup.startupName?.charAt(0)}</div>
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
          <div className="bg-white w-[95%] lg:w-full max-w-[1200px] max-h-[90vh] flex flex-col rounded-[24px] shadow-xl animate-fade-in-up overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex items-center gap-4 shrink-0 z-10">
              <button 
                onClick={() => setSelectedStartup(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex-1">
                <h2 className="text-[22px] font-bold text-gray-900">
                  Startup Details
                </h2>
                <p className="text-[15px] text-gray-500 mt-1">{selectedStartup.startupName}</p>
              </div>
              <button 
                onClick={() => setSelectedStartup(null)}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              <SharedStartupDetailsTabs startupData={selectedStartup} />
                
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between gap-3">
                <button 
                  onClick={() => setSelectedStartup(null)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors flex items-center"
                >
                  <ArrowLeft size={16} className="mr-2" /> Back
                </button>
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

export default InvestorDashboard;
