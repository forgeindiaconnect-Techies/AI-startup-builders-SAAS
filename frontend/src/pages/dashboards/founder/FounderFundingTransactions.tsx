import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet, FileCheck, ShieldCheck, CheckCircle2,
  Clock, Plus, X, AlertCircle, TrendingUp, IndianRupee,
  Eye, Building2, Calendar, User, FileText,
  ThumbsUp, ThumbsDown, MessageSquare, RefreshCw, Coins, Landmark
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { getStartups, addNotification, updateFundingOffer, getFounderWithdrawalsApi, submitFounderWithdrawalApi } from '../../../utils/localStorageHelper';
import {
  getFundingTransactions, saveFundingTransaction
} from '../../../utils/investorModuleStorage';
import type { FundingTransaction } from '../../../utils/investorModuleStorage';

const FounderFundingTransactions: React.FC = () => {
  const { user } = useAuth();
  const { offers, loading, refreshOffers, respondToOffer } = useFunding();

  const [activeTab, setActiveTab] = useState<'commitments' | 'deals' | 'withdrawals'>('commitments');
  const [localDeals, setLocalDeals] = useState<FundingTransaction[]>([]);
  const [startups, setStartups] = useState<any[]>([]);

  // Founder Withdrawals from MongoDB
  const [founderWithdrawals, setFounderWithdrawals] = useState<any[]>([]);
  const [withdrawalSummary, setWithdrawalSummary] = useState<any>(null);

  // Multi-step Withdrawal Wizard State
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardAmount, setWizardAmount] = useState('');
  const [wizardMethod, setWizardMethod] = useState<'bank_account' | 'upi'>('bank_account');
  const [wizardAccountHolder, setWizardAccountHolder] = useState(user?.fullName || '');
  const [wizardBankName, setWizardBankName] = useState('');
  const [wizardAccountNumber, setWizardAccountNumber] = useState('');
  const [wizardIfscCode, setWizardIfscCode] = useState('');
  const [wizardUpiId, setWizardUpiId] = useState('');
  const [wizardStartupName, setWizardStartupName] = useState('');

  // Detail modals
  const [viewingOffer, setViewingOffer] = useState<FundingOffer | null>(null);
  const [viewingDeal, setViewingDeal] = useState<FundingTransaction | null>(null);
  const [viewingWithdrawal, setViewingWithdrawal] = useState<any | null>(null);
  // Counter offer
  const [showCounterModal, setShowCounterModal] = useState<string | null>(null);
  const [counterData, setCounterData] = useState({ amount: '', equity: '', message: '' });
  // Record Finalized Deal modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Withdrawal States
  const [withdrawalOfferModal, setWithdrawalOfferModal] = useState<FundingOffer | null>(null);
  const [withdrawalBankName, setWithdrawalBankName] = useState('');
  const [withdrawalAccountNumber, setWithdrawalAccountNumber] = useState('');
  const [withdrawalIfscCode, setWithdrawalIfscCode] = useState('');
  const [withdrawalAccountHolder, setWithdrawalAccountHolder] = useState('');
  const [withdrawalUpiId, setWithdrawalUpiId] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'upi'>('bank');

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

  const loadWithdrawals = async () => {
    if (!user) return;
    const fId = String(user.id || (user as any)._id || '');
    if (!fId) return;
    try {
      const res = await getFounderWithdrawalsApi(fId);
      if (res) {
        if (Array.isArray(res.withdrawals)) setFounderWithdrawals(res.withdrawals);
        if (res.summary) setWithdrawalSummary(res.summary);
      }
    } catch (e) {
      console.error('Failed loading withdrawals', e);
    }
  };

  useEffect(() => {
    refreshOffers();
    loadLocalData();
    loadWithdrawals();
    window.addEventListener('storage', loadLocalData);
    window.addEventListener('funding_transactions_updated', loadLocalData);
    window.addEventListener('founder_withdrawal_updated', loadWithdrawals);
    return () => {
      window.removeEventListener('storage', loadLocalData);
      window.removeEventListener('funding_transactions_updated', loadLocalData);
      window.removeEventListener('founder_withdrawal_updated', loadWithdrawals);
    };
  }, [user]);

  const founderOffers = useMemo(() => {
    if (!user) return offers;
    const id = String(user.id || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const name = (user.fullName || '').toLowerCase();
    return offers.filter(o => {
      const fId = String(o.founderId || '').toLowerCase();
      const fEmail = String(o.founderEmail || '').toLowerCase();
      const fName = String(o.founderName || '').toLowerCase();

      const matchesId = Boolean(id && fId && fId === id);
      const matchesEmail = Boolean(email && fEmail && (fEmail === email || email.includes(fEmail) || fEmail.includes(email)));
      const matchesName = Boolean(name && fName && (fName === name || name.includes(fName) || fName.includes(name)));
      const isDispatched = Boolean(o.agreementStatus && !['Draft', 'Drafted'].includes(o.agreementStatus));

      return matchesId || matchesEmail || matchesName || isDispatched;
    });
  }, [offers, user]);

  // Metrics from live FundingContext offers
  const metrics = useMemo(() => {
    let totalCommitted = 0, pending = 0, completed = 0, awaitingAction = 0, totalCommission = 0, netCapital = 0;
    founderOffers.forEach(o => {
      totalCommitted += o.offerAmount;
      const rate = o.commissionRate ?? 2;
      const commAmt = o.commissionAmount ?? Math.round(o.offerAmount * (rate / 100));
      totalCommission += commAmt;

      if (['funded', 'completed'].includes(o.status)) {
        completed += o.offerAmount;
        netCapital += (o.offerAmount - commAmt);
      } else if (['payment_submitted', 'under_verification', 'accepted'].includes(o.status)) {
        pending += o.offerAmount;
      }
      if (o.status === 'offer_received') awaitingAction++;
    });
    return { totalCommitted, pending, completed, awaitingAction, totalCommission, netCapital };
  }, [founderOffers]);

  const calculatedAvailableBalance = useMemo(() => {
    const withdrawalsTaken = founderWithdrawals.reduce((sum, w) =>
      ['Pending', 'Under Review', 'Approved', 'Processing', 'Completed'].includes(w.status)
        ? sum + Number(w.amount || 0)
        : sum, 0
    );
    const localAvailable = Math.max(0, metrics.netCapital - withdrawalsTaken);
    if (withdrawalSummary && typeof withdrawalSummary.availableBalance === 'number' && withdrawalSummary.availableBalance > 0) {
      return Math.max(withdrawalSummary.availableBalance, localAvailable);
    }
    return localAvailable;
  }, [withdrawalSummary, metrics.netCapital, founderWithdrawals]);

  const openWithdrawalModal = () => {
    setActiveTab('withdrawals');
    setWizardStep(1);
    setWizardAccountHolder(user?.fullName || '');
    if (calculatedAvailableBalance > 0) {
      setWizardAmount(String(calculatedAvailableBalance));
    } else {
      setWizardAmount('');
    }
    setShowWizardModal(true);
    setTimeout(() => {
      const el = document.getElementById('founder-withdrawals-tab-content');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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

  const handleSubmitWithdrawal = async () => {
    if (!withdrawalOfferModal) return;
    
    let details: any = { method: withdrawalMethod };
     if (withdrawalMethod === 'bank') {
      if (!withdrawalAccountHolder.trim() || !withdrawalBankName.trim() || !withdrawalAccountNumber.trim() || !withdrawalIfscCode.trim()) {
        showToast('Please fill all required bank fields.', 'error');
        return;
      }
      if (withdrawalAccountNumber.trim().length < 9 || withdrawalAccountNumber.trim().length > 18) {
        showToast('Account number must be between 9 and 18 digits.', 'error');
        return;
      }
      if (withdrawalIfscCode.trim().length !== 11) {
        showToast('IFSC Code must be exactly 11 characters.', 'error');
        return;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(withdrawalIfscCode.trim())) {
        showToast('IFSC Code format is invalid (e.g., HDFC0000123).', 'error');
        return;
      }
      details = {
        method: 'bank',
        accountHolder: withdrawalAccountHolder.trim(),
        bankName: withdrawalBankName.trim(),
        accountNumber: withdrawalAccountNumber.trim(),
        ifscCode: withdrawalIfscCode.trim(),
      };
    } else {
      if (!withdrawalUpiId.trim()) {
        showToast('Please enter a valid UPI ID.', 'error');
        return;
      }
      details = {
        method: 'upi',
        upiId: withdrawalUpiId.trim(),
      };
    }
    
    details.requestedAt = new Date().toISOString();
    setActionLoading(true);
    
    try {
      const offerId = withdrawalOfferModal._id || withdrawalOfferModal.id;
      const netAmount = withdrawalOfferModal.offerAmount - (withdrawalOfferModal.commissionAmount ?? Math.round(withdrawalOfferModal.offerAmount * ((withdrawalOfferModal.commissionRate ?? 2) / 100)));
      
      const historyEntry = {
        action: 'withdrawal_requested',
        performedBy: user?.fullName || 'Founder',
        role: 'Founder',
        message: `Requested withdrawal of net capital ₹${netAmount.toLocaleString('en-IN')}.`,
        createdAt: new Date().toISOString(),
      };
      
      const updates = {
        withdrawalStatus: 'Pending Admin Approval',
        withdrawalDetails: details,
        history: [...(withdrawalOfferModal.history || []), historyEntry],
        updatedAt: new Date().toISOString(),
      };
      
      await updateFundingOffer(offerId, updates);
      
      // Notify Admin
      await addNotification({
        userId: 'admin',
        title: '🏦 New Withdrawal Request',
        message: `Founder "${user?.fullName || 'Founder'}" requested withdrawal of ₹${netAmount.toLocaleString('en-IN')} for "${withdrawalOfferModal.startupName}".`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Notify Investor
      if (withdrawalOfferModal.investorId) {
        await addNotification({
          userId: withdrawalOfferModal.investorId,
          title: '🏦 Investment Release Requested',
          message: `Founder "${user?.fullName || 'Founder'}" has requested release/withdrawal of net investment capital ₹${netAmount.toLocaleString('en-IN')} for "${withdrawalOfferModal.startupName}".`,
          type: 'funding',
          actionUrl: '/dashboard/investor/transactions',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
      
      showToast('Withdrawal request submitted successfully ✓');
      setWithdrawalOfferModal(null);
      await refreshOffers();
    } catch (e: any) {
      showToast(e.message || 'Submission failed.', 'error');
    } finally {
      setActionLoading(false);
    }
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
          <p className="text-sm text-gray-500 mt-1">View investor commitments and manage funding offers.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Capital Committed</p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">{fmtAmt(metrics.totalCommitted)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{founderOffers.length} commitment(s)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Pending / In Progress</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{fmtAmt(metrics.pending)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Funded / Completed Net</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{fmtAmt(metrics.completed)}</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Verified Capital</p>
        </div>
        <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-2xl shadow-sm p-5 text-white">
          <p className="text-[10px] font-black text-purple-200 uppercase tracking-wider">Platform Fee (Admin Fixed)</p>
          <p className="text-xl font-extrabold mt-1">{fmtAmt(metrics.totalCommission)}</p>
          <p className="text-[10px] text-purple-200 mt-0.5">Admin Platform Fee</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-md p-5 text-white flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-wider">Withdrawable Balance</p>
            <p className="text-xl font-black mt-1">
              {fmtAmt(calculatedAvailableBalance)}
            </p>
          </div>
          <button
            onClick={openWithdrawalModal}
            className="mt-2.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold rounded-xl text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wallet size={13} /> Withdraw Funds
          </button>
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
      <div className="flex gap-2 border-b border-gray-200 mb-6 flex-wrap">
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
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'withdrawals' ? 'border-[#5B21B6] text-[#5B21B6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Wallet size={15} /> Founder Withdrawals ({founderWithdrawals.length})
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
        <div className="space-y-6">

          {/* ── Investor Payment Submissions (from FundingContext) ── */}
          {(() => {
            const paidOffers = founderOffers.filter(o => o.paymentStatus || o.paymentMethod || ['payment_submitted','under_verification','funded','completed'].includes(o.status));
            if (paidOffers.length === 0) return null;
            return (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <h3 className="font-bold text-gray-900 text-sm">Investor Payment Details</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">{paidOffers.length} Payment{paidOffers.length > 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {paidOffers.map((o) => {
                    const commRate = o.commissionRate ?? 2;
                    const commAmount = o.commissionAmount ?? Math.round(o.offerAmount * (commRate / 100));
                    const netCapital = o.offerAmount - commAmount;

                    return (
                      <div key={o.id || o._id} className="p-5 space-y-4">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center shrink-0">
                              <IndianRupee size={16} className="text-white" />
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900 text-sm">{o.startupName}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{o.commitmentId || `FC-${String(o.id || '').slice(-6).toUpperCase()}`}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-black text-[#5B21B6]">₹{o.offerAmount.toLocaleString('en-IN')}</span>
                            {getOfferBadge(o.status)}
                          </div>
                        </div>

                        {/* Net Capital & Admin Commission Breakdown Card */}
                        <div className="bg-gradient-to-r from-purple-50/80 via-white to-emerald-50/80 p-4 rounded-2xl border border-purple-100 space-y-2">
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-purple-100/60">
                            <span className="text-gray-500 font-bold uppercase text-[10px]">Investor Investment Capital</span>
                            <strong className="text-gray-900 font-black text-sm">₹{o.offerAmount.toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-purple-100/60">
                            <span className="text-emerald-700 font-bold uppercase text-[10px] flex items-center gap-1">
                              <Coins size={13} /> Platform Commission Fee (Fixed by Admin - {commRate}%)
                            </span>
                            <strong className="text-emerald-700 font-black text-xs">- ₹{commAmount.toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-[#5B21B6] font-extrabold uppercase text-[10px]">Net Capital Received by Founder</span>
                            <strong className="text-[#5B21B6] font-black text-base">₹{netCapital.toLocaleString('en-IN')}</strong>
                          </div>
                          {o.commissionNotes && (
                            <p className="text-[10px] text-gray-500 font-medium italic pt-1 border-t border-purple-100/40">
                              Audit Note: {o.commissionNotes}
                            </p>
                          )}
                        </div>

                      {/* Payment details grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Investor</p>
                          <p className="font-bold text-gray-900 text-xs">{o.investorName}</p>
                          <p className="text-[10px] text-gray-400">{o.investorCompany}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Payment Method</p>
                          <p className="font-bold text-gray-900 text-xs">{o.paymentMethod || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">UTR / Reference No.</p>
                          <p className="font-bold text-gray-900 font-mono text-xs">{o.paymentReference || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Payment Status</p>
                          {o.paymentStatus === 'Submitted' || o.paymentStatus === 'submitted' ? (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-black">⏳ Submitted</span>
                          ) : o.status === 'funded' || o.status === 'completed' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">✅ Verified</span>
                          ) : o.status === 'under_verification' ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black">🔍 Verifying</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">{o.paymentStatus || 'Pending'}</span>
                          )}
                        </div>
                        {o.paymentDate && (
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Payment Date</p>
                            <p className="font-bold text-gray-900 text-xs">{fmtDate(o.paymentDate)}</p>
                          </div>
                        )}
                        {o.verificationStatus && (
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Verification</p>
                            <p className="font-bold text-gray-900 text-xs">{o.verificationStatus}</p>
                          </div>
                        )}
                        {o.transactionId && (
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Transaction ID</p>
                            <p className="font-bold text-gray-900 font-mono text-xs">{o.transactionId}</p>
                          </div>
                        )}
                        {o.instrument && (
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Type / Round</p>
                            <p className="font-bold text-gray-900 text-xs">{o.instrument}{o.fundingRound ? ` · ${o.fundingRound}` : ''}</p>
                          </div>
                        )}
                      </div>

                      {/* Payment Proof Image */}
                      {o.paymentProof && o.paymentProof.startsWith('data:image') && (
                        <div className="mt-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Payment Receipt / Proof</p>
                          <img
                            src={o.paymentProof}
                            alt="Payment Proof"
                            className="max-h-40 rounded-xl border border-gray-200 shadow-sm object-contain bg-gray-50"
                          />
                        </div>
                      )}
                      {/* Withdrawal Request Section */}
                      {(() => {
                        const isDone = o.status === 'funded' || o.status === 'completed' || o.verificationStatus === 'Approved' || o.verificationStatus === 'Verified';
                        if (!isDone) return null;

                        if (o.withdrawalStatus === 'Pending Admin Approval') {
                          return (
                            <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-amber-800 font-bold uppercase text-[10px] flex items-center gap-1">
                                  <Clock size={13} /> Withdrawal Status: Pending Admin Approval
                                </span>
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">Awaiting Admin Release</span>
                              </div>
                              <div className="text-[11px] text-gray-600 space-y-1 bg-white border border-amber-100 rounded-xl p-3">
                                <p className="font-bold text-gray-700">Withdrawal Destination Details:</p>
                                {o.withdrawalDetails?.method === 'bank' ? (
                                  <>
                                    <div><span className="text-gray-400">Bank Name:</span> <strong className="text-gray-800">{o.withdrawalDetails?.bankName}</strong></div>
                                    <div><span className="text-gray-400">Account Number:</span> <strong className="text-gray-800">{o.withdrawalDetails?.accountNumber}</strong></div>
                                    <div><span className="text-gray-400">IFSC Code:</span> <strong className="text-gray-800">{o.withdrawalDetails?.ifscCode}</strong></div>
                                    <div><span className="text-gray-400">Account Holder:</span> <strong className="text-gray-800">{o.withdrawalDetails?.accountHolder}</strong></div>
                                  </>
                                ) : (
                                  <div><span className="text-gray-400">UPI ID:</span> <strong className="text-gray-800">{o.withdrawalDetails?.upiId}</strong></div>
                                )}
                                <div className="text-[10px] text-gray-400 pt-1.5 border-t border-gray-100 mt-1.5">
                                  Requested at: {fmtDate(o.withdrawalDetails?.requestedAt)}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (o.withdrawalStatus === 'Approved') {
                          return (
                            <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-emerald-800 font-bold uppercase text-[10px] flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Withdrawal Released
                                </span>
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">Funds Dispatched</span>
                              </div>
                              <p className="text-[11px] text-emerald-700 leading-relaxed">
                                Admin approved and released the net investment capital of <strong>₹{(o.offerAmount - (o.commissionAmount ?? Math.round(o.offerAmount * ((o.commissionRate ?? 2) / 100)))).toLocaleString('en-IN')}</strong> to your registered account.
                              </p>
                              {o.withdrawalAdminNote && (
                                <div className="text-[10px] text-gray-500 italic bg-white border border-emerald-100 rounded-xl p-2.5 mt-1">
                                  Admin Note: "{o.withdrawalAdminNote}"
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (o.withdrawalStatus === 'Rejected') {
                          return (
                            <div className="mt-4 p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-red-800 font-bold uppercase text-[10px] flex items-center gap-1">
                                  <AlertCircle size={13} /> Withdrawal Rejected by Admin
                                </span>
                                <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-bold">Rejected</span>
                              </div>
                              {o.withdrawalAdminNote && (
                                <p className="text-[11px] text-red-700">
                                  Reason: <strong>"{o.withdrawalAdminNote}"</strong>
                                </p>
                              )}
                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => {
                                    setWithdrawalOfferModal(o);
                                    setWithdrawalAccountHolder(user?.fullName || '');
                                    setWithdrawalBankName('');
                                    setWithdrawalAccountNumber('');
                                    setWithdrawalIfscCode('');
                                    setWithdrawalUpiId('');
                                  }}
                                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-colors cursor-pointer"
                                >
                                  Re-request Withdrawal
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // Default: Withdrawals managed via Founder Withdrawals tab
                        return null;
                      })()}
                    </div>
                  );
                })}
                </div>
              </div>
            );
          })()}

          {/* ── Manually Recorded Deals ── */}
          {localDeals.length === 0 && founderOffers.filter(o => o.paymentStatus || o.paymentMethod).length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
              <FileCheck size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800">No Finalized Deals Recorded</h3>
              <p className="text-xs text-gray-500 mt-1">Once an investment agreement is signed and finalized, it will be displayed here.</p>
            </div>
          ) : localDeals.length > 0 ? (
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
          ) : null}
        </div>
      )}

      {/* ── Founder Withdrawals Tab ── */}
      {activeTab === 'withdrawals' && (
        <div id="founder-withdrawals-tab-content" className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                  <Wallet size={18} className="text-emerald-600" /> Founder Capital Withdrawal Requests
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Track payout requests, verification steps, and bank/UPI UTR transfers.</p>
              </div>
              <button
                onClick={openWithdrawalModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                + New Withdrawal Request
              </button>
            </div>

            {founderWithdrawals.length === 0 ? (
              <div className="p-14 text-center">
                <Wallet size={40} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-base font-bold text-gray-800">No Withdrawal Requests Yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Submit a withdrawal request to transfer your net funded capital to your Bank Account or UPI ID.
                </p>
                <button
                  onClick={openWithdrawalModal}
                  className="mt-4 px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Request Funds Withdrawal
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-xs font-medium">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="px-5 py-3.5">Request ID</th>
                      <th className="px-5 py-3.5">Requested Amount</th>
                      <th className="px-5 py-3.5">Method</th>
                      <th className="px-5 py-3.5">Destination Details</th>
                      <th className="px-5 py-3.5">Status Flow</th>
                      <th className="px-5 py-3.5">UTR / Payout Ref</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {founderWithdrawals.map((w: any) => {
                      const wId = w._id || w.id || `WD-${Date.now()}`;
                      const isBank = w.withdrawalMethod === 'bank_account' || w.withdrawalMethod === 'bank';
                      return (
                        <tr key={wId} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-[#5B21B6]">
                            {`WD-${String(wId).slice(-6).toUpperCase()}`}
                          </td>
                          <td className="px-5 py-4 font-black text-emerald-700 text-sm">
                            ₹{Number(w.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-lg text-[10px] font-bold uppercase">
                              {isBank ? 'Bank Account' : 'UPI ID'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs">
                            {isBank ? (
                              <div>
                                <p className="font-bold text-gray-900">{w.bankDetails?.accountHolderName || w.accountHolderName || user?.fullName}</p>
                                <p className="text-[10px] text-gray-500 font-mono">
                                  {w.bankDetails?.bankName || w.bankName} · A/C: {w.bankDetails?.accountNumber || w.accountNumber} · IFSC: {w.bankDetails?.ifscCode || w.ifscCode}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-bold text-gray-900 font-mono">{w.upiDetails?.upiId || w.upiId || '—'}</p>
                                <p className="text-[10px] text-gray-400">Direct UPI Payout</p>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {(() => {
                              const s = w.status || 'Pending';
                              const map: Record<string, { label: string; cls: string }> = {
                                Pending:        { label: '1. Pending', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
                                'Under Review': { label: '2. Under Review', cls: 'bg-blue-50 text-blue-800 border-blue-200' },
                                Approved:       { label: '3. Approved', cls: 'bg-purple-50 text-purple-800 border-purple-200' },
                                Processing:     { label: '4. Processing', cls: 'bg-sky-50 text-sky-800 border-sky-200' },
                                Completed:      { label: '5. Completed ✓', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                                Rejected:       { label: 'Rejected', cls: 'bg-red-50 text-red-800 border-red-200' },
                              };
                              const item = map[s] || { label: s, cls: 'bg-gray-50 text-gray-700 border-gray-200' };
                              return <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${item.cls}`}>{item.label}</span>;
                            })()}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-xs text-gray-900">
                            {w.utrNumber || w.payoutReference || '—'}
                          </td>
                          <td className="px-5 py-4 text-gray-500">
                            {fmtDate(w.createdAt || new Date().toISOString())}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setViewingWithdrawal(w)}
                              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            >
                              <Eye size={12} /> View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
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
              {/* Amount & Commission Breakdown */}
              {(() => {
                const commRate = viewingOffer.commissionRate ?? 2;
                const commAmount = viewingOffer.commissionAmount ?? Math.round(viewingOffer.offerAmount * (commRate / 100));
                const netCapital = viewingOffer.offerAmount - commAmount;

                return (
                  <div className="bg-gradient-to-r from-purple-50 via-white to-emerald-50 border border-purple-100 rounded-2xl p-5 space-y-3">
                    <div className="text-center pb-3 border-b border-purple-100">
                      <p className="text-[10px] font-black text-purple-400 uppercase">Gross Investment Capital</p>
                      <p className="text-3xl font-black text-[#5B21B6] mt-0.5">₹{viewingOffer.offerAmount.toLocaleString('en-IN')}</p>
                      <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-white border border-purple-200 text-[#5B21B6] rounded-lg text-[10px] font-bold">{viewingOffer.instrument || 'SAFE'}</span>
                        {viewingOffer.fundingRound && <span className="px-2 py-0.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-[10px] font-bold">{viewingOffer.fundingRound}</span>}
                        {viewingOffer.equityPercentage > 0 && <span className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-600 rounded-lg text-[10px] font-bold">{viewingOffer.equityPercentage}% Equity</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs">
                      <div className="flex justify-between items-center text-emerald-700 font-bold">
                        <span className="flex items-center gap-1 text-[10px] uppercase">
                          <Coins size={12} /> Admin Platform Commission Fee ({commRate}%)
                        </span>
                        <span>- ₹{commAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#5B21B6] font-black text-sm pt-1 border-t border-purple-100">
                        <span className="text-[10px] uppercase">Net Capital Funded to Founder</span>
                        <span>₹{netCapital.toLocaleString('en-IN')}</span>
                      </div>
                      {viewingOffer.commissionNotes && (
                        <p className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-100">
                          Audit Note: {viewingOffer.commissionNotes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
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

              {/* Withdrawal Request Section inside Details Modal */}
              {(() => {
                const isDone = viewingOffer.status === 'funded' || viewingOffer.status === 'completed' || viewingOffer.verificationStatus === 'Approved' || viewingOffer.verificationStatus === 'Verified';
                if (!isDone) return null;

                if (viewingOffer.withdrawalStatus === 'Pending Admin Approval') {
                  return (
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-800 font-bold uppercase text-[10px] flex items-center gap-1">
                          <Clock size={13} /> Withdrawal Status: Pending Admin Approval
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">Awaiting Release</span>
                      </div>
                      <div className="text-[11px] text-gray-600 space-y-1 bg-white border border-amber-100 rounded-xl p-3">
                        <p className="font-bold text-gray-700">Withdrawal Destination Details:</p>
                        {viewingOffer.withdrawalDetails?.method === 'bank' ? (
                          <>
                            <div><span className="text-gray-400">Bank Name:</span> <strong className="text-gray-800">{viewingOffer.withdrawalDetails?.bankName}</strong></div>
                            <div><span className="text-gray-400">Account Number:</span> <strong className="text-gray-800">{viewingOffer.withdrawalDetails?.accountNumber}</strong></div>
                            <div><span className="text-gray-400">IFSC Code:</span> <strong className="text-gray-800">{viewingOffer.withdrawalDetails?.ifscCode}</strong></div>
                            <div><span className="text-gray-400">Account Holder:</span> <strong className="text-gray-800">{viewingOffer.withdrawalDetails?.accountHolder}</strong></div>
                          </>
                        ) : (
                          <div><span className="text-gray-400">UPI ID:</span> <strong className="text-gray-800">{viewingOffer.withdrawalDetails?.upiId}</strong></div>
                        )}
                        <div className="text-[10px] text-gray-400 pt-1.5 border-t border-gray-100 mt-1.5">
                          Requested at: {fmtDate(viewingOffer.withdrawalDetails?.requestedAt)}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (viewingOffer.withdrawalStatus === 'Approved') {
                  return (
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-800 font-bold uppercase text-[10px] flex items-center gap-1">
                          <CheckCircle2 size={13} /> Withdrawal Released
                        </span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">Funds Dispatched</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Admin approved and released the net investment capital of <strong>₹{(viewingOffer.offerAmount - (viewingOffer.commissionAmount ?? Math.round(viewingOffer.offerAmount * ((viewingOffer.commissionRate ?? 2) / 100)))).toLocaleString('en-IN')}</strong> to your registered account.
                      </p>
                      {viewingOffer.withdrawalAdminNote && (
                        <div className="text-[10px] text-gray-500 italic bg-white border border-emerald-100 rounded-xl p-2.5 mt-1">
                          Admin Note: "{viewingOffer.withdrawalAdminNote}"
                        </div>
                      )}
                    </div>
                  );
                }

                if (viewingOffer.withdrawalStatus === 'Rejected') {
                  return (
                    <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-red-800 font-bold uppercase text-[10px] flex items-center gap-1">
                          <AlertCircle size={13} /> Withdrawal Rejected by Admin
                        </span>
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-bold">Rejected</span>
                      </div>
                      {viewingOffer.withdrawalAdminNote && (
                        <p className="text-[11px] text-red-700">
                          Reason: <strong>"{viewingOffer.withdrawalAdminNote}"</strong>
                        </p>
                      )}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setWithdrawalOfferModal(viewingOffer);
                            setWithdrawalAccountHolder(user?.fullName || '');
                            setWithdrawalBankName('');
                            setWithdrawalAccountNumber('');
                            setWithdrawalIfscCode('');
                            setWithdrawalUpiId('');
                            setViewingOffer(null);
                          }}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          Re-request Withdrawal
                        </button>
                      </div>
                    </div>
                  );
                }

                // Default: Withdrawals managed via Founder Withdrawals tab
                return null;
              })()}
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
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative font-sans my-6">
            <button onClick={() => setViewingDeal(null)} className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500"><X size={18} /></button>
            <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider block mb-1">Ref: {viewingDeal.referenceId}</span>
            <h2 className="text-xl font-black text-gray-900 mb-1">{viewingDeal.startupName}</h2>
            <p className="text-xs text-gray-500 mb-5">Finalized Investment Record</p>
            <div className="space-y-3 text-xs">
              {/* Amount */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                <span className="text-[10px] font-black text-purple-400 uppercase block">Funding Amount</span>
                <span className="text-2xl font-black text-emerald-600">{viewingDeal.fundingAmount}</span>
                <span className="text-[11px] text-gray-500 block font-medium mt-0.5">{viewingDeal.investmentStage}</span>
              </div>
              {/* Investor & Firm */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                <div><span className="text-[10px] font-black text-gray-400 uppercase block">Investor</span><span className="font-bold text-gray-900">{viewingDeal.investorName}</span></div>
                <div><span className="text-[10px] font-black text-gray-400 uppercase block">Firm</span><span className="font-bold text-gray-900">{viewingDeal.investorFirm}</span></div>
              </div>
              {/* Status */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                <span className="text-[10px] font-black text-gray-400 uppercase">Deal Status</span>
                {getDealBadge(viewingDeal.transactionStatus)}
              </div>
              {/* Payment Details - sourced from matching FundingContext offer */}
              {(() => {
                const matched = founderOffers.find(o =>
                  (o.investorName && viewingDeal.investorName && o.investorName.toLowerCase().includes(viewingDeal.investorName.toLowerCase())) ||
                  (o.commitmentId && o.commitmentId === viewingDeal.referenceId)
                );
                if (!matched || (!matched.paymentMethod && !matched.paymentReference)) return null;
                return (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={11} /> Payment Details
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {matched.paymentMethod && <div><span className="text-[10px] text-gray-400">Method</span><p className="font-bold text-gray-900">{matched.paymentMethod}</p></div>}
                      {matched.paymentReference && <div><span className="text-[10px] text-gray-400">UTR / Reference</span><p className="font-bold text-gray-900 font-mono">{matched.paymentReference}</p></div>}
                      {matched.paymentStatus && <div><span className="text-[10px] text-gray-400">Payment Status</span><p className="font-bold text-emerald-700">{matched.paymentStatus}</p></div>}
                      {matched.paymentDate && <div><span className="text-[10px] text-gray-400">Payment Date</span><p className="font-bold text-gray-900">{fmtDate(matched.paymentDate)}</p></div>}
                      {matched.transactionId && <div><span className="text-[10px] text-gray-400">Transaction ID</span><p className="font-bold text-gray-900 font-mono">{matched.transactionId}</p></div>}
                      {matched.verificationStatus && <div><span className="text-[10px] text-gray-400">Verification</span><p className="font-bold text-gray-900">{matched.verificationStatus}</p></div>}
                    </div>
                    {matched.paymentProof && matched.paymentProof.startsWith('data:image') && (
                      <div className="mt-2">
                        <p className="text-[10px] text-gray-400 mb-1">Payment Receipt</p>
                        <img src={matched.paymentProof} alt="Receipt" className="max-h-32 rounded-lg border border-gray-200 object-contain bg-gray-50" />
                      </div>
                    )}
                  </div>
                );
              })()}
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

      {/* ─── REQUEST WITHDRAWAL MODAL ─── */}
      {withdrawalOfferModal && (
        <div className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left font-sans text-xs">
            <button
              onClick={() => setWithdrawalOfferModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl shadow-md">
                <Wallet size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Request Withdrawal</h3>
                <p className="text-xs text-gray-500">Submit destination details to release net capital of ₹{(withdrawalOfferModal.offerAmount - (withdrawalOfferModal.commissionAmount ?? Math.round(withdrawalOfferModal.offerAmount * ((withdrawalOfferModal.commissionRate ?? 2) / 100)))).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Method Selector */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Withdrawal Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawalMethod('bank')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                      withdrawalMethod === 'bank'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalMethod('upi')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                      withdrawalMethod === 'upi'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    UPI ID
                  </button>
                </div>
              </div>

              {withdrawalMethod === 'bank' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      value={withdrawalAccountHolder}
                      onChange={e => setWithdrawalAccountHolder(e.target.value)}
                      placeholder="Enter account holder name"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Bank Name *</label>
                    <input
                      type="text"
                      required
                      value={withdrawalBankName}
                      onChange={e => setWithdrawalBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Account Number *</label>
                      <input
                        type="text"
                        required
                        value={withdrawalAccountNumber}
                        maxLength={18}
                        onChange={e => setWithdrawalAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter account number"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        value={withdrawalIfscCode}
                        maxLength={11}
                        onChange={e => setWithdrawalIfscCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                        placeholder="e.g. HDFC0000123"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">UPI ID *</label>
                  <input
                    type="text"
                    required
                    value={withdrawalUpiId}
                    onChange={e => setWithdrawalUpiId(e.target.value)}
                    placeholder="e.g. founder@okaxis"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWithdrawalOfferModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitWithdrawal}
                disabled={actionLoading}
                className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
              >
                {actionLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MULTI-STEP WITHDRAWAL WIZARD MODAL ─── */}
      {showWizardModal && (
        <div className="fixed inset-0 z-[170] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left font-sans text-xs animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowWizardModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Stepper Header */}
            <div className="mb-6">
              <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider block mb-1">Founder Payout Wizard</span>
              <h2 className="text-lg font-black text-gray-900">Withdraw Capital Funds</h2>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { step: 1, label: '1. Amount' },
                  { step: 2, label: '2. Method' },
                  { step: 3, label: '3. Review' },
                  { step: 4, label: '4. Confirm' },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`py-2 px-1 text-center rounded-xl font-extrabold text-[10px] border transition-all ${
                      wizardStep === s.step
                        ? 'bg-[#5B21B6] text-white border-[#5B21B6]'
                        : wizardStep > s.step
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: AMOUNT ENTRY */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Available Withdrawable Balance</span>
                  <strong className="text-xl font-black text-emerald-700">
                    ₹{calculatedAvailableBalance.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div>
                  <label className="block font-extrabold text-gray-700 uppercase tracking-wider mb-1">Enter Withdrawal Amount (₹) *</label>
                  <input
                    type="number"
                    value={wizardAmount}
                    onChange={(e) => setWizardAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Amount must not exceed available withdrawable balance.</p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowWizardModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const num = Number(wizardAmount);
                      if (!num || num <= 0) {
                        showToast('Please enter a valid amount', 'error');
                        return;
                      }
                      if (calculatedAvailableBalance > 0 && num > calculatedAvailableBalance) {
                        showToast(`Amount exceeds available balance ₹${calculatedAvailableBalance.toLocaleString('en-IN')}`, 'error');
                        return;
                      }
                      setWizardStep(2);
                    }}
                    className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Next: Select Method →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: METHOD & DETAILS */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Withdrawal Payout Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWizardMethod('bank_account')}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                        wizardMethod === 'bank_account'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      Bank Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardMethod('upi')}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                        wizardMethod === 'upi'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      UPI ID
                    </button>
                  </div>
                </div>

                {wizardMethod === 'bank_account' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Account Holder Name *</label>
                      <input
                        type="text"
                        value={wizardAccountHolder}
                        onChange={(e) => setWizardAccountHolder(e.target.value)}
                        placeholder="Name registered on bank account"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Bank Name *</label>
                      <input
                        type="text"
                        value={wizardBankName}
                        onChange={(e) => setWizardBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank, ICICI Bank"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Account Number *</label>
                        <input
                          type="text"
                          value={wizardAccountNumber}
                          maxLength={18}
                          onChange={(e) => setWizardAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="9-18 digit account number"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">IFSC Code *</label>
                        <input
                          type="text"
                          value={wizardIfscCode}
                          maxLength={11}
                          onChange={(e) => setWizardIfscCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                          placeholder="e.g. HDFC0000123"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">UPI ID *</label>
                    <input
                      type="text"
                      value={wizardUpiId}
                      onChange={(e) => setWizardUpiId(e.target.value)}
                      placeholder="e.g. founder@okaxis"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    />
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (wizardMethod === 'bank_account') {
                        if (!wizardAccountHolder.trim() || !wizardBankName.trim() || !wizardAccountNumber.trim() || !wizardIfscCode.trim()) {
                          showToast('Please fill all bank details.', 'error');
                          return;
                        }
                        if (wizardAccountNumber.trim().length < 9 || wizardAccountNumber.trim().length > 18) {
                          showToast('Account number must be between 9 and 18 digits.', 'error');
                          return;
                        }
                        if (wizardIfscCode.trim().length !== 11) {
                          showToast('IFSC code must be exactly 11 characters.', 'error');
                          return;
                        }
                      } else {
                        if (!wizardUpiId.trim()) {
                          showToast('Please enter a valid UPI ID.', 'error');
                          return;
                        }
                      }
                      setWizardStep(3);
                    }}
                    className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl shadow-md"
                  >
                    Next: Review →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW SUMMARY */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold">Withdrawal Amount:</span>
                    <strong className="text-purple-900 font-black text-base">₹{Number(wizardAmount).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold">Payout Method:</span>
                    <strong className="text-gray-900 font-extrabold">{wizardMethod === 'bank_account' ? 'Bank Transfer' : 'UPI ID'}</strong>
                  </div>
                  {wizardMethod === 'bank_account' ? (
                    <div className="text-[11px] text-gray-600 pt-2 border-t border-purple-100 space-y-1">
                      <p><span className="text-gray-400">Account Holder:</span> <strong className="text-gray-900">{wizardAccountHolder}</strong></p>
                      <p><span className="text-gray-400">Bank Name:</span> <strong className="text-gray-900">{wizardBankName}</strong></p>
                      <p><span className="text-gray-400">Account Number:</span> <strong className="text-gray-900 font-mono">{wizardAccountNumber}</strong></p>
                      <p><span className="text-gray-400">IFSC Code:</span> <strong className="text-gray-900 font-mono">{wizardIfscCode}</strong></p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-600 pt-2 border-t border-purple-100">
                      <p><span className="text-gray-400">UPI ID:</span> <strong className="text-gray-900 font-mono">{wizardUpiId}</strong></p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-900">
                  ℹ️ Status flow: <strong>Pending → Under Review → Approved → Processing → Completed</strong>. Admin finance will process the payout and record UTR transaction details.
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setWizardStep(4)}
                    className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl shadow-md"
                  >
                    Next: Confirm →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRMATION & SUBMIT */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Confirm Payout Request</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Are you sure you want to submit a withdrawal request of <strong>₹{Number(wizardAmount).toLocaleString('en-IN')}</strong> to your {wizardMethod === 'bank_account' ? 'Bank Account' : 'UPI ID'}?
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const founderId = String(user?.id || (user as any)?._id || '');
                        await submitFounderWithdrawalApi({
                          founderId,
                          founderName: user?.fullName || 'Founder',
                          founderEmail: user?.email || '',
                          startupName: wizardStartupName || (startups[0]?.startupName || ''),
                          amount: Number(wizardAmount),
                          withdrawalMethod: wizardMethod,
                          bankDetails: wizardMethod === 'bank_account' ? {
                            accountHolderName: wizardAccountHolder.trim(),
                            bankName: wizardBankName.trim(),
                            accountNumber: wizardAccountNumber.trim(),
                            ifscCode: wizardIfscCode.trim().toUpperCase(),
                          } : undefined,
                          upiDetails: wizardMethod === 'upi' ? {
                            upiId: wizardUpiId.trim(),
                          } : undefined,
                        });

                        await addNotification({
                          userId: 'admin',
                          title: '🏦 New Founder Withdrawal Request',
                          message: `Founder "${user?.fullName || 'Founder'}" requested withdrawal of ₹${Number(wizardAmount).toLocaleString('en-IN')}.`,
                          type: 'funding',
                          actionUrl: '/dashboard/admin/investor-funding',
                          isRead: false,
                          createdAt: new Date().toISOString(),
                        });

                        showToast('Withdrawal request submitted successfully ✓');
                        setShowWizardModal(false);
                        setWizardStep(1);
                        setWizardAmount('');
                        loadWithdrawals();
                        refreshOffers();
                      } catch (e: any) {
                        showToast(e.message || 'Submission failed', 'error');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg cursor-pointer"
                  >
                    {actionLoading ? 'Submitting...' : 'Confirm & Submit Request'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FOUNDER WITHDRAWAL DETAIL MODAL ─── */}
      {viewingWithdrawal && (
        <div className="fixed inset-0 z-[180] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left font-sans text-xs animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingWithdrawal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#5B21B6] text-white rounded-2xl shadow-md">
                <Wallet size={22} />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider block">Capital Payout Record</span>
                <h2 className="text-base font-black text-gray-900">Withdrawal Request Details</h2>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  Ref ID: WD-{String(viewingWithdrawal._id || viewingWithdrawal.id || '').slice(-6).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Summary Card */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">Withdrawal Amount</span>
                  <span className="text-xl font-black text-emerald-700">
                    ₹{Number(viewingWithdrawal.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-bold">Status Pipeline:</span>
                  {(() => {
                    const s = viewingWithdrawal.status || 'Pending';
                    const map: Record<string, { label: string; cls: string }> = {
                      Pending:        { label: '1. Pending', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
                      'Under Review': { label: '2. Under Review', cls: 'bg-blue-50 text-blue-800 border-blue-200' },
                      Approved:       { label: '3. Approved', cls: 'bg-purple-50 text-purple-800 border-purple-200' },
                      Processing:     { label: '4. Processing', cls: 'bg-sky-50 text-sky-800 border-sky-200' },
                      Completed:      { label: '5. Completed ✓', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                      Rejected:       { label: 'Rejected', cls: 'bg-red-50 text-red-800 border-red-200' },
                    };
                    const item = map[s] || { label: s, cls: 'bg-gray-50 text-gray-700 border-gray-200' };
                    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${item.cls}`}>{item.label}</span>;
                  })()}
                </div>
              </div>

              {/* Founder & Startup Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Founder &amp; Startup Info</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-bold">Founder Name:</span>
                  <strong className="text-gray-900">{viewingWithdrawal.founderName || user?.fullName}</strong>
                </div>
                {viewingWithdrawal.founderEmail && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold">Founder Email:</span>
                    <strong className="text-gray-900">{viewingWithdrawal.founderEmail}</strong>
                  </div>
                )}
                {viewingWithdrawal.startupName && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold">Startup Name:</span>
                    <strong className="text-gray-900">{viewingWithdrawal.startupName}</strong>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-bold">Request Date:</span>
                  <strong className="text-gray-900">{fmtDate(viewingWithdrawal.createdAt || new Date().toISOString())}</strong>
                </div>
              </div>

              {/* Destination Payout Details */}
              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-black uppercase text-[#5B21B6] tracking-wider mb-1 flex items-center gap-1">
                  <Landmark size={12} /> Destination Payout Details
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-bold">Method:</span>
                  <strong className="text-purple-900 font-extrabold uppercase">
                    {(viewingWithdrawal.withdrawalMethod === 'bank_account' || viewingWithdrawal.withdrawalMethod === 'bank') ? 'Bank Account Transfer' : 'Direct UPI Payout'}
                  </strong>
                </div>

                {(viewingWithdrawal.withdrawalMethod === 'bank_account' || viewingWithdrawal.withdrawalMethod === 'bank') ? (
                  <div className="pt-2 border-t border-purple-100 space-y-1.5 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account Holder:</span>
                      <strong className="text-gray-900">{viewingWithdrawal.bankDetails?.accountHolderName || viewingWithdrawal.accountHolderName || user?.fullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bank Name:</span>
                      <strong className="text-gray-900">{viewingWithdrawal.bankDetails?.bankName || viewingWithdrawal.bankName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account Number:</span>
                      <strong className="text-gray-900 font-mono">{viewingWithdrawal.bankDetails?.accountNumber || viewingWithdrawal.accountNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">IFSC Code:</span>
                      <strong className="text-gray-900 font-mono">{viewingWithdrawal.bankDetails?.ifscCode || viewingWithdrawal.ifscCode}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-purple-100 text-xs flex justify-between">
                    <span className="text-gray-400">UPI ID:</span>
                    <strong className="text-gray-900 font-mono">{viewingWithdrawal.upiDetails?.upiId || viewingWithdrawal.upiId || '—'}</strong>
                  </div>
                )}
              </div>

              {/* Admin Payout Details & UTR */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" /> Admin Finance Payout Verification
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-bold">Bank/UPI UTR Ref:</span>
                  <strong className="text-gray-900 font-mono font-bold">
                    {viewingWithdrawal.utrNumber || viewingWithdrawal.payoutReference || 'Pending UTR Generation'}
                  </strong>
                </div>
                {viewingWithdrawal.adminNotes && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Admin Finance Remarks:</span>
                    <p className="text-xs text-gray-700 italic bg-gray-50 p-2 rounded-xl border border-gray-100">
                      "{viewingWithdrawal.adminNotes}"
                    </p>
                  </div>
                )}
                {viewingWithdrawal.processedBy && (
                  <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                    <span>Processed By: <strong>{viewingWithdrawal.processedBy}</strong></span>
                    {viewingWithdrawal.processedAt && <span>Date: {fmtDate(viewingWithdrawal.processedAt)}</span>}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setViewingWithdrawal(null)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderFundingTransactions;
