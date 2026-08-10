import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Clock, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { getMentorEarnings } from '../../../utils/mentorApi';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 border-red-200' },
  refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const PAYOUT_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 border-red-200' },
};

const formatCurrency = (v: number) =>
  `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const MentorEarnings: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMentorEarnings();
      setSummary(data.summary);
      setTransactions(data.transactions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in-up flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#5B21B6]" />
        <span className="ml-3 text-gray-500 font-medium">Loading earnings data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button onClick={fetchEarnings} className="px-4 py-2 bg-[#5B21B6] text-white rounded-xl font-bold text-sm hover:bg-[#7C3AED] transition-colors flex items-center gap-2 mx-auto">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
          <p className="text-gray-500 mt-1">Track your session earnings and payout history.</p>
        </div>
        <button onClick={fetchEarnings} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IndianRupee size={80} />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">Total Earnings</p>
          <p className="text-3xl font-black">{formatCurrency(summary?.totalEarnings || 0)}</p>
          <p className="text-xs text-purple-200 mt-2 font-medium">Your {summary?.mentorSharePercentage ?? 80}% share</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
              <TrendingUp size={20} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">This Month</p>
          </div>
          <p className="text-3xl font-black text-gray-900">{formatCurrency(summary?.thisMonthEarnings || 0)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
              <Clock size={20} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Payout</p>
          </div>
          <p className="text-3xl font-black text-amber-600">{formatCurrency(summary?.pendingEarnings || 0)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle size={20} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Paid Out</p>
          </div>
          <p className="text-3xl font-black text-emerald-600">{formatCurrency(summary?.paidEarnings || 0)}</p>
        </div>
      </div>

      {/* Commission Info (Read-Only) */}
      {summary && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Your Commission Structure</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5B21B6] flex items-center justify-center text-white font-black text-sm">
                {summary.mentorSharePercentage}%
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Your Share</p>
                <p className="font-bold text-gray-900 text-sm">Mentor Earnings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-sm">
                {summary.platformCommissionPercentage}%
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Platform Commission</p>
                <p className="font-bold text-gray-900 text-sm">AI Startup Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-black text-sm">
                <IndianRupee size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Session Fee</p>
                <p className="font-bold text-gray-900 text-sm">{formatCurrency(summary.sessionFee || 0)} per session</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 italic">Commission settings are managed by Admin. Contact admin to update.</p>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
          <p className="text-sm text-gray-500 mt-0.5">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} recorded</p>
        </div>

        {transactions.length === 0 ? (
          <div className="py-16 text-center">
            <IndianRupee size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-700 mb-1">No Transactions Yet</h3>
            <p className="text-sm text-gray-500">Your earnings from completed sessions will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Session / Topic</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Founder / Startup</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Fee</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Your Share</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Your Earnings</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Platform Cut</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => {
                  const pyStatus = PAYOUT_STYLES[tx.payoutStatus] || PAYOUT_STYLES.pending;
                  const pmStatus = STATUS_STYLES[tx.paymentStatus] || STATUS_STYLES.pending;
                  return (
                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 max-w-[160px] truncate">{tx.topic || 'Mentoring Session'}</p>
                        {tx.sessionDate && <p className="text-xs text-gray-400">{tx.sessionDate}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{tx.founderName || '—'}</p>
                        {tx.startupName && <p className="text-xs text-gray-400 truncate max-w-[130px]">{tx.startupName}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(tx.sessionFee)}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#5B21B6] text-right whitespace-nowrap">
                        {tx.mentorSharePercentage}%
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-emerald-600 text-right whitespace-nowrap">
                        {formatCurrency(tx.mentorEarnings)}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-500 text-right whitespace-nowrap">
                        {formatCurrency(tx.platformCommission)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${pmStatus.className}`}>
                          {pmStatus.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${pyStatus.className}`}>
                          {pyStatus.label}
                        </span>
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
  );
};

export default MentorEarnings;
