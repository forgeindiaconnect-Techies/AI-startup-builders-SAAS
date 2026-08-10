import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  X,
  CreditCard,
  Building,
  Send,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { getMentorEarnings, requestWithdrawal } from '../../../utils/mentorApi';

const WITHDRAWAL_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 border-red-200' },
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

const MentorEarnings: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [method, setMethod] = useState<'upi' | 'bank_account'>('upi');
  const [amount, setAmount] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMentorEarnings();
      setSummary(data.summary);
      setTransactions(data.transactions || []);
      setWithdrawals(data.withdrawals || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const openWithdrawModal = () => {
    const avail = summary?.availableToWithdraw || 0;
    setAmount(avail > 0 ? String(avail) : '');
    setFormError('');
    setFormSuccess('');
    setShowWithdrawModal(true);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const numAmount = Number(amount);
    const avail = summary?.availableToWithdraw || 0;

    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid withdrawal amount.');
      return;
    }

    if (numAmount > avail) {
      setFormError(`Withdrawal amount cannot exceed your available balance of ${formatCurrency(avail)}.`);
      return;
    }

    if (method === 'upi' && !upiId.trim()) {
      setFormError('Please enter your UPI ID.');
      return;
    }

    if (method === 'bank_account') {
      if (!accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
        setFormError('Please complete all required bank account fields.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await requestWithdrawal({
        amount: numAmount,
        withdrawalMethod: method,
        upiId: upiId.trim(),
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
      });
      setFormSuccess('Withdrawal request submitted successfully!');
      setTimeout(() => {
        setShowWithdrawModal(false);
        fetchEarnings();
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchEarnings}
          className="px-4 py-2 bg-[#5B21B6] text-white rounded-xl font-bold text-sm hover:bg-[#7C3AED] transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const availableBalance = summary?.availableToWithdraw || 0;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
          <p className="text-gray-500 mt-1">Track your session income, request withdrawals, and monitor payout status.</p>
        </div>
        <button
          onClick={fetchEarnings}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Top 5 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Earnings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Total Earnings</p>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(summary?.totalEarnings || 0)}</p>
          <p className="text-[11px] text-gray-400 mt-1">All-time bookings</p>
        </div>

        {/* This Month */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">This Month</p>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600">{formatCurrency(summary?.thisMonthEarnings || 0)}</p>
        </div>

        {/* Available to Withdraw */}
        <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <IndianRupee size={60} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">Available to Withdraw</p>
          <p className="text-2xl font-black mb-3">{formatCurrency(availableBalance)}</p>
          <button
            onClick={openWithdrawModal}
            disabled={availableBalance <= 0}
            className="w-full py-2 bg-white text-gray-900 rounded-xl text-xs font-bold shadow hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight size={14} /> Withdraw Earnings
          </button>
        </div>

        {/* Pending Withdrawal */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pending Withdrawal</p>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{formatCurrency(summary?.pendingWithdrawal || 0)}</p>
        </div>

        {/* Paid Out */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Paid Out</p>
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(summary?.paidOut || 0)}</p>
        </div>
      </div>

      {/* Commission Structure Banner */}
      {summary && (
        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-[#5B21B6] uppercase tracking-wider mb-1">Your Configured Payment Settings</h3>
            <p className="text-sm font-semibold text-gray-800">
              Session Fee: <strong className="text-gray-900">{formatCurrency(summary.sessionFee)}</strong> | Your Share:{' '}
              <strong className="text-emerald-700">{summary.mentorSharePercentage}%</strong> | Platform Commission:{' '}
              <strong className="text-amber-700">{summary.platformCommissionPercentage}%</strong>
            </p>
          </div>
          <span className="text-[11px] font-bold bg-white text-[#5B21B6] px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm">
            🔒 Managed by Admin
          </span>
        </div>
      )}

      {/* Withdrawals Section */}
      {withdrawals.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">Withdrawal History</h2>
            <span className="text-xs font-semibold text-gray-500">{withdrawals.length} request(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Requested Date</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Details</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Reference / UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {withdrawals.map((w) => {
                  const statusStyle = WITHDRAWAL_STATUS_STYLES[w.status] || WITHDRAWAL_STATUS_STYLES.pending;
                  return (
                    <tr key={w._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{formatDate(w.requestedAt || w.createdAt)}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-gray-900 uppercase">{w.withdrawalMethod === 'upi' ? 'UPI' : 'Bank Transfer'}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">
                        {w.withdrawalMethod === 'upi' ? (
                          <span className="font-semibold text-purple-950">{w.upiId}</span>
                        ) : (
                          <span>
                            {w.accountHolderName} ({w.bankName}) - <strong className="text-gray-900">{w.accountNumber}</strong>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-black text-gray-900 text-right whitespace-nowrap">{formatCurrency(w.amount)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 font-mono">
                        {w.transactionReference ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {w.transactionReference}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Pending payout</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Mentoring Session Transactions</h2>
          <p className="text-xs text-gray-500 mt-0.5">Historical session revenue snapshots (immutable)</p>
        </div>

        {transactions.length === 0 ? (
          <div className="py-16 text-center">
            <IndianRupee size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-700 mb-1">No Session Transactions</h3>
            <p className="text-xs text-gray-500">Your session earnings snapshots will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Topic / Session</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Founder / Startup</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Fee</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Share %</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Your Earnings</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Platform Cut</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-900 max-w-[150px] truncate">{tx.topic || 'Mentoring Session'}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-700">{tx.founderName || 'Founder'}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-gray-900 text-right whitespace-nowrap">{formatCurrency(tx.sessionFee)}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-[#5B21B6] text-right whitespace-nowrap">{tx.mentorSharePercentage}%</td>
                    <td className="px-5 py-3.5 text-xs font-black text-emerald-600 text-right whitespace-nowrap">{formatCurrency(tx.mentorEarnings)}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 text-right whitespace-nowrap">{formatCurrency(tx.platformCommission)}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {tx.paymentStatus?.toUpperCase() || 'PAID'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-6 py-4 flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-base">Withdraw Earnings</h3>
                <p className="text-xs text-purple-200">Submit a payout request to Admin</p>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-purple-200 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4">
              {/* Balance Box */}
              <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Available Balance</span>
                <span className="text-xl font-black text-[#5B21B6]">{formatCurrency(availableBalance)}</span>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Withdrawal Amount (₹) *</label>
                <input
                  type="number"
                  min={1}
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-none text-sm font-bold text-gray-900"
                />
              </div>

              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Withdrawal Method *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                      method === 'upi'
                        ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard size={16} /> UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('bank_account')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                      method === 'bank_account'
                        ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Building size={16} /> Bank Account
                  </button>
                </div>
              </div>

              {/* UPI Fields */}
              {method === 'upi' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">UPI ID *</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mentor@upi or mobile@paytm"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-none text-sm font-medium text-gray-900"
                  />
                </div>
              )}

              {/* Bank Account Fields */}
              {method === 'bank_account' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Name as in bank account"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-[#5B21B6] outline-none text-xs font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-[#5B21B6] outline-none text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="e.g. HDFC0001234"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-[#5B21B6] outline-none text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Account Number *</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-[#5B21B6] outline-none text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {formError && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100">{formError}</p>
              )}
              {formSuccess && (
                <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">{formSuccess}</p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl transition-colors shadow flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {submitting ? 'Submitting...' : 'Submit Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorEarnings;
