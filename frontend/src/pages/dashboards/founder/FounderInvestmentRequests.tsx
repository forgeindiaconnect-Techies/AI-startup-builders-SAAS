import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, CheckCircle2, Clock, XCircle, Ban, Eye,
  MessageSquare, Calendar, Trash2, ShieldCheck, ArrowRight, X, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  getInvestmentRequests, updateInvestmentRequestStatus
} from '../../../utils/investorModuleStorage';
import type { InvestmentRequest } from '../../../utils/investorModuleStorage';

const FounderInvestmentRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'>('PENDING');

  const [viewingRequest, setViewingRequest] = useState<InvestmentRequest | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadRequests = () => {
    // Requirements: Do NOT show the submitted request under the Founder Dashboard -> Founder Requests page.
    setRequests([]);
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

  const filteredRequests = requests.filter(r => r.status === activeTab);

  const handleWithdraw = (reqId: string, invName: string) => {
    if (window.confirm(`Are you sure you want to withdraw your funding request to ${invName}?`)) {
      updateInvestmentRequestStatus(reqId, 'WITHDRAWN');
      showToast(`Investment request to ${invName} has been withdrawn.`);
      loadRequests();
      if (viewingRequest?.id === reqId) setViewingRequest(null);
    }
  };

  const getStatusBadge = (status: InvestmentRequest['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={13} /> Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <XCircle size={13} /> Rejected
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <Ban size={13} /> Withdrawn
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <Clock size={13} /> Pending
          </span>
        );
    }
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
            <ClipboardList className="text-[#5B21B6]" size={28} /> Investment Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your submitted funding proposals to verified investors.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/founder/investor-marketplace')}
          className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          Explore Marketplace <ArrowRight size={14} />
        </button>
      </div>

      {/* Accepted Banner Notice */}
      {requests.some(r => r.status === 'ACCEPTED') && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">Investor Accepted Your Request!</h3>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  An investor has expressed interest in your startup! Connection is now established. You can chat in <span className="font-bold underline cursor-pointer" onClick={() => navigate('/founder/messages')}>Messages</span> or schedule a <span className="font-bold underline cursor-pointer" onClick={() => navigate('/founder/meetings')}>Meeting</span>.
                  <br />
                  <span className="text-[11px] text-emerald-700 italic">* Acceptance means investor is interested to continue discussions. It does not automatically mark the startup as funded.</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/founder/messages')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1"
              >
                <MessageSquare size={13} /> Messages
              </button>
              <button
                onClick={() => navigate('/founder/meetings')}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1"
              >
                <Calendar size={13} /> Meetings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm mb-6 flex gap-2 overflow-x-auto">
        {(['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] as const).map((tab) => {
          const count = requests.filter(r => r.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab
                  ? 'bg-[#5B21B6] text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <ClipboardList size={44} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-800">No {activeTab.toLowerCase()} requests</h3>
          <p className="text-xs text-gray-500 mt-1">You currently have no proposals in this status tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-lg font-black shadow shrink-0">
                    {req.investorName ? req.investorName.charAt(0).toUpperCase() : 'I'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{req.investorName}</h3>
                    <p className="text-xs text-gray-500 font-medium">{req.investorFirm}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(req.status)}
                  <span className="text-xs text-gray-400 font-medium">Submitted {formatDate(req.createdAt)}</span>
                </div>
              </div>

              {/* Proposal Content Snippet */}
              <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-0.5">Target Startup</span>
                  <span className="font-bold text-[#5B21B6] text-sm">{req.startupName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-0.5">Funding Requested</span>
                  <span className="font-bold text-gray-900 text-sm">{req.fundingAmount} ({req.fundingStage})</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-0.5">Last Updated</span>
                  <span className="font-semibold text-gray-700">{formatDate(req.updatedAt)}</span>
                </div>
              </div>

              {/* Pitch Intro */}
              <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-xl border border-gray-100 italic mb-4">
                "{req.shortIntro}"
              </p>

              {/* Actions Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingRequest(req)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Eye size={14} /> View Details
                  </button>
                  {req.status === 'ACCEPTED' && (
                    <>
                      <button
                        onClick={() => navigate('/founder/messages')}
                        className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <MessageSquare size={14} /> Open Messages
                      </button>
                      <button
                        onClick={() => navigate('/founder/meetings')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Calendar size={14} /> Schedule Meeting
                      </button>
                    </>
                  )}
                </div>

                {req.status === 'PENDING' && (
                  <button
                    onClick={() => handleWithdraw(req.id, req.investorName)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors border border-red-200 flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Withdraw Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── REQUEST DETAILS MODAL ─── */}
      {viewingRequest && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans">
            <button
              onClick={() => setViewingRequest(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(viewingRequest.status)}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Proposal Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Submitted to <span className="font-bold text-gray-800">{viewingRequest.investorName}</span> ({viewingRequest.investorFirm})
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-black text-purple-400 uppercase block">Startup</span>
                  <span className="font-bold text-[#5B21B6] text-sm">{viewingRequest.startupName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-purple-400 uppercase block">Requested Funding</span>
                  <span className="font-bold text-gray-900 text-sm">{viewingRequest.fundingAmount} ({viewingRequest.fundingStage})</span>
                </div>
              </div>

              <div>
                <h4 className="font-black text-gray-400 uppercase mb-1">Elevator Introduction</h4>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium leading-relaxed">
                  {viewingRequest.shortIntro}
                </p>
              </div>

              <div>
                <h4 className="font-black text-gray-400 uppercase mb-1">Why Seeking This Investor</h4>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium leading-relaxed">
                  {viewingRequest.whySeeking}
                </p>
              </div>

              {viewingRequest.optionalMessage && (
                <div>
                  <h4 className="font-black text-gray-400 uppercase mb-1">Optional Message</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                    "{viewingRequest.optionalMessage}"
                  </p>
                </div>
              )}

              {viewingRequest.responseNote && (
                <div>
                  <h4 className="font-black text-emerald-600 uppercase mb-1">Investor Response Note</h4>
                  <p className="text-emerald-950 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-medium leading-relaxed">
                    "{viewingRequest.responseNote}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
              {viewingRequest.status === 'PENDING' && (
                <button
                  onClick={() => handleWithdraw(viewingRequest.id, viewingRequest.investorName)}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors border border-red-200"
                >
                  Withdraw Request
                </button>
              )}
              <button
                onClick={() => setViewingRequest(null)}
                className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl transition-colors"
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

export default FounderInvestmentRequests;
