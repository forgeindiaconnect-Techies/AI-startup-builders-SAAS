import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Save,
  Percent,
  TrendingUp,
  Briefcase,
  Calendar,
  Wallet,
  Coins,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  User,
  Building,
  KeyRound,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { API_URL } from '../../../config/api';

const TOKEN_KEY = 'ai_startup_builder_jwt';

interface PlatformRevenueData {
  totalMentorTransactions: number;
  totalMentorRevenue: number;
  totalMentorCommission: number;
  totalInvestorTransactions: number;
  totalInvestorCommission: number;
  totalPlatformCommission: number;
  totalPlatformRevenue: number;
  availablePlatformBalance: number;
  pendingPlatformWithdrawals: number;
  totalAmountWithdrawn: number;
  currentAvailableWithdrawalBalance: number;
  mentorTransactions: any[];
  investorTransactions: any[];
  withdrawals: any[];
}

interface CommissionSettingsData {
  mentorCommission: number;
  investorCommission: number;
  investorCommissionPayer: 'investor' | 'founder';
}

const AdminPlatformRevenue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mentor' | 'investor' | 'withdrawals' | 'settings'>('overview');
  const [revenueData, setRevenueData] = useState<PlatformRevenueData | null>(null);
  const [settings, setSettings] = useState<CommissionSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank_transfer' | 'upi' | 'other'>('bank_transfer');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [otherDetails, setOtherDetails] = useState('');

  // Admin Payout Processing states
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);
  const [utrReference, setUtrReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const revenueRes = await fetch(`${API_URL}/admin/platform-revenue`, { headers });
      const revenueJson = await revenueRes.json();
      if (!revenueRes.ok) throw new Error(revenueJson.message || 'Failed to fetch platform revenue');

      const settingsRes = await fetch(`${API_URL}/admin/commission-settings`, { headers });
      const settingsJson = await settingsRes.json();
      if (!settingsRes.ok) throw new Error(settingsJson.message || 'Failed to fetch commission settings');

      setRevenueData(revenueJson.data);
      setSettings(settingsJson.data);
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to the server');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSubmittingSettings(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/admin/commission-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update commission settings');

      setSuccessMessage('Commission settings updated successfully!');
      setSettings(result.data);
      fetchDashboardData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings');
    } finally {
      setSubmittingSettings(false);
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revenueData) return;
    setSubmittingWithdrawal(true);
    setErrorMessage('');
    setSuccessMessage('');

    const amountNum = Number(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount.');
      setSubmittingWithdrawal(false);
      return;
    }

    if (amountNum > revenueData.currentAvailableWithdrawalBalance) {
      setErrorMessage('Withdrawal amount exceeds your current available withdrawal balance.');
      setSubmittingWithdrawal(false);
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/admin/platform-withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          amount: amountNum,
          withdrawalMethod: withdrawMethod,
          upiId,
          accountHolderName,
          bankName,
          accountNumber,
          ifscCode,
          otherDetails,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to request withdrawal');

      setSuccessMessage('Withdrawal request submitted successfully!');
      setWithdrawAmount('');
      setUpiId('');
      setAccountHolderName('');
      setBankName('');
      setAccountNumber('');
      setIfscCode('');
      setOtherDetails('');
      fetchDashboardData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit withdrawal');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string) => {
    setActionError('');
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/admin/platform-withdrawals/${withdrawalId}/process`, {
        method: 'PUT',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to process withdrawal');

      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to process withdrawal request');
    }
  };

  const handleCompleteWithdrawal = async (withdrawalId: string, status: 'paid' | 'failed') => {
    setActionError('');
    if (status === 'paid' && !utrReference.trim()) {
      setActionError('Transaction/UTR Reference ID is required to mark as Paid.');
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/admin/platform-withdrawals/${withdrawalId}/mark-paid`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          status,
          transactionReference: utrReference,
          adminNotes,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update withdrawal status');

      setProcessingWithdrawalId(null);
      setUtrReference('');
      setAdminNotes('');
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update withdrawal request');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium text-sm">Loading Platform Revenue Dashboard...</p>
      </div>
    );
  }

  const data = revenueData || {
    totalMentorTransactions: 0,
    totalMentorRevenue: 0,
    totalMentorCommission: 0,
    totalInvestorTransactions: 0,
    totalInvestorCommission: 0,
    totalPlatformCommission: 0,
    totalPlatformRevenue: 0,
    availablePlatformBalance: 0,
    pendingPlatformWithdrawals: 0,
    totalAmountWithdrawn: 0,
    currentAvailableWithdrawalBalance: 0,
    mentorTransactions: [],
    investorTransactions: [],
    withdrawals: [],
  };

  // Helper formatting functions
  const formatCurrency = (val: number) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtered Lists
  const filteredMentorTransactions = data.mentorTransactions.filter(t => {
    const term = searchQuery.toLowerCase();
    return (
      (t.mentorName || '').toLowerCase().includes(term) ||
      (t.founderName || '').toLowerCase().includes(term) ||
      (t.topic || '').toLowerCase().includes(term)
    );
  });

  const filteredInvestorTransactions = data.investorTransactions.filter(t => {
    const term = searchQuery.toLowerCase();
    return (
      (t.investorName || '').toLowerCase().includes(term) ||
      (t.startupName || '').toLowerCase().includes(term) ||
      (t.instrument || '').toLowerCase().includes(term)
    );
  });

  const filteredWithdrawals = data.withdrawals.filter(w => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Coins className="text-[#5B21B6]" /> Platform Revenue & Commission
          </h1>
          <p className="text-gray-500 mt-1">Configure platform rates, track collections, and manage payout disbursements.</p>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm flex items-start gap-2.5">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm flex items-start gap-2.5">
          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Platform Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-1.5 bg-purple-50 text-[#5B21B6] rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.totalPlatformRevenue)}</h3>
            <p className="text-[10px] text-gray-500 font-bold mt-1">Total platform share</p>
          </div>
        </div>

        {/* Available Withdrawal Balance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4.5 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Available Revenue</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.availablePlatformBalance)}</h3>
            <p className="text-[10px] text-gray-500 font-bold mt-1">Net revenue in hand</p>
          </div>
        </div>

        {/* Current Available Withdrawal Balance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Available for Payout</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><ArrowUpRight size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.currentAvailableWithdrawalBalance)}</h3>
            <p className="text-[10px] text-gray-500 font-bold mt-1">Excludes pending queues</p>
          </div>
        </div>

        {/* Mentor Commission */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mentor Comm</span>
            <div className="p-1.5 bg-purple-50 text-[#5B21B6] rounded-lg"><Percent size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.totalMentorCommission)}</h3>
            <p className="text-[10px] text-gray-500 font-bold mt-1">{data.totalMentorTransactions} sessions paid</p>
          </div>
        </div>

        {/* Investor Commission */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Investor Comm</span>
            <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg"><Percent size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.totalInvestorCommission)}</h3>
            <p className="text-[10px] text-gray-500 font-bold mt-1">{data.totalInvestorTransactions} deals completed</p>
          </div>
        </div>

        {/* Total Amount Withdrawn */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Withdrawn</span>
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><CheckCircle2 size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.totalAmountWithdrawn)}</h3>
            <p className="text-[10px] text-gray-500 font-bold mt-1">{formatCurrency(data.pendingPlatformWithdrawals)} pending requests</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: Coins },
          { id: 'mentor', label: 'Mentor Commissions', icon: Briefcase },
          { id: 'investor', label: 'Investor Commissions', icon: TrendingUp },
          { id: 'withdrawals', label: 'Admin Withdrawals', icon: Wallet },
          { id: 'settings', label: 'Commission Settings', icon: Percent },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === tab.id ? 'bg-white text-[#5B21B6] shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detailed Revenue Split */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#5B21B6]" /> Platform Revenue Distribution
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/80">
                <span className="text-xs font-bold text-purple-600 block mb-1">Mentor Transaction Splits</span>
                <div className="flex justify-between items-end mt-2">
                  <div>
                    <p className="text-2xl font-black text-gray-900">{formatCurrency(data.totalMentorCommission)}</p>
                    <p className="text-[10px] text-gray-500 font-bold">Collected Commissions (Avg: {settings?.mentorCommission}% per call)</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Fee total: {formatCurrency(data.totalMentorRevenue)}</span>
                </div>
              </div>
              <div className="p-4 bg-yellow-50/40 rounded-xl border border-yellow-100/80">
                <span className="text-xs font-bold text-yellow-700 block mb-1">Investor Transaction Splits</span>
                <div className="flex justify-between items-end mt-2">
                  <div>
                    <p className="text-2xl font-black text-gray-900">{formatCurrency(data.totalInvestorCommission)}</p>
                    <p className="text-[10px] text-gray-500 font-bold">Collected Commissions (Avg: {settings?.investorCommission}% per deal)</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Deals: {data.totalInvestorTransactions}</span>
                </div>
              </div>
            </div>

            {/* Financial Ledger Explanation */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-2">
              <p className="font-bold text-gray-700">Accounting Rules & Legality Checklist:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Every collection snapshot (Mentor & Investor) is immutable after payment confirmation.</li>
                <li>Changes made to commission rates will only impact future checkout sessions.</li>
                <li>Admin withdrawal balances strictly reflect net platform revenue minus completed payouts.</li>
              </ul>
            </div>
          </div>

          {/* Quick Balance Payout Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet size={18} className="text-emerald-600" /> Platform Payout
              </h2>
              <div className="p-4.5 bg-emerald-50/40 rounded-xl border border-emerald-100 mb-5 text-center">
                <p className="text-xs text-emerald-800 font-bold mb-1">Total Available Withdrawal Balance</p>
                <h3 className="text-3xl font-black text-gray-900">{formatCurrency(data.currentAvailableWithdrawalBalance)}</h3>
                <p className="text-[10px] text-gray-400 mt-2">Available for immediate disbursement</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Platform revenue is stored in the primary platform account. Use the <strong>Admin Withdrawals</strong> tab to submit a new payout request or monitor bank transfers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className="mt-6 w-full py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Request Withdrawal <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Mentor Commission */}
      {activeTab === 'mentor' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">Mentor Commission Ledgers</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search mentor or founder..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6] font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Session Date</th>
                  <th className="p-3.5">Mentor</th>
                  <th className="p-3.5">Founder</th>
                  <th className="p-3.5">Topic</th>
                  <th className="p-3.5 text-right">Fee</th>
                  <th className="p-3.5 text-center">Comm %</th>
                  <th className="p-3.5 text-right">Platform Revenue</th>
                  <th className="p-3.5 text-right">Mentor Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {filteredMentorTransactions.length > 0 ? (
                  filteredMentorTransactions.map((tx, idx) => (
                    <tr key={tx._id || idx} className="hover:bg-gray-55/20">
                      <td className="p-3.5 text-gray-500">{formatDate(tx.sessionDate || tx.createdAt)}</td>
                      <td className="p-3.5 text-gray-900 font-bold">{tx.mentorName || '—'}</td>
                      <td className="p-3.5">{tx.founderName || '—'}</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px]">{tx.topic || 'Mentoring'}</span></td>
                      <td className="p-3.5 text-right text-gray-900">{formatCurrency(tx.sessionFee)}</td>
                      <td className="p-3.5 text-center text-purple-600 font-bold">{tx.platformCommissionPercentage}%</td>
                      <td className="p-3.5 text-right text-emerald-600 font-bold">{formatCurrency(tx.platformCommission)}</td>
                      <td className="p-3.5 text-right font-bold">{formatCurrency(tx.mentorEarnings)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-400 italic">
                      No matching mentor session revenue records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Investor Commission */}
      {activeTab === 'investor' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">Investor Commission Ledgers</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search investor or startup..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6] font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Settled Date</th>
                  <th className="p-3.5">Investor</th>
                  <th className="p-3.5">Startup</th>
                  <th className="p-3.5 text-right">Investment Amount</th>
                  <th className="p-3.5 text-center">Comm %</th>
                  <th className="p-3.5 text-right">Platform Revenue</th>
                  <th className="p-3.5 text-right">Founder Allocation</th>
                  <th className="p-3.5 text-center">Fee Paid By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {filteredInvestorTransactions.length > 0 ? (
                  filteredInvestorTransactions.map((tx, idx) => {
                    const rate = tx.commissionRate ?? 2;
                    const commAmount = tx.commissionAmount ?? ((tx.offerAmount * rate) / 100);
                    const payer = tx.commissionPayer || 'investor';
                    const founderAlloc = payer === 'founder' ? tx.offerAmount - commAmount : tx.offerAmount;

                    return (
                      <tr key={tx._id || idx} className="hover:bg-gray-55/20">
                        <td className="p-3.5 text-gray-500">{formatDate(tx.paymentDate || tx.updatedAt)}</td>
                        <td className="p-3.5 text-gray-900 font-bold">{tx.investorName || tx.investorCompany || '—'}</td>
                        <td className="p-3.5 font-bold">{tx.startupName || '—'}</td>
                        <td className="p-3.5 text-right text-gray-900">{formatCurrency(tx.offerAmount)}</td>
                        <td className="p-3.5 text-center text-yellow-600 font-bold">{rate}%</td>
                        <td className="p-3.5 text-right text-emerald-600 font-bold">{formatCurrency(commAmount)}</td>
                        <td className="p-3.5 text-right font-bold">{formatCurrency(founderAlloc)}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            payer === 'investor' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                          }`}>
                            {payer === 'investor' ? 'Investor' : 'Founder/Startup'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-400 italic">
                      No matching investor deal revenue records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Admin Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit Withdrawal Request Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Wallet size={18} className="text-[#5B21B6]" /> Request Payout
              </h2>
              <p className="text-xs text-gray-400 mt-1">Disburse accumulated platform commissions into bank or UPI accounts.</p>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Amount to Withdraw (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B21B6] font-semibold text-gray-800"
                    required
                    min={1}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Available: {formatCurrency(data.currentAvailableWithdrawalBalance)}</p>
              </div>

              {/* Method */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Disbursement Mode</label>
                <select
                  value={withdrawMethod}
                  onChange={e => setWithdrawMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#5B21B6]"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI Address</option>
                  <option value="other">Other Details</option>
                </select>
              </div>

              {/* Conditional Inputs */}
              {withdrawMethod === 'upi' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">UPI ID / Address</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="e.g. name@upi"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B21B6]"
                    required
                  />
                </div>
              )}

              {withdrawMethod === 'bank_transfer' && (
                <div className="space-y-3.5 border-t border-gray-50 pt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Account Holder Name</label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={e => setAccountHolderName(e.target.value)}
                      placeholder="Enter legal bank name"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#5B21B6]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#5B21B6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#5B21B6]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={e => setIfscCode(e.target.value)}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#5B21B6]"
                      required
                    />
                  </div>
                </div>
              )}

              {withdrawMethod === 'other' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Alternative Payment Details</label>
                  <textarea
                    value={otherDetails}
                    onChange={e => setOtherDetails(e.target.value)}
                    placeholder="Enter manual payout account logs or special instructions..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6]"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submittingWithdrawal}
                className="w-full py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                {submittingWithdrawal ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                ) : null}
                Request Payout
              </button>
            </form>
          </div>

          {/* Withdrawal History & Payout Operations */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-base font-bold text-gray-900">Withdrawal History & Operations</h2>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((w, idx) => (
                  <div key={w._id || idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/20 hover:bg-gray-50/50 transition-colors space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-sm">{formatCurrency(w.amount)}</span>
                          <span className="text-xs text-gray-400 font-bold">•</span>
                          <span className="text-xs text-gray-500 font-semibold uppercase">{w.withdrawalMethod.replace('_', ' ')}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Requested {formatDate(w.createdAt)}</p>
                      </div>

                      {/* Badges */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        w.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : w.status === 'processing'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : w.status === 'failed'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                        {w.status}
                      </span>
                    </div>

                    {/* Account Details info block */}
                    <div className="text-[11px] text-gray-600 font-medium grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-white p-3 rounded-lg border border-gray-50">
                      {w.withdrawalMethod === 'upi' && (
                        <div><span className="text-gray-400">UPI Address:</span> <strong className="text-gray-800">{w.upiId}</strong></div>
                      )}
                      {w.withdrawalMethod === 'bank_transfer' && (
                        <>
                          <div><span className="text-gray-400">Holder:</span> <strong className="text-gray-800">{w.accountHolderName}</strong></div>
                          <div><span className="text-gray-400">Bank:</span> <strong className="text-gray-800">{w.bankName || '—'}</strong></div>
                          <div><span className="text-gray-400">A/C:</span> <strong className="text-gray-800">{w.accountNumber}</strong></div>
                          <div><span className="text-gray-400">IFSC:</span> <strong className="text-gray-800">{w.ifscCode}</strong></div>
                        </>
                      )}
                      {w.withdrawalMethod === 'other' && (
                        <div className="col-span-2"><span className="text-gray-400">Details:</span> <strong className="text-gray-800">{w.otherDetails}</strong></div>
                      )}

                      {w.status === 'paid' && (
                        <div className="col-span-2 mt-2 pt-2 border-t border-gray-50 flex flex-wrap justify-between gap-1 text-[10px] text-gray-500">
                          <span>Ref: <strong className="text-emerald-700 font-mono font-bold">{w.transactionReference}</strong></span>
                          {w.processedBy && <span>Settled by: <strong>{w.processedBy.fullName || 'Admin'}</strong> on {formatDate(w.processedAt)}</span>}
                        </div>
                      )}
                      {w.adminNotes && (
                        <div className="col-span-2 text-[10px] text-gray-500 italic mt-1">Note: {w.adminNotes}</div>
                      )}
                    </div>

                    {/* Operations for Admin payouts */}
                    {(w.status === 'pending' || w.status === 'processing') && (
                      <div className="flex flex-wrap items-center justify-end gap-2 mt-2 pt-1 border-t border-gray-50/50">
                        {w.status === 'pending' && (
                          <button
                            onClick={() => handleProcessWithdrawal(w._id)}
                            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors border border-blue-200 cursor-pointer"
                          >
                            Process Request
                          </button>
                        )}
                        {processingWithdrawalId !== w._id ? (
                          <button
                            onClick={() => {
                              setProcessingWithdrawalId(w._id);
                              setUtrReference('');
                              setAdminNotes('');
                              setActionError('');
                            }}
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold transition-colors border border-emerald-200 cursor-pointer"
                          >
                            Settle / Mark Paid
                          </button>
                        ) : (
                          <div className="w-full bg-white p-3 border border-gray-100 rounded-xl space-y-3 mt-2 text-left">
                            <h4 className="text-[11px] font-bold text-gray-900">Provide Settlement Details:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">UTR / Transaction Reference ID</label>
                                <input
                                  type="text"
                                  placeholder="Enter payment reference"
                                  value={utrReference}
                                  onChange={e => setUtrReference(e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-[#5B21B6]"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Internal Notes</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Sent via NetBanking"
                                  value={adminNotes}
                                  onChange={e => setAdminNotes(e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-[#5B21B6]"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setProcessingWithdrawalId(null)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[11px] font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCompleteWithdrawal(w._id, 'failed')}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 text-[11px] font-bold cursor-pointer"
                              >
                                Mark Failed
                              </button>
                              <button
                                onClick={() => handleCompleteWithdrawal(w._id, 'paid')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                              >
                                Confirm Paid
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm italic border border-dashed border-gray-200 rounded-xl bg-gray-50/20">
                  No withdrawals found matching the filter criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Commission Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Percent size={18} className="text-[#5B21B6]" /> Platform Commission Rates
            </h2>
            <p className="text-xs text-gray-400 mt-1">Configure global percentage shares for mentor sessions and investor deals.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Mentor Commission */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase flex items-center gap-1.5">
                  <Briefcase size={14} className="text-purple-600" /> Mentor Platform Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings?.mentorCommission ?? 20}
                    onChange={e => setSettings(prev => prev ? { ...prev, mentorCommission: Number(e.target.value) } : null)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-bold text-gray-700 text-sm"
                    min={0}
                    max={100}
                    required
                  />
                  <span className="absolute right-4 top-2.5 text-gray-400 font-bold text-sm">%</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Remaining percentage goes directly to the mentor.</p>
              </div>

              {/* Investor Commission */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-yellow-600" /> Investor Platform Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings?.investorCommission ?? 2}
                    onChange={e => setSettings(prev => prev ? { ...prev, investorCommission: Number(e.target.value) } : null)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-bold text-gray-700 text-sm"
                    min={0}
                    max={100}
                    required
                  />
                  <span className="absolute right-4 top-2.5 text-gray-400 font-bold text-sm">%</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Calculated from transacted investment totals.</p>
              </div>
            </div>

            {/* responsible payer choice */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase flex items-center gap-1.5">
                <User size={14} className="text-indigo-600" /> Responsible Payer for Investor Commission
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  settings?.investorCommissionPayer === 'investor'
                    ? 'border-[#5B21B6] bg-purple-50/20'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                }`}>
                  <input
                    type="radio"
                    name="investorCommissionPayer"
                    value="investor"
                    checked={settings?.investorCommissionPayer === 'investor'}
                    onChange={() => setSettings(prev => prev ? { ...prev, investorCommissionPayer: 'investor' } : null)}
                    className="accent-[#5B21B6]"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Investor Pays Fee</span>
                    <span className="text-[10px] text-gray-400">Commission is charged on top of or billed to the investor.</span>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  settings?.investorCommissionPayer === 'founder'
                    ? 'border-[#5B21B6] bg-purple-50/20'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                }`}>
                  <input
                    type="radio"
                    name="investorCommissionPayer"
                    value="founder"
                    checked={settings?.investorCommissionPayer === 'founder'}
                    onChange={() => setSettings(prev => prev ? { ...prev, investorCommissionPayer: 'founder' } : null)}
                    className="accent-[#5B21B6]"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Founder / Startup Pays Fee</span>
                    <span className="text-[10px] text-gray-400">Commission is deducted from startup's transacted allocation.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
              <button
                type="submit"
                disabled={submittingSettings}
                className="flex items-center px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {submittingSettings ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                ) : (
                  <Save size={17} className="mr-2" />
                )}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPlatformRevenue;
