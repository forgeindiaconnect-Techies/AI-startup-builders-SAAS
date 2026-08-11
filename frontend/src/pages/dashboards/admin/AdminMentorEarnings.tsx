import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Building,
  Check,
  X,
  FileText,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Eye,
  History,
  CheckCircle2,
} from 'lucide-react';
import {
  getAdminMentorEarnings,
  updateMentorPayoutStatus,
  processWithdrawal,
  markWithdrawalPaid,
} from '../../../utils/mentorApi';

const PAYOUT_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
};

const formatCurrency = (v: number) =>
  `₹${(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const formatDateTime = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const AdminMentorEarnings: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'user_payments' | 'withdrawals'>('overview');

  // Search and filter for User Payments section
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Modal states
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState<any | null>(null);
  const [selectedWithdrawalForPaid, setSelectedWithdrawalForPaid] = useState<any | null>(null);
  const [utrReference, setUtrReference] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminMentorEarnings();
      if (Array.isArray(res)) {
        setMentors(res);
      } else if (res && (res as any).data) {
        setMentors((res as any).data);
        if ((res as any).withdrawals) setAllWithdrawals((res as any).withdrawals);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle direct Process withdrawal
  const handleProcessWithdrawal = async (withdrawalId: string) => {
    setUpdating((prev) => ({ ...prev, [withdrawalId]: true }));
    try {
      await processWithdrawal(withdrawalId);
      await fetchData();
    } catch (err: any) {
      alert(`Error processing withdrawal: ${err.message}`);
    } finally {
      setUpdating((prev) => ({ ...prev, [withdrawalId]: false }));
    }
  };

  // Open Mark Paid Modal
  const openMarkPaidModal = (withdrawal: any) => {
    setSelectedWithdrawalForPaid(withdrawal);
    setUtrReference('');
    setPaidDate(new Date().toISOString().split('T')[0]);
    setModalError('');
  };

  // Submit Mark Paid Modal
  const handleConfirmPaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrReference.trim()) {
      setModalError('Transaction / UTR Reference is required.');
      return;
    }
    setModalSaving(true);
    setModalError('');
    try {
      await markWithdrawalPaid(selectedWithdrawalForPaid._id, {
        transactionReference: utrReference.trim(),
        paidDate,
      });
      setSelectedWithdrawalForPaid(null);
      await fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to mark withdrawal as paid.');
    } finally {
      setModalSaving(false);
    }
  };

  // Handle individual transaction payout status change with strict transition validation
  const handleTxPayoutStatusChange = async (txId: string, currentStatus: string, newStatus: string) => {
    if (currentStatus === 'pending' && newStatus === 'paid') {
      alert('Invalid status transition: Pending -> Paid is not allowed without Processing. Please set status to Processing first.');
      return;
    }
    setUpdating((prev) => ({ ...prev, [txId]: true }));
    try {
      await updateMentorPayoutStatus(txId, newStatus as any);
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating((prev) => ({ ...prev, [txId]: false }));
    }
  };

  const toggleExpand = (mentorId: string) => {
    setExpanded((prev) => ({ ...prev, [mentorId]: !prev[mentorId] }));
  };

  const totals = mentors.reduce(
    (acc, m) => ({
      revenue: acc.revenue + (m.totalRevenue || 0),
      mentorEarnings: acc.mentorEarnings + (m.totalMentorEarnings || 0),
      platformCommission: acc.platformCommission + (m.totalPlatformCommission || 0),
      pendingPayout: acc.pendingPayout + (m.pendingPayout || 0),
      processingPayout: acc.processingPayout + (m.processingPayout || 0),
      paidPayout: acc.paidPayout + (m.paidPayout || 0),
      sessions: acc.sessions + (m.totalSessions || 0),
    }),
    { revenue: 0, mentorEarnings: 0, platformCommission: 0, pendingPayout: 0, processingPayout: 0, paidPayout: 0, sessions: 0 }
  );

  // Aggregate all pending/processing/paid withdrawal requests across all mentors
  const pendingWithdrawalRequests = mentors.flatMap((m) =>
    (m.withdrawals || []).map((w: any) => ({ ...w, mentorName: m.mentorName, mentorEmail: m.email }))
  );

  // Aggregate all user payments to mentors across all mentors
  const allUserPayments = mentors.flatMap((m) =>
    (m.transactions || []).map((tx: any) => ({
      ...tx,
      mentorName: tx.mentorName || m.mentorName,
      mentorEmail: tx.mentorEmail || m.email,
      mentorId: m.mentorId,
    }))
  );

  // Filter user payments based on search and status
  const filteredUserPayments = allUserPayments.filter((tx) => {
    const searchLower = paymentSearch.trim().toLowerCase();
    const matchesSearch =
      searchLower === '' ||
      (tx.founderName || '').toLowerCase().includes(searchLower) ||
      (tx.founderEmail || '').toLowerCase().includes(searchLower) ||
      (tx.mentorName || '').toLowerCase().includes(searchLower) ||
      (tx.mentorEmail || '').toLowerCase().includes(searchLower) ||
      (tx.topic || '').toLowerCase().includes(searchLower) ||
      (tx.startupName || '').toLowerCase().includes(searchLower);

    const matchesStatus =
      paymentStatusFilter === 'all' ||
      (tx.payoutStatus || 'pending') === paymentStatusFilter ||
      (paymentStatusFilter === 'completed' && tx.isCompleted);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="animate-fade-in-up flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#5B21B6]" />
        <span className="ml-3 text-gray-500 font-medium">Loading mentor earnings & withdrawals...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#5B21B6] text-white rounded-xl font-bold text-sm hover:bg-[#7C3AED] transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mentor Earnings & Withdrawal Payouts</h1>
        <p className="text-gray-500 mt-1">Monitor mentor session revenue, platform commission, user payment details, and withdrawal requests.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#5B21B6] text-[#5B21B6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview & Mentors ({mentors.length})
        </button>

        <button
          onClick={() => setActiveTab('user_payments')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'user_payments'
              ? 'border-[#5B21B6] text-[#5B21B6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard size={15} />
          User Payments Details ({allUserPayments.length})
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'withdrawals'
              ? 'border-[#5B21B6] text-[#5B21B6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Withdrawal Requests
          {pendingWithdrawalRequests.filter((w) => w.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white">
              {pendingWithdrawalRequests.filter((w) => w.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Platform Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: totals.sessions.toString(), icon: <Users size={18} />, color: 'bg-purple-100 text-[#5B21B6]' },
          { label: 'Total Revenue', value: formatCurrency(totals.revenue), icon: <IndianRupee size={18} />, color: 'bg-blue-100 text-blue-600' },
          { label: 'Mentor Earnings', value: formatCurrency(totals.mentorEarnings), icon: <TrendingUp size={18} />, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Platform Cut (20%)', value: formatCurrency(totals.platformCommission), icon: <IndianRupee size={18} />, color: 'bg-amber-100 text-amber-600' },
          { label: 'Pending Payouts', value: formatCurrency(totals.pendingPayout), icon: <Clock size={18} />, color: 'bg-orange-100 text-orange-600' },
          { label: 'Paid Out', value: formatCurrency(totals.paidPayout), icon: <CheckCircle size={18} />, color: 'bg-teal-100 text-teal-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-lg font-black text-gray-900">{s.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & PER-MENTOR CARDS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {mentors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <IndianRupee size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">No Mentor Financial Data</h3>
              <p className="text-xs text-gray-500">Earnings will appear here once mentors complete booked sessions.</p>
            </div>
          ) : (
            mentors.map((mentor) => {
              const isExpanded = !!expanded[mentor.mentorId];
              const hasTx = mentor.transactions && mentor.transactions.length > 0;

              return (
                <div key={mentor.mentorId?.toString()} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white font-black text-lg shadow-sm">
                          {(mentor.mentorName || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{mentor.mentorName || 'Unknown Mentor'}</h3>
                          <p className="text-xs text-gray-500">{mentor.email || ''}</p>
                          <div className="flex flex-wrap gap-3 mt-1.5 text-xs font-medium text-gray-500">
                            <span>Session Fee: <strong className="text-gray-900">{formatCurrency(mentor.sessionFee)}</strong></span>
                            <span>Share: <strong className="text-[#5B21B6]">{mentor.mentorSharePercentage}%</strong></span>
                            <span>Platform: <strong className="text-amber-600">{mentor.platformCommissionPercentage}%</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <p className="text-xs font-black text-gray-900">{formatCurrency(mentor.totalRevenue)}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Revenue</p>
                        </div>
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                          <p className="text-xs font-black text-emerald-700">{formatCurrency(mentor.totalMentorEarnings)}</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">Mentor Earnings</p>
                        </div>
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                          <p className="text-xs font-black text-amber-700">{formatCurrency(mentor.totalPlatformCommission)}</p>
                          <p className="text-[10px] text-amber-600 font-bold uppercase">Platform (20%)</p>
                        </div>
                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                          <p className="text-xs font-black text-[#5B21B6]">{formatCurrency(mentor.paidPayout)}</p>
                          <p className="text-[10px] text-purple-600 font-bold uppercase">Paid Out</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {hasTx && (
                    <>
                      <button
                        onClick={() => toggleExpand(mentor.mentorId?.toString())}
                        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <span>View Session Transactions ({mentor.transactions.length})</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {isExpanded && (
                        <div className="overflow-x-auto border-t border-gray-100">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Session / Startup</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Total Fee</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Mentor Share</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Mentor Earnings</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Platform Cut</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Session Status</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payout Status</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {mentor.transactions.map((tx: any) => (
                                <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                                  <td className="px-5 py-3.5">
                                    <p className="text-xs font-semibold text-gray-900 max-w-[140px] truncate">{tx.topic || 'Session'}</p>
                                    {tx.startupName && <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{tx.startupName}</p>}
                                  </td>
                                  <td className="px-5 py-3.5 text-xs font-bold text-gray-900 text-right whitespace-nowrap">{formatCurrency(tx.sessionFee)}</td>
                                  <td className="px-5 py-3.5 text-xs font-bold text-[#5B21B6] text-right whitespace-nowrap">{tx.mentorSharePercentage}%</td>
                                  <td className="px-5 py-3.5 text-xs font-black text-emerald-600 text-right whitespace-nowrap">{formatCurrency(tx.mentorEarnings)}</td>
                                  <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 text-right whitespace-nowrap">{formatCurrency(tx.platformCommission)}</td>
                                  <td className="px-5 py-3.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {tx.isCompleted ? 'Completed' : 'Booked'}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-xs shadow-2xs">
                                      <Check size={13} className="text-emerald-600" /> Paid
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                    <button
                                      onClick={() => setSelectedPaymentForHistory(tx)}
                                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] border border-purple-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                      title="View History Details"
                                    >
                                      <Eye size={12} /> Details
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: USER PAYMENTS DETAILS TO MENTORS (WITH VIEW HISTORY ACTION) */}
      {activeTab === 'user_payments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header & Filter Controls */}
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-[#5B21B6]" />
                User Payment Details to Mentors
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Detailed breakdown of startup founder session bookings, payments made, and mentor earnings distribution.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search founder, mentor, or topic..."
                  className="w-full pl-9 pr-3.5 py-1.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
                />
                {paymentSearch && (
                  <button onClick={() => setPaymentSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                <Filter size={13} className="text-gray-400" />
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="all">All Payout Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="completed">Completed Sessions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {filteredUserPayments.length === 0 ? (
            <div className="py-16 text-center">
              <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">No User Payment Transactions Found</h3>
              <p className="text-xs text-gray-500">
                {paymentSearch || paymentStatusFilter !== 'all'
                  ? 'No transactions match your search filter criteria.'
                  : 'User payments to mentors for booked sessions will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">User / Founder</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Mentor</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Session Topic / Startup</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">User Paid Fee</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Mentor Share (80%)</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Platform Cut (20%)</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Payout Status</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUserPayments.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Date & Time */}
                      <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                        <p className="font-bold text-gray-900">{formatDate(tx.createdAt)}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{formatDateTime(tx.createdAt).split(',')[1] || ''}</p>
                      </td>

                      {/* User / Founder */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5B21B6] font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                            {(tx.founderName || 'F').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{tx.founderName || 'Founder User'}</p>
                            {tx.founderEmail && <p className="text-[10px] text-gray-400 truncate">{tx.founderEmail}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Assigned Mentor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                            {(tx.mentorName || 'M').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{tx.mentorName || 'Mentor'}</p>
                            {tx.mentorEmail && <p className="text-[10px] text-gray-400 truncate">{tx.mentorEmail}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Session Topic & Startup */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-gray-900 max-w-[180px] truncate">{tx.topic || '1-on-1 Mentorship Session'}</p>
                        {tx.startupName && <p className="text-[10px] text-purple-700 font-medium truncate max-w-[180px] mt-0.5">🚀 {tx.startupName}</p>}
                      </td>

                      {/* User Paid Fee */}
                      <td className="px-5 py-4 text-xs font-black text-gray-900 text-right whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg">{formatCurrency(tx.sessionFee)}</span>
                      </td>

                      {/* Mentor Share */}
                      <td className="px-5 py-4 text-xs font-black text-emerald-600 text-right whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">{formatCurrency(tx.mentorEarnings)}</span>
                      </td>

                      {/* Platform Cut */}
                      <td className="px-5 py-4 text-xs font-semibold text-amber-700 text-right whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-100">{formatCurrency(tx.platformCommission)}</span>
                      </td>

                      {/* Payout Status Fixed Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-xs shadow-2xs">
                          <Check size={13} className="text-emerald-600" /> Paid
                        </span>
                      </td>

                      {/* Action: View History Button */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPaymentForHistory(tx)}
                          className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                          title="View Payment History Details"
                        >
                          <Eye size={13} /> View History
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

      {/* TAB 3: WITHDRAWAL REQUESTS & PROCESS / MARK AS PAID */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">Mentor Withdrawal Requests</h2>
            <span className="text-xs font-semibold text-gray-500">{pendingWithdrawalRequests.length} total request(s)</span>
          </div>

          {pendingWithdrawalRequests.length === 0 ? (
            <div className="py-16 text-center">
              <Clock size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">No Withdrawal Requests</h3>
              <p className="text-xs text-gray-500">Withdrawal requests submitted by mentors will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Mentor</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Payout Details</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingWithdrawalRequests.map((w) => {
                    const statusClass = PAYOUT_STYLES[w.status] || PAYOUT_STYLES.pending;
                    return (
                      <tr key={w._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{formatDate(w.requestedAt || w.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-bold text-gray-900">{w.mentorName}</p>
                          <p className="text-[10px] text-gray-400">{w.mentorEmail}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-900 uppercase">
                          {w.withdrawalMethod === 'upi' ? 'UPI' : 'Bank Transfer'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-600">
                          {w.withdrawalMethod === 'upi' ? (
                            <span className="font-semibold text-purple-950 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{w.upiId}</span>
                          ) : (
                            <div className="text-[11px]">
                              <p className="font-bold text-gray-900">{w.accountHolderName}</p>
                              <p className="text-gray-500">{w.bankName} - A/C: <strong>{w.accountNumber}</strong> | IFSC: <strong>{w.ifscCode}</strong></p>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-black text-gray-900 text-right whitespace-nowrap">{formatCurrency(w.amount)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusClass}`}>
                            {w.status?.charAt(0).toUpperCase() + w.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {w.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleProcessWithdrawal(w._id)}
                                disabled={updating[w._id]}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                              >
                                {updating[w._id] ? <Loader2 size={12} className="animate-spin" /> : 'Process'}
                              </button>
                              <button
                                onClick={() => openMarkPaidModal(w)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm"
                              >
                                <Check size={12} /> Mark as Paid
                              </button>
                            </div>
                          )}

                          {w.status === 'processing' && (
                            <button
                              onClick={() => openMarkPaidModal(w)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm"
                            >
                              <Check size={12} /> Mark as Paid
                            </button>
                          )}

                          {w.status === 'paid' && (
                            <div className="text-[11px]">
                              <span className="font-bold text-emerald-700">✓ Paid</span>
                              {w.transactionReference && (
                                <p className="text-[10px] text-gray-400 font-mono">Ref: {w.transactionReference}</p>
                              )}
                            </div>
                          )}
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

      {/* PAYMENT HISTORY & TRANSACTION AUDIT DETAILS MODAL */}
      {selectedPaymentForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#5B21B6] via-[#6C4CF1] to-[#7C3AED] px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <History size={20} className="text-purple-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Payment History & Audit Details</h3>
                  <p className="text-xs text-purple-200 font-mono">
                    Txn ID: #{selectedPaymentForHistory._id ? selectedPaymentForHistory._id.toString().slice(-8).toUpperCase() : 'TXN-PAYMENT'} • {formatDateTime(selectedPaymentForHistory.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaymentForHistory(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-purple-100 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Founder and Mentor Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Founder Box */}
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/80">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Payer (Founder)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5B21B6] text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {(selectedPaymentForHistory.founderName || 'F').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedPaymentForHistory.founderName || 'Founder User'}</p>
                      <p className="text-xs text-gray-500">{selectedPaymentForHistory.founderEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Mentor Box */}
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/80">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Payee (Mentor)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {(selectedPaymentForHistory.mentorName || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedPaymentForHistory.mentorName || 'Mentor'}</p>
                      <p className="text-xs text-gray-500">{selectedPaymentForHistory.mentorEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Information */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">Session & Topic Details</p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{selectedPaymentForHistory.topic || 'Mentorship Session'}</h4>
                    {selectedPaymentForHistory.startupName && (
                      <p className="text-xs text-purple-700 font-semibold mt-0.5">🚀 Startup: {selectedPaymentForHistory.startupName}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle size={13} /> {selectedPaymentForHistory.isCompleted ? 'Session Completed' : 'Booking Active'}
                  </span>
                </div>
              </div>

              {/* Payment Financial Breakdown */}
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Financial Transaction Breakdown</p>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
                  <div className="p-3.5 flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-medium">Total Session Fee Paid by User</span>
                    <span className="font-black text-gray-900 text-sm">{formatCurrency(selectedPaymentForHistory.sessionFee)}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center text-xs bg-emerald-50/40">
                    <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Mentor Share ({selectedPaymentForHistory.mentorSharePercentage || 80}%)
                    </span>
                    <span className="font-black text-emerald-700 text-sm">{formatCurrency(selectedPaymentForHistory.mentorEarnings)}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center text-xs bg-amber-50/40">
                    <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      Platform Commission ({selectedPaymentForHistory.platformCommissionPercentage || 20}%)
                    </span>
                    <span className="font-black text-amber-700 text-sm">{formatCurrency(selectedPaymentForHistory.platformCommission)}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Payout Status</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-full border border-emerald-200 text-xs">
                      <Check size={13} className="text-emerald-600" /> Paid
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Activity Audit History Timeline */}
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Audit Activity History</p>
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-4">
                  <div className="flex gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-gray-900">Payment Processed & Received</p>
                      <p className="text-[11px] text-gray-500">User completed online payment of {formatCurrency(selectedPaymentForHistory.sessionFee)}.</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{formatDateTime(selectedPaymentForHistory.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-gray-900">Session Booking Recorded</p>
                      <p className="text-[11px] text-gray-500">Mentorship slot booked with {selectedPaymentForHistory.mentorName || 'Mentor'}.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-gray-900">Platform Commission & Mentor Split Calculated</p>
                      <p className="text-[11px] text-gray-500">20% ({formatCurrency(selectedPaymentForHistory.platformCommission)}) retained by platform, 80% ({formatCurrency(selectedPaymentForHistory.mentorEarnings)}) assigned to mentor.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-gray-900">Payout Status Verified as Paid</p>
                      <p className="text-[11px] text-emerald-700 font-semibold">Earnings available for mentor withdrawal payout.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedPaymentForHistory(null)}
                className="px-5 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Close History Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK AS PAID CONFIRMATION MODAL */}
      {selectedWithdrawalForPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-6 py-4 flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-base">Mark Withdrawal as Paid</h3>
                <p className="text-xs text-purple-200">Confirm payment transfer to mentor</p>
              </div>
              <button onClick={() => setSelectedWithdrawalForPaid(null)} className="text-purple-200 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmPaidSubmit} className="p-6 space-y-4">
              {/* Summary Box */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Mentor:</span>
                  <span className="font-bold text-gray-900">{selectedWithdrawalForPaid.mentorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Amount:</span>
                  <span className="font-black text-emerald-600 text-sm">{formatCurrency(selectedWithdrawalForPaid.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Method:</span>
                  <span className="font-bold uppercase text-gray-700">{selectedWithdrawalForPaid.withdrawalMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Details:</span>
                  <span className="font-semibold text-purple-900">
                    {selectedWithdrawalForPaid.withdrawalMethod === 'upi'
                      ? selectedWithdrawalForPaid.upiId
                      : `${selectedWithdrawalForPaid.accountNumber} (${selectedWithdrawalForPaid.ifscCode})`}
                  </span>
                </div>
              </div>

              {/* UTR / Ref Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Transaction / UTR Reference *</label>
                <input
                  type="text"
                  required
                  value={utrReference}
                  onChange={(e) => setUtrReference(e.target.value)}
                  placeholder="e.g. UTR192837465012 or BANKTXN9921"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-none text-xs font-mono font-bold text-gray-900"
                />
              </div>

              {/* Paid Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Paid Date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#5B21B6] outline-none text-xs font-medium"
                />
              </div>

              {modalError && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100">{modalError}</p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedWithdrawalForPaid(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {modalSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {modalSaving ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMentorEarnings;
