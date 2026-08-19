import React, { useState } from 'react';
import { Eye, MessageCircle, FileCheck, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';

const FounderFunding: React.FC = () => {
  const { user } = useAuth();
  const { getFounderOffers, respondToOffer } = useFunding();

  // If no user is logged in, use "1" for demo purposes
  const userId = user?.id || "1";
  const offers = getFounderOffers(userId);

  const [showCounterModal, setShowCounterModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const [counterData, setCounterData] = useState({ amount: '', equity: '', message: '' });
  const [rejectReason, setRejectReason] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'offer_received': return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold mb-3 inline-block">Commitment Submitted</span>;
      case 'accepted': return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-bold mb-3 inline-block">Accepted / Pending Payment</span>;
      case 'counter_offer': return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-xs font-bold mb-3 inline-block">Counter Offer Sent</span>;
      case 'rejected': return <span className="px-2.5 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold mb-3 inline-block">Rejected</span>;
      case 'payment_submitted':
      case 'under_verification': return <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold mb-3 inline-block">Under Verification</span>;
      case 'funded':
      case 'completed': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-3 inline-block border border-emerald-300 shadow-sm">Completed</span>;
      case 'failed': return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold mb-3 inline-block">Failed</span>;
      default: return <span className="px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-bold mb-3 inline-block">{status}</span>;
    }
  };

  const handleAccept = (offer: FundingOffer) => {
    const termLabel = offer.commitmentId ? "commitment" : "offer";
    if (window.confirm(`Are you sure you want to accept this ${termLabel} from ${offer.investorCompany}?`)) {
      respondToOffer(offer.id, 'accepted', {});
      window.alert(`Offer accepted successfully!`);
    }
  };

  const submitCounter = () => {
    if (showCounterModal) {
      respondToOffer(showCounterModal, 'counter_offer', {
        counterAmount: Number(counterData.amount),
        counterEquity: Number(counterData.equity),
        message: counterData.message
      });
      window.alert("Counter offer sent!");
      setShowCounterModal(null);
      setCounterData({ amount: '', equity: '', message: '' });
    }
  };

  const submitReject = () => {
    if (showRejectModal) {
      respondToOffer(showRejectModal, 'rejected', { message: rejectReason });
      setShowRejectModal(null);
      setRejectReason('');
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Funding & Offers</h1>
        <p className="text-gray-500 mt-1">Track investor interest, messages, and term sheet offers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-500"><Eye size={24} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">142</p>
          <p className="text-sm font-medium text-gray-500">Investor Profile Views</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-500"><MessageCircle size={24} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">4</p>
          <p className="text-sm font-medium text-gray-500">Active Conversations</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-2xl shadow-sm text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-white/20 text-white"><FileCheck size={24} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{offers.length}</p>
          <p className="text-sm font-medium text-green-100">Term Sheet Offers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Active Term Sheets & Offers</h2>
        
        {offers.length === 0 ? (
          <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No funding offers received yet. Apply to more investors in the network!
          </div>
        ) : (
          <div className="space-y-6">
            {offers.map(offer => (
              <div key={offer.id} className={`border rounded-xl overflow-hidden relative ${offer.status === 'funded' ? 'bg-green-50/20 border-green-300' : 'bg-gray-50/30 border-gray-200'}`}>
                {offer.status === 'funded' && <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>}
                {(offer.status === 'offer_received' || offer.status === 'accepted') && <div className="absolute top-0 left-0 w-1 h-full bg-[#5B21B6]"></div>}
                
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      {getStatusBadge(offer.status)}
                      <h3 className="text-xl font-bold text-gray-900">
                        {offer.commitmentId ? 'Funding Commitment Request' : 'Investment Offer'}
                      </h3>
                      <p className="text-sm text-gray-600">From: {offer.investorCompany} ({offer.investorName}) for <span className="font-semibold text-gray-900">{offer.startupName}</span></p>
                      {offer.commitmentId && (
                        <p className="text-xs text-purple-600 font-mono font-bold mt-1">Commitment ID: {offer.commitmentId}</p>
                      )}
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-3xl font-extrabold text-gray-900">
                        {offer.currency === 'INR' ? '₹' : '$'}{offer.offerAmount.toLocaleString()}
                      </p>
                      <p className="text-sm font-medium text-gray-500">
                        {offer.instrument === 'Equity' ? `for ${offer.equityPercentage}% Equity` : `${offer.instrument}`}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div><p className="text-gray-500 uppercase font-bold">Investor Name</p><p className="font-semibold text-gray-900">{offer.investorName}</p></div>
                    <div><p className="text-gray-500 uppercase font-bold">Investor Email</p><p className="font-semibold text-gray-900 truncate" title={offer.investorEmail}>{offer.investorEmail || 'N/A'}</p></div>
                    <div className="col-span-2"><p className="text-gray-500 uppercase font-bold">Investor Address</p><p className="font-semibold text-gray-900 truncate" title={offer.investorAddress}>{offer.investorAddress || 'N/A'}</p></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-100 shadow-sm text-xs">
                    <div>
                      <p className="text-gray-500 font-medium">Instrument</p>
                      <p className="font-bold text-gray-900">{offer.instrument}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Funding Round</p>
                      <p className="font-bold text-gray-900">{offer.fundingRound || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Valuation Cap</p>
                      <p className="font-bold text-gray-900">
                        {offer.currency === 'INR' ? `₹${(offer.valuationCap / 10000000).toFixed(2)} Cr` : `$${(offer.valuationCap / 1000000).toFixed(1)}M`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Expected Date</p>
                      <p className="font-bold text-gray-900">{offer.expectedInvestmentDate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Discount</p>
                      <p className="font-bold text-gray-900">{offer.discount}%</p>
                    </div>
                  </div>

                  {offer.investorMessage && (
                    <div className="mb-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Message / Notes from Investor</p>
                      <p className="text-sm text-gray-700 italic">"{offer.investorMessage}"</p>
                    </div>
                  )}

                  {['accepted', 'payment_submitted', 'under_verification', 'funded', 'completed', 'failed', 'rejected'].includes(offer.status) && (
                    <div className="mb-6 border border-purple-100 bg-purple-50/20 p-5 rounded-xl space-y-3 text-left">
                      <h4 className="font-bold text-[#5B21B6] uppercase text-[10px] tracking-wider">Investment Deal Progress Checklist</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                        <div>
                          <p className="text-gray-400 font-bold block uppercase text-[9px] mb-1">Investor Name</p>
                          <p className="text-gray-900 font-extrabold">{offer.investorName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold block uppercase text-[9px] mb-1">Committed Amount</p>
                          <p className="text-emerald-700 font-extrabold">₹{offer.offerAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold block uppercase text-[9px] mb-1">Investment Type</p>
                          <p className="text-gray-900 font-bold">{offer.instrument}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold block uppercase text-[9px] mb-1">Agreement Status</p>
                          <p className="text-gray-800 font-bold">{offer.agreementStatus || 'Completed'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold block uppercase text-[9px] mb-1">Transaction Status</p>
                          <p className="text-gray-800 font-bold">
                            {offer.status === 'funded' || offer.status === 'completed' ? 'Verified & Completed' :
                             offer.status === 'under_verification' || offer.status === 'payment_submitted' ? 'Under Verification' :
                             offer.status === 'failed' ? 'Failed / Refunded' :
                             offer.status === 'rejected' ? 'Rejected' : 'Payment Pending'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold block uppercase text-[9px] mb-1">Funding Status</p>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            offer.status === 'funded' || offer.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            offer.status === 'under_verification' || offer.status === 'payment_submitted' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                            offer.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {offer.status === 'funded' || offer.status === 'completed' ? 'Completed' :
                             offer.status === 'under_verification' || offer.status === 'payment_submitted' ? 'Under Verification' :
                             offer.status === 'rejected' ? 'Rejected' : 'Funding Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Read-only timeline checklist */}
                      <div className="border-t border-purple-100/60 pt-3 flex flex-wrap items-center gap-4 text-[10px] text-gray-500 font-bold">
                        <span className="text-purple-700 text-[9px] uppercase tracking-wider block">Timeline:</span>
                        <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={12} /> Deal Accepted</span>
                        <span className="text-gray-300">→</span>
                        <span className={`flex items-center gap-1 ${offer.agreementStatus === 'Completed' ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {offer.agreementStatus === 'Completed' && <CheckCircle2 size={12} />} Agreement Signed
                        </span>
                        <span className="text-gray-300">→</span>
                        <span className={`flex items-center gap-1 ${['payment_submitted', 'under_verification', 'funded', 'completed'].includes(offer.status) ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {['payment_submitted', 'under_verification', 'funded', 'completed'].includes(offer.status) && <CheckCircle2 size={12} />} Payment Submitted
                        </span>
                        <span className="text-gray-300">→</span>
                        <span className={`flex items-center gap-1 ${['funded', 'completed'].includes(offer.status) ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {['funded', 'completed'].includes(offer.status) && <CheckCircle2 size={12} />} Admin Verification & Funding Completed
                        </span>
                      </div>
                    </div>
                  )}

                  {(offer.status === 'offer_received' || offer.status === 'counter_offer') && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleAccept(offer)}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                      >
                        Accept Commitment
                      </button>
                      
                      {!offer.commitmentId && (
                        <button 
                          onClick={() => {
                            setCounterData({ amount: offer.offerAmount.toString(), equity: offer.equityPercentage.toString(), message: '' });
                            setShowCounterModal(offer.id);
                          }}
                          className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-sm transition-colors shadow-sm"
                        >
                          Review Changes
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setShowRejectModal(offer.id)}
                        className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg font-bold text-sm transition-colors"
                      >
                        Reject Commitment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Review Changes / Counter Offer</h3>
              <button onClick={() => setShowCounterModal(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">New Amount ($)</label>
                  <input 
                    type="number" 
                    value={counterData.amount}
                    onChange={(e) => setCounterData({...counterData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">New Equity (%)</label>
                  <input 
                    type="number" 
                    value={counterData.equity}
                    onChange={(e) => setCounterData({...counterData, equity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Message to Investor</label>
                  <textarea 
                    value={counterData.message}
                    onChange={(e) => setCounterData({...counterData, message: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowCounterModal(null)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-sm text-gray-700">Cancel</button>
              <button onClick={submitCounter} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-sm">Send Counter Offer</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50 text-red-700">
              <h3 className="font-bold text-lg flex items-center gap-2"><AlertCircle size={20}/> Reject Offer</h3>
              <button onClick={() => setShowRejectModal(null)} className="hover:bg-red-100 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 font-medium">Are you sure you want to reject this offer? This action cannot be undone.</p>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Reason (Optional)</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Valuation is too low for our current traction."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(null)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-sm text-gray-700">Cancel</button>
              <button onClick={submitReject} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm">Reject Offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderFunding;
