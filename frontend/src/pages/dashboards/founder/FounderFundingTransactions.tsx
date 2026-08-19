import React, { useState, useEffect } from 'react';
import {
  Wallet, FileCheck, ArrowRight, ShieldCheck, CheckCircle2,
  Clock, Plus, X, AlertCircle, TrendingUp, Award, Building2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getStartups } from '../../../utils/localStorageHelper';
import {
  getFundingTransactions, saveFundingTransaction
} from '../../../utils/investorModuleStorage';
import type { FundingTransaction } from '../../../utils/investorModuleStorage';

const FounderFundingTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<FundingTransaction[]>([]);
  const [startups, setStartups] = useState<any[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingTx, setViewingTx] = useState<FundingTransaction | null>(null);

  // Form state
  const [selectedStartupName, setSelectedStartupName] = useState('');
  const [investorName, setInvestorName] = useState('');
  const [investorFirm, setInvestorFirm] = useState('');
  const [fundingAmount, setFundingAmount] = useState('₹50,00,000');
  const [investmentStage, setInvestmentStage] = useState('Seed Round');
  const [transactionStatus, setTransactionStatus] = useState<FundingTransaction['transactionStatus']>('Term Sheet Signed');
  const [dealNotes, setDealNotes] = useState('');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    const txs = getFundingTransactions();
    setTransactions(txs);

    const userStartups = await getStartups();
    setStartups(userStartups);
    if (userStartups.length > 0) {
      setSelectedStartupName(userStartups[0].startupName || 'Tourists Platform AI');
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('funding_transactions_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('funding_transactions_updated', loadData);
    };
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName.trim() || !investorFirm.trim()) {
      showToast('Please enter investor name and firm.', 'error');
      return;
    }

    saveFundingTransaction({
      startupId: `st_${Date.now()}`,
      startupName: selectedStartupName,
      founderName: user?.fullName || 'Founder',
      investorName: investorName.trim(),
      investorFirm: investorFirm.trim(),
      fundingAmount,
      investmentStage,
      transactionStatus,
      dealNotes,
    });

    showToast('Finalized investment deal recorded successfully!', 'success');
    setShowAddModal(false);
    setInvestorName('');
    setInvestorFirm('');
    setDealNotes('');
    loadData();
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: FundingTransaction['transactionStatus']) => {
    switch (status) {
      case 'Investment Completed':
        return (
          <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <CheckCircle2 size={12} /> Investment Completed
          </span>
        );
      case 'Agreement Finalized':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <FileCheck size={12} /> Agreement Finalized
          </span>
        );
      case 'Due Diligence Complete':
        return (
          <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] border border-purple-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={12} /> Due Diligence Complete
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} /> {status}
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Wallet className="text-[#5B21B6]" size={28} /> Funding & Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track finalized funding deals, term sheet records, and investment agreements.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> Record Finalized Deal
        </button>
      </div>

      {/* Final Workflow Process Diagram */}
      <div className="mb-8 bg-gradient-to-r from-[#5B21B6] to-[#4C1D95] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <TrendingUp size={16} /> Standard Investment Lifecycle Workflow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[11px] font-bold">
          {[
            { step: '1', title: 'Connection Accepted' },
            { step: '2', title: 'Discussion' },
            { step: '3', title: 'Meeting' },
            { step: '4', title: 'Due Diligence' },
            { step: '5', title: 'Investment Agreement' },
            { step: '6', title: 'Investment Completed' },
            { step: '7', title: 'Transaction Record' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 p-3 rounded-2xl border border-white/15 flex flex-col items-center justify-center">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-black text-[10px] flex items-center justify-center mb-1 shadow-sm">
                {item.step}
              </span>
              <span className="text-purple-100">{item.title}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-purple-200 mt-4 italic text-center">
          * An investment is marked as completed only after due diligence, signed agreements, and finalized funds transfer.
        </p>
      </div>

      {/* Transactions Table / Cards */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Wallet size={44} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Finalized Deals Yet</h3>
          <p className="text-xs text-gray-500 mt-1">Once an investment agreement is signed, deal records will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Finalized Deals & Term Sheets</h3>
            <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-lg text-xs font-bold">
              {transactions.length} Recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs font-medium">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase">
                  <th className="px-6 py-3.5">Ref ID</th>
                  <th className="px-6 py-3.5">Startup</th>
                  <th className="px-6 py-3.5">Investor & Firm</th>
                  <th className="px-6 py-3.5">Funding Amount</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#5B21B6]">{tx.referenceId}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{tx.startupName}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{tx.investorName}</div>
                      <div className="text-[11px] text-gray-400">{tx.investorFirm}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600 text-sm">{tx.fundingAmount}</td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{tx.investmentStage}</td>
                    <td className="px-6 py-4">{getStatusBadge(tx.transactionStatus)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(tx.transactionDate)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setViewingTx(tx)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        View Deal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── RECORD FINALIZED DEAL MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-full text-xs font-black uppercase tracking-wider inline-block mb-2">
                Transaction Entry
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Record Finalized Investment</h2>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Select Startup *</label>
                <select
                  value={selectedStartupName}
                  onChange={(e) => setSelectedStartupName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                >
                  {startups.map((s) => (
                    <option key={s.id || s.startupId} value={s.startupName || 'Startup'}>
                      {s.startupName || 'Startup'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Investor Name *</label>
                  <input
                    type="text"
                    value={investorName}
                    onChange={(e) => setInvestorName(e.target.value)}
                    placeholder="e.g. Priya Nambiar"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Investor Firm / Syndicate *</label>
                  <input
                    type="text"
                    value={investorFirm}
                    onChange={(e) => setInvestorFirm(e.target.value)}
                    placeholder="e.g. Nambiar Capital"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Funding Amount *</label>
                  <input
                    type="text"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="e.g. ₹50,00,000"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Round / Stage *</label>
                  <input
                    type="text"
                    value={investmentStage}
                    onChange={(e) => setInvestmentStage(e.target.value)}
                    placeholder="e.g. Seed Round"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Deal Status *</label>
                <select
                  value={transactionStatus}
                  onChange={(e) => setTransactionStatus(e.target.value as any)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                >
                  <option value="Term Sheet Signed">Term Sheet Signed</option>
                  <option value="Due Diligence Complete">Due Diligence Complete</option>
                  <option value="Agreement Finalized">Agreement Finalized</option>
                  <option value="Investment Completed">Investment Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Deal Notes / Reference</label>
                <textarea
                  rows={2}
                  value={dealNotes}
                  onChange={(e) => setDealNotes(e.target.value)}
                  placeholder="Valuation cap, equity terms, or legal firm details..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── VIEW DEAL MODAL ─── */}
      {viewingTx && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setViewingTx(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider block mb-1">
                Ref ID: {viewingTx.referenceId}
              </span>
              <h2 className="text-xl font-black text-gray-900">{viewingTx.startupName}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Finalized Investment Record</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <span className="text-[10px] font-black text-purple-400 uppercase block">Funding Amount</span>
                <span className="text-xl font-black text-emerald-600">{viewingTx.fundingAmount}</span>
                <span className="text-[11px] text-gray-500 block font-medium mt-0.5">{viewingTx.investmentStage}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Investor</span>
                  <span className="font-bold text-gray-900">{viewingTx.investorName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Firm</span>
                  <span className="font-bold text-gray-900">{viewingTx.investorFirm}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Deal Notes</span>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{viewingTx.dealNotes || 'No additional deal notes provided.'}"
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingTx(null)}
                className="px-6 py-2 bg-[#5B21B6] text-white font-bold text-xs rounded-xl"
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

export default FounderFundingTransactions;
