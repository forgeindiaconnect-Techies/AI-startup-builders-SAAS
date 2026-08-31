import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Wallet, ShieldCheck, CheckCircle2, AlertCircle, Search, 
  X, Mail, Building, MapPin, Calendar, FileText, Landmark,
  TrendingUp, Clock, HelpCircle, Ban, RefreshCw, FileDown, Eye,
  Coins, Percent, Calculator, QrCode, Smartphone, CreditCard, Copy, Check
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import { updateFundingOffer, addNotification } from '../../../utils/localStorageHelper';

const handleDownloadFile = (base64Data: string, filename: string) => {
  if (!base64Data) return;
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename || 'document.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AdminInvestorFunding: React.FC = () => {
  const { offers, loading, refreshOffers, markAsFunded, verifyOffer } = useFunding();
  const { user } = useAuth();
  const adminName = user?.fullName || 'Admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'approved' | 'pending' | 'completed' | 'rejected'>('All');
  
  // Selected transaction for details modal
  const [selectedTx, setSelectedTx] = useState<FundingOffer | null>(null);

  // Inline status dropdown
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setOpenStatusDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  
  // Commission Modal State
  const [commissionModalTx, setCommissionModalTx] = useState<FundingOffer | null>(null);
  const [commissionRateInput, setCommissionRateInput] = useState<number>(2);
  const [commissionAmountInput, setCommissionAmountInput] = useState<string>('');
  const [commissionNotesInput, setCommissionNotesInput] = useState<string>('');

  // Payment Options State for Fixed Commission
  const [commissionPaymentMode, setCommissionPaymentMode] = useState<'bank' | 'upi_qr' | 'both'>('bank');
  const [bankAccountHolder, setBankAccountHolder] = useState('AI Startup Builder Platform');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState('9990018472901');
  const [bankIfscCode, setBankIfscCode] = useState('HDFC0001234');
  const [paytmUpi, setPaytmUpi] = useState('admin.aistartup@paytm');
  const [gpayUpi, setGpayUpi] = useState('admin.aistartup@okicici');
  const [phonepeUpi, setPhonepeUpi] = useState('admin.aistartup@ybl');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'paytm' | 'phonepe' | 'all'>('gpay');

  // Actions states
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [showActionBox, setShowActionBox] = useState<'verify' | 'completed' | 'reject' | 'approve' | 'clarify' | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Quick inline status change from the dropdown badge
  const handleQuickStatusChange = async (offer: FundingOffer, newAgreementStatus: string) => {
    setOpenStatusDropdown(null);
    const offerId = offer._id || offer.id;
    const statusMap: Record<string, string> = {
      'Approved — Sent to Founder & Investor': 'accepted',
      'Pending Admin Approval': 'offer_received',
      'Rejected': 'rejected',
    };
    const newStatus = statusMap[newAgreementStatus] || offer.status;
    const auditEntry = {
      action: newAgreementStatus,
      performedBy: adminName,
      role: 'Admin',
      notes: `Admin changed agreement status to "${newAgreementStatus}".`,
      timestamp: new Date().toISOString(),
    };
    const updates: any = {
      agreementStatus: newAgreementStatus,
      status: newStatus,
      adminNote: `Status changed to ${newAgreementStatus} by Admin.`,
      agreementAuditTrail: [...(offer.agreementAuditTrail || []), auditEntry],
      history: [...(offer.history || []), {
        action: newAgreementStatus.toLowerCase().replace(/ /g, '_'),
        performedBy: adminName,
        role: 'Admin',
        message: `Admin updated agreement status to "${newAgreementStatus}".`,
        createdAt: new Date().toISOString(),
      }],
      updatedAt: new Date().toISOString(),
    };
    await updateFundingOffer(offerId, updates);
    // Notify founder
    if (offer.founderId) {
      await addNotification({
        userId: offer.founderId,
        title: `Agreement ${newAgreementStatus}`,
        message: `Admin updated your investment agreement for "${offer.startupName}" to: ${newAgreementStatus}.`,
        type: 'funding',
        actionUrl: '/dashboard/founder/investor-agreement',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
    // Notify investor
    if (offer.investorId) {
      await addNotification({
        userId: offer.investorId,
        title: `Agreement ${newAgreementStatus}`,
        message: `Admin updated the agreement status for "${offer.startupName}" to: ${newAgreementStatus}.`,
        type: 'funding',
        actionUrl: '/dashboard/investor/agreement',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
    showToast(`Status updated to "${newAgreementStatus}" ✓`);
    await refreshOffers();
  };

  // Filter offers
  const filteredOffers = useMemo(() => {
    return offers.filter(o => {
      const matchesSearch =
        o.startupName.toLowerCase().includes(search.toLowerCase()) ||
        o.founderName.toLowerCase().includes(search.toLowerCase()) ||
        o.investorName.toLowerCase().includes(search.toLowerCase()) ||
        (o.investorCompany && o.investorCompany.toLowerCase().includes(search.toLowerCase())) ||
        (o.id || o._id || '').toLowerCase().includes(search.toLowerCase());

      let matchesTab = false;
      if (statusFilter === 'All') {
        matchesTab = true;
      } else if (statusFilter === 'approved') {
        // Deals where agreement has been approved by admin
        matchesTab = (o.agreementStatus || '').toLowerCase().includes('approved');
      } else if (statusFilter === 'pending') {
        // Deals waiting for admin approval
        matchesTab = o.agreementStatus === 'Pending Admin Approval' ||
          (!o.agreementStatus && !['completed', 'funded', 'rejected', 'failed'].includes(o.status));
      } else if (statusFilter === 'completed') {
        matchesTab = ['completed', 'funded', 'payment_submitted', 'under_verification', 'accepted'].includes(o.status) || !!o.paymentStatus || !!o.paymentMethod;
      } else if (statusFilter === 'rejected') {
        matchesTab = o.status === 'rejected' || o.status === 'failed';
      }

      return matchesSearch && matchesTab;
    });
  }, [offers, search, statusFilter]);

  // Summary Metrics calculations
  const summary = useMemo(() => {
    let totalTransactions = offers.length;
    let completedFunding = 0;
    let totalAmount = 0;
    let totalCommission = 0;

    offers.forEach(o => {
      totalAmount += o.offerAmount;
      const rate = o.commissionRate ?? 2;
      const commAmt = o.commissionAmount ?? Math.round(o.offerAmount * (rate / 100));
      totalCommission += commAmt;

      if (['completed', 'funded', 'payment_submitted', 'under_verification', 'accepted'].includes(o.status) || o.paymentStatus || o.paymentMethod) {
        completedFunding += 1;
      }
    });

    return {
      totalTransactions,
      completedFunding,
      totalAmount,
      totalCommission
    };
  }, [offers]);

  // Open Fix Platform Commission Modal
  const openCommissionModal = (tx: FundingOffer) => {
    const defaultRate = tx.commissionRate ?? 2;
    const calcAmount = Math.round(tx.offerAmount * (defaultRate / 100));
    const defaultAmount = (tx.commissionAmount !== undefined && tx.commissionAmount !== null && tx.commissionAmount > 0)
      ? tx.commissionAmount
      : calcAmount;
    setCommissionModalTx(tx);
    setCommissionRateInput(defaultRate);
    setCommissionAmountInput(String(defaultAmount));
    setCommissionNotesInput(tx.commissionNotes || `Platform commission set for investment of ₹${tx.offerAmount.toLocaleString('en-IN')}`);
    setCommissionPaymentMode(tx.commissionPaymentMode || 'bank');
    setBankAccountHolder(tx.commissionBankDetails?.accountHolder || 'AI Startup Builder Platform');
    setBankName(tx.commissionBankDetails?.bankName || 'HDFC Bank');
    setBankAccountNumber(tx.commissionBankDetails?.accountNumber || '9990018472901');
    setBankIfscCode(tx.commissionBankDetails?.ifscCode || 'HDFC0001234');
    setPaytmUpi(tx.commissionUpiDetails?.paytmUpi || 'admin.aistartup@paytm');
    setGpayUpi(tx.commissionUpiDetails?.gpayUpi || 'admin.aistartup@okicici');
    setPhonepeUpi(tx.commissionUpiDetails?.phonepeUpi || 'admin.aistartup@ybl');
    setSelectedUpiApp(tx.commissionUpiDetails?.selectedUpiApp || 'gpay');
  };

  // Save Platform Commission Action
  const handleSaveCommission = async () => {
    if (!commissionModalTx) return;
    const txId = commissionModalTx._id || commissionModalTx.id;
    setActionLoading(true);
    try {
      const rate = Number(commissionRateInput) || 0;
      const amount = Number(commissionAmountInput) || Math.round(commissionModalTx.offerAmount * (rate / 100));
      
      const historyEntry = {
        action: 'commission_fixed',
        performedBy: adminName,
        role: 'Admin',
        message: `Admin fixed platform commission to ₹${amount.toLocaleString('en-IN')} (${rate}%). Payment Options configured: ${commissionPaymentMode.toUpperCase()} (${selectedUpiApp.toUpperCase()}).`,
        createdAt: new Date().toISOString(),
      };

      const updates = {
        commissionRate: rate,
        commissionAmount: amount,
        commissionNotes: commissionNotesInput || `Platform commission fixed by Admin for investment of ₹${commissionModalTx.offerAmount.toLocaleString('en-IN')}`,
        commissionUpdatedAt: new Date().toISOString(),
        commissionFixedBy: adminName,
        commissionStatus: 'Fixed' as const,
        commissionPaymentMode,
        commissionBankDetails: {
          accountHolder: bankAccountHolder,
          bankName,
          accountNumber: bankAccountNumber,
          ifscCode: bankIfscCode,
        },
        commissionUpiDetails: {
          selectedUpiApp,
          paytmUpi,
          gpayUpi,
          phonepeUpi,
        },
        history: [...(commissionModalTx.history || []), historyEntry],
        updatedAt: new Date().toISOString(),
      };

      await updateFundingOffer(txId, updates);

      // Notify investor and founder
      if (commissionModalTx.investorId) {
        await addNotification({
          userId: commissionModalTx.investorId,
          title: `Platform Commission Fixed 💼`,
          message: `Admin fixed platform commission for ${commissionModalTx.startupName} investment: ₹${amount.toLocaleString('en-IN')} (${rate}%). Payment options (Bank & Paytm/GPay/PhonePe QR) are now available.`,
          type: 'funding',
          actionUrl: '/dashboard/investor/transactions',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      showToast(`Platform Commission fixed to ₹${amount.toLocaleString('en-IN')} (${rate}%) with Payment Options!`);
      await refreshOffers();
      setCommissionModalTx(null);

      if (selectedTx && ((selectedTx._id && selectedTx._id === txId) || (selectedTx.id && selectedTx.id === txId))) {
        setSelectedTx({ ...selectedTx, ...updates });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save commission', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Safe fetch properties
  const getTxId = (tx: FundingOffer) => tx._id || tx.id || 'N/A';

  // Handle Admin Status Update Actions
  const handleAction = async (actionType: 'approve' | 'reject' | 'verify' | 'completed' | 'clarify') => {
    if (!selectedTx) return;
    const txId = selectedTx._id || selectedTx.id;
    setActionLoading(true);
    try {
      if (actionType === 'verify' || actionType === 'completed') {
        const historyEntry = {
          action: 'completed',
          performedBy: adminName,
          role: 'Admin',
          message: 'Admin verified payment reference, UTR compliance, and signatures, marking deal as completed.',
          createdAt: new Date().toISOString(),
        };
        const updates = {
          status: 'completed' as const,
          paymentStatus: 'Completed',
          verificationStatus: 'Verified',
          adminNote: adminNoteInput || selectedTx.adminNote || 'Admin verified compliance and UTR reference.',
          history: [...selectedTx.history, historyEntry],
          updatedAt: new Date().toISOString(),
        };
        await updateFundingOffer(txId, updates);
        
        // Notify both parties
        if (selectedTx.founderId) {
          await addNotification({
            userId: selectedTx.founderId,
            title: `Funding Completed ✓`,
            message: `Admin verified your funding payment from ${selectedTx.investorCompany || selectedTx.investorName} (₹${selectedTx.offerAmount.toLocaleString('en-IN')}) as Completed!`,
            type: 'funding',
            actionUrl: '/dashboard/founder/funding',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
        if (selectedTx.investorId) {
          await addNotification({
            userId: selectedTx.investorId,
            title: `Funding Completed ✓`,
            message: `Admin verified your ₹${selectedTx.offerAmount.toLocaleString('en-IN')} investment in ${selectedTx.startupName} as Completed!`,
            type: 'funding',
            actionUrl: '/dashboard/investor/portfolio-hub',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
        showToast('Payment verified and funding marked as Completed!');
      } else if (actionType === 'clarify') {
        const historyEntry = {
          action: 'clarification_requested',
          performedBy: adminName,
          role: 'Admin',
          message: 'Admin requested clarification regarding the payment transfer.',
          createdAt: new Date().toISOString(),
        };
        const updates = {
          verificationStatus: 'Clarification Requested',
          status: 'under_verification' as const,
          adminNote: adminNoteInput || 'Admin requested clarification regarding transaction details.',
          history: [...selectedTx.history, historyEntry],
          updatedAt: new Date().toISOString(),
        };
        await updateFundingOffer(txId, updates);

        // Notify both parties
        if (selectedTx.founderId) {
          await addNotification({
            userId: selectedTx.founderId,
            title: `Clarification Requested`,
            message: `Admin requested clarification on the payment for ${selectedTx.startupName}. Note: ${updates.adminNote}`,
            type: 'funding',
            actionUrl: '/dashboard/founder/funding',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
        if (selectedTx.investorId) {
          await addNotification({
            userId: selectedTx.investorId,
            title: `Clarification Requested`,
            message: `Admin requested clarification on your payment for ${selectedTx.startupName}. Note: ${updates.adminNote}`,
            type: 'funding',
            actionUrl: '/dashboard/investor/transactions',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      } else if (actionType === 'reject') {
        const isAgreementPending = selectedTx.agreementStatus === 'Pending Admin Approval';
        const rejectionReason = adminNoteInput.trim() || 'Agreement terms require revision by Investor.';
        
        const historyEntry = {
          action: isAgreementPending ? 'agreement_rejected_by_admin' : 'rejected_by_admin',
          performedBy: adminName,
          role: 'Admin',
          message: isAgreementPending 
            ? `Admin rejected investment agreement. Reason: ${rejectionReason}`
            : `Admin rejected funding deal/payment. Reason: ${rejectionReason}`,
          createdAt: new Date().toISOString(),
        };

        const auditTrail = selectedTx.agreementAuditTrail || [];
        auditTrail.push({
          action: 'Rejected by Admin',
          performedBy: adminName,
          role: 'Admin',
          notes: `Rejection Reason: ${rejectionReason}`,
          timestamp: new Date().toISOString()
        });

        const updates: any = {
          status: 'rejected' as const,
          verificationStatus: 'Rejected',
          agreementStatus: isAgreementPending ? 'Admin Rejected' : selectedTx.agreementStatus,
          adminNote: rejectionReason,
          agreementAuditTrail: auditTrail,
          history: [...selectedTx.history, historyEntry],
          updatedAt: new Date().toISOString(),
        };
        await updateFundingOffer(txId, updates);

        // Notify Investor of Rejection
        if (selectedTx.investorId) {
          await addNotification({
            userId: selectedTx.investorId,
            title: `❌ Investment Agreement Rejected by Admin`,
            message: `Investment agreement ${selectedTx.agreementId || ''} for ${selectedTx.startupName} was rejected by Admin. Reason: ${rejectionReason}`,
            type: 'funding',
            actionUrl: '/dashboard/investor/agreement',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }

        // Admin Notification Log
        await addNotification({
          userId: 'admin',
          title: 'Agreement Rejected',
          message: `Investment agreement ${selectedTx.agreementId || ''} was rejected. Reason: ${rejectionReason}`,
          type: 'funding',
          actionUrl: '/dashboard/admin/investor-funding',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        showToast('Agreement/Funding rejected and notification sent.', 'error');
      } else if (actionType === 'approve') {
        const isAgreementPending = selectedTx.agreementStatus === 'Pending Admin Approval' || !selectedTx.agreementStatus || selectedTx.agreementStatus === 'Draft';
        
        const historyEntry = {
          action: isAgreementPending ? 'agreement_approved_by_admin' : 'approved_by_admin',
          performedBy: adminName,
          role: 'Admin',
          message: isAgreementPending ? 'Admin approved investment agreement and dispatched to Founder.' : 'Admin reactivated funding deal.',
          createdAt: new Date().toISOString(),
        };

        const auditTrail = selectedTx.agreementAuditTrail || [];
        auditTrail.push({
          action: 'Approved by Admin',
          performedBy: adminName,
          role: 'Admin',
          notes: 'Agreement approved and dispatched to Founder for signature.',
          timestamp: new Date().toISOString()
        });

        const updates: any = {
          verificationStatus: 'Approved',
          agreementStatus: 'Approved — Sent to Founder',
          fundingLockStatus: 'locked',
          agreementAuditTrail: auditTrail,
          history: [...selectedTx.history, historyEntry],
          updatedAt: new Date().toISOString(),
        };

        if (selectedTx.status === 'rejected') {
          updates.status = 'accepted';
        }

        await updateFundingOffer(txId, updates);

        // Notify Founder
        if (selectedTx.founderId) {
          await addNotification({
            userId: selectedTx.founderId,
            title: `✍️ New Investment Agreement Received`,
            message: `Admin approved the investment agreement for ${selectedTx.startupName} (₹${selectedTx.offerAmount.toLocaleString('en-IN')}). Please review and sign.`,
            type: 'funding',
            actionUrl: '/dashboard/founder/agreement',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }

        // Notify Investor
        if (selectedTx.investorId) {
          await addNotification({
            userId: selectedTx.investorId,
            title: `✅ Agreement Approved by Admin`,
            message: `Investment agreement ${selectedTx.agreementId || ''} has been approved by Admin and sent to Founder.`,
            type: 'funding',
            actionUrl: '/dashboard/investor/agreement',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }

        // Admin Log Notification
        await addNotification({
          userId: 'admin',
          title: 'Agreement Approved',
          message: `Investment agreement ${selectedTx.agreementId || ''} has been approved.`,
          type: 'funding',
          actionUrl: '/dashboard/admin/investor-funding',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        showToast('Investment agreement approved and sent to Founder!');
      }

      await refreshOffers();
      setSelectedTx(null);
      setShowActionBox(null);
      setAdminNoteInput('');
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up pb-10 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet size={26} className="text-[#5B21B6]" /> Investor Funding &amp; Platform Commission
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Monitor investor payment commitments, verify transfer proofs, fix platform commissions, and manage manual &amp; QR payment options.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Deals</span>
            <div className="p-2 bg-purple-50 text-[#5B21B6] rounded-xl"><Wallet size={18} /></div>
          </div>
          <p className="text-2xl font-black text-gray-900">{summary.totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-0.5">₹{(summary.totalAmount / 100000).toFixed(2)} Lakhs Total</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed / Verified</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={18} /></div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{summary.completedFunding}</p>
          <p className="text-xs text-gray-500 mt-0.5">Verified completed deals</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Ratio</span>
            <div className="p-2 bg-purple-50 text-[#5B21B6] rounded-xl"><TrendingUp size={18} /></div>
          </div>
          <p className="text-2xl font-black text-[#5B21B6]">
            {summary.totalTransactions > 0 ? Math.round((summary.completedFunding / summary.totalTransactions) * 100) : 100}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Success completion rate</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Platform Commission</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><Coins size={18} /></div>
          </div>
          <p className="text-2xl font-black text-emerald-700">₹{summary.totalCommission.toLocaleString('en-IN')}</p>
          <p className="text-xs text-emerald-600 font-bold mt-0.5">Admin Platform Earnings</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search startup, investor, founder, or TXN ref..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'All',       label: 'All Transactions' },
            { id: 'pending',   label: 'Pending' },
            { id: 'approved',  label: 'Approved' },
            { id: 'completed', label: 'Completed' },
            { id: 'rejected',  label: 'Rejected' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === t.id
                  ? t.id === 'pending'   ? 'bg-amber-500 text-white shadow-md'
                  : t.id === 'approved'  ? 'bg-blue-600 text-white shadow-md'
                  : t.id === 'completed' ? 'bg-emerald-600 text-white shadow-md'
                  : t.id === 'rejected'  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-[#5B21B6] text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Funding Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Startup &amp; Founder</th>
                <th className="px-5 py-3.5">Investor &amp; Firm</th>
                <th className="px-5 py-3.5">Investment Amount</th>
                <th className="px-5 py-3.5">Platform Commission</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No investor funding transactions found.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((o) => {
                  const rate = o.commissionRate ?? 2;
                  const commAmt = o.commissionAmount ?? Math.round(o.offerAmount * (rate / 100));

                  return (
                    <tr key={o.id || o._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Startup & Founder */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{o.startupName}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Founder: {o.founderName}</p>
                        </div>
                      </td>

                      {/* Investor & Firm */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{o.investorName}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{o.investorCompany || 'Individual Investor'}</p>
                        </div>
                      </td>

                      {/* Investment Amount */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-black text-gray-900 text-sm">₹{o.offerAmount.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-purple-700 font-bold mt-0.5">{o.instrument || 'Equity'} • {o.equityPercentage}%</p>
                        </div>
                      </td>

                      {/* Platform Commission */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-black text-emerald-700 text-xs">₹{commAmt.toLocaleString('en-IN')}</p>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-[#5B21B6] border border-purple-100 inline-block mt-0.5">
                            {rate}% Fee
                          </span>
                        </div>
                      </td>

                      {/* Status — clickable dropdown */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {(() => {
                          const offerId = o._id || o.id || '';
                          const agStatus = o.agreementStatus;
                          const isApproved = agStatus && agStatus.toLowerCase().includes('approved');
                          const isPending  = agStatus === 'Pending Admin Approval';
                          const isSigned   = agStatus === 'Fully Signed';
                          const isDone     = o.status === 'completed' || o.status === 'funded';
                          const isRejected = o.status === 'rejected' || o.status === 'failed' || agStatus === 'Rejected';
                          const label = agStatus || (isDone ? 'Completed' : isRejected ? 'Rejected' : 'Pending Verification');
                          const cls = isDone || isSigned
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isRejected
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isApproved
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200';
                          return (
                            <div className="relative inline-block" ref={openStatusDropdown === offerId ? statusDropdownRef : undefined}>
                              <button
                                onClick={() => setOpenStatusDropdown(openStatusDropdown === offerId ? null : offerId)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${cls}`}
                                title="Click to change status"
                              >
                                {label}
                                <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                              </button>
                              {openStatusDropdown === offerId && (
                                <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                                  <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider px-3 pt-2 pb-1">Change Status</p>
                                  {[
                                    { label: 'Approved — Sent to Founder & Investor', color: 'text-blue-700 hover:bg-blue-50', dot: 'bg-blue-500' },
                                    { label: 'Pending Admin Approval',                 color: 'text-amber-700 hover:bg-amber-50', dot: 'bg-amber-500' },
                                    { label: 'Rejected',                               color: 'text-red-700 hover:bg-red-50', dot: 'bg-red-500' },
                                  ].map(opt => (
                                    <button
                                      key={opt.label}
                                      onClick={() => handleQuickStatusChange(o, opt.label)}
                                      className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${opt.color} ${
                                        label === opt.label ? 'opacity-40 cursor-default pointer-events-none' : ''
                                      }`}
                                    >
                                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                                      {opt.label}
                                    </button>
                                  ))}
                                  <div className="border-t border-gray-100 mx-2 my-1" />
                                  <button
                                    onClick={() => setOpenStatusDropdown(null)}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openCommissionModal(o)}
                            title="Fix Platform Commission & Payment Options"
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Coins size={13} /> Fix Commission
                          </button>
                          <button
                            onClick={() => setSelectedTx(o)}
                            title="View Full Deal Audit & Payment Details"
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] border border-purple-200 rounded-lg font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye size={13} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEAL DETAILS & AUDIT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] text-xs my-4">
            <div className="bg-gradient-to-r from-[#5B21B6] via-[#6C4CF1] to-[#7C3AED] px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <ShieldCheck size={20} className="text-purple-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">{selectedTx.startupName} — Investment Deal</h3>
                  <p className="text-xs text-purple-200 font-mono">{selectedTx.agreementId || getTxId(selectedTx)} &bull; {selectedTx.agreementVersion || 'v1.0'}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedTx(null); setShowActionBox(null); setAdminNoteInput(''); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-purple-100 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status bar */}
            <div className={`px-6 py-2 flex items-center gap-2 text-xs font-bold border-b flex-shrink-0 ${
              selectedTx.agreementStatus === 'Pending Admin Approval'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : (selectedTx.agreementStatus || '').includes('Approved')
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : selectedTx.agreementStatus === 'Fully Signed'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              <span className="uppercase tracking-wider">Agreement Status:</span>
              <span>{selectedTx.agreementStatus || selectedTx.status || 'Pending Verification'}</span>
              <span className="ml-auto">{selectedTx.fundingLockStatus === 'locked' ? '🔒 Funding Locked' : '🔓 Funding Enabled'}</span>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Investment', value: `₹${(selectedTx.offerAmount || 0).toLocaleString('en-IN')}`, color: 'text-[#5B21B6]' },
                  { label: 'Equity', value: `${selectedTx.equityPercentage || 0}%`, color: 'text-indigo-700' },
                  { label: 'Instrument', value: selectedTx.instrument || (selectedTx.agreementDetails as any)?.fundingType || 'SAFE', color: 'text-gray-900' },
                  { label: 'Commission', value: `₹${(selectedTx.commissionAmount ?? Math.round((selectedTx.offerAmount || 0) * ((selectedTx.commissionRate ?? 2) / 100))).toLocaleString('en-IN')}`, color: 'text-emerald-700' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">{m.label}</p>
                    <p className={`text-base font-black mt-0.5 ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4">
                  <p className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider mb-2">Startup</p>
                  <p className="font-black text-gray-900">{selectedTx.startupName}</p>
                  <p className="text-gray-500 mt-0.5">Founder: {selectedTx.founderName}</p>
                  {selectedTx.founderEmail && <p className="text-gray-400 mt-0.5">{selectedTx.founderEmail}</p>}
                  {selectedTx.businessCategory && <p className="text-purple-700 font-bold mt-1 text-[10px] uppercase">{selectedTx.businessCategory}</p>}
                </div>
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4">
                  <p className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider mb-2">Investor</p>
                  <p className="font-black text-gray-900">{selectedTx.investorName}</p>
                  <p className="text-gray-500 mt-0.5">{selectedTx.investorCompany || 'Individual Investor'}</p>
                  {selectedTx.investorEmail && <p className="text-gray-400 mt-0.5">{selectedTx.investorEmail}</p>}
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-2">Agreement Info</p>
                  <div className="space-y-1">
                    {([
                      ['Agreement ID', selectedTx.agreementId],
                      ['Version', selectedTx.agreementVersion || 'v1.0'],
                      ['Type', selectedTx.agreementType],
                      ['Method', selectedTx.creationMethod],
                      ['Category', selectedTx.businessCategory],
                      ['Date', selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleDateString('en-IN') : null],
                    ] as [string, string | null | undefined][]).filter(([, v]) => v).map(([label, val]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-bold text-gray-900 capitalize">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Terms */}
              {((selectedTx.agreementDetails as any)?.agreementContent || (selectedTx.agreementDetails as any)?.investmentTerms || selectedTx.investorMessage) && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-2">Agreement Terms / Content</p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs">
                    {(selectedTx.agreementDetails as any)?.agreementContent || (selectedTx.agreementDetails as any)?.investmentTerms || selectedTx.investorMessage}
                  </p>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-2xl p-3 border ${selectedTx.investorSignedAt ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Investor Signature</p>
                  {selectedTx.investorSignedAt
                    ? <><p className="font-bold text-emerald-700 mt-0.5">Signed — {selectedTx.investorSignatureName}</p><p className="text-gray-400">{new Date(selectedTx.investorSignedAt).toLocaleDateString('en-IN')}</p></>
                    : <p className="font-bold text-amber-600 mt-0.5">Pending</p>}
                </div>
                <div className={`rounded-2xl p-3 border ${selectedTx.founderSignedAt ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Founder Signature</p>
                  {selectedTx.founderSignedAt
                    ? <><p className="font-bold text-emerald-700 mt-0.5">Signed — {selectedTx.founderSignatureName}</p><p className="text-gray-400">{new Date(selectedTx.founderSignedAt).toLocaleDateString('en-IN')}</p></>
                    : <p className="font-bold text-amber-600 mt-0.5">Pending</p>}
                </div>
              </div>

              {/* Audit Trail */}
              {selectedTx.agreementAuditTrail && selectedTx.agreementAuditTrail.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-2">Audit Trail</p>
                  <div className="space-y-2">
                    {selectedTx.agreementAuditTrail.map((entry: any, idx: number) => (
                      <div key={idx} className="flex gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-900">{entry.action}</span>
                            <span className="text-gray-400">{entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('en-IN') : ''}</span>
                          </div>
                          <p className="text-gray-500 mt-0.5">{entry.performedBy} ({entry.role})</p>
                          {entry.notes && <p className="text-gray-400 mt-0.5">{entry.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {selectedTx.agreementStatus === 'Pending Admin Approval' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider mb-3">Admin Actions</p>
                  {!showActionBox ? (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setShowActionBox('approve')} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Approve &amp; Send to Founder
                      </button>
                      <button onClick={() => setShowActionBox('reject')} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5">
                        <Ban size={13} /> Reject
                      </button>
                      <button onClick={() => setShowActionBox('clarify')} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5">
                        <HelpCircle size={13} /> Request Clarification
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-bold text-gray-700">
                        {showActionBox === 'approve' ? 'Approve & Send to Founder' : showActionBox === 'reject' ? 'Reject Agreement' : 'Request Clarification'}
                      </p>
                      <textarea value={adminNoteInput} onChange={e => setAdminNoteInput(e.target.value)}
                        placeholder="Add admin note (optional)..." rows={3}
                        className="w-full border border-gray-200 rounded-xl p-3 text-xs resize-none focus:outline-none focus:border-purple-400" />
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(showActionBox as any)} disabled={actionLoading}
                          className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50">
                          {actionLoading ? 'Processing...' : 'Confirm'}
                        </button>
                        <button onClick={() => setShowActionBox(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
              <button
                onClick={() => openCommissionModal(selectedTx)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Coins size={14} /> Fix Commission &amp; Payment Options
              </button>
              <button
                onClick={() => { setSelectedTx(null); setShowActionBox(null); setAdminNoteInput(''); }}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIX PLATFORM COMMISSION MODAL WITH MANUAL & QR PAYMENT OPTIONS */}
      {commissionModalTx && (
        <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-left animate-in zoom-in-95 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCommissionModalTx(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md">
                <Coins size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Fix Platform Commission</h3>
                <p className="text-xs text-gray-500">Configure platform commission &amp; payment options (Bank &amp; QR)</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Deal Info Card */}
              <div className="bg-purple-50/60 border border-purple-100 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Investor Name:</span>
                  <strong className="text-gray-900 font-bold">{commissionModalTx.investorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Startup:</span>
                  <strong className="text-gray-900 font-bold">{commissionModalTx.startupName}</strong>
                </div>
                <div className="flex justify-between border-t border-purple-100 pt-2 mt-2">
                  <span className="text-gray-700 font-bold">Payment / Investment Amount:</span>
                  <strong className="text-[#6C4CF1] font-black text-sm">
                    ₹{commissionModalTx.offerAmount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Commission Rate (%) Input */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">Commission Rate (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={commissionRateInput}
                    onChange={(e) => {
                      const r = Number(e.target.value);
                      setCommissionRateInput(r);
                      setCommissionAmountInput(String(Math.round(commissionModalTx.offerAmount * (r / 100))));
                    }}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                  />
                  <span className="font-extrabold text-gray-500 text-sm">%</span>
                </div>
              </div>

              {/* Quick Rate Presets */}
              <div className="flex gap-2">
                {[1, 2, 2.5, 3, 5].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCommissionRateInput(preset);
                      setCommissionAmountInput(String(Math.round(commissionModalTx.offerAmount * (preset / 100))));
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors ${
                      commissionRateInput === preset
                        ? 'bg-[#6C4CF1] text-white border-[#6C4CF1]'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>

              {/* Fixed Commission Amount (₹) */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">Fixed Platform Commission Amount (₹)</label>
                <input
                  type="number"
                  value={commissionAmountInput}
                  onChange={(e) => setCommissionAmountInput(e.target.value)}
                  placeholder="e.g. 100000"
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Auto-calculated: ₹{Math.round(commissionModalTx.offerAmount * ((commissionRateInput || 0) / 100)).toLocaleString('en-IN')} (for ₹{commissionModalTx.offerAmount.toLocaleString('en-IN')})
                </p>
              </div>

              {/* Configure Investor Commission Payment Options */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-900 font-bold text-xs flex items-center gap-1.5">
                    <QrCode size={15} className="text-[#5B21B6]" />
                    Fix Payment Options for Investor
                  </label>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-100 text-[#5B21B6] rounded-md">
                    Manual &amp; QR Code
                  </span>
                </div>

                {/* Mode Switcher */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCommissionPaymentMode('both')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      commissionPaymentMode === 'both' ? 'bg-[#5B21B6] text-white border-[#5B21B6]' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    Both (Bank &amp; UPI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommissionPaymentMode('bank')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      commissionPaymentMode === 'bank' ? 'bg-[#5B21B6] text-white border-[#5B21B6]' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    Bank NEFT/RTGS
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommissionPaymentMode('upi_qr')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      commissionPaymentMode === 'upi_qr' ? 'bg-[#5B21B6] text-white border-[#5B21B6]' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    UPI QR Code
                  </button>
                </div>

                {/* Manual Bank Details */}
                {(commissionPaymentMode === 'bank' || commissionPaymentMode === 'both') && (
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2 mt-2">
                    <p className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Manual Bank Transfer Details</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block">Account Holder</span>
                        <input
                          type="text"
                          value={bankAccountHolder}
                          onChange={(e) => setBankAccountHolder(e.target.value)}
                          className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block">Bank Name</span>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block">Account Number</span>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block">IFSC Code</span>
                        <input
                          type="text"
                          value={bankIfscCode}
                          onChange={(e) => setBankIfscCode(e.target.value)}
                          className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI QR & App Options */}
                {(commissionPaymentMode === 'upi_qr' || commissionPaymentMode === 'both') && (
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">UPI Apps &amp; QR Code Options</p>
                      <span className="text-[10px] text-purple-700 font-bold">Select App for QR</span>
                    </div>
                    
                    {/* App Selection Buttons */}
                    <div className="flex gap-2 mb-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedUpiApp('gpay')}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold cursor-pointer transition-colors ${
                          selectedUpiApp === 'gpay'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        Google Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUpiApp('paytm')}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold cursor-pointer transition-colors ${
                          selectedUpiApp === 'paytm'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        Paytm
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUpiApp('phonepe')}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold cursor-pointer transition-colors ${
                          selectedUpiApp === 'phonepe'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        PhonePe
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUpiApp('all')}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold cursor-pointer transition-colors ${
                          selectedUpiApp === 'all'
                            ? 'bg-gray-800 text-white border-gray-800 shadow-xs'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        All UPI Apps
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {(selectedUpiApp === 'gpay' || selectedUpiApp === 'all') && (
                        <div>
                          <span className="text-[10px] text-gray-400 font-semibold block">Google Pay UPI ID</span>
                          <input
                            type="text"
                            value={gpayUpi}
                            onChange={(e) => setGpayUpi(e.target.value)}
                            className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900"
                          />
                        </div>
                      )}
                      {(selectedUpiApp === 'paytm' || selectedUpiApp === 'all') && (
                        <div>
                          <span className="text-[10px] text-gray-400 font-semibold block">Paytm UPI ID</span>
                          <input
                            type="text"
                            value={paytmUpi}
                            onChange={(e) => setPaytmUpi(e.target.value)}
                            className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900"
                          />
                        </div>
                      )}
                      {(selectedUpiApp === 'phonepe' || selectedUpiApp === 'all') && (
                        <div>
                          <span className="text-[10px] text-gray-400 font-semibold block">PhonePe UPI ID</span>
                          <input
                            type="text"
                            value={phonepeUpi}
                            onChange={(e) => setPhonepeUpi(e.target.value)}
                            className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Commission Audit Notes */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">Commission Audit Note</label>
                <textarea
                  rows={2}
                  value={commissionNotesInput}
                  onChange={(e) => setCommissionNotesInput(e.target.value)}
                  placeholder="Specify reason or calculation details..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCommissionModalTx(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCommission}
                disabled={actionLoading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {actionLoading ? 'Saving...' : 'Save & Fix Commission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestorFunding;
