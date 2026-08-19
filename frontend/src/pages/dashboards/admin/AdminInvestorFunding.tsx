import React, { useState, useMemo } from 'react';
import { 
  Wallet, ShieldCheck, CheckCircle2, AlertCircle, Search, 
  X, Mail, Building, MapPin, Calendar, FileText, Landmark,
  TrendingUp, Clock, HelpCircle, Ban, RefreshCw, FileDown, Eye
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
  const [statusFilter, setStatusFilter] = useState<'All' | 'offer_received' | 'accepted' | 'rejected' | 'funded' | 'payment_submitted' | 'under_verification'>('All');
  
  // Selected transaction for details modal
  const [selectedTx, setSelectedTx] = useState<FundingOffer | null>(null);
  
  // Actions states
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [showActionBox, setShowActionBox] = useState<'verify' | 'completed' | 'reject' | 'approve' | 'clarify' | null>(null);
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
        (o.investorCompany && o.investorCompany.toLowerCase().includes(search.toLowerCase())) ||
        (o.id || o._id || '').toLowerCase().includes(search.toLowerCase());

      const matchesTab = statusFilter === 'All' || o.status === statusFilter;
      return matchesSearch && matchesTab;
    });
  }, [offers, search, statusFilter]);

  // Summary Metrics calculations
  const summary = useMemo(() => {
    let totalTransactions = offers.length;
    let pendingVerification = 0;
    let approvedFunding = 0;
    let completedFunding = 0;
    let totalAmount = 0;

    offers.forEach(o => {
      totalAmount += o.offerAmount;
      if (o.status === 'offer_received' || o.status === 'counter_offer') {
        pendingVerification += 1;
      } else if (o.status === 'accepted') {
        approvedFunding += 1;
      } else if (o.status === 'funded') {
        completedFunding += 1;
      }
    });

    return {
      totalTransactions,
      pendingVerification,
      approvedFunding,
      completedFunding,
      totalAmount
    };
  }, [offers]);

  // Safe fetch properties
  const getTxId = (tx: FundingOffer) => tx._id || tx.id || 'N/A';

  // Handle Admin Status Update Actions
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
        showToast('Clarification requested successfully.');
      } else {
        const isTxVerification = ['payment_submitted', 'under_verification'].includes(selectedTx.status);
        const newStatus = actionType === 'approve' ? 'accepted' : (isTxVerification ? 'failed' : 'rejected');
        const historyEntry = {
          action: newStatus,
          performedBy: adminName,
          role: 'Admin',
          message: `Admin ${actionType === 'approve' ? 'approved' : 'rejected'} the funding transaction/offer.`,
          createdAt: new Date().toISOString(),
        };

        const updates = {
          status: newStatus as any,
          paymentStatus: actionType === 'approve' ? 'Pending' : 'Failed',
          verificationStatus: actionType === 'approve' ? 'Pending' : 'Rejected',
          adminNote: adminNoteInput || selectedTx.adminNote || '',
          history: [...selectedTx.history, historyEntry],
          updatedAt: new Date().toISOString(),
        };

        await updateFundingOffer(txId, updates);
        
        // Notify both parties
        if (selectedTx.founderId) {
          await addNotification({
            userId: selectedTx.founderId,
            title: `Funding Transaction ${actionType === 'approve' ? 'Approved' : 'Rejected'}`,
            message: `Admin has ${actionType === 'approve' ? 'approved' : 'rejected'} your funding offer from ${selectedTx.investorCompany}. Note: ${updates.adminNote}`,
            type: 'funding',
            actionUrl: '/dashboard/founder/funding',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
        if (selectedTx.investorId) {
          await addNotification({
            userId: selectedTx.investorId,
            title: `Funding Transaction ${actionType === 'approve' ? 'Approved' : 'Rejected'}`,
            message: `Admin has ${actionType === 'approve' ? 'approved' : 'rejected'} your funding offer for ${selectedTx.startupName}. Note: ${updates.adminNote}`,
            type: 'funding',
            actionUrl: '/dashboard/investor/portfolio-hub',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }

        showToast(`Funding transaction successfully updated to ${newStatus}.`);
      }

      await refreshOffers();
      
      // Refresh selected tx to show updated data
      const updatedTx = offers.find(o => (o._id || o.id) === txId);
      setSelectedTx(updatedTx || null);
      
      // Reset action states
      setShowActionBox(null);
      setAdminNoteInput('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update transaction', 'error');
    } finally {
      setActionLoading(false);
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Wallet className="text-[#6C4CF1]" size={28} /> Investor Funding Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Oversee all investment allocations, compliance tracking, and platforms commissions.
          </p>
        </div>
        <button 
          onClick={() => { refreshOffers(); showToast('Data refreshed successfully!'); }}
          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all self-start sm:self-center flex items-center gap-1.5 font-bold cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Transactions</p>
          <h3 className="text-xl font-black text-gray-900 mt-1 flex items-baseline gap-1.5">
            {summary.totalTransactions} <span className="text-xs font-medium text-gray-400">offers</span>
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">Pending Verification</p>
          <h3 className="text-xl font-black text-amber-600 mt-1 flex items-baseline gap-1.5">
            {summary.pendingVerification} <span className="text-xs font-medium text-gray-400">awaiting</span>
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider">Approved Funding</p>
          <h3 className="text-xl font-black text-blue-600 mt-1 flex items-baseline gap-1.5">
            {summary.approvedFunding} <span className="text-xs font-medium text-gray-400">approved</span>
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider">Completed Funding</p>
          <h3 className="text-xl font-black text-emerald-600 mt-1 flex items-baseline gap-1.5">
            {summary.completedFunding} <span className="text-xs font-medium text-gray-400">closed</span>
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs bg-gradient-to-br from-purple-50 to-white">
          <p className="text-[10px] font-extrabold text-[#6C4CF1] uppercase tracking-wider">Total Funding Amount</p>
          <h3 className="text-xl font-black text-[#6C4CF1] mt-1">
            ${summary.totalAmount.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl w-full md:max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Startup, Founder, or Investor Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-medium text-gray-900 w-full placeholder-gray-400 ml-1.5"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['All', 'offer_received', 'accepted', 'payment_submitted', 'funded', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`py-2 px-3.5 rounded-xl text-[10px] font-extrabold uppercase transition-all ${
                statusFilter === tab
                  ? 'bg-[#6C4CF1] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'All' ? 'All Transactions' : 
               tab === 'offer_received' ? 'Pending Review' : 
               tab === 'payment_submitted' ? 'Awaiting Verification' : 
               tab === 'accepted' ? 'Founder Accepted' : 
               tab === 'funded' ? 'Completed' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-extrabold uppercase tracking-wider border-b border-gray-100 text-[10px]">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Funding Commitment ID</th>
                <th className="p-4">Investor</th>
                <th className="p-4">Founder</th>
                <th className="p-4">Startup</th>
                <th className="p-4">Investment Amount</th>
                <th className="p-4">Investment Type</th>
                <th className="p-4">Funding Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">Loading funding transactions...</td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">No funding transactions found.</td>
                </tr>
              ) : (
                filteredOffers.map((o) => {
                  const txId = o.transactionId || `TXN-2026-${String(o.id || o._id || '0000').slice(-4).toUpperCase()}`;
                  const commitmentId = o.commitmentId || `FC-2026-${String(o.id || o._id || '0000').slice(-4).toUpperCase()}`;
                  return (
                    <tr key={o.id || o._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-600 truncate max-w-[120px]">
                        {txId}
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-600 truncate max-w-[120px]">
                        {commitmentId}
                      </td>
                      <td className="p-4 font-bold text-gray-900">{o.investorName}</td>
                      <td className="p-4 font-bold text-gray-900">{o.founderName}</td>
                      <td className="p-4 font-bold text-gray-900">{o.startupName}</td>
                      <td className="p-4 font-black text-gray-900">{o.currency === 'INR' ? '₹' : '$'}{o.offerAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-purple-50 text-[#6C4CF1] border border-purple-100 rounded-lg text-[10px] font-bold">
                          {o.instrument || 'SAFE'}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          ['funded', 'completed'].includes(o.status)
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : o.status === 'accepted' 
                              ? 'bg-purple-50 text-purple-600 border-purple-100' 
                              : o.status === 'rejected'
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : ['payment_submitted', 'under_verification'].includes(o.status)
                                  ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                  : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {o.status === 'offer_received' ? 'Commitment Submitted' : 
                           o.status === 'payment_submitted' || o.status === 'under_verification' ? 'Awaiting Verification' :
                           o.status === 'accepted' ? 'Founder Accepted' : o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => { setSelectedTx(o); setShowActionBox(null); setAdminNoteInput(''); }}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6C4CF1] font-bold rounded-lg border border-purple-100 text-[10px] transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>      {/* DEDICATED FUNDING DETAILS VIEW MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 overflow-y-auto font-sans text-xs text-left">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 text-left">
            
            {/* Modal Close */}
            <button
              onClick={() => { setSelectedTx(null); setShowActionBox(null); setAdminNoteInput(''); }}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 shrink-0 pr-14">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  ['funded', 'completed'].includes(selectedTx.status) 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : selectedTx.status === 'accepted' 
                      ? 'bg-purple-50 text-purple-600 border-purple-100' 
                      : selectedTx.status === 'rejected'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : ['payment_submitted', 'under_verification'].includes(selectedTx.status)
                          ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  Status: {selectedTx.status === 'offer_received' ? 'Commitment Submitted' : 
                           selectedTx.status === 'payment_submitted' || selectedTx.status === 'under_verification' ? 'Awaiting Verification' :
                           selectedTx.status === 'accepted' ? 'Founder Accepted' : selectedTx.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#6C4CF1] border border-purple-100">
                  {selectedTx.instrument || 'SAFE'}
                </span>
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Funding Transaction Details</h2>
              <p className="text-[10px] font-mono text-gray-500 mt-1">
                Transaction ID: {selectedTx.transactionId || `TXN-2026-${String(selectedTx.id || selectedTx._id || '0000').slice(-4).toUpperCase()}`} | 
                Commitment ID: {selectedTx.commitmentId || `FC-2026-${String(selectedTx.id || selectedTx._id || '0000').slice(-4).toUpperCase()}`}
              </p>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 sm:p-8 py-4 overflow-y-auto flex-1 space-y-6">
              
              {/* Grid: Investor & Founder Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Investor details */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-3">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] text-[#6C4CF1] flex items-center gap-1.5">
                    <Building size={14} /> Investor Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Name:</span>
                      <strong className="text-gray-900">{selectedTx.investorName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Email:</span>
                      <strong className="text-gray-900">{selectedTx.investorEmail || '—'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Company:</span>
                      <strong className="text-gray-900">{selectedTx.investorCompany || '—'}</strong>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-gray-500">Address:</span>
                      <strong className="text-gray-900 max-w-[150px] truncate text-right" title={selectedTx.investorAddress}>
                        {selectedTx.investorAddress || '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Founder details */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-3">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] text-[#6C4CF1] flex items-center gap-1.5">
                    <Landmark size={14} /> Founder & Startup
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Startup:</span>
                      <strong className="text-gray-900">{selectedTx.startupName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Founder Name:</span>
                      <strong className="text-gray-900">{selectedTx.founderName}</strong>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-gray-500">Founder Email:</span>
                      <strong className="text-gray-900">{(selectedTx as any).founderEmail || 'renu@gmail.com'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal financials info */}
              <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl space-y-3">
                <h4 className="font-bold text-[#6C4CF1] uppercase text-[10px] tracking-wider">Investment Allocation details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Investment Amount</span>
                    <strong className="text-gray-900 text-sm font-black">
                      {selectedTx.currency === 'INR' ? '₹' : '$'}{selectedTx.offerAmount.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Equity Offered</span>
                    <strong className="text-gray-900 text-sm font-black">{selectedTx.equityPercentage}%</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Valuation Cap</span>
                    <strong className="text-gray-900 text-sm font-black">
                      {selectedTx.currency === 'INR' ? `₹${(selectedTx.valuationCap / 10000000).toFixed(2)} Cr` : `$${(selectedTx.valuationCap / 1000000).toFixed(1)}M`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Agreed Instrument</span>
                    <strong className="text-[#6C4CF1] text-sm font-black">{selectedTx.instrument}</strong>
                  </div>
                </div>
              </div>

              {/* Investment Agreement Details */}
              <div className="border border-purple-100 rounded-2xl p-5 space-y-4 bg-purple-50/10">
                <h4 className="font-bold text-[#6C4CF1] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-purple-100 pb-2">
                  <FileText size={14} /> Investment Agreement Audit & parameters
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block font-semibold">Agreement ID:</span>
                    <strong className="text-gray-900 font-mono font-bold">{selectedTx.agreementId || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-semibold">Agreement Version:</span>
                    <strong className="text-gray-900 font-mono font-bold">{selectedTx.agreementVersion || 'v1.0'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-semibold">Agreement Status:</span>
                    <strong className="text-purple-700 font-bold uppercase">{selectedTx.agreementStatus || 'Draft'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-semibold">Verification Stage:</span>
                    <strong className="text-gray-900 font-bold">{selectedTx.verificationStatus || 'Pending'}</strong>
                  </div>
                </div>

                {/* Commercial parameters details if present */}
                {selectedTx.agreementDetails && (
                  <div className="border-t border-purple-100/50 pt-3 space-y-2.5 text-[11px]">
                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-purple-100/50 text-[10px]">
                      <p><strong>Pre-Money Valuation:</strong> ₹{(selectedTx.agreementDetails.preMoneyValuation || 0).toLocaleString('en-IN')}</p>
                      <p><strong>Post-Money Valuation:</strong> ₹{(selectedTx.agreementDetails.postMoneyValuation || 0).toLocaleString('en-IN')}</p>
                      <p><strong>Funding Type:</strong> {selectedTx.agreementDetails.fundingType || 'N/A'}</p>
                      <p><strong>Investment Type:</strong> {selectedTx.agreementDetails.investmentType || 'N/A'}</p>
                      <p><strong>Expected Funding Date:</strong> {selectedTx.agreementDetails.expectedFundingDate || 'N/A'}</p>
                      <p><strong>Agreement Date:</strong> {selectedTx.agreementDetails.agreementDate || 'N/A'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-gray-500 block font-bold">Investment & Conversion terms:</span>
                      <p className="text-gray-700 leading-normal bg-white p-2.5 rounded-xl border border-gray-100 font-semibold">{selectedTx.agreementDetails.investmentTerms}</p>
                    </div>

                    {selectedTx.agreementDetails.specialClauses && (
                      <div className="space-y-1">
                        <span className="text-gray-500 block font-bold">Special Clauses:</span>
                        <p className="text-gray-700 leading-normal bg-white p-2.5 rounded-xl border border-gray-100 font-semibold">{selectedTx.agreementDetails.specialClauses}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Uploaded files download buttons */}
                {selectedTx.agreementDetails && (selectedTx.agreementDetails.uploadedDocument || selectedTx.agreementDetails.supportingDocuments) && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {selectedTx.agreementDetails.uploadedDocument && (
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(selectedTx.agreementDetails!.uploadedDocument!, selectedTx.agreementDetails!.uploadedDocumentName || 'contract.pdf')}
                        className="px-3 py-1.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer text-[10px]"
                      >
                        <FileDown size={11} /> Download Main Agreement Document
                      </button>
                    )}
                    {selectedTx.agreementDetails.supportingDocuments && (
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(selectedTx.agreementDetails!.supportingDocuments!, selectedTx.agreementDetails!.supportingDocumentsName || 'supporting.pdf')}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer text-[10px]"
                      >
                        <FileDown size={11} /> Supporting Files
                      </button>
                    )}
                  </div>
                )}

                {/* Audit trail timeline logs */}
                {selectedTx.agreementAuditTrail && selectedTx.agreementAuditTrail.length > 0 && (
                  <div className="border-t border-purple-100/50 pt-3 space-y-2">
                    <span className="text-gray-500 block font-bold text-[10px] uppercase tracking-wider flex items-center gap-1"><Clock size={11} /> Document Audit Timeline</span>
                    <div className="pl-3 border-l border-purple-200 space-y-2 text-[10px]">
                      {selectedTx.agreementAuditTrail.map((log: any, idx: number) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[16px] top-1 w-1.5 h-1.5 bg-[#6C4CF1] rounded-full" />
                          <p className="font-bold text-gray-800">
                            {log.action} <span className="font-normal text-gray-400">({new Date(log.timestamp).toLocaleString('en-IN')})</span>
                          </p>
                          <p className="text-[9px] text-gray-500">Performed by: {log.performedBy} ({log.role})</p>
                          {log.notes && <p className="text-[9px] text-amber-700 italic bg-amber-50 rounded-md p-1 mt-0.5">"{log.notes}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signature Block stamps */}
                <div className="col-span-2 border-t border-purple-100/50 pt-3 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 block font-semibold text-[10px]">Investor Execution Stamp:</span>
                    {(selectedTx.investorSignedAt || selectedTx.investorSignatureName || (selectedTx.agreementStatus && selectedTx.agreementStatus !== 'Draft')) ? (
                      <div className="mt-1 bg-white p-2.5 rounded-xl border border-gray-200">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-black uppercase">Signed</span>
                        <p className="text-xs text-[#5B21B6] italic font-serif mt-1 font-bold">
                          {selectedTx.investorSignatureName || selectedTx.investorName || 'Investor Signature'}
                        </p>
                        <span className="block text-[8px] text-gray-400 mt-1 font-mono">
                          {selectedTx.investorSignedAt ? new Date(selectedTx.investorSignedAt).toLocaleString('en-IN') : new Date(selectedTx.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[9px] font-bold mt-1 inline-block border border-amber-100">Awaiting Signature ⏳</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 block font-semibold text-[10px]">Founder Execution Stamp:</span>
                    {selectedTx.founderSignedAt ? (
                      <div className="mt-1 bg-white p-2.5 rounded-xl border border-gray-200">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-black uppercase">Signed</span>
                        <p className="text-xs text-[#5B21B6] italic font-serif mt-1 font-bold">
                          {selectedTx.founderSignatureName}
                        </p>
                        <span className="block text-[8px] text-gray-400 mt-1 font-mono">{new Date(selectedTx.founderSignedAt).toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[9px] font-bold mt-1 inline-block border border-amber-100">Awaiting Signature ⏳</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta information */}
              <div className="border border-gray-100 rounded-2xl p-4 space-y-2.5 bg-gray-50/30">
                <div className="flex justify-between text-gray-500 border-b border-gray-100 pb-2">
                  <span>Funding Date (Term Sheet Created):</span>
                  <span className="text-gray-900 font-bold">
                    {new Date(selectedTx.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 border-b border-gray-100 pb-2">
                  <span>Meeting Reference:</span>
                  <span className="text-gray-900 font-bold flex items-center gap-1">
                    <Clock size={12} className="text-purple-600" /> Virtual Accreditation & Pitch Review
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 border-b border-gray-100 pb-2">
                  <span>Last Updated:</span>
                  <span className="text-gray-900 font-bold">
                    {new Date(selectedTx.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 pb-0.5">
                  <span>Calculated Platform Commission (2.0%):</span>
                  <span className="text-emerald-600 font-black text-sm">
                    {selectedTx.currency === 'INR' ? '₹' : '$'}{(selectedTx.offerAmount * 0.02).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Verification Info */}
              {selectedTx.paymentMethod && (
                <div className="border border-purple-100 rounded-2xl p-4 space-y-2.5 bg-purple-50/20">
                  <h4 className="font-bold text-[#6C4CF1] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Landmark size={14} /> Investor Payment Information
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500 font-semibold">Payment Method:</span>
                      <strong className="text-gray-900 font-bold">{selectedTx.paymentMethod}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500 font-semibold">UTR / Reference Number:</span>
                      <strong className="text-gray-900 font-mono font-bold">{selectedTx.paymentReference || '—'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500 font-semibold">Payment Date:</span>
                      <strong className="text-gray-900 font-bold">
                        {selectedTx.paymentDate ? new Date(selectedTx.paymentDate).toLocaleString() : '—'}
                      </strong>
                    </div>
                    {selectedTx.paymentProof && (
                      <div className="space-y-1.5 pt-1.5">
                        <span className="text-gray-500 font-semibold block font-sans">Uploaded Receipt / Payment Proof:</span>
                        {selectedTx.paymentProof.startsWith('data:image/') ? (
                          <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[180px] bg-white p-2 flex items-center justify-center">
                            <img src={selectedTx.paymentProof} alt="Receipt Proof" className="object-contain max-h-[160px] rounded-lg shadow-sm" />
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-200 p-2.5 rounded-lg font-mono text-[10px] text-gray-600 truncate">
                            {selectedTx.paymentProof}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Messages / Notes */}
              <div className="space-y-3.5">
                {selectedTx.investorMessage && (
                  <div className="space-y-1">
                    <h5 className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Investor Note:</h5>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-gray-700 italic">
                      "{selectedTx.investorMessage}"
                    </div>
                  </div>
                )}

                {selectedTx.founderResponse && (
                  <div className="space-y-1">
                    <h5 className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Founder Response Note:</h5>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-gray-700 italic">
                      "{selectedTx.founderResponse}"
                    </div>
                  </div>
                )}

                {selectedTx.adminNote && (
                  <div className="space-y-1">
                    <h5 className="font-bold text-[#6C4CF1] uppercase tracking-wider text-[9px]">Admin Audit & Verification Notes:</h5>
                    <div className="bg-purple-50/40 border border-purple-100/60 rounded-xl p-3 text-purple-900 italic font-semibold">
                      "{selectedTx.adminNote}"
                    </div>
                  </div>
                )}
              </div>

              {/* Conditionally rendering Admin Action boxes */}
              {showActionBox && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-3 shadow-sm">
                  <h4 className="font-bold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <HelpCircle size={14} /> Specify Notes for Action: {showActionBox.toUpperCase()}
                  </h4>
                  <textarea
                    rows={2}
                    placeholder="Enter audit logs, compliance document verification remarks, or rejection grounds..."
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#6C4CF1] outline-none font-medium text-xs text-gray-800"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setShowActionBox(null); setAdminNoteInput(''); }}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction(showActionBox)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-extrabold rounded-lg shadow cursor-pointer"
                    >
                      {actionLoading ? 'Saving...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 shrink-0 flex flex-wrap gap-2.5 justify-end rounded-b-3xl">
              {/* Show Approve/Reject if in offer_received status */}
              {(selectedTx.status === 'offer_received' || selectedTx.status === 'counter_offer') && !showActionBox && (
                <>
                  <button
                    onClick={() => setShowActionBox('reject')}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban size={14} /> Reject Offer
                  </button>
                  <button
                    onClick={() => setShowActionBox('approve')}
                    className="px-5 py-2 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck size={14} /> Approve Funding
                  </button>
                </>
              )}

              {/* Show Verify / Mark Completed if accepted, payment_submitted, or under_verification */}
              {(['accepted', 'payment_submitted', 'under_verification'].includes(selectedTx.status)) && !showActionBox && (
                <>
                  <button
                    onClick={() => setShowActionBox('reject')}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban size={14} /> Reject/Void Deal
                  </button>
                  <button
                    onClick={() => setShowActionBox('clarify')}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle size={14} /> Request Clarification
                  </button>
                  <button
                    onClick={() => setShowActionBox('verify')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck size={14} /> Approve Payment
                  </button>
                  <button
                    onClick={() => setShowActionBox('completed')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Mark Completed
                  </button>
                </>
              )}

              {/* Show Approve (Reactivate) if rejected */}
              {selectedTx.status === 'rejected' && !showActionBox && (
                <button
                  onClick={() => setShowActionBox('approve')}
                  className="px-5 py-2 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck size={14} /> Approve/Reactivate Deal
                </button>
              )}

              <button
                onClick={() => { setSelectedTx(null); setShowActionBox(null); setAdminNoteInput(''); }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInvestorFunding;
