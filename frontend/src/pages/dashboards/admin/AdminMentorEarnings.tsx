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
} from 'lucide-react';
import { getAdminMentorEarnings, updateMentorPayoutStatus } from '../../../utils/mentorApi';

const PAYOUT_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminMentorEarnings();
      setMentors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayoutUpdate = async (txId: string, status: 'pending' | 'processing' | 'paid' | 'failed') => {
    setUpdating((prev) => ({ ...prev, [txId]: true }));
    try {
      await updateMentorPayoutStatus(txId, status);
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
      paidPayout: acc.paidPayout + (m.paidPayout || 0),
      sessions: acc.sessions + (m.totalSessions || 0),
    }),
    { revenue: 0, mentorEarnings: 0, platformCommission: 0, pendingPayout: 0, paidPayout: 0, sessions: 0 }
  );

  if (loading) {
    return (
      <div className="animate-fade-in-up flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#5B21B6]" />
        <span className="ml-3 text-gray-500 font-medium">Loading mentor earnings...</span>
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
    <div className="animate-fade-in-up">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Earnings Overview</h1>
          <p className="text-gray-500 mt-1">Monitor mentor revenues, commissions, and payout status.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: totals.sessions.toString(), icon: <Users size={18} />, color: 'bg-purple-100 text-[#5B21B6]' },
          { label: 'Total Revenue', value: formatCurrency(totals.revenue), icon: <IndianRupee size={18} />, color: 'bg-blue-100 text-blue-600' },
          { label: 'Mentor Earnings', value: formatCurrency(totals.mentorEarnings), icon: <TrendingUp size={18} />, color: 'bg-green-100 text-green-600' },
          { label: 'Platform Commission', value: formatCurrency(totals.platformCommission), icon: <IndianRupee size={18} />, color: 'bg-amber-100 text-amber-600' },
          { label: 'Pending Payout', value: formatCurrency(totals.pendingPayout), icon: <Clock size={18} />, color: 'bg-orange-100 text-orange-600' },
          { label: 'Paid Out', value: formatCurrency(totals.paidPayout), icon: <CheckCircle size={18} />, color: 'bg-emerald-100 text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-lg font-black text-gray-900">{s.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per Mentor Cards */}
      <div className="space-y-4">
        {mentors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <IndianRupee size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-700 mb-1">No Earnings Data</h3>
            <p className="text-sm text-gray-500">Earnings will appear here once mentors complete sessions.</p>
          </div>
        ) : (
          mentors.map((mentor) => {
            const isExpanded = !!expanded[mentor.mentorId];
            const hasTx = mentor.transactions && mentor.transactions.length > 0;

            return (
              <div key={mentor.mentorId?.toString()} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Mentor Header */}
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
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#5B21B6]" />
                            Mentor Share: <span className="font-bold text-gray-700">{mentor.mentorSharePercentage}%</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Platform: <span className="font-bold text-gray-700">{mentor.platformCommissionPercentage}%</span>
                          </span>
                          <span>Session Fee: <span className="font-bold text-gray-700">{formatCurrency(mentor.sessionFee)}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 text-center">
                      <div>
                        <p className="text-lg font-black text-gray-900">{mentor.totalSessions}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Sessions</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900">{formatCurrency(mentor.totalRevenue)}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Revenue</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-emerald-600">{formatCurrency(mentor.totalMentorEarnings)}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Mentor Earnings</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-amber-600">{formatCurrency(mentor.totalPlatformCommission)}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Platform</p>
                      </div>
                      <div>
                        <p className={`text-lg font-black ${mentor.pendingPayout > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                          {formatCurrency(mentor.pendingPayout)}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand Transactions */}
                {hasTx && (
                  <>
                    <button
                      onClick={() => toggleExpand(mentor.mentorId?.toString())}
                      className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <span>View Transactions ({mentor.transactions.length})</span>
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
                              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Mentor %</th>
                              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Mentor Earnings</th>
                              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Platform Cut</th>
                              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payout</th>
                              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {mentor.transactions.map((tx: any) => (
                              <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                                  {formatDate(tx.createdAt)}
                                </td>
                                <td className="px-5 py-3.5">
                                  <p className="text-xs font-semibold text-gray-900 max-w-[140px] truncate">{tx.topic || 'Session'}</p>
                                  {tx.startupName && (
                                    <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{tx.startupName}</p>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-xs font-bold text-gray-900 text-right whitespace-nowrap">
                                  {formatCurrency(tx.sessionFee)}
                                </td>
                                <td className="px-5 py-3.5 text-xs font-bold text-[#5B21B6] text-right whitespace-nowrap">
                                  {tx.mentorSharePercentage}%
                                </td>
                                <td className="px-5 py-3.5 text-xs font-black text-emerald-600 text-right whitespace-nowrap">
                                  {formatCurrency(tx.mentorEarnings)}
                                </td>
                                <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 text-right whitespace-nowrap">
                                  {formatCurrency(tx.platformCommission)}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PAYMENT_STYLES[tx.paymentStatus] || PAYMENT_STYLES.pending}`}>
                                    {tx.paymentStatus?.charAt(0).toUpperCase() + tx.paymentStatus?.slice(1)}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PAYOUT_STYLES[tx.payoutStatus] || PAYOUT_STYLES.pending}`}>
                                    {tx.payoutStatus?.charAt(0).toUpperCase() + tx.payoutStatus?.slice(1)}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  {tx.payoutStatus !== 'paid' ? (
                                    <div className="flex gap-1.5">
                                      {tx.payoutStatus === 'pending' && (
                                        <button
                                          onClick={() => handlePayoutUpdate(tx._id, 'processing')}
                                          disabled={updating[tx._id]}
                                          className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                        >
                                          {updating[tx._id] ? <Loader2 size={10} className="animate-spin" /> : 'Process'}
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handlePayoutUpdate(tx._id, 'paid')}
                                        disabled={updating[tx._id]}
                                        className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                      >
                                        {updating[tx._id] ? <Loader2 size={10} className="animate-spin" /> : 'Mark Paid'}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-medium text-emerald-600">✓ Paid</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {!hasTx && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-xs text-gray-400 italic">No transactions yet for this mentor.</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminMentorEarnings;
