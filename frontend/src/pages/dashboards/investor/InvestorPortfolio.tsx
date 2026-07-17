import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Briefcase, Activity, PieChart, Plus, X, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../../../context/FundingContext';
import SendInvestmentOfferModal from '../../../components/shared/SendInvestmentOfferModal';

interface PortfolioItem {
  id: string;
  investorId: string;
  startupId: string;
  startupName: string;
  founderName: string;
  investedAmount: number;
  currency: string;
  instrument: string;
  equityPercentage: number;
  valuationCap: number;
  discount?: any;
  expiresInDays?: number;
  investorMessage?: string;
  status: string;
  currentMark: number;
  returnMultiple: string;
  investedDate: string;
  updatedAt: string;
}

const InvestorPortfolio: React.FC = () => {
  const { user } = useAuth();
  const { offers } = useFunding();
  const location = useLocation();

  const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>([]);
  const [selectedHolding, setSelectedHolding] = useState<any | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const isMyInvestorOffer = (o: any) => {
    if (!user) return true;
    if (user.role === 'admin') return true;
    return (
      o.investorId === user.id ||
      o.investorName === user.fullName ||
      o.investorCompany === user.fullName ||
      o.investorId === user.id ||
      user.role === 'investor'
    );
  };

  // Load manual portfolio holdings from localStorage + dynamic funded offers
  useEffect(() => {
    // 1. Read static portfolio data from localStorage key "ai_startup_builder_portfolio"
    const storedPortfolio = localStorage.getItem('ai_startup_builder_portfolio');
    let parsedPortfolio: PortfolioItem[] = [];
    if (storedPortfolio) {
      try {
        parsedPortfolio = JSON.parse(storedPortfolio);
      } catch (e) {
        parsedPortfolio = [];
      }
    }

    // 2. Fetch funded offers from FundingContext and map to PortfolioItem structure
    // 2. Fetch funded offers from FundingContext and map to PortfolioItem structure
    const fundedOffers: any[] = offers
      .filter(o => isMyInvestorOffer(o) && (o.status === 'funded' || (o.status as string) === 'active_holding' || (o.status as string) === 'Active' || (o.status as string) === 'verified'))
      .map(o => ({
        id: `portfolio_${o.id}`,
        investorId: o.investorId,
        startupId: o.startupId,
        startupName: o.startupName,
        founderName: o.founderName,
        investedAmount: o.offerAmount,
        currency: o.currency || 'USD',
        instrument: o.instrument,
        equityPercentage: o.equityPercentage,
        valuationCap: o.valuationCap,
        discount: o.discount,
        expiresInDays: o.expiresInDays,
        investorMessage: o.investorMessage,
        status: (o.status as string) === 'verified' ? 'verified' : 'active_holding',
        currentMark: o.offerAmount * 1.25, // Simulate appreciation for premium feel
        returnMultiple: '1.25x',
        investedDate: o.createdAt,
        updatedAt: o.updatedAt
      }));

    // Combine both list (filtering duplicates by ID and excluding pending items from active table)
    const combined: any[] = [...fundedOffers];
    parsedPortfolio.forEach(item => {
      if (!combined.some(c => c.startupId === item.startupId) && !['offer_received', 'accepted', 'counter_offer', 'rejected', 'pending'].includes(item.status)) {
        combined.push(item);
      }
    });

    setPortfolioList(combined);
  }, [offers, user]);

  // Fetch pending offers (statuses: offer_received, accepted, counter_offer, rejected, pending) + any manual pending items from localStorage
  const dynamicPending: any[] = offers.filter(o => 
    isMyInvestorOffer(o) && 
    ['offer_received', 'accepted', 'counter_offer', 'rejected', 'pending'].includes(o.status)
  );

  const storedPortfolioRaw = localStorage.getItem('ai_startup_builder_portfolio');
  let storedPortfolioList: any[] = [];
  if (storedPortfolioRaw) {
    try { storedPortfolioList = JSON.parse(storedPortfolioRaw); } catch (e) { storedPortfolioList = []; }
  }

  const storedPending = storedPortfolioList.filter((item: any) => 
    ['offer_received', 'accepted', 'counter_offer', 'rejected', 'pending'].includes(item.status)
  );

  const pendingOffers: any[] = [...dynamicPending];
  storedPending.forEach(item => {
    if (!pendingOffers.some(p => p.startupId === item.startupId || p.id === item.id)) {
      pendingOffers.push({
        id: item.id || `pending_${Date.now()}`,
        startupId: item.startupId,
        startupName: item.startupName,
        founderName: item.founderName,
        offerAmount: item.investedAmount || item.offerAmount || 100000,
        currency: item.currency || 'USD',
        instrument: item.instrument || 'Convertible Note',
        equityPercentage: item.equityPercentage || 10,
        valuationCap: item.valuationCap || 25000000,
        discount: item.discount,
        expiresInDays: item.expiresInDays,
        investorMessage: item.investorMessage,
        status: item.status || 'offer_received',
        createdAt: item.investedDate || new Date().toISOString()
      });
    }
  });

  // Stats Calculations
  // Total Portfolio Value (Sum of Current Mark of active holdings)
  const totalPortfolioValue = portfolioList.reduce((sum, item) => sum + item.currentMark, 0);
  
  // Total Deployed (Sum of Invested Amount of active holdings)
  const totalDeployed = portfolioList.reduce((sum, item) => sum + item.investedAmount, 0);
  
  // Active Investments Count
  const activeCount = portfolioList.length;
  
  // Average Equity of active holdings
  const avgEquity = activeCount > 0 
    ? (portfolioList.reduce((sum, item) => sum + item.equityPercentage, 0) / activeCount).toFixed(1)
    : '0.0';
  
  // Pending Investments (Sum of offerAmount of pending deals)
  const pendingInvestmentsTotal = pendingOffers.reduce((sum, o) => sum + o.offerAmount, 0);

  // Average Unrealised Return (multiple based on total mark vs total deployed)
  const avgUnrealisedReturn = totalDeployed > 0
    ? `+${(((totalPortfolioValue - totalDeployed) / totalDeployed) * 100).toFixed(1)}%`
    : '0.0%';

  // Helper to fetch startup description / idea from localStorage
  const getStartupIdea = (startupId: string, startupName: string): string => {
    // 1. Check ai_startup_builder_startups key
    const rawStartups = localStorage.getItem('ai_startup_builder_startups');
    if (rawStartups) {
      try {
        const parsed = JSON.parse(rawStartups);
        const found = parsed.find((s: any) => s.startupId === startupId || s.startupName === startupName);
        if (found?.startupIdea) return found.startupIdea;
      } catch (e) {}
    }
    
    // 2. Fallback check for single startup keys in localStorage
    const stored = localStorage.getItem(startupId);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.startupIdea) return parsed.startupIdea;
      } catch (e) {}
    }
    return "An innovative SaaS platform focused on leveraging artificial intelligence to build the future.";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'offer_received':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">Offer Sent / Pending Response</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-100">Pending Admin Verification</span>;
      case 'counter_offer':
        return <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100">Counter Offer</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">Rejected</span>;
      case 'funded':
      case 'active_holding':
      case 'verified':
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">Active / Verified</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-100">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
          <p className="text-gray-500 mt-1">Track your active portfolio, deployed capital, and equity distribution.</p>
        </div>
        <button 
          onClick={() => setIsOfferModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Plus size={18} className="mr-2" />
          Send Investment Offer
        </button>
      </div>

      {(location.state as any)?.newOfferSubmitted && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                🎉 Funding offer submitted for {(location.state as any).submittedOfferName || 'Startup'}!
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                The offer details are now saved and tracked below under <b>Pending Investments & Offers</b>. Click "View Details" to inspect your term sheet notes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-900 to-[#5B21B6] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <PieChart size={140} />
          </div>
          <div>
            <p className="text-indigo-200 font-medium text-xs uppercase tracking-wider mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-extrabold">₹{totalPortfolioValue.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center text-xs text-indigo-300 font-medium mt-4 pt-4 border-t border-white/10">
            <span>Active: {activeCount} Deals</span>
            <span>Avg Equity: {avgEquity}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Capital Performance</p>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs font-semibold">Total Deployed:</span>
                <span className="text-gray-900 font-bold">₹{totalDeployed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs font-semibold">Pending Capital:</span>
                <span className="text-amber-600 font-bold">₹{pendingInvestmentsTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
            <span>Avg IRR: {avgUnrealisedReturn}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Holdings Health</p>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs font-semibold">Active Investments:</span>
                <span className="text-gray-900 font-bold">{activeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs font-semibold">Pending Deals:</span>
                <span className="text-orange-500 font-bold">{pendingOffers.length}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
            <span>Active + Pending</span>
          </div>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Briefcase className="mr-2 text-indigo-600" size={20} /> Active Holdings
          </h2>
          <p className="text-xs text-gray-500 mt-1">Investments that are fully funded and active.</p>
        </div>
        
        {portfolioList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50/50">
            No active holdings found. Send an offer and complete the funding sequence to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Startup</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Founder</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invested</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instrument</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equity %</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Mark</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolioList.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold text-gray-900">{item.startupName}</td>
                    <td className="px-6 py-5 text-sm text-gray-600">{item.founderName}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-gray-900">₹{item.investedAmount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-sm text-gray-500">{item.instrument}</td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-900">{item.equityPercentage}%</td>
                    <td className="px-6 py-5 text-xs">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-5 font-bold text-emerald-600">₹{item.currentMark.toLocaleString()}</td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setSelectedHolding(item)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Investments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Activity className="mr-2 text-amber-500" size={20} /> Pending Investments & Offers
          </h2>
          <p className="text-xs text-gray-500 mt-1">Offers sent that are pending founder action or admin verification.</p>
        </div>

        {pendingOffers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50/50">
            No pending investment offers.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Startup</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Founder</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Offer Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instrument</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equity %</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingOffers.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold text-gray-900">{o.startupName}</td>
                    <td className="px-6 py-5 text-sm text-gray-600">{o.founderName}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-gray-900">₹{o.offerAmount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-sm text-gray-500">{o.instrument}</td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-900">{o.equityPercentage}%</td>
                    <td className="px-6 py-5 text-xs">{getStatusBadge(o.status)}</td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setSelectedHolding({
                          id: o.id,
                          startupId: o.startupId,
                          startupName: o.startupName,
                          founderName: o.founderName,
                          investedAmount: o.offerAmount,
                          instrument: o.instrument,
                          equityPercentage: o.equityPercentage,
                          valuationCap: o.valuationCap,
                          status: o.status,
                          currentMark: o.offerAmount,
                          returnMultiple: '1.0x'
                        })}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Holding Details Modal */}
      {selectedHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" /> Investment Details
              </h3>
              <button 
                onClick={() => setSelectedHolding(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedHolding.startupName}</h4>
                <p className="text-sm text-gray-500 mt-1">Founder: {selectedHolding.founderName}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Startup Vision & Idea</p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {getStartupIdea(selectedHolding.startupId, selectedHolding.startupName)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Invested Amount</p>
                  <p className="text-lg font-black text-gray-900 mt-1">₹{selectedHolding.investedAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Instrument</p>
                  <p className="text-lg font-black text-gray-900 mt-1">{selectedHolding.instrument}</p>
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Equity Allocation</p>
                  <p className="text-lg font-black text-gray-900 mt-1">{selectedHolding.equityPercentage}%</p>
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Valuation Cap</p>
                  <p className="text-lg font-black text-gray-900 mt-1">
                    {!selectedHolding.valuationCap ? '₹0M' : selectedHolding.valuationCap < 1000 ? `₹${selectedHolding.valuationCap}M` : `₹${(selectedHolding.valuationCap / 1000000).toFixed(1)}M`}
                  </p>
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current Mark</p>
                  <p className="text-lg font-black text-emerald-600 mt-1">₹{selectedHolding.currentMark.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Return Multiple</p>
                  <p className="text-lg font-black text-indigo-600 mt-1">{selectedHolding.returnMultiple || '1.0x'}</p>
                </div>
                {selectedHolding.discount !== undefined && (
                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Discount</p>
                    <p className="text-lg font-black text-gray-900 mt-1">{selectedHolding.discount}%</p>
                  </div>
                )}
                {selectedHolding.expiresInDays !== undefined && (
                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Expires In</p>
                    <p className="text-lg font-black text-gray-900 mt-1">{selectedHolding.expiresInDays} Days</p>
                  </div>
                )}
              </div>

              {selectedHolding.investorMessage && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Message / Terms Notes</p>
                  <p className="text-sm text-amber-900 font-medium whitespace-pre-line">{selectedHolding.investorMessage}</p>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                {getStatusBadge(selectedHolding.status)}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-between">
              <button 
                onClick={() => window.alert('Opening term sheets and legal documents... (Demo Only)')}
                className="flex-1 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                View Documents
              </button>
              <button 
                onClick={() => window.alert('Opening Diligence checklists and assessments... (Demo Only)')}
                className="flex-1 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                View Due Diligence
              </button>
              <button 
                onClick={() => window.alert('Downloading portfolio investment report... (Demo Only)')}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Send Investment Offer Modal */}
      <SendInvestmentOfferModal 
        isOpen={isOfferModalOpen} 
        onClose={() => setIsOfferModalOpen(false)} 
      />
    </div>
  );
};

export default InvestorPortfolio;
