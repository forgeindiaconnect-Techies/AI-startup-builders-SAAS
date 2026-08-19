import React, { useState, useEffect } from 'react';
import {
  Wallet, FileCheck, ArrowRight, ShieldCheck, CheckCircle2,
  Clock, X, AlertCircle, TrendingUp, Award, Building2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';

const FounderFundingTransactions: React.FC = () => {
  const { user } = useAuth();
  const { offers, refreshOffers, loading } = useFunding();

  const [viewingOffer, setViewingOffer] = useState<FundingOffer | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    refreshOffers();
  }, []);

  const isMyOffer = (o: any) => {
    if (!user) return false;
    return o.founderId === user.id || o.founderEmail === user.email || o.founderName === user.fullName;
  };

  const myOffers = offers.filter(isMyOffer);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'offer_received': return 'Funding Pending';
      case 'accepted': return 'Payment Pending';
      case 'payment_submitted': return 'Payment Submitted';
      case 'under_verification': return 'Under Verification';
      case 'funded': return 'Funded';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'funded':
      case 'completed':
        return (
          <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <CheckCircle2 size={12} /> Investment Completed
          </span>
        );
      case 'payment_submitted':
      case 'under_verification':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={12} /> Under Verification
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} /> Payment Pending
          </span>
        );
      case 'rejected':
      case 'failed':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <X size={12} /> {getStatusText(status)}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} /> {getStatusText(status)}
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans text-xs">
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
            View active investment allocations, term sheet deals, and payment ledger updates.
          </p>
        </div>
      </div>

      {/* Standard Investment Lifecycle Workflow Diagram */}
      <div className="mb-8 bg-gradient-to-r from-[#5B21B6] to-[#4C1D95] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h3 className="text-[10px] font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <TrendingUp size={16} /> Standard Investment Lifecycle Workflow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px] font-bold">
          {[
            { step: '1', title: 'Discover Startup' },
            { step: '2', title: 'Show Interest' },
            { step: '3', title: 'Discussion & Meeting' },
            { step: '4', title: 'Due Diligence' },
            { step: '5', title: 'Commit Funding' },
            { step: '6', title: 'Agreement Signed' },
            { step: '7', title: 'Admin Verified & Funded' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 p-3 rounded-2xl border border-white/15 flex flex-col items-center justify-center">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-black text-[10px] flex items-center justify-center mb-1 shadow-sm">
                {item.step}
              </span>
              <span className="text-purple-100">{item.title}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-purple-200 mt-4 italic text-center">
          * An investment is marked as Completed only after investor commitment, signed agreements, funds transfer, and admin verification checks.
        </p>
      </div>

      {/* Transactions Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading investment deals...</div>
      ) : myOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Wallet size={44} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Investment Deals Recorded</h3>
          <p className="text-xs text-gray-500 mt-1">Once an investor discovers and commits funding for your startup, details will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Active Investments & Term Sheets</h3>
            <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-lg text-xs font-bold">
              {myOffers.length} Recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs font-medium">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="px-6 py-3.5">Ref ID</th>
                  <th className="px-6 py-3.5">Startup</th>
                  <th className="px-6 py-3.5">Investor & Firm</th>
                  <th className="px-6 py-3.5">Funding Amount</th>
                  <th className="px-6 py-3.5">Instrument</th>
                  <th className="px-6 py-3.5">Agreement Status</th>
                  <th className="px-6 py-3.5">Funding Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {myOffers.map((offer) => (
                  <tr key={offer.id || offer._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#5B21B6]">
                      {String(offer._id || offer.id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{offer.startupName}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{offer.investorName}</div>
                      <div className="text-[11px] text-gray-400">{offer.investorCompany}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600 text-sm">
                      {offer.currency === 'INR' ? '₹' : '$'}{offer.offerAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{offer.instrument}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold border border-gray-200">
                        {offer.agreementStatus || 'Signed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(offer.status)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(offer.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setViewingOffer(offer)}
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

      {/* ─── SECURED VIEW DEAL MODAL ─── */}
      {viewingOffer && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans text-xs text-left">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setViewingOffer(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider block mb-1">
                Ref ID: {String(viewingOffer._id || viewingOffer.id).slice(-8).toUpperCase()}
              </span>
              <h2 className="text-xl font-black text-gray-900">{viewingOffer.startupName}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Investment Deal Record</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <span className="text-[10px] font-black text-purple-400 uppercase block">Committed Amount</span>
                <span className="text-xl font-black text-emerald-600">
                  {viewingOffer.currency === 'INR' ? '₹' : '$'}{viewingOffer.offerAmount.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-500 block font-medium mt-0.5">Instrument: {viewingOffer.instrument}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Investor</span>
                  <span className="font-bold text-gray-900">{viewingOffer.investorName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Syndicate / Company</span>
                  <span className="font-bold text-gray-900">{viewingOffer.investorCompany}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Agreement Status</span>
                  <span className="font-bold text-gray-900">{viewingOffer.agreementStatus || 'Signed'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Due Diligence</span>
                  <span className="font-bold text-gray-900">{viewingOffer.dueDiligenceStatus || 'Completed'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Funding Status</span>
                  <span className="font-bold text-gray-900">{getStatusText(viewingOffer.status)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Transaction Status</span>
                  <span className="font-bold text-gray-900">
                    {['funded', 'completed'].includes(viewingOffer.status) ? 'Verified' : 
                     viewingOffer.status === 'payment_submitted' ? 'Submitted (Awaiting Verify)' : 'Awaiting Payment'}
                  </span>
                </div>
              </div>

              {viewingOffer.adminNote && (
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Remarks</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                    "{viewingOffer.adminNote}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingOffer(null)}
                className="px-6 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl"
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
