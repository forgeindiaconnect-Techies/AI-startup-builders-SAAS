import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handshake, Clock, CheckCircle2, XCircle, Eye, MessageSquare, Ban, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  getInvestmentRequests, updateInvestmentRequestStatus
} from '../../../utils/investorModuleStorage';
import { InvestorHubHeaderTabs } from '../../../components/investor/InvestorHubHeaderTabs';
import type { InvestmentRequest } from '../../../utils/investorModuleStorage';

const statusStyles: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  ACCEPTED: { icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  REJECTED: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  WITHDRAWN: { icon: Ban, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
};

const InvestorRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<InvestmentRequest | null>(null);

  const loadRequests = () => {
    const all = getInvestmentRequests();
    setRequests(all);
  };

  useEffect(() => {
    loadRequests();
    window.addEventListener('storage', loadRequests);
    window.addEventListener('investment_requests_updated', loadRequests);
    return () => {
      window.removeEventListener('storage', loadRequests);
      window.removeEventListener('investment_requests_updated', loadRequests);
    };
  }, [user]);

  const handleUpdateStatus = (reqId: string, status: InvestmentRequest['status'], note?: string) => {
    updateInvestmentRequestStatus(reqId, status, note);
    loadRequests();
    if (selectedReq?.id === reqId) setSelectedReq(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-fade-in-up pb-10 font-sans">
      <InvestorHubHeaderTabs />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Handshake size={28} className="text-[#5B21B6]" /> Investment Requests
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Review incoming connection proposals and investment requests submitted by founders.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            Received Founder Requests ({requests.length})
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Handshake size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-700">No Connection Requests Received</p>
            <p className="text-xs text-gray-400 mt-1">Founders can reach out directly via the Investor Marketplace.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map(r => {
              const upperStatus = (r.status || 'PENDING').toUpperCase();
              const style = statusStyles[upperStatus] || statusStyles.PENDING;
              const StatusIcon = style.icon;
              const fData = r.form_data || {
                startupName: r.startupName,
                fundingStage: r.fundingStage,
                fundingAmount: r.fundingAmount,
                shortIntro: r.shortIntro,
                whySeeking: r.whySeeking,
                optionalMessage: r.optionalMessage,
                founderEmail: r.founderEmail,
              };

              const isPending = upperStatus === 'PENDING';
              const isAccepted = upperStatus === 'ACCEPTED';

              return (
                <div key={r.id || (r as any)._id} className="p-6 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row gap-6 items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <h3 className="font-bold text-gray-900 text-base">{fData.startupName || r.startupName}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border flex items-center gap-1 ${style.bg} ${style.color}`}>
                        <StatusIcon size={12} /> {r.status}
                      </span>
                      <span className="px-2.5 py-0.5 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-full text-xs font-bold">
                        {fData.fundingStage || r.fundingStage} • {fData.fundingAmount || r.fundingAmount}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-semibold mb-2">
                      From Founder: <span className="text-gray-900 font-bold">{r.founderName || r.founder_name}</span> ({fData.founderEmail || r.founderEmail})
                      {(r.investorName || r.investor_name) && <span className="text-gray-400 font-normal"> • Addressed To: <strong className="text-gray-700">{r.investorName || r.investor_name}</strong> ({r.investorFirm || 'Angel Investor'})</span>}
                    </p>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 mb-2 space-y-1">
                      <p className="text-xs text-gray-800 font-medium">
                        "{fData.shortIntro || r.shortIntro}"
                      </p>
                      {(fData.optionalMessage || r.optionalMessage) && (
                        <p className="text-xs text-purple-900 font-medium italic pt-1 border-t border-gray-200/60">
                          <span className="font-bold non-italic text-purple-700">Note:</span> "{fData.optionalMessage || r.optionalMessage}"
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-700 font-medium">
                      <span className="font-bold text-gray-900">Why Connecting:</span> {fData.whySeeking || r.whySeeking}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto shrink-0 gap-3">
                    <span className="text-[11px] font-medium text-gray-400">Submitted {formatDate(r.createdAt || r.created_at || '')}</span>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedReq(r)}
                        className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors flex items-center gap-1"
                      >
                        <Eye size={13} /> View Details
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(r.id || (r as any)._id, 'REJECTED')}
                            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle size={13} /> Reject Request
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id || (r as any)._id, 'ACCEPTED', 'Interested in connection! Let us start discussing details.')}
                            className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={13} /> Accept Connection
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <>
                          <button
                            onClick={() => navigate('/dashboard/investor/inbox')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare size={13} /> Chat with Founder
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id || (r as any)._id, 'REJECTED')}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}

                      {upperStatus === 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id || (r as any)._id, 'ACCEPTED', 'Interested in connection! Let us start discussing details.')}
                          className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={13} /> Accept Connection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedReq(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="px-3.5 py-1 bg-purple-100 text-[#5B21B6] rounded-full text-xs font-black uppercase tracking-wider inline-block mb-2">
                Proposal Request Details
              </span>
              <h2 className="text-xl font-black text-gray-900">{selectedReq.startupName}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Submitted by {selectedReq.founderName} ({selectedReq.founderEmail})</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Funding Stage</span>
                  <span className="font-bold text-gray-900">{selectedReq.fundingStage}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Funding Required</span>
                  <span className="font-bold text-purple-700">{selectedReq.fundingAmount}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Short Startup Summary</span>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium leading-relaxed">
                  {selectedReq.shortIntro}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Why Connecting With You</span>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium leading-relaxed">
                  {selectedReq.whySeeking}
                </p>
              </div>

              {selectedReq.optionalMessage && (
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Personal Note</span>
                  <p className="text-gray-800 bg-purple-50/60 p-3 rounded-xl border border-purple-100 font-medium italic">
                    "{selectedReq.optionalMessage}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>

              {(selectedReq.status || 'PENDING').toUpperCase() !== 'REJECTED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedReq.id || (selectedReq as any)._id, 'REJECTED')}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <XCircle size={13} /> Reject Request
                </button>
              )}

              {(selectedReq.status || 'PENDING').toUpperCase() !== 'ACCEPTED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedReq.id || (selectedReq as any)._id, 'ACCEPTED', 'Interested in connection! Let us start discussing details.')}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 size={13} /> Accept Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorRequests;
