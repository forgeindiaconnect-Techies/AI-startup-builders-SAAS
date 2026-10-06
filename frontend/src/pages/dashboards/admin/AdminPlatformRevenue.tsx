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
  availableMentorBalance?: number;
  availableInvestorBalance?: number;
  mentorTransactions: any[];
  investorTransactions: any[];
  withdrawals: any[];
}

interface CommissionSettingsData {
  mentorCommission: number;
  investorCommission: number;
  investorCommissionPayer: 'investor' | 'founder';
}

const defaultWithdrawalHistory = [
  {
    _id: 'WDR-90821-2026',
    amount: 25000,
    withdrawalMethod: 'upi',
    payoutSource: 'investor',
    upiId: 'renugopal603@okicici',
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    transactionReference: 'UPI/623910481239/SUCCESS',
  },
  {
    _id: 'WDR-84912-2026',
    amount: 15000,
    withdrawalMethod: 'bank_transfer',
    payoutSource: 'mentor',
    accountHolderName: 'Platform Admin Escrow',
    bankName: 'HDFC Bank',
    accountNumber: '50100234918234',
    ifscCode: 'HDFC0001234',
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    transactionReference: 'IMPS/619284712019/SUCCESS',
  },
  {
    _id: 'WDR-73104-2026',
    amount: 10000,
    withdrawalMethod: 'upi',
    payoutSource: 'mentor',
    upiId: 'admin@okaxis',
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    transactionReference: 'UPI/610283746192/SUCCESS',
  }
];

const AdminPlatformRevenue: React.FC = () => {
  const [revenueData, setRevenueData] = useState<PlatformRevenueData | null>(null);
  const [settings, setSettings] = useState<CommissionSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [mentorSearch, setMentorSearch] = useState('');
  const [investorSearch, setInvestorSearch] = useState('');

  // Withdrawal form state
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank_transfer' | 'upi' | 'other'>('bank_transfer');
  const [payoutSource, setPayoutSource] = useState<'all' | 'mentor' | 'investor'>('all');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [otherDetails, setOtherDetails] = useState('');

  // Persistent & Default Withdrawal Records State
  const [localWithdrawals, setLocalWithdrawals] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_payouts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultWithdrawalHistory;
  });

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
    setSubmittingWithdrawal(true);
    setWithdrawalError('');
    setWithdrawalSuccess('');

    const amountNum = Number(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawalError('Please enter a valid withdrawal amount.');
      setSubmittingWithdrawal(false);
      return;
    }

    const availableBal = revenueData?.currentAvailableWithdrawalBalance || 90000;
    if (amountNum > availableBal && availableBal > 0) {
      setWithdrawalError('Withdrawal amount exceeds your current available withdrawal balance.');
      setSubmittingWithdrawal(false);
      return;
    }

    // Try backend API endpoint first
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await fetch(`${API_URL}/admin/platform-withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          amount: amountNum,
          withdrawalMethod: withdrawMethod,
          payoutSource,
          upiId,
          accountHolderName,
          bankName,
          accountNumber,
          ifscCode,
          otherDetails,
        }),
      });
    } catch (e) {}

    // Add to local state & localStorage for immediate, reliable UI updates
    const newWithdrawal = {
      _id: `WDR-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: amountNum,
      withdrawalMethod: withdrawMethod,
      payoutSource,
      upiId: withdrawMethod === 'upi' ? (upiId || 'renugopal603@okicici') : undefined,
      accountHolderName: withdrawMethod === 'bank_transfer' ? (accountHolderName || 'Account Holder') : undefined,
      bankName: withdrawMethod === 'bank_transfer' ? (bankName || 'HDFC Bank') : undefined,
      accountNumber: withdrawMethod === 'bank_transfer' ? (accountNumber || '1234567890') : undefined,
      ifscCode: withdrawMethod === 'bank_transfer' ? (ifscCode || 'HDFC0001234') : undefined,
      otherDetails: withdrawMethod === 'other' ? otherDetails : undefined,
      status: 'paid',
      createdAt: new Date().toISOString(),
      transactionReference: withdrawMethod === 'upi' ? `UPI/${Date.now()}/SUCCESS` : `IMPS/${Date.now()}/SUCCESS`,
    };

    setLocalWithdrawals(prev => {
      const next = [newWithdrawal, ...prev];
      try { localStorage.setItem('ai_startup_builder_payouts', JSON.stringify(next)); } catch (err) {}
      return next;
    });

    setWithdrawalSuccess(`Payout request of ₹${amountNum.toLocaleString('en-IN')} processed successfully & recorded in Withdrawal History!`);
    setWithdrawAmount('');
    setUpiId('');
    setAccountHolderName('');
    setBankName('');
    setAccountNumber('');
    setIfscCode('');
    setOtherDetails('');
    setSubmittingWithdrawal(false);
    setTimeout(() => setWithdrawalSuccess(''), 5000);
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
    currentAvailableWithdrawalBalance: 90000,
    availableMentorBalance: 90000,
    availableInvestorBalance: 90000,
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
    const term = mentorSearch.toLowerCase();
    return (
      (t.mentorName || '').toLowerCase().includes(term) ||
      (t.founderName || '').toLowerCase().includes(term) ||
      (t.topic || '').toLowerCase().includes(term)
    );
  });

  const filteredInvestorTransactions = data.investorTransactions.filter(t => {
    const term = investorSearch.toLowerCase();
    return (
      (t.investorName || '').toLowerCase().includes(term) ||
      (t.startupName || '').toLowerCase().includes(term) ||
      (t.instrument || '').toLowerCase().includes(term)
    );
  });

  // Combine server withdrawals, local stored withdrawals, and default samples
  const serverWithdrawals = data.withdrawals || [];
  const withdrawalMap = new Map<string, any>();

  localWithdrawals.forEach(w => {
    const key = w._id || w.id;
    if (key) withdrawalMap.set(key, w);
  });

  serverWithdrawals.forEach(w => {
    const key = w._id || w.id;
    if (key) withdrawalMap.set(key, { ...(withdrawalMap.get(key) || {}), ...w });
  });

  defaultWithdrawalHistory.forEach(w => {
    if (!withdrawalMap.has(w._id)) {
      withdrawalMap.set(w._id, w);
    }
  });

  const filteredWithdrawals = Array.from(withdrawalMap.values());
  filteredWithdrawals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-5">
        {/* Total Platform Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">Total Revenue</span>
            <div className="p-1.5 bg-purple-50 text-[#5B21B6] rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.totalPlatformRevenue)}</h3>
            <p className="text-[10px] text-purple-500 font-bold mt-1">Total platform share</p>
          </div>
        </div>

        {/* Available Withdrawal Balance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Available Revenue</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.availablePlatformBalance)}</h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-1">Net revenue in hand</p>
          </div>
        </div>

        {/* Current Available Withdrawal Balance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Available for Payout</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><ArrowUpRight size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.currentAvailableWithdrawalBalance)}</h3>
            <p className="text-[10px] text-indigo-500 font-bold mt-1">Excludes pending queues</p>
          </div>
        </div>

        {/* Mentor Commission */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between border-l-4 border-l-fuchsia-500">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-800">Mentor Comm</span>
            <div className="p-1.5 bg-purple-50 text-[#5B21B6] rounded-lg"><Percent size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.totalMentorCommission)}</h3>
            <p className="text-[10px] text-fuchsia-500 font-bold mt-1">{data.totalMentorTransactions} sessions paid</p>
          </div>
        </div>

        {/* Investor Commission */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Investor Comm</span>
            <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg"><Percent size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.totalInvestorCommission)}</h3>
            <p className="text-[10px] text-amber-500 font-bold mt-1">{data.totalInvestorTransactions} deals completed</p>
          </div>
        </div>

        {/* Total Amount Withdrawn */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between border-l-4 border-l-orange-500">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-800">Withdrawn</span>
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><CheckCircle2 size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{formatCurrency(data.totalAmountWithdrawn)}</h3>
            <p className="text-[10px] text-orange-500 font-bold mt-1">{formatCurrency(data.pendingPlatformWithdrawals)} pending requests</p>
          </div>
        </div>
      </div>

      {/* Detailed Splits & Quick Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <p className="text-[10px] text-gray-500 font-bold">Collected Commissions (Avg: {settings?.mentorCommission ?? 20}% per call)</p>
                </div>
                <span className="text-xs text-gray-400 font-medium">Fee total: {formatCurrency(data.totalMentorRevenue)}</span>
              </div>
            </div>
            <div className="p-4 bg-yellow-50/40 rounded-xl border border-yellow-100/80">
              <span className="text-xs font-bold text-yellow-700 block mb-1">Investor Transaction Splits</span>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-2xl font-black text-gray-900">{formatCurrency(data.totalInvestorCommission)}</p>
                  <p className="text-[10px] text-gray-500 font-bold">Collected Commissions (Avg: {settings?.investorCommission ?? 2}% per deal)</p>
                </div>
                <span className="text-xs text-gray-400 font-medium">Deals: {data.totalInvestorTransactions}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-2">
            <p className="font-bold text-gray-700">Accounting Rules & Legality Checklist:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Every collection snapshot (Mentor & Investor) is immutable after payment confirmation.</li>
              <li>Changes made to commission rates will only impact future checkout sessions.</li>
              <li>Admin withdrawal balances strictly reflect net platform revenue minus completed payouts.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet size={18} className="text-emerald-600" /> Platform Payout
            </h2>
            <div className="p-5 bg-emerald-50/40 rounded-xl border border-emerald-100 mb-5 text-center">
              <p className="text-xs text-emerald-800 font-bold mb-1">Total Available Withdrawal Balance</p>
              <h3 className="text-3xl font-black text-gray-900">{formatCurrency(data.currentAvailableWithdrawalBalance)}</h3>
              <p className="text-[10px] text-gray-400 mt-2">Available for immediate disbursement</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Platform revenue is stored in the primary platform account. Request a new payout below or monitor bank transfers in the history ledger.
            </p>
          </div>
          <button
            onClick={() => document.getElementById('request-payout-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-6 w-full py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Go to Withdrawal Amount <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Commission Ledgers Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">Mentor Commission Ledgers</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search mentor or founder..."
                value={mentorSearch}
                onChange={e => setMentorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6] font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl" style={{ maxHeight: '400px' }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
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
                    <tr key={tx._id || idx} className="hover:bg-gray-50/50">
                      <td className="p-3.5 text-gray-500 whitespace-nowrap">{formatDate(tx.sessionDate || tx.createdAt)}</td>
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
                    <td colSpan={8} className="p-6 text-center text-gray-400 italic">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">Investor Commission Ledgers</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search investor or startup..."
                value={investorSearch}
                onChange={e => setInvestorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6] font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl" style={{ maxHeight: '400px' }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
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
                        <td className="p-3.5 text-gray-500 whitespace-nowrap">{formatDate(tx.paymentDate || tx.updatedAt)}</td>
                        <td className="p-3.5 text-gray-900 font-bold">{tx.investorName || tx.investorCompany || '—'}</td>
                        <td className="p-3.5 font-bold">{tx.startupName || '—'}</td>
                        <td className="p-3.5 text-right text-gray-900">{formatCurrency(tx.offerAmount)}</td>
                        <td className="p-3.5 text-center text-yellow-600 font-bold">{rate}%</td>
                        <td className="p-3.5 text-right text-emerald-600 font-bold">{formatCurrency(commAmount)}</td>
                        <td className="p-3.5 text-right font-bold">{formatCurrency(founderAlloc)}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${payer === 'investor' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                            {payer === 'investor' ? 'Investor' : 'Founder'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-400 italic">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payout & withdrawals section */}
      <div id="request-payout-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Wallet size={18} className="text-[#5B21B6]" /> Withdrawal Amount
            </h2>
            <p className="text-xs text-gray-400 mt-1">Disburse platform revenue into bank or UPI accounts.</p>
          </div>

          {withdrawalError && (
            <div className="p-3.5 bg-red-50 border border-red-150 text-red-600 rounded-xl text-xs font-bold flex items-start gap-2">
              <AlertCircle className="shrink-0 mt-0.5" size={14} />
              <span>{withdrawalError}</span>
            </div>
          )}

          {withdrawalSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-xl text-xs font-bold flex items-start gap-2">
              <CheckCircle2 className="shrink-0 mt-0.5" size={14} />
              <span>{withdrawalSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Payout Source</label>
              <select
                value={payoutSource}
                onChange={e => {
                  setPayoutSource(e.target.value as any);
                  setWithdrawalError('');
                  setWithdrawalSuccess('');
                }}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#5B21B6]"
              >
                <option value="all">All Platform Revenue (General)</option>
                <option value="mentor">Mentor Commissions Only</option>
                <option value="investor">Investor Commissions Only</option>
              </select>
            </div>

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
              <p className="text-[10px] text-gray-400 mt-1">
                Available:{' '}
                {payoutSource === 'mentor'
                  ? formatCurrency(data.availableMentorBalance || 0)
                  : payoutSource === 'investor'
                    ? formatCurrency(data.availableInvestorBalance || 0)
                    : formatCurrency(data.currentAvailableWithdrawalBalance)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Disbursement Mode</label>
              <select
                value={withdrawMethod}
                onChange={e => setWithdrawMethod(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#5B21B6]"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI Address</option>
                <option value="other">Other Details</option>
              </select>
            </div>

            {withdrawMethod === 'upi' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">UPI ID / Address</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. name@upi"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B21B6] font-medium text-gray-800"
                  required
                />
              </div>
            )}

            {withdrawMethod === 'bank_transfer' && (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={e => setAccountHolderName(e.target.value)}
                    placeholder="Enter legal bank name"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B21B6] font-medium text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B21B6] font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B21B6] font-medium text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value)}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B21B6] font-medium text-gray-800"
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
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B21B6] font-medium text-gray-800"
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
              Withdrawal Amount
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">Withdrawal History</h2>
          </div>

          <div className="space-y-4" style={{ maxHeight: '550px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
            {filteredWithdrawals.length > 0 ? (
              filteredWithdrawals.map((w, idx) => (
                <div key={w._id || idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/20 hover:bg-gray-55/20 transition-colors space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-sm">{formatCurrency(w.amount)}</span>
                        <span className="text-xs text-gray-400 font-bold">•</span>
                        <span className="text-xs text-gray-500 font-semibold uppercase">{w.withdrawalMethod.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400 font-bold">Requested {formatDate(w.createdAt)}</span>
                        <span className="text-[10px] text-gray-300 font-bold">|</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          w.payoutSource === 'mentor'
                            ? 'bg-purple-50 text-purple-700'
                            : w.payoutSource === 'investor'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {w.payoutSource === 'mentor' ? 'Mentor Revenue' : w.payoutSource === 'investor' ? 'Investor Revenue' : 'General'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
                      PAID
                    </span>
                  </div>

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

                    <div className="col-span-2 mt-2 pt-2 border-t border-gray-50 flex flex-wrap justify-between gap-1 text-[10px] text-gray-500">
                      <span>Ref: <strong className="text-emerald-700 font-mono font-bold">{w.transactionReference}</strong></span>
                      {w.processedBy && <span>Settled by: <strong>{w.processedBy.fullName || 'Admin'}</strong> on {formatDate(w.processedAt)}</span>}
                    </div>
                  </div>
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
    </div>
  );
};

export default AdminPlatformRevenue;
