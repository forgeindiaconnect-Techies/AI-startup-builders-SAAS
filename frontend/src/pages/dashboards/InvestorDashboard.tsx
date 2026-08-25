import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, TrendingUp, Search, X, ArrowLeft, Mail, Calendar, LogIn, ShieldCheck, Bookmark, Heart, Rocket, Target, Cpu, Send, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import SharedStartupDetailsTabs from '../../components/shared/SharedStartupDetailsTabs';
import SendInvestmentOfferModal from '../../components/shared/SendInvestmentOfferModal';
import { API_URL } from '../../config/api';
import { getStartupVisibilityMap, getInvestmentRequests, getInvestorMessages } from '../../utils/investorModuleStorage';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [startups, setStartups] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<any | null>(null);

  // Send Offer modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerStartup, setOfferStartup] = useState<{ name: string; founder: string }>({ name: '', founder: '' });

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    loadAllStartups();
    loadSavedIds();
  }, []);

  const loadSavedIds = () => {
    const stored = localStorage.getItem('investor_saved_startups');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedIds(parsed.map((item: any) => String(item.id || item.startupId || '')));
        }
      } catch (e) {}
    }
  };

  const loadAllStartups = async () => {
    const visibilityMap = getStartupVisibilityMap();
    const allMessages = getInvestorMessages();
    const allRequests = getInvestmentRequests();
    const allStartupsMap = new Map<string, any>();

    // 1. Default Startup Ideas created across platform
    const defaultIdeas = [
      {
        id: 'idea_breaktime',
        startupId: 'idea_breaktime',
        startupName: 'Breaktime',
        founderName: 'Renu',
        founderEmail: 'renu@gmail.com',
        fundingStage: 'Pre-Seed',
        fundingAmount: '₹500,000',
        shortIntro: 'AI-driven smart break & workplace productivity management platform.',
        startupIdea: 'AI-driven smart break & workplace productivity management platform.',
        whySeeking: 'Product development and market expansion.',
        status: 'generated',
        createdAt: new Date().toISOString()
      },
      {
        id: 'idea_bakery',
        startupId: 'idea_bakery',
        startupName: 'Bakery',
        founderName: 'Renu',
        founderEmail: 'renu@gmail.com',
        fundingStage: 'Seed',
        fundingAmount: '₹1,000,000',
        shortIntro: 'Artisanal organic bakery delivery chain with AI demand forecasting.',
        startupIdea: 'Artisanal organic bakery delivery chain with AI demand forecasting.',
        whySeeking: 'Kitchen automation and outlet expansion.',
        status: 'generated',
        createdAt: new Date().toISOString()
      },
      {
        id: 'idea_startup_it',
        startupId: 'idea_startup_it',
        startupName: 'Startup IT',
        founderName: 'Renu',
        founderEmail: 'renu@gmail.com',
        fundingStage: 'Seed',
        fundingAmount: '₹2,500,000',
        shortIntro: 'Enterprise cloud & AI infrastructure deployment platform for startups.',
        startupIdea: 'Enterprise cloud & AI infrastructure deployment platform for startups.',
        whySeeking: 'Scaling server capacity and engineering team.',
        status: 'generated',
        createdAt: new Date().toISOString()
      },
      {
        id: 'idea_tourists_ai',
        startupId: 'idea_tourists_ai',
        startupName: 'Tourists Platform AI',
        founderName: 'Renu',
        founderEmail: 'renu@gmail.com',
        fundingStage: 'Seed',
        fundingAmount: '₹1,500,000',
        shortIntro: 'Personalized AI travel companion & itinerary generator for global tourists.',
        startupIdea: 'Personalized AI travel companion & itinerary generator for global tourists.',
        whySeeking: 'API integrations and marketing.',
        status: 'generated',
        createdAt: new Date().toISOString()
      }
    ];

    defaultIdeas.forEach(idea => {
      allStartupsMap.set(idea.startupId, idea);
    });

    // 2. Fetch from backend API
    try {
      const apiRes = await fetch(`${API_URL}/startups`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.success && Array.isArray(apiData.data)) {
          apiData.data.forEach((s: any) => {
            const sId = String(s.id || s._id || s.startupId || '');
            if (sId) allStartupsMap.set(sId, s);
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch backend startups for investor dashboard:', err);
    }

    // 3. Fetch from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('startup_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (item) {
            const sId = String(item.id || item.startupId || key);
            if (sId) {
              allStartupsMap.set(sId, item);
            }
          }
        } catch (e) {}
      }
    });

    // 4. Fetch from Investment Requests submitted by founders
    try {
      allRequests.forEach((req: any) => {
        const sName = req.startupName || 'Startup Idea';
        const sId = req.startupId || `req_startup_${sName.replace(/\s+/g, '_')}`;
        allStartupsMap.set(String(sId), {
          id: sId,
          startupId: sId,
          startupName: sName,
          founderName: req.founderName || 'Renu',
          founderEmail: req.founderEmail || 'renu@gmail.com',
          fundingStage: req.fundingStage || 'Seed',
          fundingAmount: req.fundingAmount || '₹500,000',
          shortIntro: req.shortIntro || 'Innovative AI startup idea looking for investment.',
          startupIdea: req.shortIntro || req.whySeeking || 'Innovative AI startup idea looking for investment.',
          whySeeking: req.whySeeking || 'Scaling production and expansion.',
          status: 'generated',
          createdAt: req.createdAt || new Date().toISOString()
        });
      });
    } catch (e) {}

    const combined = Array.from(allStartupsMap.values());
    setStartups(combined);
  };

  const handleToggleSave = (startup: any) => {
    const sId = String(startup.id || startup._id || startup.startupId || '');
    const savedKey = 'investor_saved_startups';
    const stored = localStorage.getItem(savedKey);
    let list: any[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {}
    }

    const isAlreadySaved = list.some(item => String(item.id || item.startupId) === sId);

    if (isAlreadySaved) {
      const updated = list.filter(item => String(item.id || item.startupId) !== sId);
      localStorage.setItem(savedKey, JSON.stringify(updated));
      setSavedIds(updated.map(item => String(item.id || item.startupId)));
    } else {
      const newSaved = {
        id: sId,
        startupId: sId,
        name: startup.startupName || startup.name || 'Unknown Startup',
        sector: startup.aiGenerated?.ideaAnalysis?.businessModel || 'Tech',
        stage: startup.fundingStage || (startup.status === 'generated' ? 'Seed' : 'Idea Stage'),
        traction: 'Idea Stage',
        team: 1,
        location: 'Global',
        rating: startup.aiGenerated?.aiReport?.investmentReadinessScore || 85,
        logo: 'from-purple-500 to-indigo-600',
        fundingAsk: startup.fundingAmount || '₹50,00,000',
        founderName: startup.founderName || 'Founder',
        startupIdea: startup.startupIdea || startup.shortIntro,
        startupData: startup
      };

      const updated = [newSaved, ...list];
      localStorage.setItem(savedKey, JSON.stringify(updated));
      setSavedIds(updated.map(item => String(item.id || item.startupId)));
    }
  };

  const handleOpenOfferModal = (startupName: string, founderName?: string) => {
    setOfferStartup({
      name: startupName,
      founder: founderName || 'Founder'
    });
    setShowOfferModal(true);
  };

  const filteredStartups = startups.filter(s => {
    if (!search) return true;
    const query = search.toLowerCase();
    const nameMatch = (s.startupName || s.name || '').toLowerCase().includes(query);
    const ideaMatch = (s.startupIdea || s.shortIntro || '').toLowerCase().includes(query);
    const founderMatch = (s.founderName || '').toLowerCase().includes(query);
    return nameMatch || ideaMatch || founderMatch;
  });

  return (
    <div className="animate-fade-in-up pb-10">
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

      {/* Startups Marketplace Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Startups Marketplace</h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore startup ideas, review AI-readiness, and send investment offers.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
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

            <button
              onClick={() => navigate('/dashboard/investor/startup-ideas')}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] border border-purple-200 font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
            >
              <Heart size={14} className="fill-purple-500 text-purple-500" />
              Startup Ideas ({savedIds.length})
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Sparkles size={28} className="mx-auto mb-2 text-gray-400" />
              No startups available in the marketplace matching "{search}".
            </div>
          ) : (
            filteredStartups.map((startup, idx) => {
              const sId = String(startup.id || startup._id || startup.startupId || `startup_${idx}`);
              const isSaved = savedIds.includes(sId);
              const score = startup.aiGenerated?.aiReport?.investmentReadinessScore || 85;
              const stage = startup.fundingStage || (startup.status === 'generated' ? 'Seed' : 'Idea Stage');
              const sName = startup.startupName || startup.name || 'Startup Idea';

              return (
                <div key={idx} className="border border-gray-200 rounded-2xl p-5 hover:border-[#5B21B6]/50 transition-all hover:shadow-md group flex flex-col justify-between h-full bg-white relative">
                  {/* Top Heart / Like Button */}
                  <button
                    onClick={() => handleToggleSave(startup)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title={isSaved ? "Remove from Liked Ideas" : "Like & Save Startup Idea"}
                  >
                    <Heart size={18} className={isSaved ? "fill-rose-500 text-rose-500" : "text-gray-400 hover:text-rose-500"} />
                  </button>

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3.5 mb-4 pr-10">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B21B6] to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
                        {sName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-base truncate">{sName}</h3>
                        <span className="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mt-0.5">
                          {stage}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-4 flex-grow line-clamp-3 leading-relaxed bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                      {startup.startupIdea || startup.shortIntro || startup.whySeeking || 'Innovative AI startup idea seeking investment.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-gray-100 text-xs">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Funding Readiness</p>
                        <p className="font-extrabold text-[#5B21B6]">{score}/100</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Target Ask</p>
                        <p className="font-bold text-gray-900 truncate">{startup.fundingAmount || '₹50,00,000'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
                    <button 
                      onClick={() => setSelectedStartup(startup)}
                      className="flex-1 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 border border-purple-100 cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      View Pitch
                    </button>
                    <button 
                      onClick={() => handleOpenOfferModal(sName, startup.founderName)}
                      className="flex-1 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send size={13} />
                      Send Offer
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Disclaimer Box */}
        <div className="mt-8 p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-start gap-3">
          <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 font-semibold leading-relaxed">
            💡 <strong>AI-Assisted Startup Analysis Disclaimer:</strong> Platform scores and validation metrics provide analytical deal-flow insights to assist your due diligence. Final investment decisions remain solely with the investor.
          </p>
        </div>
      </div>

      {/* Startup Details Modal Overlay */}
      {selectedStartup && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedStartup(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedStartup.startupName || selectedStartup.name}</h2>
              <p className="text-xs text-gray-500 font-medium">Detailed AI Startup Report & Pitch Analysis</p>
            </div>
            
            <SharedStartupDetailsTabs startupData={selectedStartup} />
            
            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between gap-3">
              <button 
                onClick={() => setSelectedStartup(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors flex items-center cursor-pointer"
              >
                <ArrowLeft size={14} className="mr-1.5" /> Close
              </button>
              <button 
                onClick={() => { 
                  const sName = selectedStartup.startupName || selectedStartup.name;
                  setSelectedStartup(null);
                  handleOpenOfferModal(sName, selectedStartup.founderName);
                }}
                className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center cursor-pointer"
              >
                <Send size={14} className="mr-1.5" /> Send Investment Offer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Send Investment Offer Modal */}
      {showOfferModal && (
        <SendInvestmentOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          initialStartupName={offerStartup.name}
          initialFounderName={offerStartup.founder}
        />
      )}
    </div>
  );
};

export default InvestorDashboard;
