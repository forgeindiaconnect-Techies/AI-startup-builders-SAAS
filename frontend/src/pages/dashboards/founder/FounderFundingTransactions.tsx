import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet, FileCheck, ShieldCheck, CheckCircle2,
  Clock, Plus, X, AlertCircle, TrendingUp, IndianRupee,
  Eye, Building2, Calendar, User, FileText,
  ThumbsUp, ThumbsDown, MessageSquare, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { getStartups } from '../../../utils/localStorageHelper';
import {
  getFundingTransactions, saveFundingTransaction
} from '../../../utils/investorModuleStorage';
import type { FundingTransaction } from '../../../utils/investorModuleStorage';

const FounderFundingTransactions: React.FC = () => {
  const { user } = useAuth();
  const { offers, loading, refreshOffers, respondToOffer } = useFunding();

  const [activeTab, setActiveTab] = useState<'commitments' | 'deals'>('commitments');
  const [localDeals, setLocalDeals] = useState<FundingTransaction[]>([]);
  const [startups, setStartups] = useState<any[]>([]);

  // Detail modals
  const [viewingOffer, setViewingOffer] = useState<FundingOffer | null>(null);
  const [viewingDeal, setViewingDeal] = useState<FundingTransaction | null>(null);
  // Counter offer
  const [showCounterModal, setShowCounterModal] = useState<string | null>(null);
  const [counterData, setCounterData] = useState({ amount: '', equity: '', message: '' });
  // Record Finalized Deal modal
  const [showAddModal, setShowAddModal] = useState(false);

  // "Record deal" form state
  const [selectedStartupName, setSelectedStartupName] = useState('');
  const [investorName, setInvestorName] = useState('');
  const [investorFirm, setInvestorFirm] = useState('');
  const [fundingAmount, setFundingAmount] = useState('₹50,00,000');
  const [investmentStage, setInvestmentStage] = useState('Seed Round');
  const [transactionStatus, setTransactionStatus] = useState<FundingTransaction['transactionStatus']>('Term Sheet Signed');
  const [dealNotes, setDealNotes] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadLocalData = async () => {
    const txs = getFundingTransactions();
    setLocalDeals(txs);
    const userStartups = await getStartups();
    setStartups(userStartups);
    if (userStartups.length > 0 && !selectedStartupName) {
      setSelectedStartupName(userStartups[0].startupName || '');
    }
  };

  useEffect(() => {
    refreshOffers();
    loadLocalData();
    window.addEventListener('storage', loadLocalData);
    window.addEventListener('funding_transactions_updated', loadLocalData);
    return () => {
      window.removeEventListener('storage', loadLocalData);
      window.removeEventListener('funding_transactions_updated', loadLocalData);
    };
  }, []);

  // Get all investor commitments directed to this founder's startups
  const founderOffers = useMemo(() => {
    if (!user) return offers;
    const userId = String(user.id || '');
    const userEmail = (user.email || '').toLowerCase();
    return offers.filter(o =>
      (o.founderId && String(o.founderId) === userId) ||
      (o.founderEmail && o.founderEmail.toLowerCase() === userEmail)
    );
  }, [offers, user]);

  // Metrics from live FundingContext offers
  const metrics = useMemo(() => {
    let totalCommitted = 0, pending = 0, completed = 0, awaitingAction = 0;
    founderOffers.forEach(o => {
      totalCommitted += o.offerAmount;
      if (['funded', 'completed'].includes(o.status)) completed += o.offerAmount;
      else if (['payment_submitted', 'under_verification', 'accepted'].includes(o.status)) pending += o.offerAmount;
      if (o.status === 'offer_received') awaitingAction++;
    });
    return { totalCommitted, pending, completed, awaitingAction };
  }, [founderOffers]);

  const fmtAmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const getOfferBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      offer_received:     { label: 'Commitment Received', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
      accepted:           { label: 'Accepted · Awaiting Payment', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
      counter_offer:      { label: 'Counter Offer Sent', cls: 'bg-orange-50 text-orange-700 border border-orange-200' },
      rejected:           { label: 'Rejected', cls: 'bg-red-50 text-red-700 border border-red-200' },
      payment_submitted:  { label: 'Payment Submitted', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
      under_verification: { label: 'Under Verification', cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      funded:             { label: 'Funded ✓', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      completed:          { label: 'Completed ✓', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      failed:             { label: 'Failed', cls: 'bg-rose-50 text-rose-700 border border-rose-200' },
    };
    const item = map[status] || { label: status, cls: 'bg-gray-50 text-gray-700 border border-gray-200' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${item.cls}`}>{item.label}</span>;
  };

  const getDealBadge = (status: FundingTransaction['transactionStatus']) => {
    const map: Record<string, string> = {
      'Investment Completed': 'bg-emerald-600 text-white',
      'Agreement Finalized':  'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'Due Diligence Complete': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Term Sheet Signed':    'bg-amber-100 text-amber-800 border border-amber-200',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${map[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const handleAccept = async (offer: FundingOffer) => {
    if (!window.confirm(`Accept the ₹${offer.offerAmount.toLocaleString()} commitment from ${offer.investorName}?`)) return;
    setActionLoading(true);
    try {
      await respondToOffer(offer.id || offer._id!, 'accepted', {});
      showToast('Commitment accepted! Investor will be notified to proceed with payment.');
      setViewingOffer(null);
      await refreshOffers();
    } catch (e: any) { showToast(e.message || 'Failed to accept.', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (offer: FundingOffer) => {
    if (!window.confirm(`Reject this commitment from ${offer.investorName}?`)) return;
    setActionLoading(true);
    try {
      await respondToOffer(offer.id || offer._id!, 'rejected', { message: 'Founder declined.' });
      showToast('Commitment rejected.');
      setViewingOffer(null);
      await refreshOffers();
    } catch (e: any) { showToast(e.message || 'Failed to reject.', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleCounter = async () => {
    if (!showCounterModal) return;
    setActionLoading(true);
    try {
      await respondToOffer(showCounterModal, 'counter_offer', {
        counterAmount: Number(counterData.amount),
        counterEquity: Number(counterData.equity),
        message: counterData.message,
      });
      showToast('Counter offer sent to the investor!');
      setShowCounterModal(null);
      setCounterData({ amount: '', equity: '', message: '' });
      await refreshOffers();
    } catch (e: any) { showToast(e.message || 'Failed.', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName.trim() || !investorFirm.trim()) { showToast('Enter investor name and firm.', 'error'); return; }
    saveFundingTransaction({
      startupId: `st_${Date.now()}`,
      startupName: selectedStartupName,
      founderName: user?.fullName || 'Founder',
      investorName: investorName.trim(),
      investorFirm: investorFirm.trim(),
      fundingAmount,
      investmentStage,
      transactionStatus,
      dealNotes,
    });
    showToast('Deal recorded successfully!');
    setShowAddModal(false);
    setInvestorName(''); setInvestorFirm(''); setDealNotes('');
    loadLocalData();
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Wallet className="text-[#5B21B6]" size={28} /> Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1">View investor commitments, manage funding offers, and record finalized deals.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refreshOffers()} className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-[#5B21B6] rounded-xl transition-colors" title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5">
            <Plus size={14} /> Record Finalized Deal
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Committed</p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">{fmtAmt(metrics.totalCommitted)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{founderOffers.length} commitment(s)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Pending / In Progress</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{fmtAmt(metrics.pending)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Funded / Completed</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{fmtAmt(metrics.completed)}</p>
        </div>
        <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-2xl shadow-sm p-5 text-white">
          <p className="text-[10px] font-black text-purple-200 uppercase tracking-wider">Awaiting Your Action</p>
          <p className="text-xl font-extrabold mt-1">{metrics.awaitingAction}</p>
          <p className="text-[10px] text-purple-200 mt-0.5">new commitment(s)</p>
        </div>
      </div>

      {/* Investment Lifecycle Banner */}
      <div className="mb-8 bg-gradient-to-r from-[#5B21B6] to-[#4C1D95] rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <TrendingUp size={14} /> Investment Lifecycle
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-bold">
          {[
            { step: '1', title: 'Commitment\nReceived' },
            { step: '2', title: 'Review &\nAccept' },
            { step: '3', title: 'Payment\nSubmitted' },
            { step: '4', title: 'Admin\nVerification' },
            { step: '5', title: 'Deal\nFunded' },
            { step: '6', title: 'Transaction\nRecorded' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 p-2.5 rounded-xl border border-white/15 flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-black text-[10px] flex items-center justify-center mb-1">{item.step}</span>
              <span className="text-purple-100 leading-tight whitespace-pre-line">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('commitments')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'commitments' ? 'border-[#5B21B6] text-[#5B21B6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <IndianRupee size={15} /> Investor Commitments ({founderOffers.length})
          {metrics.awaitingAction > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{metrics.awaitingAction}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'deals' ? 'border-[#5B21B6] text-[#5B21B6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FileCheck size={15} /> Recorded Deals ({localDeals.length})
        </button>
      </div>

      {/* ── Investor Commitments Tab ── */}
      {activeTab === 'commitments' && (
        loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#5B21B6] border-t-transparent rounded-full" />
          </div>
        ) : founderOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
            <IndianRupee size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Investor Commitments Yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">When investors submit a funding commitment to your startup, it will appear here for your review.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Investor Funding Commitments</h3>
              <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-lg text-xs font-bold">{founderOffers.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs font-medium">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="px-5 py-3.5">Commitment ID</th>
                    <th className="px-5 py-3.5">Startup</th>
                    <th className="px-5 py-3.5">Investor</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Type / Round</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {founderOffers.map((o) => (
                    <tr key={o.id || o._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[#5B21B6] text-[11px]">
                        {o.commitmentId || `FC-${String(o.id || o._id || '').slice(-6).toUpperCase()}`}
                      </td>
                      <td className="px-5 py-4"><p className="font-bold text-gray-900">{o.startupName}</p></td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">{o.investorName}</p>
                        <p className="text-[10px] text-gray-400">{o.investorCompany}</p>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-[#5B21B6]">₹{o.offerAmount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-lg text-[10px] font-semibold">{o.instrument || 'SAFE'}</span>
                        {o.fundingRound && <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-semibold">{o.fundingRound}</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{fmtDate(o.createdAt)}</td>
                      <td className="px-5 py-4">{getOfferBadge(o.status)}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => setViewingOffer(o)} className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-lg text-[10px] transition-colors flex items-center gap-1 ml-auto">
                          <Eye size={11} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ── Recorded Deals Tab ── */}
      {activeTab === 'deals' && (
        localDeals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
            <FileCheck size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Finalized Deals Recorded</h3>
            <p className="text-xs text-gray-500 mt-1">Once an investment agreement is signed and finalized, record it here.</p>
            <button onClick={() => setShowAddModal(true)} className="mt-4 px-5 py-2.5 bg-[#5B21B6] text-white font-bold text-xs rounded-xl shadow-md">+ Record Finalized Deal</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Finalized Deals & Term Sheets</h3>
              <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-lg text-xs font-bold">{localDeals.length} Recorded</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs font-medium">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="px-5 py-3.5">Ref ID</th>
                    <th className="px-5 py-3.5">Startup</th>
                    <th className="px-5 py-3.5">Investor & Firm</th>
                    <th className="px-5 py-3.5">Funding Amount</th>
                    <th className="px-5 py-3.5">Stage</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {localDeals.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#5B21B6] font-mono">{tx.referenceId}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{tx.startupName}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{tx.investorName}</div>
                        <div className="text-[10px] text-gray-400">{tx.investorFirm}</div>
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-600 text-sm">{tx.fundingAmount}</td>
                      <td className="px-5 py-4 font-semibold text-gray-600">{tx.investmentStage}</td>
                      <td className="px-5 py-4">{getDealBadge(tx.transactionStatus)}</td>
                      <td className="px-5 py-4 text-gray-500">{fmtDate(tx.transactionDate)}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => setViewingDeal(tx)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-[10px] transition-colors">View Deal</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ─── INVESTOR COMMITMENT DETAIL MODAL ─── */}
      {viewingOffer && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative my-6 flex flex-col font-sans max-h-[90vh]">
            <button onClick={() => setViewingOffer(null)} className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 z-10"><X size={18} /></button>
            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 flex items-start gap-3 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center shrink-0">
                <IndianRupee size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Funding Commitment Details</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{viewingOffer.commitmentId || `FC-${String(viewingOffer.id || '').slice(-6).toUpperCase()}`}</p>
              </div>
            </div>
            <div className="p-6 sm:p-8 py-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Current Status</span>
                {getOfferBadge(viewingOffer.status)}
              </div>
              {/* Amount */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 text-center">
                <p className="text-[10px] font-black text-purple-400 uppercase">Investment Amount</p>
                <p className="text-3xl font-black text-[#5B21B6] mt-1">₹{viewingOffer.offerAmount.toLocaleString('en-IN')}</p>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-white border border-purple-200 text-[#5B21B6] rounded-lg text-[10px] font-bold">{viewingOffer.instrument || 'SAFE'}</span>
                  {viewingOffer.fundingRound && <span className="px-2 py-0.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-[10px] font-bold">{viewingOffer.fundingRound}</span>}
                  {viewingOffer.equityPercentage > 0 && <span className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-600 rounded-lg text-[10px] font-bold">{viewingOffer.equityPercentage}% Equity</span>}
                </div>
              </div>
              {/* Investor + Startup */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1"><User size={10} /> Investor</p>
                  <p className="font-bold text-gray-900 mt-0.5">{viewingOffer.investorName}</p>
                  <p className="text-gray-500">{viewingOffer.investorCompany}</p>
                  {viewingOffer.investorEmail && <p className="text-[10px] text-gray-400">{viewingOffer.investorEmail}</p>}
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1"><Building2 size={10} /> Startup</p>
                  <p className="font-bold text-gray-900 mt-0.5">{viewingOffer.startupName}</p>
                  {viewingOffer.expectedInvestmentDate && (
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1"><Calendar size={10} /> Expected: {fmtDate(viewingOffer.expectedInvestmentDate)}</p>
                  )}
                </div>
              </div>
              {/* Term Sheet */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-1.5">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1"><FileText size={10} /> Term Sheet Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[10px] text-gray-400">Valuation Cap</span><p className="font-bold text-gray-900">₹{(viewingOffer.valuationCap || 0).toLocaleString('en-IN')}</p></div>
                  <div><span className="text-[10px] text-gray-400">Discount Rate</span><p className="font-bold text-gray-900">{viewingOffer.discount || 10}%</p></div>
                  <div><span className="text-[10px] text-gray-400">Commitment Date</span><p className="font-bold text-gray-900">{fmtDate(viewingOffer.createdAt)}</p></div>
                  <div><span className="text-[10px] text-gray-400">Agreement Status</span><p className="font-bold text-gray-900">{viewingOffer.agreementStatus || 'Drafted'}</p></div>
                </div>
              </div>
              {/* Payment info */}
              {viewingOffer.paymentMethod && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1.5"><ShieldCheck size={10} className="inline mr-1" />Payment Details</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-[10px] text-gray-400">Method</span><p className="font-bold text-gray-900">{viewingOffer.paymentMethod}</p></div>
                    {viewingOffer.paymentReference && <div><span className="text-[10px] text-gray-400">UTR/Reference</span><p className="font-bold text-gray-900 font-mono">{viewingOffer.paymentReference}</p></div>}
                    {viewingOffer.paymentStatus && <div><span className="text-[10px] text-gray-400">Payment Status</span><p className="font-bold text-emerald-700">{viewingOffer.paymentStatus}</p></div>}
                    {viewingOffer.transactionId && <div><span className="text-[10px] text-gray-400">Transaction ID</span><p className="font-bold font-mono text-gray-900">{viewingOffer.transactionId}</p></div>}
                  </div>
                </div>
              )}
              {/* Notes */}
              {viewingOffer.commitmentNotes && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Investor Notes</p>
                  <p className="text-gray-700 italic">"{viewingOffer.commitmentNotes}"</p>
                </div>
              )}
              {/* Guidelines Audit */}
              {(viewingOffer as any).guidelinesVersion && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-600 shrink-0" />
                  <p className="text-[10px] text-purple-700">
                    <strong>Investment Guidelines Acknowledged</strong> · Version {(viewingOffer as any).guidelinesVersion}
                    {(viewingOffer as any).guidelinesReviewedAt && <> · {fmtDate((viewingOffer as any).guidelinesReviewedAt)}</>}
                  </p>
                </div>
              )}
            </div>
            {/* Actions */}
            {viewingOffer.status === 'offer_received' ? (
              <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex flex-wrap items-center justify-end gap-3 rounded-b-3xl">
                <button onClick={() => { setShowCounterModal(viewingOffer.id || viewingOffer._id!); setViewingOffer(null); }}
                  className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl text-xs flex items-center gap-1.5">
                  <MessageSquare size={12} /> Counter Offer
                </button>
                <button onClick={() => handleReject(viewingOffer)} disabled={actionLoading}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs flex items-center gap-1.5">
                  <ThumbsDown size={12} /> Reject
                </button>
                <button onClick={() => handleAccept(viewingOffer)} disabled={actionLoading}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5">
                  <ThumbsUp size={12} /> Accept Commitment
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end rounded-b-3xl">
                <button onClick={() => setViewingOffer(null)} className="px-5 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── COUNTER OFFER MODAL ─── */}
      {showCounterModal && (
        <div className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative font-sans">
            <button onClick={() => setShowCounterModal(null)} className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500"><X size={18} /></button>
            <h2 className="text-xl font-black text-gray-900 mb-1">Send Counter Offer</h2>
            <p className="text-xs text-gray-500 mb-5">Propose different terms to the investor.</p>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Counter Amount (₹)</label>
                  <input type="number" value={counterData.amount} onChange={e => setCounterData(p => ({ ...p, amount: e.target.value }))}
                    placeholder="e.g. 5000000" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Equity % (optional)</label>
                  <input type="number" value={counterData.equity} onChange={e => setCounterData(p => ({ ...p, equity: e.target.value }))}
                    placeholder="e.g. 8" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Your Message</label>
                <textarea rows={3} value={counterData.message} onChange={e => setCounterData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Explain your counter terms..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button onClick={() => setShowCounterModal(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">Cancel</button>
                <button onClick={handleCounter} disabled={actionLoading} className="px-5 py-2 bg-[#5B21B6] text-white font-extrabold rounded-xl text-xs shadow-md">Send Counter Offer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW LOCAL DEAL MODAL ─── */}
      {viewingDeal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative font-sans">
            <button onClick={() => setViewingDeal(null)} className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500"><X size={18} /></button>
            <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider block mb-1">Ref: {viewingDeal.referenceId}</span>
            <h2 className="text-xl font-black text-gray-900 mb-1">{viewingDeal.startupName}</h2>
            <p className="text-xs text-gray-500 mb-5">Finalized Investment Record</p>
            <div className="space-y-3 text-xs">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                <span className="text-[10px] font-black text-purple-400 uppercase block">Funding Amount</span>
                <span className="text-2xl font-black text-emerald-600">{viewingDeal.fundingAmount}</span>
                <span className="text-[11px] text-gray-500 block font-medium mt-0.5">{viewingDeal.investmentStage}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                <div><span className="text-[10px] font-black text-gray-400 uppercase block">Investor</span><span className="font-bold text-gray-900">{viewingDeal.investorName}</span></div>
                <div><span className="text-[10px] font-black text-gray-400 uppercase block">Firm</span><span className="font-bold text-gray-900">{viewingDeal.investorFirm}</span></div>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                <span className="text-[10px] font-black text-gray-400 uppercase">Status</span>
                {getDealBadge(viewingDeal.transactionStatus)}
              </div>
              {viewingDeal.dealNotes && (
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Deal Notes</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">"{viewingDeal.dealNotes}"</p>
                </div>
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewingDeal(null)} className="px-5 py-2 bg-[#5B21B6] text-white font-bold text-xs rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RECORD FINALIZED DEAL MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative font-sans my-6">
            <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500"><X size={18} /></button>
            <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-full text-xs font-black uppercase tracking-wider inline-block mb-2">Transaction Entry</span>
            <h2 className="text-xl font-black text-gray-900 mb-5">Record Finalized Investment</h2>
            <form onSubmit={handleAddDeal} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Select Startup *</label>
                <select value={selectedStartupName} onChange={e => setSelectedStartupName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]" required>
                  {startups.map(s => <option key={s.id || s.startupId} value={s.startupName || 'Startup'}>{s.startupName || 'Startup'}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Investor Name *</label>
                  <input type="text" value={investorName} onChange={e => setInvestorName(e.target.value)} placeholder="e.g. Priya Nambiar"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]" required />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Investor Firm *</label>
                  <input type="text" value={investorFirm} onChange={e => setInvestorFirm(e.target.value)} placeholder="e.g. Nambiar Capital"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Funding Amount *</label>
                  <input type="text" value={fundingAmount} onChange={e => setFundingAmount(e.target.value)} placeholder="e.g. ₹50,00,000"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]" required />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Round / Stage *</label>
                  <input type="text" value={investmentStage} onChange={e => setInvestmentStage(e.target.value)} placeholder="e.g. Seed Round"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]" required />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Deal Status *</label>
                <select value={transactionStatus} onChange={e => setTransactionStatus(e.target.value as any)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]" required>
                  <option value="Term Sheet Signed">Term Sheet Signed</option>
                  <option value="Due Diligence Complete">Due Diligence Complete</option>
                  <option value="Agreement Finalized">Agreement Finalized</option>
                  <option value="Investment Completed">Investment Completed</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Deal Notes / Reference</label>
                <textarea rows={2} value={dealNotes} onChange={e => setDealNotes(e.target.value)} placeholder="Valuation cap, equity terms, or legal firm details..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]" />
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderFundingTransactions;
