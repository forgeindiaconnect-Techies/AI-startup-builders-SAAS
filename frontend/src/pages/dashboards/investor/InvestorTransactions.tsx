import React, { useState, useEffect, useMemo } from 'react';
import { 
  IndianRupee, ArrowUpRight, Clock, Wallet, CheckCircle2, 
  AlertCircle, X, ShieldCheck, Eye, CreditCard, Landmark, 
  Send, Calendar, FileText, ChevronRight, Upload, Info, 
  FileCheck, FileQuestion
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import InvestorSubNav from '../../../components/shared/InvestorSubNav';

const InvestorTransactions: React.FC = () => {
  const { offers, loading, refreshOffers } = useFunding();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'funding' | 'transactions'>('funding');
  
  // Selected funding offer for details modal
  const [selectedFunding, setSelectedFunding] = useState<FundingOffer | null>(null);
  // Selected transaction offer for transaction details modal
  const [selectedTx, setSelectedTx] = useState<FundingOffer | null>(null);
  
  // Payment modal state
  const [paymentOffer, setPaymentOffer] = useState<FundingOffer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Card'>('UPI');
  
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
  
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    refreshOffers();
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
    } else if (paymentMethod === 'Bank Transfer') {
      if (!senderBank.trim() || !senderAccount.trim()) {
        showToast('Please enter sender bank and account details.', 'error');
        return;
      }
      if (!bankUtr.trim()) {
        showToast('Please enter the transaction Reference/UTR number.', 'error');
        return;
      }
      utr = bankUtr.trim();
      details = `Bank: ${senderBank.trim()} (A/C: ${senderAccount.trim()})`;
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
      
      const { updateFundingOffer } = await import('../../../utils/localStorageHelper');
      const updated = await updateFundingOffer(paymentOffer._id || paymentOffer.id, {
        status: 'under_verification',
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
  const getFundingStatusBadge = (status: string) => {
    switch (status) {
      case 'offer_received':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold font-sans">Funding Pending</span>;
      case 'accepted':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold font-sans">Payment Pending</span>;
      case 'payment_submitted':
      case 'under_verification':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold font-sans">Under Verification</span>;
      case 'funded':
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-sans">Completed</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold font-sans">Rejected</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold font-sans">Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-bold font-sans">{status}</span>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">Payment Pending</span>;
      case 'under_verification':
      case 'payment_submitted':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">Under Verification</span>;
      case 'funded':
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">Completed</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">Rejected</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold">Initiated</span>;
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
      <div className="flex border-b border-gray-200 mb-6 gap-2">
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

      {/* Funding Commitments Tab */}
      {activeTab === 'funding' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading commitments...</div>
          ) : investorOffers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Wallet size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-700">No Funding Commitments Initiated</p>
              <p className="text-xs text-gray-400 mt-1">Discover startups in the Startup Marketplace to initiate a funding offer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Startup</th>
                    <th className="px-6 py-4">Founder</th>
                    <th className="px-6 py-4">Commitment Amount</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {investorOffers.map(o => {
                    const isAccepted = o.status === 'accepted';
                    const hasPaid = ['payment_submitted', 'under_verification', 'funded', 'completed'].includes(o.status);
                    const isPendingSign = !o.agreementStatus || o.agreementStatus === 'Drafted';

                    return (
                      <tr key={o.id || o._id} className="hover:bg-gray-50/50 transition-colors">
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
                        <td className="px-6 py-4">{getFundingStatusBadge(o.status)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            o.paymentStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            o.paymentStatus === 'Submitted' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {o.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setSelectedFunding(o)}
                              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Eye size={12} /> View Details
                            </button>
                            
                            {isAccepted && isPendingSign && (
                              <button
                                onClick={() => handleSignAgreement(o)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] rounded-lg font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1"
                              >
                                <FileCheck size={12} /> Sign Agreement
                              </button>
                            )}

                            {isAccepted && !isPendingSign && !hasPaid && (
                              <button
                                onClick={() => setPaymentOffer(o)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
                              >
                                <IndianRupee size={12} /> Pay Now
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
                    <th className="px-6 py-4">Startup</th>
                    <th className="px-6 py-4">Founder</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Reference / UTR</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {transactions.map(t => (
                    <tr key={t.id || t._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-600">
                        {t.paymentReference ? `TX-${t.paymentReference.slice(-6)}` : `TX-${(t.id || t._id || '0000').slice(-6)}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{t.startupName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">{t.founderName}</td>
                      <td className="px-6 py-4 font-extrabold text-[#5B21B6]">₹{t.offerAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold">
                          {t.paymentMethod || 'Manual Transfer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 font-semibold">{t.paymentReference || '—'}</td>
                      <td className="px-6 py-4">{getTransactionStatusBadge(t.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedTx(t)}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Eye size={12} /> View Details
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
                {getFundingStatusBadge(selectedFunding.status)}
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
                    { title: 'Agreement Signed', active: selectedFunding.agreementStatus === 'Completed' },
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
                  {(!selectedFunding.agreementStatus || selectedFunding.agreementStatus === 'Drafted') && (
                    <p>The investment term sheet is accepted. You must sign the formal Investment Agreement before releasing funds.</p>
                  )}
                  {selectedFunding.agreementStatus === 'Completed' && selectedFunding.paymentStatus === 'Pending' && (
                    <p>Agreement is signed by all parties. Click "Fund / Make Payment" to initiate escrow transfer.</p>
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

              {selectedFunding.status === 'accepted' && (!selectedFunding.agreementStatus || selectedFunding.agreementStatus === 'Drafted') && (
                <button
                  onClick={() => handleSignAgreement(selectedFunding)}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow transition-colors flex items-center gap-1.5"
                >
                  <FileCheck size={14} /> Sign Agreement
                </button>
              )}

              {selectedFunding.agreementStatus === 'Completed' && selectedFunding.paymentStatus === 'Pending' && (
                <button
                  onClick={() => { setPaymentOffer(selectedFunding); setSelectedFunding(null); }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow transition-colors flex items-center gap-1.5"
                >
                  <IndianRupee size={14} /> Fund / Make Payment
                </button>
              )}
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
                {getTransactionStatusBadge(selectedTx.status)}
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
                    <span className="text-gray-500">Startup Name:</span>
                    <strong className="text-gray-900">{selectedTx.startupName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Founder:</span>
                    <strong className="text-gray-900">{selectedTx.founderName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Investor:</span>
                    <strong className="text-gray-900">{selectedTx.investorName}</strong>
                  </div>
                </div>

                <div className="space-y-2.5">
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
                      <CheckCircle2 size={12} /> {selectedTx.agreementStatus || 'Completed'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Audit timelines */}
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Transaction Timeline</h4>
                <div className="space-y-3 font-sans">
                  {[
                    { title: 'Funding Offer Initiated', date: selectedTx.createdAt, desc: 'Investor commits the initial capital offer.' },
                    { title: 'Agreement Completed', date: selectedTx.createdAt, desc: 'Investment agreement signed.' },
                    { title: 'Payment Submitted', date: selectedTx.paymentDate, desc: `Payment submitted via ${selectedTx.paymentMethod || 'Manual Transfer'}. Reference UTR: ${selectedTx.paymentReference || 'Pending'}.` },
                    { title: 'Admin Verification', date: selectedTx.status === 'funded' ? selectedTx.updatedAt : null, desc: selectedTx.status === 'funded' ? 'Payment verified against platform escrow.' : 'Awaiting administrative verification.' }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          step.date ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.date ? '✓' : i + 1}
                        </div>
                        {i < 3 && <div className={`w-0.5 h-10 ${step.date ? 'bg-emerald-200' : 'bg-gray-100'}`}></div>}
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
                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Admin Verification Notes</span>
                  <p className="text-xs text-purple-900 italic font-medium">"{selectedTx.adminNote}"</p>
                </div>
              )}

              {/* Proof Viewer */}
              {selectedTx.paymentProof && (
                <div className="space-y-2">
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
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Investing In</span>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{paymentOffer.startupName}</p>
                    <span className="text-[10px] text-gray-500">Founder: {paymentOffer.founderName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Amount</span>
                    <p className="font-extrabold text-[#5B21B6] text-lg mt-0.5">₹{paymentOffer.offerAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Method selector tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Bank Transfer', 'Card'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border font-bold text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === method
                          ? 'border-[#5B21B6] bg-purple-50/50 text-[#5B21B6] shadow-sm'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {method === 'UPI' && <Send size={16} />}
                      {method === 'Bank Transfer' && <Landmark size={16} />}
                      {method === 'Card' && <CreditCard size={16} />}
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

                {/* Bank Transfer form */}
                {paymentMethod === 'Bank Transfer' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="bg-purple-50/40 border border-purple-100/60 p-4 rounded-xl text-xs space-y-1.5 text-gray-700">
                      <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">Escrow Bank Details</span>
                      <p className="flex justify-between"><span className="text-gray-500">Bank Name:</span> <strong>HDFC Bank</strong></p>
                      <p className="flex justify-between"><span className="text-gray-500">A/C Number:</span> <strong>50200088921102</strong></p>
                      <p className="flex justify-between"><span className="text-gray-500">IFSC Code:</span> <strong>HDFC0000104</strong></p>
                      <p className="flex justify-between"><span className="text-gray-500">Account Name:</span> <strong>AI Startup Platform Escrow Account</strong></p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {actionLoading ? 'Processing...' : `Submit ₹${paymentOffer.offerAmount.toLocaleString()} Payment`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvestorTransactions;
