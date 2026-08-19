import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, ArrowUpRight, Clock, Wallet, CheckCircle2, 
  AlertCircle, X, ShieldCheck, Eye, CreditCard, Landmark, 
  Send, Calendar, FileText, ChevronRight, Upload, Info, 
  FileCheck, FileQuestion, BookOpen, ExternalLink
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import InvestorSubNav from '../../../components/shared/InvestorSubNav';
import { getStartups } from '../../../utils/localStorageHelper';

const InvestorTransactions: React.FC = () => {
  const navigate = useNavigate();
  const { offers, loading, refreshOffers, sendOffer } = useFunding();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'funding' | 'transactions'>('funding');
  
  // Selected funding offer for details modal
  const [selectedFunding, setSelectedFunding] = useState<FundingOffer | null>(null);
  // Selected transaction offer for transaction details modal
  const [selectedTx, setSelectedTx] = useState<FundingOffer | null>(null);
  
  // Payment modal state
  const [paymentOffer, setPaymentOffer] = useState<FundingOffer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Card' | 'Manual Payment'>('UPI');
  
  // Payment Form inputs
  const [upiVpa, setUpiVpa] = useState('');
  const [upiUtr, setUpiUtr] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [bankUtr, setBankUtr] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const [proofBase64, setProofBase64] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Commitment Creation States
  const [startups, setStartups] = useState<any[]>([]);
  const [showCreateCommitmentModal, setShowCreateCommitmentModal] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [selectedStartup, setSelectedStartup] = useState<any | null>(null);
  const [commitmentAmount, setCommitmentAmount] = useState('');
  const [commitmentType, setCommitmentType] = useState<'Equity' | 'SAFE' | 'Convertible Note' | 'Other'>('SAFE');
  const [fundingRound, setFundingRound] = useState<'Pre-Seed' | 'Seed' | 'Series A' | 'Other'>('Seed');
  const [expectedInvestmentDate, setExpectedInvestmentDate] = useState('');
  const [commitmentNotes, setCommitmentNotes] = useState('');
  const [agreementAcknowledged, setAgreementAcknowledged] = useState(false);
  const [showSummaryStep, setShowSummaryStep] = useState(false);

  // Funding Guidelines state
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [guidelinesRead, setGuidelinesRead] = useState(false);
  const [guidelinesAudit, setGuidelinesAudit] = useState<{
    reviewedAt: string;
    version: string;
    investorId: string;
    status: string;
  } | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    refreshOffers();
    getStartups().then(res => setStartups(res || []));
  }, []);

  // Filter investor-specific offers
  const investorOffers = useMemo(() => {
    if (!user) return [];
    const investorEmailLower = (user.email || '').toLowerCase();
    const investorIdStr = String(user.id || '');
    return offers.filter(o => 
      (o.investorId && String(o.investorId) === investorIdStr) ||
      (o.investorEmail && o.investorEmail.toLowerCase() === investorEmailLower)
    );
  }, [offers, user]);

  // Derived Transaction list: any offer that has been accepted and payment has been initiated/submitted/verified/failed
  const transactions = useMemo(() => {
    return investorOffers.filter(o => 
      o.paymentMethod || 
      ['payment_submitted', 'under_verification', 'funded', 'completed', 'failed', 'rejected'].includes(o.status)
    );
  }, [investorOffers]);

  // Compute metrics dynamically
  const metrics = useMemo(() => {
    const TOTAL_LIMIT = 100000000; // ₹10 Crore default investment capacity
    let totalCommitted = 0;
    let pendingFunding = 0;
    let completedInvestments = 0;

    investorOffers.forEach(o => {
      // Exclude rejected/failed deals from committed total
      if (o.status !== 'rejected' && o.status !== 'failed') {
        totalCommitted += o.offerAmount;
      }
      
      // Pending funding: accepted by founder, payment submitted, or under verification, but not fully closed
      if (['accepted', 'payment_submitted', 'under_verification', 'funding_pending', 'payment_pending'].includes(o.status)) {
        pendingFunding += o.offerAmount;
      }
      
      // Completed: fully verified and marked as funded
      if (o.status === 'funded' || o.status === 'completed') {
        completedInvestments += o.offerAmount;
      }
    });

    const remainingLimit = Math.max(0, TOTAL_LIMIT - totalCommitted);

    return {
      totalLimit: TOTAL_LIMIT,
      totalCommitted,
      pendingFunding,
      completedInvestments,
      remainingLimit,
      totalTransactionsCount: transactions.length
    };
  }, [investorOffers, transactions]);

  // Handle Uploader for Payment Proof
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Proof image exceeds 2MB limit.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofBase64(reader.result as string);
        showToast('Payment proof uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Sign Agreement Action
  const handleSignAgreement = async (offer: FundingOffer) => {
    setActionLoading(true);
    try {
      const historyEntry = {
        action: 'agreement_signed',
        performedBy: user?.fullName || 'Investor',
        role: 'Investor',
        message: 'Investor signed the investment agreement.',
        createdAt: new Date().toISOString(),
      };
      
      const { updateFundingOffer } = await import('../../../utils/localStorageHelper');
      const updated = await updateFundingOffer(offer._id || offer.id, {
        agreementStatus: 'Completed',
        status: 'accepted',
        history: [...(offer.history || []), historyEntry]
      });
      
      if (updated) {
        showToast('Agreement signed successfully! You can now proceed to payment.');
        refreshOffers();
        // Update details modal if open
        if (selectedFunding && (selectedFunding._id === offer._id || selectedFunding.id === offer.id)) {
          setSelectedFunding({ ...selectedFunding, agreementStatus: 'Completed', status: 'accepted' });
        }
      } else {
        showToast('Failed to sign agreement.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error signing agreement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Payment Flow
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentOffer) return;
    
    // Validations
    let utr = '';
    let details = '';
    
    if (paymentMethod === 'UPI') {
      if (!upiVpa.trim()) {
        showToast('Please enter your UPI ID.', 'error');
        return;
      }
      if (!upiUtr.trim()) {
        showToast('Please enter the transaction reference / UTR number.', 'error');
        return;
      }
      utr = upiUtr.trim();
      details = `UPI ID: ${upiVpa.trim()}`;
    } else if (paymentMethod === 'Bank Transfer' || paymentMethod === 'Manual Payment') {
      if (paymentMethod === 'Bank Transfer' && (!senderBank.trim() || !senderAccount.trim())) {
        showToast('Please enter sender bank and account details.', 'error');
        return;
      }
      if (!bankUtr.trim()) {
        showToast('Please enter the transaction Reference/UTR number.', 'error');
        return;
      }
      utr = bankUtr.trim();
      details = paymentMethod === 'Bank Transfer' 
        ? `Bank: ${senderBank.trim()} (A/C: ${senderAccount.trim()})`
        : `Manual Payment Ref: ${utr}`;
    } else if (paymentMethod === 'Card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        showToast('Please complete all card details.', 'error');
        return;
      }
      utr = `CARD-${Date.now().toString().slice(-8)}`;
      details = `Cardholder: ${cardName.trim()}`;
    }
    
    setActionLoading(true);
    try {
      const historyEntry = {
        action: 'payment_submitted',
        performedBy: user?.fullName || 'Investor',
        role: 'Investor',
        message: `Investor submitted payment via ${paymentMethod}. UTR/Ref: ${utr}.`,
        createdAt: new Date().toISOString(),
      };
      
      const targetStatus = (paymentMethod === 'Bank Transfer' || paymentMethod === 'Manual Payment')
        ? 'under_verification'
        : 'payment_submitted';

      const { updateFundingOffer } = await import('../../../utils/localStorageHelper');
      const updated = await updateFundingOffer(paymentOffer._id || paymentOffer.id, {
        status: targetStatus,
        paymentStatus: 'Submitted',
        paymentMethod: paymentMethod,
        paymentReference: utr,
        paymentDate: new Date().toISOString(),
        paymentProof: proofBase64 || 'Uploaded receipt verification pending.',
        verificationStatus: 'Under Verification',
        history: [...(paymentOffer.history || []), historyEntry]
      });
      
      if (updated) {
        showToast('Payment details submitted! Admin verification is now in progress.');
        refreshOffers();
        setPaymentOffer(null);
        // Reset states
        setUpiVpa(''); setUpiUtr('');
        setSenderBank(''); setSenderAccount(''); setBankUtr(''); setBankNotes('');
        setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCvv(''); setProofBase64('');
        
        // Switch to transactions tab to view item
        setActiveTab('transactions');
      } else {
        showToast('Failed to submit payment details.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting payment details', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper status display
  const getWorkflowStatus = (o: FundingOffer): string => {
    if (o.status === 'completed') return 'Completed';
    if (o.status === 'funded') return 'Funded';
    if (o.status === 'under_verification') return 'Admin Verification';
    if (o.status === 'payment_submitted') return 'Payment Submitted';
    if (o.status === 'payment_pending') return 'Payment Pending';
    if (o.status === 'accepted') {
      if (o.agreementStatus === 'Fully Signed') return 'Payment Pending';
      return 'Founder Accepted';
    }
    if (o.status === 'offer_received') return 'Commitment Submitted';
    if (o.status === 'rejected') return 'Rejected';
    if (o.status === 'failed') return 'Failed';
    return o.status;
  };

  // Submit Commitment Action
  const handleCreateCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup) {
      showToast('Please select a startup.', 'error');
      return;
    }
    if (!commitmentAmount || isNaN(Number(commitmentAmount)) || Number(commitmentAmount) <= 0) {
      showToast('Please enter a valid investment amount.', 'error');
      return;
    }
    if (!guidelinesRead) {
      showToast('Please review and acknowledge the Funding Guidelines before continuing.', 'error');
      return;
    }
    if (!agreementAcknowledged) {
      showToast('Please acknowledge the agreement terms.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const year = new Date().getFullYear();
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const cId = `FC-${year}-${suffix}`;
      const txSuffix = Math.floor(1000 + Math.random() * 9000);
      const tId = `TXN-${year}-${txSuffix}`;

      const offerPayload = {
        startupId: selectedStartup.startupId || selectedStartup.id,
        startupName: selectedStartup.startupName,
        founderId: selectedStartup.founderId,
        founderName: selectedStartup.founderName || 'Founder',
        founderEmail: selectedStartup.founderEmail || 'founder@aistartup.com',
        investorId: String(user?.id || 'investor_1'),
        investorName: user?.fullName || 'Investor',
        investorCompany: (user as any)?.companyName || 'Capital Partners',
        investorEmail: user?.email || 'investor@aistartup.com',
        investorAddress: (user as any)?.address || 'GIFT City, Gujarat',
        offerAmount: Number(commitmentAmount),
        currency: 'INR',
        equityPercentage: commitmentType === 'Equity' ? 5 : 0,
        valuationCap: selectedStartup.aiGenerated?.ideaAnalysis?.valuationCap || 50000000,
        instrument: commitmentType,
        discount: 10,
        expiresInDays: 30,
        investorMessage: commitmentNotes,
        commitmentId: cId,
        transactionId: tId,
        fundingRound: fundingRound,
        expectedInvestmentDate: expectedInvestmentDate,
        commitmentNotes: commitmentNotes,
        agreementAcknowledged: agreementAcknowledged,
        guidelinesVersion: guidelinesAudit?.version || 'v1.0',
        guidelinesReviewedAt: guidelinesAudit?.reviewedAt || new Date().toISOString(),
        agreementStatus: 'Drafted'
      };

      await sendOffer(offerPayload as any);
      showToast('Funding commitment submitted successfully!');
      
      // Reset forms
      setSelectedStartupId('');
      setSelectedStartup(null);
      setCommitmentAmount('');
      setCommitmentType('SAFE');
      setFundingRound('Seed');
      setExpectedInvestmentDate('');
      setCommitmentNotes('');
      setAgreementAcknowledged(false);
      setGuidelinesRead(false);
      setGuidelinesAudit(null);
      setShowSummaryStep(false);
      setShowCreateCommitmentModal(false);
      refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit commitment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getFundingStatusBadge = (o: FundingOffer) => {
    const status = getWorkflowStatus(o);
    switch (status) {
      case 'Commitment Submitted':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold font-sans">Commitment Submitted</span>;
      case 'Founder Accepted':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold font-sans">Founder Accepted</span>;
      case 'Agreement Pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold font-sans">Agreement Pending</span>;
      case 'Payment Pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold font-sans">Payment Pending</span>;
      case 'Payment Submitted':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold font-sans">Payment Submitted</span>;
      case 'Admin Verification':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-full text-xs font-bold font-sans">Admin Verification</span>;
      case 'Funded':
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-sans">Completed</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold font-sans">Rejected</span>;
      case 'Failed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold font-sans">Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-bold font-sans">{status}</span>;
    }
  };

  const getTransactionStatusBadge = (o: FundingOffer) => {
    const status = getWorkflowStatus(o);
    switch (status) {
      case 'Payment Pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">Payment Pending</span>;
      case 'Payment Submitted':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">Payment Submitted</span>;
      case 'Admin Verification':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 rounded-full text-xs font-semibold">Under Verification</span>;
      case 'Funded':
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">Completed</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">Rejected</span>;
      case 'Failed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in-up pb-10 font-sans">
      <InvestorSubNav activeTab="transactions" />
      
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
          <h1 className="text-2xl font-bold text-gray-900">Funding & Transactions</h1>
          <p className="text-gray-500 mt-1">Submit commitments, sign agreements, initiate payments, and view transaction audits.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Committed</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">₹{metrics.totalCommitted.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Funding</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">₹{metrics.pendingFunding.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed Investments</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">₹{metrics.completedInvestments.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-tr from-[#5B21B6] to-[#7C3AED] rounded-2xl shadow-sm p-6 text-white flex flex-col justify-between">
          <span className="text-xs font-bold text-purple-100 uppercase tracking-wider">Remaining Capacity</span>
          <div>
            <p className="text-2xl font-extrabold mt-2">₹{metrics.remainingLimit.toLocaleString()}</p>
            <span className="text-[10px] text-purple-200 mt-1 block">from ₹10 Cr dynamic capacity limit</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row border-b border-gray-200 mb-6 gap-4 justify-between sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('funding')}
            className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'funding'
                ? 'border-[#5B21B6] text-[#5B21B6]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Wallet size={16} /> Funding Commitments
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'border-[#5B21B6] text-[#5B21B6]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText size={16} /> Transactions History ({metrics.totalTransactionsCount})
          </button>
        </div>
        {activeTab === 'funding' && investorOffers.length > 0 && (
          <button
            onClick={() => {
              if (startups.length === 0) {
                getStartups().then(res => setStartups(res || []));
              }
              setShowCreateCommitmentModal(true);
            }}
            className="mb-2 sm:mb-0 px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            + Create Funding Commitment
          </button>
        )}
      </div>

      {/* Funding Commitments Tab */}
      {activeTab === 'funding' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading commitments...</div>
          ) : investorOffers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
              <Wallet size={40} className="mb-3 text-gray-300" />
              <p className="font-bold text-gray-700 text-base">No funding commitments yet.</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">Select a startup and submit a new allocation request to get started.</p>
              <button
                onClick={() => {
                  if (startups.length === 0) {
                    getStartups().then(res => setStartups(res || []));
                  }
                  setShowCreateCommitmentModal(true);
                }}
                className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl font-bold text-sm shadow-md transition-all"
              >
                + Create Funding Commitment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Commitment ID</th>
                    <th className="px-6 py-4">Startup</th>
                    <th className="px-6 py-4">Founder</th>
                    <th className="px-6 py-4">Commitment Amount</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Commitment Status</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {investorOffers.map(o => {
                    const isAccepted = o.status === 'accepted';
                    const hasPaid = ['payment_submitted', 'under_verification', 'funded', 'completed'].includes(o.status);
                    const isFullySigned = o.agreementStatus === 'Fully Signed';

                    return (
                      <tr key={o.id || o._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-600">
                          {o.commitmentId || `FC-2026-${String(o.id || o._id || '0000').slice(-4).toUpperCase()}`}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{o.startupName}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{o.id || o._id}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-700">{o.founderName}</td>
                        <td className="px-6 py-4 font-extrabold text-[#5B21B6]">₹{o.offerAmount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-lg text-xs font-semibold">{o.instrument || 'SAFE'}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">{getFundingStatusBadge(o)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            o.paymentStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            o.paymentStatus === 'Submitted' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {o.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500 font-semibold">
                          {hasPaid ? (o.transactionId || `TXN-2026-${String(o.id || o._id || '0000').slice(-4).toUpperCase()}`) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setSelectedFunding(o)}
                              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Eye size={12} /> View Details
                            </button>
                            
                             {isAccepted && !isFullySigned && (
                              <button
                                onClick={() => navigate('/dashboard/investor/agreement')}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] rounded-lg font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <FileCheck size={12} /> {!o.investorSignedAt ? 'Sign Agreement' : 'Awaiting Countersign'}
                              </button>
                            )}

                            {isAccepted && isFullySigned && !hasPaid && (
                              <button
                                onClick={() => setPaymentOffer(o)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <IndianRupee size={12} /> Continue Payment
                              </button>
                            )}

                            {hasPaid && (
                              <button
                                onClick={() => setSelectedTx(o)}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] rounded-lg font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1"
                              >
                                <FileText size={12} /> View Transaction
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Transactions History Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileQuestion size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-700">No Transaction Records Found</p>
              <p className="text-xs text-gray-400 mt-1">Once you submit payments for commitments, the receipts ledger will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Funding Commitment ID</th>
                    <th className="px-6 py-4">Startup</th>
                    <th className="px-6 py-4">Founder</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Transaction/UTR Reference</th>
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {transactions.map(t => (
                    <tr key={t.id || t._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-600">
                        {t.transactionId || `TXN-2026-${String(t.id || t._id || '0000').slice(-4).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-600">
                        {t.commitmentId || `FC-2026-${String(t.id || t._id || '0000').slice(-4).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{t.startupName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">{t.founderName}</td>
                      <td className="px-6 py-4 font-extrabold text-[#5B21B6]">₹{t.offerAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold">
                          {t.paymentMethod || 'Manual Transfer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 font-semibold">{t.paymentReference || '—'}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                      </td>
                      <td className="px-6 py-4">{getTransactionStatusBadge(t)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedTx(t)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] rounded-lg font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Eye size={12} /> View Transaction
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── DEDICATED FUNDING DETAILS MODAL ─── */}
      {selectedFunding && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 flex flex-col text-left">
            <button
              onClick={() => setSelectedFunding(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 flex flex-col">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getFundingStatusBadge(selectedFunding)}
                <span className="px-2.5 py-0.5 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-full text-xs font-semibold">
                  {selectedFunding.instrument || 'SAFE'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Investment Commitment Profile</h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Ref: {selectedFunding.id || selectedFunding._id}</p>
            </div>

            <div className="p-6 sm:p-8 py-4 overflow-y-auto space-y-6 max-h-[60vh]">
              {/* Grid: Startup & Founder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Landmark size={14} /> Startup details
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-500">Name: <strong className="text-gray-950 font-bold">{selectedFunding.startupName}</strong></p>
                    <p className="text-gray-500">Stage: <strong className="text-gray-950 font-semibold">{selectedFunding.stage || 'Seed'}</strong></p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Landmark size={14} /> Founder details
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-500">Name: <strong className="text-gray-950 font-bold">{selectedFunding.founderName}</strong></p>
                    <p className="text-gray-500">Email: <strong className="text-gray-950 font-semibold">{selectedFunding.founderEmail || 'renu@gmail.com'}</strong></p>
                  </div>
                </div>
              </div>

              {/* Allocation values */}
              <div className="bg-purple-50/40 border border-purple-100/60 p-4 rounded-xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Invested Amount</span>
                    <strong className="text-[#5B21B6] text-base font-extrabold">₹{selectedFunding.offerAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Equity Percentage</span>
                    <strong className="text-gray-900 text-base font-extrabold">{selectedFunding.equityPercentage}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Valuation Cap</span>
                    <strong className="text-gray-900 text-base font-extrabold">₹{(selectedFunding.valuationCap || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Discount</span>
                    <strong className="text-gray-900 text-base font-extrabold">{selectedFunding.discount || 0}%</strong>
                  </div>
                </div>
              </div>

              {/* Workflow Status Details */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/20">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider pb-1.5 border-b border-gray-100">Workflow Checklist</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Due Diligence Status:</span>
                    <strong className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={13} /> {selectedFunding.dueDiligenceStatus || 'Completed'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Agreement Status:</span>
                    <strong className="text-gray-800 font-bold mt-0.5 block">
                      {selectedFunding.agreementStatus || 'Drafted'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Payment Status:</span>
                    <strong className="text-gray-800 font-bold mt-0.5 block">
                      {selectedFunding.paymentStatus || 'Pending'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Verification Status:</span>
                    <strong className="text-gray-800 font-bold mt-0.5 block">
                      {selectedFunding.verificationStatus || 'Pending'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Timeline diagram */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Funding Checklist Progress</h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
                  {[
                    { title: 'Initiated', active: true },
                    { title: 'Agreement Signed', active: selectedFunding.agreementStatus === 'Fully Signed' },
                    { title: 'Payment Submitted', active: ['payment_submitted', 'under_verification', 'funded', 'completed'].includes(selectedFunding.status) },
                    { title: 'Admin Verification', active: ['under_verification', 'funded', 'completed'].includes(selectedFunding.status) },
                    { title: 'Funding Completed', active: ['funded', 'completed'].includes(selectedFunding.status) }
                  ].map((node, i, arr) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          node.active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {node.active ? <CheckCircle2 size={12} /> : i + 1}
                        </div>
                        <span className={`font-semibold ${node.active ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>{node.title}</span>
                      </div>
                      {i < arr.length - 1 && <ChevronRight size={14} className="hidden sm:block text-gray-300" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Required action notes */}
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Required actions:</span>
                  {(!selectedFunding.agreementStatus || selectedFunding.agreementStatus === 'Pending Investor Signature') && (
                    <p>The investment term sheet is accepted. You must sign the formal Investment Agreement in the Agreement tab before releasing funds.</p>
                  )}
                  {selectedFunding.agreementStatus === 'Pending Founder Signature' && (
                    <p>You have signed the agreement. We are awaiting the Founder's countersignature. Payment will unlock once fully signed.</p>
                  )}
                  {selectedFunding.agreementStatus === 'Fully Signed' && selectedFunding.paymentStatus === 'Pending' && (
                    <p>Agreement is signed by both parties. Click "Fund / Make Payment" to initiate escrow transfer.</p>
                  )}
                  {selectedFunding.paymentStatus === 'Submitted' && (
                    <p>Payment has been recorded. Admin is currently verifying the Reference/UTR number. No further action needed.</p>
                  )}
                  {selectedFunding.status === 'funded' && (
                    <p className="text-emerald-800 font-semibold">Deal complete! Capital deployed and equity shares allocated in dashboard portfolio.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setSelectedFunding(null)}
                className="px-5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Close
              </button>

              {selectedFunding.status === 'accepted' && selectedFunding.agreementStatus !== 'Fully Signed' && (
                <button
                  onClick={() => { setSelectedFunding(null); navigate('/dashboard/investor/agreement'); }}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck size={14} /> Review & Sign Agreement
                </button>
              )}

              {/* Payment button (unlocked only if fully signed) */}
              {selectedFunding.agreementStatus === 'Fully Signed' && selectedFunding.paymentStatus === 'Pending' ? (
                <button
                  onClick={() => { setPaymentOffer(selectedFunding); setSelectedFunding(null); }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <IndianRupee size={14} /> Fund / Make Payment
                </button>
              ) : selectedFunding.paymentStatus === 'Pending' ? (
                <div className="flex flex-col items-end gap-1">
                  <button
                    disabled
                    className="px-5 py-2 bg-gray-200 text-gray-400 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-not-allowed"
                  >
                    <IndianRupee size={14} /> Fund / Make Payment (Locked)
                  </button>
                  <span className="text-[10px] text-red-500 font-semibold block text-right max-w-[280px] mt-1">
                    Payment is available after both Investor and Founder have signed the Investment Agreement.
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ─── DEDICATED TRANSACTION DETAILS VIEW ─── */}
      {selectedTx && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 flex flex-col text-left">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 flex flex-col">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getTransactionStatusBadge(selectedTx)}
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-xs font-semibold">
                  {selectedTx.paymentMethod || 'Manual Transfer'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Transaction Details Audit Log</h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Reference ID: {selectedTx.paymentReference || 'N/A'}</p>
            </div>

            <div className="p-6 sm:p-8 py-4 overflow-y-auto space-y-6 max-h-[60vh]">
              {/* Financial Summary */}
              <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Capital Amount</span>
                  <strong className="text-2xl font-black text-[#5B21B6]">₹{selectedTx.offerAmount.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Instrument / Equity</span>
                  <p className="text-sm font-extrabold text-gray-800">{selectedTx.instrument} for {selectedTx.equityPercentage}%</p>
                </div>
              </div>

              {/* Core Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Transaction ID:</span>
                    <strong className="text-gray-900">{selectedTx.transactionId || `TXN-2026-${String(selectedTx.id || selectedTx._id || '0000').slice(-4).toUpperCase()}`}</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Funding Commitment ID:</span>
                    <strong className="text-gray-900">{selectedTx.commitmentId || `FC-2026-${String(selectedTx.id || selectedTx._id || '0000').slice(-4).toUpperCase()}`}</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Startup Name:</span>
                    <strong className="text-gray-900">{selectedTx.startupName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Founder:</span>
                    <strong className="text-gray-900">{selectedTx.founderName}</strong>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Payment Method:</span>
                    <strong className="text-gray-900">{selectedTx.paymentMethod || 'Manual Payment'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Payment Date:</span>
                    <strong className="text-gray-900">
                      {selectedTx.paymentDate ? new Date(selectedTx.paymentDate).toLocaleString() : 'Pending'}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">UTR / Reference:</span>
                    <strong className="text-gray-900 font-mono">{selectedTx.paymentReference || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Agreement Status:</span>
                    <strong className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 size={12} /> {selectedTx.agreementStatus || 'Fully Signed'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Audit timelines */}
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Transaction Timeline</h4>
                <div className="space-y-3 font-sans">
                  {[
                    { title: 'Funding Commitment Created', date: selectedTx.createdAt, desc: 'Investor commits the initial capital allocation.' },
                    { title: 'Founder Accepted', date: ['accepted', 'payment_submitted', 'under_verification', 'funded', 'completed', 'failed'].includes(selectedTx.status) ? selectedTx.createdAt : null, desc: 'Founder approved the investment proposal.' },
                    { title: 'Agreement Signed', date: selectedTx.agreementStatus === 'Fully Signed' ? selectedTx.createdAt : null, desc: 'Legal documentation completed by both parties.' },
                    { title: 'Payment Initiated', date: selectedTx.paymentDate || null, desc: 'Investor started the payment process.' },
                    { title: 'Payment Submitted', date: ['payment_submitted', 'under_verification', 'funded', 'completed'].includes(selectedTx.status) ? selectedTx.paymentDate : null, desc: `Capital transfer proof submitted via ${selectedTx.paymentMethod || 'Manual'}.` },
                    { title: 'Admin Verification', date: ['under_verification', 'funded', 'completed'].includes(selectedTx.status) ? (selectedTx.updatedAt || selectedTx.paymentDate) : null, desc: 'Escrow verification in progress.' },
                    { title: 'Payment Verified', date: ['funded', 'completed'].includes(selectedTx.status) ? selectedTx.updatedAt : null, desc: 'Escrow matches committed funding.' },
                    { title: 'Funding Completed', date: ['funded', 'completed'].includes(selectedTx.status) ? selectedTx.updatedAt : null, desc: 'Capital deployed to founder startup ledger.' }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          step.date ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.date ? '✓' : i + 1}
                        </div>
                        {i < 7 && <div className={`w-0.5 h-10 ${step.date ? 'bg-emerald-200' : 'bg-gray-100'}`}></div>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${step.date ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                          {step.date && <span className="text-[10px] text-gray-400 font-medium">({new Date(step.date).toLocaleDateString()})</span>}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Notes */}
              {selectedTx.adminNote && (
                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-1 text-left">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Admin Verification Notes</span>
                  <p className="text-xs text-purple-900 italic font-medium">"{selectedTx.adminNote}"</p>
                </div>
              )}

              {/* Proof Viewer */}
              {selectedTx.paymentProof && (
                <div className="space-y-2 text-left">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Receipt / Proof</h4>
                  {selectedTx.paymentProof.startsWith('data:image/') ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[250px] flex items-center justify-center bg-gray-50 p-2">
                      <img src={selectedTx.paymentProof} alt="Payment Receipt Proof" className="object-contain max-h-[230px] rounded-lg shadow-sm" />
                    </div>
                  ) : (
                    <div className="border border-gray-100 bg-gray-50 p-4 rounded-xl text-xs text-gray-600 font-mono italic leading-relaxed">
                      {selectedTx.paymentProof}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PAYMENT CHECKOUT FLOW MODAL ─── */}
      {paymentOffer && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 flex flex-col text-left font-sans">
            <button
              onClick={() => setPaymentOffer(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <IndianRupee size={22} className="text-emerald-600" /> Capital Allocation Checkout
              </h2>
              <p className="text-xs text-gray-500 mt-1">Select your payment method and input transaction verification fields.</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="p-6 sm:p-8 py-4 overflow-y-auto space-y-5 max-h-[60vh] text-xs">
                {/* Startup Summary Box */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex justify-between items-center text-left">
                  <div className="space-y-1">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Commitment ID</span>
                      <p className="font-mono text-xs text-gray-700 mt-0.5 font-bold">
                        {paymentOffer.commitmentId || `FC-2026-${String(paymentOffer.id || paymentOffer._id || '0000').slice(-4).toUpperCase()}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Investing In</span>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{paymentOffer.startupName}</p>
                      <span className="text-[10px] text-gray-500 font-medium">Founder: {paymentOffer.founderName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Payment Amount</span>
                    <p className="font-extrabold text-[#5B21B6] text-lg mt-0.5">₹{paymentOffer.offerAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Method selector tabs */}
                <div className="grid grid-cols-4 gap-2">
                  {(['UPI', 'Bank Transfer', 'Card', 'Manual Payment'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition-all flex flex-col items-center justify-center gap-1.5 text-[10px] ${
                        paymentMethod === method
                          ? 'border-[#5B21B6] bg-purple-50/50 text-[#5B21B6] shadow-sm'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {method === 'UPI' && <Send size={14} />}
                      {method === 'Bank Transfer' && <Landmark size={14} />}
                      {method === 'Card' && <CreditCard size={14} />}
                      {method === 'Manual Payment' && <Landmark size={14} />}
                      {method}
                    </button>
                  ))}
                </div>

                {/* UPI form */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      {/* CSS QR representation */}
                      <div className="w-32 h-32 bg-white p-2 border border-gray-200 rounded-lg flex flex-col justify-between items-center relative shadow-sm mb-3">
                        <div className="grid grid-cols-2 gap-1.5 w-full h-full opacity-80">
                          <div className="border-[5px] border-gray-900 w-10 h-10"></div>
                          <div className="border-[5px] border-gray-900 w-10 h-10 justify-self-end"></div>
                          <div className="border-[5px] border-gray-900 w-10 h-10 align-self-end"></div>
                          <div className="w-10 h-10 border-[3px] border-gray-900 border-dashed rounded-full align-self-end justify-self-end"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-black uppercase text-white bg-purple-600 px-1.5 py-0.5 rounded shadow">UPI QR</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-semibold text-center">Scan QR code with BHIM / Google Pay / PhonePe to transfer exact amount.</p>
                      <strong className="text-gray-900 font-mono mt-1 text-[11px]">escrow@aistartupplatform.upi</strong>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Your VPA / UPI ID *</label>
                        <input
                          type="text"
                          required
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          placeholder="e.g. rakesh@okhdfcbank"
                          className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">UPI Reference ID / UTR *</label>
                        <input
                          type="text"
                          required
                          value={upiUtr}
                          onChange={(e) => setUpiUtr(e.target.value)}
                          placeholder="12-digit UPI Transaction Ref"
                          className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer & Manual Payment form */}
                {(paymentMethod === 'Bank Transfer' || paymentMethod === 'Manual Payment') && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {paymentMethod === 'Bank Transfer' && (
                      <div className="bg-purple-50/40 border border-purple-100/60 p-4 rounded-xl text-xs space-y-1.5 text-gray-700">
                        <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">Escrow Bank Details</span>
                        <p className="flex justify-between"><span className="text-gray-500">Bank Name:</span> <strong>HDFC Bank</strong></p>
                        <p className="flex justify-between"><span className="text-gray-500">A/C Number:</span> <strong>50200088921102</strong></p>
                        <p className="flex justify-between"><span className="text-gray-500">IFSC Code:</span> <strong>HDFC0000104</strong></p>
                        <p className="flex justify-between"><span className="text-gray-500">Account Name:</span> <strong>AI Startup Platform Escrow Account</strong></p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {paymentMethod === 'Bank Transfer' ? (
                        <>
                          <div>
                            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Sender Bank Name *</label>
                            <input
                              type="text"
                              required
                              value={senderBank}
                              onChange={(e) => setSenderBank(e.target.value)}
                              placeholder="e.g. ICICI Bank"
                              className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Sender Account Name/No. *</label>
                            <input
                              type="text"
                              required
                              value={senderAccount}
                              onChange={(e) => setSenderAccount(e.target.value)}
                              placeholder="Sender Name or Account No."
                              className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                            />
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Payment Channel / Bank *</label>
                          <input
                            type="text"
                            required
                            value={senderBank}
                            onChange={(e) => setSenderBank(e.target.value)}
                            placeholder="e.g. Cash Deposit / Custody Escrow"
                            className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Transaction ID / UTR *</label>
                        <input
                          type="text"
                          required
                          value={bankUtr}
                          onChange={(e) => setBankUtr(e.target.value)}
                          placeholder="Reference / IMPS / NEFT Ref"
                          className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                        <input
                          type="text"
                          value={bankNotes}
                          onChange={(e) => setBankNotes(e.target.value)}
                          placeholder="Remarks / notes"
                          className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                      </div>
                    </div>

                    {/* File Proof Uploader */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-gray-700 uppercase tracking-wider">Upload Transfer Receipt / Proof *</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-purple-300 transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          required={!proofBase64}
                        />
                        {proofBase64 ? (
                          <div className="flex items-center gap-3 w-full">
                            <img src={proofBase64} alt="Receipt Thumbnail" className="w-12 h-12 object-cover rounded-lg border shadow-xs" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">payment_proof_receipt.jpg</p>
                              <span className="text-[10px] text-emerald-600 font-bold">Base64 file encoded</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); setProofBase64(''); }}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 relative z-10"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <p className="font-bold text-gray-700">Select File Proof</p>
                            <span className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG receipt file up to 2MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Form */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Cardholder Name *</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name as it appears on Card"
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Card Number *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          placeholder="4000 1234 5678 9010"
                          className="w-full p-2.5 pl-10 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Expiry Date *</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6] text-center"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">CVV *</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6] text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-3 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setPaymentOffer(null)}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  {actionLoading ? 'Processing...' : `Submit Payment`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CREATE FUNDING COMMITMENT MODAL ─── */}
      {showCreateCommitmentModal && (
        <div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 flex flex-col text-left font-sans">
            <button
              onClick={() => {
                setShowCreateCommitmentModal(false);
                setShowSummaryStep(false);
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-[#5B21B6]" size={22} /> 
                {showSummaryStep ? 'Review Commitment Summary' : 'Create Funding Commitment'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {showSummaryStep 
                  ? 'Verify your commitment parameters before final deployment to founder ledger.' 
                  : 'Enter the startup investment details to create a formal allocation request.'}
              </p>
            </div>

            {!showSummaryStep ? (
              <form onSubmit={(e) => { e.preventDefault(); setShowSummaryStep(true); }} className="flex-1 flex flex-col min-h-0 text-xs">
                <div className="p-6 sm:p-8 py-4 overflow-y-auto space-y-4 max-h-[60vh]">
                  {/* Select Startup */}
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Select Startup *</label>
                    <select
                      required
                      value={selectedStartupId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setSelectedStartupId(sId);
                        const found = startups.find(s => s.startupId === sId || s.id === sId);
                        setSelectedStartup(found || null);
                      }}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    >
                      <option value="">-- Choose Startup --</option>
                      {startups.map(s => (
                        <option key={s.id || s.startupId} value={s.id || s.startupId}>
                          {s.startupName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Founder */}
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Founder Name (Auto-filled)</label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Founder Name"
                      value={selectedStartup ? selectedStartup.founderName : ''}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Investment Amount */}
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Investment Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      placeholder="e.g. 5000000"
                      value={commitmentAmount}
                      onChange={(e) => setCommitmentAmount(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    />
                  </div>

                  {/* Investment Type */}
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Investment Type *</label>
                    <select
                      value={commitmentType}
                      onChange={(e) => setCommitmentType(e.target.value as any)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    >
                      <option value="SAFE">SAFE</option>
                      <option value="Equity">Equity</option>
                      <option value="Convertible Note">Convertible Note</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Funding Round */}
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Funding Round *</label>
                    <select
                      value={fundingRound}
                      onChange={(e) => setFundingRound(e.target.value as any)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    >
                      <option value="Pre-Seed">Pre-Seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Expected Investment Date */}
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Expected Investment Date *</label>
                    <input
                      type="date"
                      required
                      value={expectedInvestmentDate}
                      onChange={(e) => setExpectedInvestmentDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    />
                  </div>

                  {/* Investment notes */}
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Investment Notes / Remarks</label>
                    <textarea
                      placeholder="Remarks, strategic value-adds, or timeline details"
                      value={commitmentNotes}
                      onChange={(e) => setCommitmentNotes(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    />
                  </div>

                  {/* Funding Guidelines Step */}
                  <div className={`rounded-2xl border-2 p-4 transition-all ${
                    guidelinesRead
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-amber-200 bg-amber-50/40'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {guidelinesRead
                          ? <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                          : <BookOpen size={18} className="text-amber-600 mt-0.5 shrink-0" />
                        }
                        <div>
                          <p className={`font-bold text-xs ${
                            guidelinesRead ? 'text-emerald-800' : 'text-amber-800'
                          }`}>
                            {guidelinesRead ? '✓ Funding Guidelines Reviewed' : 'Funding Guidelines — Review Required'}
                          </p>
                          {guidelinesRead && guidelinesAudit && (
                            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                              {guidelinesAudit.version} · Acknowledged {new Date(guidelinesAudit.reviewedAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                          {!guidelinesRead && (
                            <p className="text-[10px] text-amber-700 mt-0.5">You must read and confirm the investment framework before proceeding.</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGuidelinesModal(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all shrink-0 ${
                          guidelinesRead
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 animate-pulse'
                        }`}
                      >
                        <ExternalLink size={11} />
                        {guidelinesRead ? 'Re-read Guidelines' : 'View Guidelines'}
                      </button>
                    </div>

                    {/* Acknowledgement Checkbox — only enabled after guidelines read */}
                    <div className={`mt-3 pt-3 border-t ${
                      guidelinesRead ? 'border-emerald-200' : 'border-amber-200'
                    } flex items-start gap-2.5`}>
                      <input
                        type="checkbox"
                        required
                        id="agreementCheckbox"
                        disabled={!guidelinesRead}
                        checked={agreementAcknowledged}
                        onChange={(e) => setAgreementAcknowledged(e.target.checked)}
                        className={`mt-0.5 w-4 h-4 rounded border-gray-300 transition-all ${
                          guidelinesRead
                            ? 'text-[#5B21B6] focus:ring-[#5B21B6] cursor-pointer'
                            : 'opacity-40 cursor-not-allowed'
                        }`}
                      />
                      <label
                        htmlFor="agreementCheckbox"
                        className={`font-medium text-[11px] leading-relaxed transition-all ${
                          guidelinesRead ? 'text-gray-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        I acknowledge the term sheet guidelines and verify that the committed amount matches our allocation framework. *
                        {!guidelinesRead && (
                          <span className="block text-[10px] text-amber-600 font-bold mt-0.5 italic">← Read the guidelines above to unlock this checkbox</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-3 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setShowCreateCommitmentModal(false)}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow-md transition-colors"
                  >
                    Review Summary
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateCommitment} className="flex-1 flex flex-col min-h-0 text-xs">
                <div className="p-6 sm:p-8 py-4 overflow-y-auto space-y-4 max-h-[60vh]">
                  <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl space-y-3">
                    <p className="flex justify-between pb-2 border-b border-purple-100/50 text-gray-600">
                      <span>Startup:</span>
                      <strong className="text-gray-900 text-sm font-bold">{selectedStartup?.startupName}</strong>
                    </p>
                    <p className="flex justify-between pb-2 border-b border-purple-100/50 text-gray-600">
                      <span>Founder:</span>
                      <strong className="text-gray-900 text-sm font-bold">{selectedStartup?.founderName}</strong>
                    </p>
                    <p className="flex justify-between pb-2 border-b border-purple-100/50 text-gray-600">
                      <span>Investment Amount:</span>
                      <strong className="text-[#5B21B6] text-sm font-extrabold">₹{Number(commitmentAmount).toLocaleString()}</strong>
                    </p>
                    <p className="flex justify-between pb-2 border-b border-purple-100/50 text-gray-600">
                      <span>Investment Type:</span>
                      <strong className="text-gray-900 text-sm font-bold">{commitmentType}</strong>
                    </p>
                    <p className="flex justify-between pb-2 border-b border-purple-100/50 text-gray-600">
                      <span>Funding Round:</span>
                      <strong className="text-gray-900 text-sm font-bold">{fundingRound}</strong>
                    </p>
                    <p className="flex justify-between text-gray-600">
                      <span>Expected Investment Date:</span>
                      <strong className="text-gray-900 text-sm font-bold">{expectedInvestmentDate}</strong>
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-amber-900 text-[11px] flex gap-2">
                    <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
                    <p>
                      Submitting this commitment will place it in <strong>Commitment Submitted</strong> state. The founder will receive a notification to review, accept, or reject the allocation.
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-3 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setShowSummaryStep(false)}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow-md transition-colors"
                  >
                    {actionLoading ? 'Deploying...' : 'Submit Funding Commitment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* ─── FUNDING GUIDELINES MODAL ─── */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 flex flex-col text-left font-sans max-h-[90vh]">
            <button
              onClick={() => setShowGuidelinesModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 flex items-start gap-3 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Funding Guidelines & Investment Framework</h2>
                <p className="text-xs text-gray-500 mt-0.5">Version v1.0 · Please read carefully before committing funds</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 py-5 overflow-y-auto flex-1 space-y-5 text-xs text-gray-700">

              {/* Section 1 */}
              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-[#5B21B6] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <IndianRupee size={12} /> Investment Amount & Allocation Rules
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600 leading-relaxed">
                  <li>Minimum investment per commitment: <strong className="text-gray-900">₹1,00,000</strong> (₹1 Lakh)</li>
                  <li>Maximum single-deal investment: <strong className="text-gray-900">₹10,00,00,000</strong> (₹10 Crore)</li>
                  <li>Total platform investment capacity per investor: <strong className="text-gray-900">₹10 Crore</strong> per cycle</li>
                  <li>Investment amounts must be committed in full and cannot be partially fulfilled</li>
                  <li>Multi-tranche funding structures are supported only with explicit founder agreement</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-blue-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <FileText size={12} /> Funding Commitment Rules & Term Sheet
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600 leading-relaxed">
                  <li>A Funding Commitment is a formal binding declaration of intent to invest</li>
                  <li>All commitments must specify: Investment Type (SAFE/Equity/Convertible Note), Funding Round, and Expected Investment Date</li>
                  <li>Once the founder accepts a commitment, the investor is obligated to proceed to the payment stage</li>
                  <li>Term sheet parameters (valuation cap, discount rate, equity %) are fixed at commitment creation and cannot be altered post-acceptance</li>
                  <li>Both parties must digitally sign the Investment Agreement before funds can be released</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-emerald-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Payment Requirements & Transaction Verification
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600 leading-relaxed">
                  <li>Payments must be made to the platform's designated escrow account within <strong className="text-gray-900">30 days</strong> of agreement signing</li>
                  <li>Accepted payment methods: UPI (Paytm/Google Pay) or Manual Bank Transfer (NEFT/RTGS/IMPS)</li>
                  <li>Investors must provide the exact UTR / Reference Number of the transaction</li>
                  <li>For Bank Transfer/Manual payments, a clear payment receipt or proof must be uploaded</li>
                  <li>Payment amounts must exactly match the committed investment amount — no partial transfers accepted</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-amber-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Eye size={12} /> Due Diligence & Agreement Requirements
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600 leading-relaxed">
                  <li>Investors are responsible for conducting their own due diligence before committing funds</li>
                  <li>The platform provides startup data and AI analysis for informational purposes only</li>
                  <li>Investment Agreement documents must be reviewed, negotiated, and signed via the platform's digital signing workflow</li>
                  <li>KYC verification is mandatory before any investment commitment can be activated</li>
                  <li>Investors may request additional information from founders through the platform's messaging system</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-rose-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <AlertCircle size={12} /> Refund, Cancellation & Investor Responsibilities
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600 leading-relaxed">
                  <li>Commitments may be cancelled <strong className="text-gray-900">before the founder accepts</strong>. Once accepted, cancellation requires mutual agreement</li>
                  <li>Refunds are processed only in cases of verified platform errors or documented founder misrepresentation</li>
                  <li>In case of failed payment verification, investors have <strong className="text-gray-900">7 days</strong> to resubmit correct payment proof</li>
                  <li>Investors must maintain accurate contact and banking information on their platform profile</li>
                  <li>Misrepresentation or fraudulent payment submissions will result in immediate account suspension</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Admin Verification & Funding Completion
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600 leading-relaxed">
                  <li>All payment submissions undergo mandatory admin verification (UTR validation, escrow reconciliation)</li>
                  <li>Verification typically completes within <strong className="text-gray-900">2–5 business days</strong></li>
                  <li>Investors will be notified via the platform dashboard and email upon successful verification</li>
                  <li>Funding is deemed <strong className="text-gray-900">Complete</strong> only after escrow reconciliation and admin confirmation</li>
                  <li>Post-funding, equity or SAFE agreement details are digitally recorded in both parties' dashboards</li>
                </ul>
              </div>

              {/* Footer notice */}
              <div className="bg-[#5B21B6]/5 border border-[#5B21B6]/20 rounded-2xl p-4 flex items-start gap-3">
                <Info size={16} className="text-[#5B21B6] shrink-0 mt-0.5" />
                <p className="text-gray-600 leading-relaxed">
                  <strong className="text-gray-900">Please read and understand the above guidelines before continuing.</strong> By clicking "I Have Read & Understand" you confirm that you have read, understood, and agree to comply with all guidelines stated in this Investment Framework (v1.0). This confirmation is recorded as part of the deal audit trail.
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 sm:p-8 pt-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-3xl">
              <div className="text-[10px] text-gray-400 font-medium">
                Guidelines Version: <strong className="text-gray-600">v1.0</strong> · Effective: Aug 2026
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGuidelinesModal(false)}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-sm hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const auditRecord = {
                      reviewedAt: new Date().toISOString(),
                      version: 'v1.0',
                      investorId: String(user?.id || 'investor'),
                      status: 'Acknowledged',
                    };
                    setGuidelinesAudit(auditRecord);
                    setGuidelinesRead(true);
                    setShowGuidelinesModal(false);
                    showToast('Funding Guidelines acknowledged successfully!');
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={14} /> I Have Read & Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorTransactions;
