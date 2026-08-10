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

const AdminMentorEarnings: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'transactions'>('overview');

  // Mark Paid confirmation modal state
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
      // Handle response structure
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
      <div className="mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Earnings & Withdrawal Payouts</h1>
          <p className="text-gray-500 mt-1">Monitor mentor session revenue, platform commission, and process withdrawal requests.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-[#5B21B6] text-[#5B21B6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview & Mentors ({mentors.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
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
                                  <td className="px-5 py-3.5">
                                    <select
                                      value={tx.payoutStatus || 'pending'}
                                      onChange={(e) => handleTxPayoutStatusChange(tx._id, tx.payoutStatus || 'pending', e.target.value)}
                                      disabled={updating[tx._id]}
                                      className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-[#5B21B6] outline-none"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="processing">Processing</option>
                                      <option value="paid">Paid</option>
                                      <option value="failed">Failed</option>
                                    </select>
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

      {/* TAB 2: WITHDRAWAL REQUESTS & PROCESS / MARK AS PAID */}
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
