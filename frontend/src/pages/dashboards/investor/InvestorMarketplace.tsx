import React, { useState } from 'react';
import { Search, Filter, Cpu, ArrowRight, Bookmark, Target, X, CheckCircle2, AlertTriangle, Briefcase, ArrowLeft, DollarSign } from 'lucide-react';
import SharedStartupDetailsTabs from '../../../components/shared/SharedStartupDetailsTabs';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../../../context/FundingContext';

const InvestorMarketplace: React.FC = () => {
  const { user } = useAuth();
  const { sendOffer } = useFunding();

  const [search, setSearch] = useState('');
  const [startups, setStartups] = React.useState<any[]>([]);
  const [selectedStartup, setSelectedStartup] = React.useState<any>(null);

  // Funding Offer Modal State
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [offerData, setOfferData] = useState({
    offerAmount: '',
    currency: 'USD',
    equityPercentage: '',
    valuationCap: '',
    instrument: 'SAFE',
    discount: '20',
    expiresInDays: '14',
    investorMessage: ''
  });

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

  const handleSendOffer = () => {
    if (!user || !selectedStartup) return;

    sendOffer({
      startupId: selectedStartup.startupId,
      startupName: selectedStartup.startupName,
      founderId: "1", // Hardcoded for demo as founder is usually ID '1' in this demo
      founderName: "Sarah Jenkins", // Hardcoded for demo
      investorId: user.id,
      investorName: user.name,
      investorCompany: "DC Ventures", // Hardcoded for demo, normally would come from user profile
      offerAmount: Number(offerData.offerAmount),
      currency: offerData.currency,
      equityPercentage: Number(offerData.equityPercentage),
      valuationCap: Number(offerData.valuationCap),
      instrument: offerData.instrument,
      discount: Number(offerData.discount),
      expiresInDays: Number(offerData.expiresInDays),
      investorMessage: offerData.investorMessage
    });

    window.alert("Funding offer sent successfully!");
    setShowFundingModal(false);
    setSelectedStartup(null);
  };

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
            if (search && !s.startupName?.toLowerCase().includes(search.toLowerCase()) && !s.startupIdea?.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
          }).map((startup, idx) => {
            const score = startup.aiGenerated?.aiReport?.investmentReadinessScore || 85;
            const stage = startup.status === 'generated' ? 'Seed' : 'Idea Stage';
            return (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#5B21B6]/40 hover:shadow-lg transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl shadow-sm from-blue-500 to-indigo-600`}>
                    {startup.startupName ? startup.startupName.charAt(0) : 'S'}
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

      {/* Details Modal Overlay */}
      {selectedStartup && !showFundingModal && (
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
                <div className="flex gap-3">
                  <button 
                    onClick={() => { window.alert('Interest expressed to the founders!'); setSelectedStartup(null); }}
                    className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center"
                  >
                    <Briefcase size={16} className="mr-2" /> Express Interest
                  </button>
                  <button 
                    onClick={() => setShowFundingModal(true)}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center"
                  >
                    <DollarSign size={16} className="mr-2" /> Send Funding Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Funding Offer Modal */}
      {showFundingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" /> 
                Send Funding Offer
              </h3>
              <button onClick={() => setShowFundingModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-green-50 p-4 rounded-xl border border-green-100 gap-4">
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Target Startup</p>
                  <p className="text-lg font-black text-gray-900">{selectedStartup?.startupName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Founder</p>
                  <p className="text-sm font-bold text-gray-800">Sarah Jenkins</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Offer Amount ($)</label>
                  <input 
                    type="number" 
                    value={offerData.offerAmount}
                    onChange={(e) => setOfferData({...offerData, offerAmount: e.target.value})}
                    placeholder="250000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Equity Percentage (%)</label>
                  <input 
                    type="number" 
                    value={offerData.equityPercentage}
                    onChange={(e) => setOfferData({...offerData, equityPercentage: e.target.value})}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Instrument</label>
                  <select 
                    value={offerData.instrument}
                    onChange={(e) => setOfferData({...offerData, instrument: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="SAFE">SAFE</option>
                    <option value="Convertible Note">Convertible Note</option>
                    <option value="Equity">Priced Equity Round</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Valuation Cap ($)</label>
                  <input 
                    type="number" 
                    value={offerData.valuationCap}
                    onChange={(e) => setOfferData({...offerData, valuationCap: e.target.value})}
                    placeholder="2500000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Discount (%)</label>
                  <input 
                    type="number" 
                    value={offerData.discount}
                    onChange={(e) => setOfferData({...offerData, discount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Expires In (Days)</label>
                  <input 
                    type="number" 
                    value={offerData.expiresInDays}
                    onChange={(e) => setOfferData({...offerData, expiresInDays: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Message / Terms Notes</label>
                <textarea 
                  value={offerData.investorMessage}
                  onChange={(e) => setOfferData({...offerData, investorMessage: e.target.value})}
                  rows={4}
                  placeholder="Additional terms or message to the founder..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3">
              <button 
                onClick={() => setShowFundingModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendOffer}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center transition-colors"
              >
                Submit Funding Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorMarketplace;
