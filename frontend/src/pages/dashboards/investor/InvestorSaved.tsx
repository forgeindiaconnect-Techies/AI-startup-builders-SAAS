import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Users, Rocket, ExternalLink, Trash2, Heart, Search, Target, Cpu, Send, Plus, ArrowRight, Sparkles } from 'lucide-react';
import SharedStartupDetailsTabs from '../../../components/shared/SharedStartupDetailsTabs';
import SendInvestmentOfferModal from '../../../components/shared/SendInvestmentOfferModal';

interface SavedStartup {
  id: string;
  name: string;
  sector: string;
  stage: string;
  traction: string;
  team: number;
  location: string;
  rating: number;
  logo?: string;
  fundingAsk?: string;
  valuationCap?: string;
  founderName?: string;
  startupIdea?: string;
  startupData?: any;
}

const InvestorSaved: React.FC = () => {
  const navigate = useNavigate();
  const [savedList, setSavedList] = useState<SavedStartup[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStartup, setSelectedStartup] = useState<any | null>(null);

  // Send Offer Modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerStartup, setOfferStartup] = useState<{ name: string; founder: string }>({ name: '', founder: '' });

  useEffect(() => {
    loadSavedStartups();
  }, []);

  const loadSavedStartups = () => {
    const stored = localStorage.getItem('investor_saved_startups');
    if (stored) {
      try {
        setSavedList(JSON.parse(stored));
      } catch (e) {
        setSavedList([]);
      }
    } else {
      setSavedList([]);
    }
  };

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`Remove "${name}" from your liked Startup Ideas?`)) {
      const updated = savedList.filter(item => item.id !== id);
      setSavedList(updated);
      localStorage.setItem('investor_saved_startups', JSON.stringify(updated));
    }
  };

  const handleOpenOfferModal = (startupName: string, founderName?: string) => {
    setOfferStartup({
      name: startupName,
      founder: founderName || 'Founder'
    });
    setShowOfferModal(true);
  };

  const filteredList = savedList.filter(s => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.sector.toLowerCase().includes(query) ||
      (s.founderName && s.founderName.toLowerCase().includes(query)) ||
      (s.startupIdea && s.startupIdea.toLowerCase().includes(query))
    );
  });

  const totalScore = savedList.reduce((acc, curr) => acc + (curr.rating || 85), 0);
  const avgScore = savedList.length > 0 ? Math.round(totalScore / savedList.length) : 0;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Startup Ideas</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-[#5B21B6] border border-purple-200">
              {savedList.length} Liked
            </span>
          </div>
          <p className="text-gray-500 mt-1 text-sm">Review, evaluate, and send investment offers to startup ideas you have liked.</p>
        </div>

        <button
          onClick={() => navigate('/dashboard/investor/marketplace')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Sparkles size={16} />
          Explore Marketplace
        </button>
      </div>

      {/* Summary Metrics Bar */}
      {savedList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Saved Startup Ideas */}
          <div className="bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#4C1D95] p-5 rounded-2xl shadow-lg shadow-purple-600/20 border border-purple-400/30 text-white flex items-center gap-4 relative overflow-hidden">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0">
              <Heart size={20} className="fill-white text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black text-purple-200 uppercase tracking-wider block">Saved Startup Ideas</span>
              <strong className="text-xl font-black text-white">{savedList.length} Deals</strong>
            </div>
          </div>

          {/* Avg AI Readiness */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-5 rounded-2xl shadow-lg shadow-emerald-600/20 border border-emerald-400/20 text-white flex items-center gap-4 relative overflow-hidden">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0">
              <Cpu size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-100 uppercase tracking-wider block">Avg AI Readiness</span>
              <strong className="text-xl font-black text-white">{avgScore}/100</strong>
            </div>
          </div>

          {/* Shortlisted Stage */}
          <div className="bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 p-5 rounded-2xl shadow-lg shadow-cyan-600/20 border border-cyan-400/20 text-white flex items-center gap-4 relative overflow-hidden">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0">
              <Rocket size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-cyan-100 uppercase tracking-wider block">Shortlisted Stage</span>
              <strong className="text-xl font-black text-white">Seed & Pre-Seed</strong>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {savedList.length > 0 && (
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-3 mb-6 flex items-center gap-3">
          <Search className="text-gray-400 ml-2" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved startup ideas by name, sector, or founder..."
            className="w-full text-sm font-medium outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />
        </div>
      )}

      {/* Empty State */}
      {filteredList.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 shadow-2xs space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-[#5B21B6] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Heart size={32} className="text-[#5B21B6]" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900">No Liked Startup Ideas Yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Browse the Deal Flow Marketplace and click the heart/bookmark button on startup ideas you like to save them here.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/investor/marketplace')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            Browse Startup Marketplace
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* Startup Ideas Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((s) => {
            const startupObj = s.startupData || s;
            const score = s.rating || 85;

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md hover:border-purple-200 transition-all p-5 flex flex-col justify-between group relative"
              >
                {/* Top Unlike Button */}
                <button
                  onClick={() => handleRemove(s.id, s.name)}
                  className="absolute top-4 right-4 p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                  title="Remove from Liked Ideas"
                >
                  <Heart size={18} className="fill-rose-500 text-rose-500" />
                </button>

                <div>
                  {/* Logo & Header */}
                  <div className="flex items-center gap-3.5 mb-4 pr-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B21B6] to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-base truncate">{s.name}</h3>
                      <span className="inline-block text-[11px] font-bold text-[#5B21B6] bg-purple-50 px-2 py-0.5 rounded-md mt-0.5">
                        {s.sector || 'Tech'}
                      </span>
                    </div>
                  </div>

                  {/* Startup Pitch Summary */}
                  <p className="text-xs text-gray-600 line-clamp-3 mb-5 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    {s.startupIdea || startupObj.startupIdea || startupObj.shortIntro || 'Innovative AI startup idea seeking seed funding.'}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Target Raise</span>
                      <strong className="text-gray-900 font-extrabold text-sm">{s.fundingAsk || '₹50,00,000'}</strong>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Stage</span>
                      <strong className="text-gray-900 font-bold text-sm">{s.stage || 'Seed'}</strong>
                    </div>
                  </div>

                  {/* AI Score Badge */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-5 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-black text-xs">
                        {score}/100
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">AI Readiness</span>
                    </div>
                    {s.founderName && (
                      <span className="text-[11px] text-gray-500 font-medium truncate max-w-[120px]">
                        By {s.founderName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => setSelectedStartup(startupObj)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    View Details
                    <ExternalLink size={13} />
                  </button>

                  <button
                    onClick={() => handleOpenOfferModal(s.name, s.founderName || startupObj.founderName)}
                    className="flex-1 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Send Offer
                    <Send size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Startup Details Modal */}
      {selectedStartup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStartup(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Trash2 size={0} className="hidden" /> ✕
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedStartup.startupName || selectedStartup.name}</h2>
              <p className="text-xs text-gray-500 font-medium">Detailed AI Startup Report & Modules</p>
            </div>
            <SharedStartupDetailsTabs startupData={selectedStartup} />
          </div>
        </div>
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

export default InvestorSaved;
