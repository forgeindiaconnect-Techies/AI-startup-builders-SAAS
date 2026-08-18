import React, { useState, useMemo } from 'react';
import { 
  Wallet, ShieldCheck, CheckCircle2, AlertCircle, Search, 
  Filter, FileText, ArrowUpRight, DollarSign, Handshake, Percent 
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';

const AdminInvestorFunding: React.FC = () => {
  const { offers, loading, markAsFunded, refreshOffers } = useFunding();
  const { user } = useAuth();
  const adminName = user?.fullName || 'Admin';

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'funded' | 'accepted' | 'offer_received' | 'rejected'>('All');
  
  // Modal State for marking as Funded
  const [fundingTarget, setFundingTarget] = useState<FundingOffer | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter offers
  const filteredOffers = useMemo(() => {
    return offers.filter(o => {
      const matchesSearch = 
        o.startupName.toLowerCase().includes(search.toLowerCase()) ||
        o.founderName.toLowerCase().includes(search.toLowerCase()) ||
        o.investorName.toLowerCase().includes(search.toLowerCase()) ||
        (o.investorCompany && o.investorCompany.toLowerCase().includes(search.toLowerCase()));

      const matchesTab = activeTab === 'All' || o.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [offers, search, activeTab]);

  // Calculations
  const stats = useMemo(() => {
    let totalFundedAmount = 0;
    let completedDeals = 0;
    let totalCommission = 0;
    let pendingCommission = 0;

    offers.forEach(o => {
      if (o.status === 'funded') {
        totalFundedAmount += o.offerAmount;
        completedDeals += 1;
        totalCommission += o.offerAmount * 0.02; // 2.0% platform commission fee
      } else if (o.status === 'accepted') {
        pendingCommission += o.offerAmount * 0.02;
      }
    });

    return {
      totalFundedAmount,
      completedDeals,
      totalCommission,
      pendingCommission
    };
  }, [offers]);

  const handleMarkFundedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingTarget) return;
    setSubmitting(true);
    try {
      const targetId = fundingTarget._id || fundingTarget.id;
      await markAsFunded(targetId, adminNote || 'Admin verified compliance and marked deal as funded.', adminName);
      showToast('Deal successfully marked as Funded & commissions calculated!');
      setFundingTarget(null);
      setAdminNote('');
      refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update transaction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans text-xs">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Wallet className="text-[#6C4CF1]" size={28} /> Investor Funding & Commissions
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor investor term sheets, deal closures, and track the 2.0% platform success fee commissions.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6C4CF1] flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Funded Volume</p>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">
              ${stats.totalFundedAmount.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Handshake size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Completed Deals</p>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">
              {stats.completedDeals} closed
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Percent size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Earned Commissions (2.0%)</p>
            <h3 className="text-lg font-black text-emerald-600 mt-0.5">
              ${stats.totalCommission.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pipeline Commission</p>
            <h3 className="text-lg font-black text-amber-600 mt-0.5">
              ${stats.pendingCommission.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl w-full md:max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by Startup, Founder, or Investor Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-medium text-gray-900 w-full placeholder-gray-400 ml-1.5"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['All', 'funded', 'accepted', 'offer_received', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                activeTab === tab
                  ? 'bg-[#6C4CF1] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'offer_received' ? 'Offer Received' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-extrabold uppercase tracking-wider border-b border-gray-100 text-[10px]">
                <th className="p-4">Date</th>
                <th className="p-4">Startup / Founder</th>
                <th className="p-4">Investor / Firm</th>
                <th className="p-4">Details</th>
                <th className="p-4">Deal Value</th>
                <th className="p-4">Commission (2.0%)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">Loading deal transactions...</td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">No funding transactions found.</td>
                </tr>
              ) : (
                filteredOffers.map((o) => {
                  const commission = o.offerAmount * 0.02;
                  const isFunded = o.status === 'funded';
                  const isAccepted = o.status === 'accepted';
                  
                  return (
                    <tr key={o.id || o._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{o.startupName}</div>
                        <div className="text-[10px] text-gray-400">Founder: {o.founderName}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{o.investorName}</div>
                        <div className="text-[10px] text-gray-400">{o.investorCompany}</div>
                      </td>
                      <td className="p-4 text-[10px]">
                        <div>Instrument: <strong className="text-gray-900">{o.instrument}</strong></div>
                        <div>Equity: <strong className="text-gray-900">{o.equityPercentage}%</strong></div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        ${o.offerAmount.toLocaleString()}
                      </td>
                      <td className={`p-4 font-black ${isFunded ? 'text-emerald-600' : isAccepted ? 'text-amber-600' : 'text-gray-400'}`}>
                        ${commission.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          isFunded 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : isAccepted 
                              ? 'bg-amber-50 text-amber-600 border-amber-100' 
                              : o.status === 'rejected'
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {o.status === 'offer_received' ? 'Offer Received' : o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isAccepted && (
                          <button
                            onClick={() => setFundingTarget(o)}
                            className="px-3 py-1.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <ShieldCheck size={12} /> Mark Funded
                          </button>
                        )}
                        {isFunded && (
                          <span className="text-[10px] text-emerald-600 font-extrabold flex items-center justify-end gap-1">
                            <CheckCircle2 size={12} /> Verified & Closed
                          </span>
                        )}
                        {!isAccepted && !isFunded && (
                          <span className="text-[10px] text-gray-400 italic">No Action Required</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MARK AS FUNDED MODAL */}
      {fundingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 overflow-y-auto font-sans text-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in zoom-in-95 text-left">
            <h3 className="text-lg font-black text-gray-900 mb-1">Verify Funding & Close Deal</h3>
            <p className="text-xs text-gray-500 mb-4">
              Confirm that startup <strong>{fundingTarget.startupName}</strong> has received the <strong>${fundingTarget.offerAmount.toLocaleString()}</strong> investment from <strong>{fundingTarget.investorName}</strong>. 
            </p>

            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl mb-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Deal Value:</span>
                <strong className="text-gray-900">${fundingTarget.offerAmount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between border-t border-purple-100/50 pt-2">
                <span className="text-gray-500 font-bold">Platform Success Fee (2.0%):</span>
                <strong className="text-emerald-600 font-black">${(fundingTarget.offerAmount * 0.02).toLocaleString()}</strong>
              </div>
            </div>

            <form onSubmit={handleMarkFundedSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Admin Audit Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Escrow verified, compliance paperwork completed, equity transferred."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6C4CF1] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFundingTarget(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl shadow-md text-xs cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Confirm Funding & Commission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestorFunding;
