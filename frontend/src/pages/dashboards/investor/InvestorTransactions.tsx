import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, IndianRupee, CreditCard, Send, CheckCircle2, Clock, X, 
  ArrowUpRight, ShieldCheck, AlertCircle, Calendar, Building2, 
  User, TrendingUp, Upload, ArrowRight, ChevronRight, FileText, Landmark, FileCheck
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import { updateFundingOffer, addNotification } from '../../../utils/localStorageHelper';
import InvestorSubNav from '../../../components/shared/InvestorSubNav';

const InvestorTransactions: React.FC = () => {
  const { user } = useAuth();
  const { offers, refreshOffers, loading } = useFunding();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'funding' | 'transactions'>('funding');
  const [selectedFunding, setSelectedFunding] = useState<any | null>(null);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<any | null>(null);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Card'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [paymentProof, setPaymentProof] = useState<string>(''); // Base64 proof preview
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Total Investment Budget setting (e.g. ₹5,00,00,000 / 5 Crores)
  const totalBudget = 50000000;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isMyOffer = (o: any) => {
    if (!user) return false;
    return o.investorId === user.id || o.investorEmail === user.email || o.investorName === user.fullName;
  };

  const myOffers = offers.filter(isMyOffer);

  // Add dummy/mock data for testing if there are no commitments yet
  const generateMockDeal = async () => {
    if (!user) return;
    const mockOffer = {
      startupId: 'startup_mock_1',
      startupName: 'Tourists Platform AI',
      founderId: 'f_1',
      founderName: 'Renu Gopal',
      investorId: user.id || 'inv_1',
      investorName: user.fullName || 'Rakesh Kumar',
      investorCompany: (user as any).company || 'Nexus Venture Partners',
      investorEmail: user.email || 'rakesh@investor.com',
      offerAmount: 5000000,
      currency: 'INR',
      equityPercentage: 10,
      valuationCap: 50000000,
      instrument: 'SAFE',
      discount: 20,
      expiresInDays: 14,
      investorMessage: 'We love your traction! Looking forward to working together.',
      status: 'accepted' as const, // Accepted by founder, ready for payment
      history: [
        {
          action: 'offer_received',
          performedBy: user.fullName || 'Rakesh Kumar',
          role: 'Investor',
          message: 'Investor committed funding.',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          action: 'accepted',
          performedBy: 'Renu Gopal',
          role: 'Founder',
          message: 'Founder accepted the term sheet offer.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]
    };

    try {
      const res = await fetch(`${window.location.origin.replace('3000', '5000')}/api/funding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockOffer)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Successfully seeded a mock investment deal!', 'success');
        refreshOffers();
      }
    } catch (e) {
      // Direct LocalStorage seed fallback
      const stored = localStorage.getItem('ai_startup_builder_funding_offers');
      const list = stored ? JSON.parse(stored) : [];
      const newOffer = { ...mockOffer, id: `offer_mock_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      list.unshift(newOffer);
      localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(list));
      showToast('Seeded mock investment deal locally!', 'success');
      refreshOffers();
    }
  };

  // Helper for file base64 conversions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;

    if (!utrNumber.trim()) {
      showToast('Please enter a Transaction ID / UTR reference number.', 'error');
      return;
    }

    setIsSubmittingPayment(true);
    const offerId = showPaymentModal._id || showPaymentModal.id;

    const historyEntry = {
      action: 'payment_submitted',
      performedBy: user?.fullName || 'Investor',
      role: 'Investor',
      message: `Investor submitted payment via ${paymentMethod}. UTR: ${utrNumber}`,
      createdAt: new Date().toISOString(),
    };

    const updates: any = {
      status: 'payment_submitted',
      paymentMethod,
      transactionId: utrNumber,
      paymentDate: new Date(),
      paymentNotes,
      agreementStatus: 'Signed',
      dueDiligenceStatus: 'Completed',
      history: [...(showPaymentModal.history || []), historyEntry],
      updatedAt: new Date().toISOString()
    };

    if (paymentProof) {
      updates.paymentProof = paymentProof;
    }

    if (paymentMethod === 'Bank Transfer') {
      updates.senderDetails = {
        bankName,
        accountNumber,
        accountHolderName
      };
    }

    try {
      const updated = await updateFundingOffer(offerId, updates);
      if (updated) {
        showToast('Payment submitted successfully! Awaiting Admin Verification.', 'success');
        
        // Notify Admin
        await addNotification({
          userId: 'admin',
          title: 'Investment Payment Submitted',
          message: `Investor ${user?.fullName} submitted payment proof for ${showPaymentModal.startupName} ($${showPaymentModal.offerAmount.toLocaleString()}).`,
          type: 'funding',
          actionUrl: '/dashboard/admin/investor-funding',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        // Notify Founder
        await addNotification({
          userId: showPaymentModal.founderId,
          title: 'Investment Payment Submitted',
          message: `Investor has submitted payment for your startup ${showPaymentModal.startupName}. Admin verification pending.`,
          type: 'funding',
          actionUrl: '/dashboard/founder/funding-transactions',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        refreshOffers();
        setShowPaymentModal(null);
        setSelectedFunding(null);
        
        // Reset Form Fields
        setUtrNumber('');
        setUpiId('');
        setBankName('');
        setAccountNumber('');
        setAccountHolderName('');
        setPaymentProof('');
        setPaymentNotes('');
      } else {
        showToast('Failed to update investment record.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error processing payment.', 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Metrics Calculations
  const metrics = React.useMemo(() => {
    let totalCommitted = 0;
    let pendingFunding = 0;
    let completedInvestments = 0;
    let totalTransactions = 0;

    myOffers.forEach(o => {
      const amt = o.offerAmount;
      if (o.status !== 'rejected' && o.status !== 'counter_offer') {
        totalCommitted += amt;
      }
      if (['offer_received', 'accepted', 'payment_pending', 'payment_submitted', 'under_verification'].includes(o.status)) {
        pendingFunding += amt;
      }
      if (o.status === 'funded' || o.status === 'completed') {
        completedInvestments += amt;
      }
      if (['payment_submitted', 'under_verification', 'funded', 'completed', 'failed'].includes(o.status)) {
        totalTransactions += 1;
      }
    });

    const remainingBudget = Math.max(0, totalBudget - totalCommitted);

    return {
      totalCommitted,
      pendingFunding,
      completedInvestments,
      totalTransactions,
      remainingBudget
    };
  }, [myOffers]);

  // Format currencies helper
  const formatVal = (val: number, cur: string = 'INR') => {
    const symbol = cur === 'INR' ? '₹' : '$';
    return `${symbol}${val.toLocaleString()}`;
  };

  // Map database status to client-friendly display statuses
  const getStatusText = (status: string) => {
    switch (status) {
      case 'offer_received': return 'Funding Pending';
      case 'accepted': return 'Payment Pending';
      case 'payment_submitted': return 'Payment Submitted';
      case 'under_verification': return 'Under Verification';
      case 'funded': return 'Funded';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'funded':
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'payment_submitted':
      case 'under_verification':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'accepted':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'rejected':
      case 'failed':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans">
      <InvestorSubNav activeTab="transactions" />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header and Quick Seed */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Wallet className="text-[#5B21B6]" size={28} /> Funding & Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Commit capital, process payments, and audit investment histories.
          </p>
        </div>
        
        {myOffers.length === 0 && (
          <button
            onClick={generateMockDeal}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#5B21B6] font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            + Seed Pending Deal (Demo)
          </button>
        )}
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Committed Capital</p>
          <p className="text-xl font-extrabold text-gray-900 mt-1.5">{formatVal(metrics.totalCommitted)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Funding</p>
          <p className="text-xl font-extrabold text-amber-500 mt-1.5">{formatVal(metrics.pendingFunding)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed Investments</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1.5">{formatVal(metrics.completedInvestments)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Transactions</p>
          <p className="text-xl font-extrabold text-[#5B21B6] mt-1.5">{metrics.totalTransactions}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-sm p-5 text-white">
          <p className="text-[10px] font-black text-purple-100 uppercase tracking-widest">Available Budget</p>
          <p className="text-xl font-extrabold text-white mt-1.5">{formatVal(metrics.remainingBudget)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('funding')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'funding' ? 'bg-white text-[#5B21B6] shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <TrendingUp size={14} /> Funding Commitments
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'transactions' ? 'bg-white text-[#5B21B6] shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard size={14} /> Transactions History
        </button>
      </div>

      {/* ─── TAB CONTENT: FUNDING COMMITMENTS ─── */}
      {activeTab === 'funding' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading commitments...</div>
          ) : myOffers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-700">No Funding Commitments Yet</p>
              <p className="text-xs text-gray-400 mt-1">Discover startups in the Marketplace to make investment offers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs font-medium">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="px-6 py-3.5">Startup</th>
                    <th className="px-6 py-3.5">Founder</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Investment Type</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Reference ID</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {myOffers.map((o) => (
                    <tr key={o.id || o._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{o.startupName}</td>
                      <td className="px-6 py-4">{o.founderName}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{formatVal(o.offerAmount, o.currency)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold border border-purple-100">
                          {o.instrument}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-500">
                        {o.transactionId || 'PENDING'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(o.status)}`}>
                          {getStatusText(o.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex gap-1.5 justify-end">
                        {o.status === 'accepted' && (
                          <button
                            onClick={() => setShowPaymentModal(o)}
                            className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-lg text-[10px] shadow-sm transition-all"
                          >
                            Fund / Make Payment
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedFunding(o)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px] transition-colors"
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
      )}

      {/* ─── TAB CONTENT: TRANSACTIONS HISTORY ─── */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading transactions...</div>
          ) : myOffers.filter(o => ['payment_submitted', 'under_verification', 'funded', 'completed', 'failed'].includes(o.status)).length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <CreditCard size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-700">No Transaction Records Found</p>
              <p className="text-xs text-gray-400 mt-1">Once you submit funding payments, your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs font-medium">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="px-6 py-3.5">Transaction ID</th>
                    <th className="px-6 py-3.5">Startup</th>
                    <th className="px-6 py-3.5">Founder</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Payment Method</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Reference / UTR</th>
                    <th className="px-6 py-3.5">Transaction Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {myOffers.filter(o => ['payment_submitted', 'under_verification', 'funded', 'completed', 'failed'].includes(o.status)).map((o) => (
                    <tr key={o.id || o._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-600 truncate max-w-[120px]">
                        TX-{new Date(o.paymentDate || o.updatedAt).getFullYear()}-{String(o._id || o.id).slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{o.startupName}</td>
                      <td className="px-6 py-4">{o.founderName}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{formatVal(o.offerAmount, o.currency)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1">
                          {o.paymentMethod === 'Card' ? <CreditCard size={12} /> : <Landmark size={12} />}
                          {o.paymentMethod || 'Manual Transfer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(o.paymentDate || o.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-600">
                        {o.transactionId || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(o.status)}`}>
                          {o.status === 'payment_submitted' || o.status === 'under_verification' ? 'Under Verification' : getStatusText(o.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedTx(o)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-[10px] transition-colors"
                        >
                          View Transaction
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

      {/* ─── MODAL 1: FUNDING DETAILS ─── */}
      {selectedFunding && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-xs text-left">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedFunding(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6 border-b border-gray-100">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(selectedFunding.status)}`}>
                Status: {getStatusText(selectedFunding.status)}
              </span>
              <h2 className="text-lg font-black text-gray-900 mt-2">{selectedFunding.startupName} Details</h2>
              <p className="text-gray-500 font-mono text-[10px] mt-0.5">Reference ID: {selectedFunding._id || selectedFunding.id}</p>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Startup & Founder Card */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Startup Information</span>
                  <p className="font-bold text-gray-900 text-sm mt-1">{selectedFunding.startupName}</p>
                  <p className="text-gray-500">Stage: {selectedFunding.fundingStage || 'Seed Round'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Founder Contact</span>
                  <p className="font-bold text-gray-900 text-sm mt-1">{selectedFunding.founderName}</p>
                  <p className="text-gray-500">{selectedFunding.founderEmail || 'founder@startup.com'}</p>
                </div>
              </div>

              {/* Financial Allocation Card */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/60 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase block">Investment Amount</span>
                  <strong className="text-base text-gray-900 font-extrabold">{formatVal(selectedFunding.offerAmount, selectedFunding.currency)}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase block">Equity Percentage</span>
                  <strong className="text-base text-gray-900 font-extrabold">{selectedFunding.equityPercentage}%</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase block">Instrument</span>
                  <strong className="text-base text-purple-700 font-extrabold">{selectedFunding.instrument}</strong>
                </div>
              </div>

              {/* Due Diligence & Agreements Statuses */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-100 p-3 rounded-xl bg-gray-50/30">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Due Diligence</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck size={14} className="text-emerald-500" /> Completed & Verified
                  </span>
                </div>
                <div className="border border-gray-100 p-3 rounded-xl bg-gray-50/30">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Agreement Status</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <FileCheck size={14} className="text-emerald-500" /> Fully Signed
                  </span>
                </div>
              </div>

              {/* Timeline Stepper */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-3">Funding Progress Timeline</span>
                <div className="relative pl-6 space-y-4 border-l border-gray-100 ml-3">
                  {[
                    { title: 'Funding Initiated', date: selectedFunding.createdAt, completed: true },
                    { title: 'Founder Accepted Offer', date: selectedFunding.history?.find((h: any) => h.action === 'accepted')?.createdAt, completed: !!selectedFunding.history?.find((h: any) => h.action === 'accepted') },
                    { title: 'Payment Submitted', date: selectedFunding.paymentDate, completed: ['payment_submitted', 'under_verification', 'funded', 'completed'].includes(selectedFunding.status) },
                    { title: 'Admin Verification', date: selectedFunding.history?.find((h: any) => h.action === 'verified')?.createdAt, completed: ['funded', 'completed'].includes(selectedFunding.status) },
                    { title: 'Funding Completed', date: selectedFunding.history?.find((h: any) => h.action === 'funded')?.createdAt, completed: ['funded', 'completed'].includes(selectedFunding.status) }
                  ].map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border font-bold text-[10px] ${
                        step.completed 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? '✓' : idx + 1}
                      </span>
                      <div>
                        <h4 className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h4>
                        {step.date && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(step.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-2 justify-end">
              {selectedFunding.status === 'accepted' && (
                <button
                  onClick={() => { setShowPaymentModal(selectedFunding); setSelectedFunding(null); }}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Fund / Make Payment
                </button>
              )}
              <button
                onClick={() => setSelectedFunding(null)}
                className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: TRANSACTION DETAILS ─── */}
      {selectedTx && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-xs text-left">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6 border-b border-gray-100">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(selectedTx.status)}`}>
                Verification: {selectedTx.status === 'payment_submitted' || selectedTx.status === 'under_verification' ? 'Under Verification' : getStatusText(selectedTx.status)}
              </span>
              <h2 className="text-lg font-black text-gray-900 mt-2">
                Transaction TX-{new Date(selectedTx.paymentDate || selectedTx.updatedAt).getFullYear()}-{String(selectedTx._id || selectedTx.id).slice(-6).toUpperCase()}
              </h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                <div>
                  <p className="text-gray-400 uppercase text-[9px] font-bold block">Startup</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{selectedTx.startupName}</p>
                  <p className="text-[10px] text-gray-500">Founder: {selectedTx.founderName}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-[9px] font-bold block">Investor</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{selectedTx.investorName}</p>
                  <p className="text-[10px] text-gray-500">{selectedTx.investorCompany}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                <div>
                  <p className="text-gray-400 uppercase text-[9px] font-bold">Paid Amount</p>
                  <p className="font-extrabold text-sm text-emerald-600 mt-0.5">{formatVal(selectedTx.offerAmount, selectedTx.currency)}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-[9px] font-bold">Payment Method</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedTx.paymentMethod || 'UPI'}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-[9px] font-bold">Reference / UTR</p>
                  <p className="font-mono font-bold text-gray-800 mt-0.5">{selectedTx.transactionId || 'N/A'}</p>
                </div>
              </div>

              {selectedTx.paymentProof && (
                <div>
                  <p className="text-gray-400 uppercase text-[9px] font-bold mb-1.5">Uploaded Proof of Payment</p>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50 flex justify-center p-3 relative group max-h-[160px]">
                    <img
                      src={selectedTx.paymentProof}
                      alt="Payment Receipt"
                      className="object-contain max-h-[140px] rounded-lg transition-transform hover:scale-105 duration-200"
                    />
                  </div>
                </div>
              )}

              {selectedTx.adminNote && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-purple-900 font-medium">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-purple-400 mb-1">Admin Audit Notes</p>
                  <p className="italic">"{selectedTx.adminNote}"</p>
                </div>
              )}

              {/* Progress Timeline Stepper */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-3">Timeline Event Logs</span>
                <div className="relative pl-6 space-y-4 border-l border-gray-100 ml-3">
                  {[
                    { title: 'Funding Initiated', msg: 'Funding committed and agreement signed.', date: selectedTx.createdAt, completed: true },
                    { title: 'Payment Submitted', msg: `Payment reference ${selectedTx.transactionId} uploaded.`, date: selectedTx.paymentDate || selectedTx.updatedAt, completed: true },
                    { title: 'Admin Verification', msg: selectedTx.adminNote || 'Checking reference transaction logs.', date: selectedTx.history?.find((h: any) => h.action === 'verified')?.createdAt, completed: ['funded', 'completed'].includes(selectedTx.status) },
                    { title: 'Funding Completed', msg: 'Funds confirmed on-ledger. Allocation finalized.', date: selectedTx.history?.find((h: any) => h.action === 'funded')?.createdAt, completed: ['funded', 'completed'].includes(selectedTx.status) }
                  ].map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border font-bold text-[10px] ${
                        step.completed 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? '✓' : idx + 1}
                      </span>
                      <div>
                        <h4 className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{step.msg}</p>
                        {step.date && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(step.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: PAYMENT WORKFLOW FLOW ─── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-xs text-left">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative my-8 max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPaymentModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-black text-gray-900">Process Investment Funding</h2>
              <p className="text-gray-500 mt-0.5">Send committed allocation funds to {showPaymentModal.startupName}.</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
              {/* Payment Summary Box */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
                <div>
                  <p className="text-purple-400 font-bold uppercase text-[9px] block">Funding Amount</p>
                  <p className="text-xl font-black text-emerald-600 mt-0.5">{formatVal(showPaymentModal.offerAmount, showPaymentModal.currency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold uppercase text-[9px] block">Instrument</p>
                  <p className="font-bold text-gray-900 mt-0.5">{showPaymentModal.instrument}</p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-2">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'UPI', label: 'UPI / VPA', icon: IndianRupee },
                    { id: 'Bank Transfer', label: 'Bank / IMPS', icon: Landmark },
                    { id: 'Card', label: 'Credit Card', icon: CreditCard }
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3.5 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-[11px] font-bold ${
                          isSelected 
                            ? 'border-[#5B21B6] bg-purple-50/40 text-[#5B21B6] shadow-sm' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={18} />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditionally Render: UPI Payment Form */}
              {paymentMethod === 'UPI' && (
                <div className="space-y-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                  <div className="flex flex-col items-center p-3 bg-white border border-gray-100 rounded-xl shadow-xs w-fit mx-auto">
                    {/* SVG Mock QR Code */}
                    <svg width="100" height="100" viewBox="0 0 100 100" className="text-gray-900">
                      <rect width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="10" y="10" width="10" height="10" fill="white" />
                      <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="80" y="10" width="10" height="10" fill="white" />
                      <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                      <rect x="10" y="80" width="10" height="10" fill="white" />
                      {/* Random QR elements */}
                      <rect x="35" y="15" width="10" height="30" fill="currentColor" />
                      <rect x="55" y="5" width="15" height="10" fill="currentColor" />
                      <rect x="50" y="25" width="20" height="15" fill="currentColor" />
                      <rect x="30" y="55" width="20" height="20" fill="currentColor" />
                      <rect x="60" y="50" width="15" height="35" fill="currentColor" />
                      <rect x="15" y="35" width="15" height="15" fill="currentColor" />
                      <rect x="80" y="75" width="15" height="15" fill="currentColor" />
                    </svg>
                    <span className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-widest">Scan QR to Pay</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Standard UPI Virtual Payment Address (VPA)</label>
                    <div className="p-2.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-800 select-all cursor-pointer flex justify-between items-center">
                      <span>funding@forgeindiaconnect</span>
                      <span className="text-[10px] text-purple-600 uppercase font-black">Copy</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Enter Your UPI ID / VPA used</label>
                    <input
                      type="text"
                      placeholder="e.g. rakesh@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    />
                  </div>
                </div>
              )}

              {/* Conditionally Render: Bank Transfer Form */}
              {paymentMethod === 'Bank Transfer' && (
                <div className="space-y-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                  <div className="bg-white p-3 rounded-lg border border-gray-100 text-[11px] font-semibold text-gray-700">
                    <p className="font-black text-purple-700 uppercase text-[9px] mb-1.5 tracking-wider">Escrow Account Bank Details</p>
                    <p>Bank: <strong className="text-gray-900">HDFC Bank Limited</strong></p>
                    <p>Account Name: <strong className="text-gray-900">ForgeIndiaConnect Escrow A/C</strong></p>
                    <p>Account Number: <strong className="text-gray-900">50200084321098</strong></p>
                    <p>IFSC Code: <strong className="text-gray-900">HDFC0000240</strong></p>
                    <p>Branch: <strong className="text-gray-900">Koramangala, Bangalore</strong></p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Your Bank Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. ICICI Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        required={paymentMethod === 'Bank Transfer'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Sender Account Holder Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rakesh Kumar"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        required={paymentMethod === 'Bank Transfer'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Your Account Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 10098432104"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                      required={paymentMethod === 'Bank Transfer'}
                    />
                  </div>
                </div>
              )}

              {/* Conditionally Render: Card Form */}
              {paymentMethod === 'Card' && (
                <div className="space-y-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Card Holder Name</label>
                      <input
                        type="text"
                        placeholder="Rakesh Kumar"
                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4320 0081 2341 0984"
                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UTR / Transaction ID Reference Field (Required for all offline flows) */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Transaction ID / UTR / Reference Number *</label>
                <input
                  type="text"
                  placeholder="e.g. UTR843210984321"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Copy and paste the transaction UTR reference code from your bank/UPI application.</span>
              </div>

              {/* Receipt File Upload */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Upload Payment Proof / Receipt</label>
                <div className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-100/40 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {paymentProof ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={paymentProof}
                        alt="Proof Preview"
                        className="max-h-[80px] object-cover rounded-lg mb-2"
                      />
                      <span className="text-[10px] text-emerald-600 font-bold">Image loaded successfully ✓</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={22} className="text-gray-400 mb-1" />
                      <span className="font-semibold text-gray-600 text-xs">Choose or drag receipt file</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Supports PNG, JPG, or PDF (Max 2MB)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="Add details about transfer timing, references, syndicate participants, etc."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-2 justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowPaymentModal(null)}
                className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={isSubmittingPayment}
                className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {isSubmittingPayment ? 'Submitting...' : 'Submit Payment / UTR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorTransactions;
