import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Image as ImageIcon, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config/api';

interface Payment {
  _id: string;
  founderName: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  screenshot: string;
  status: 'pending_verification' | 'approved' | 'rejected';
  createdAt: string;
  userId?: { email?: string; mobile?: string };
}

const PLAN_LABELS: Record<string, string> = {
  pro: 'Pro Plan (₹999/mo)',
  premium_startup_builder: 'Premium Startup Builder (₹2,999/mo)',
};

const STATUS_CONFIG: Record<string, { cls: string; icon: React.ElementType; label: string }> = {
  pending_verification: { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending Review' },
  approved: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Approved' },
  rejected: { cls: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' },
};

const parseTransactionDetails = (txId: string) => {
  if (txId && txId.startsWith('UTR: ')) {
    const parts = txId.split(' | ');
    const utrPart = parts.find(p => p.startsWith('UTR: '))?.replace('UTR: ', '') || '';
    const bankPart = parts.find(p => p.startsWith('Bank: '))?.replace('Bank: ', '') || '';
    const holderPart = parts.find(p => p.startsWith('Holder: '))?.replace('Holder: ', '') || '';
    return { utr: utrPart, bank: bankPart, holder: holderPart, isParsed: true };
  }
  return { utr: txId || '', bank: '', holder: '', isParsed: false };
};

const AdminPayments: React.FC = () => {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setPayments(data.payments);
    } catch {
      showToast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
    setActionLoading(paymentId);
    try {
      const res = await fetch(`${API_URL}/payments/${paymentId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setPayments(prev => prev.map(p =>
          p._id === paymentId
            ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' }
            : p
        ));
        showToast(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');
      } else {
        showToast(data.error || 'Action failed', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending_verification');
  const displayedPayments = activeTab === 'pending' ? pendingPayments : payments;

  const stats = {
    pending: pendingPayments.length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
    revenue: payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-[#1F2937]">Subscription Payments</h1>
        <p className="text-[#6B7280] mt-1">Review and approve founder upgrade payments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'text-purple-600', bg: 'bg-purple-50', icon: CheckCircle2 },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-9 h-9 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['pending', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === tab ? 'bg-purple-700 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {tab === 'pending' ? `Pending (${stats.pending})` : `All Payments (${payments.length})`}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" /> Loading payments...
          </div>
        ) : displayedPayments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-gray-500 font-medium">{activeTab === 'pending' ? 'No pending payments to review.' : 'No payment records found.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedPayments.map(payment => {
              const statusCfg = STATUS_CONFIG[payment.status];
              return (
                <div key={payment._id} className="p-5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#1F2937]">{payment.founderName}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg?.cls}`}>
                          {statusCfg?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{payment.userId?.email}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 font-medium">
                        <span>Plan: <strong className="text-gray-600">{PLAN_LABELS[payment.planName] || payment.planName}</strong></span>
                        <span>Amount: <strong className="text-gray-600">₹{payment.amount.toLocaleString('en-IN')}</strong></span>
                        <span>Via: <strong className="text-gray-600">{payment.paymentMethod}</strong></span>
                        <span>UTR: <strong className="text-purple-600 font-mono">{payment.transactionId}</strong></span>
                        <span>{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                      >
                        <ImageIcon size={14} /> View Details / Receipt
                      </button>

                      {payment.status === 'pending_verification' && (
                        <>
                          <button
                            onClick={() => handleAction(payment._id, 'approve')}
                            disabled={actionLoading === payment._id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-70"
                          >
                            {actionLoading === payment._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(payment._id, 'reject')}
                            disabled={actionLoading === payment._id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-70"
                          >
                            {actionLoading === payment._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details / Receipt Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPayment(null)}>
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-[#1F2937] text-base">Payment Receipt Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">Plan Name</p>
                  <p className="text-sm font-extrabold text-[#1F2937]">{PLAN_LABELS[selectedPayment.planName] || selectedPayment.planName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-purple-700">₹{selectedPayment.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-purple-500 font-semibold">Payment Recorded</p>
                </div>
              </div>

              {/* Grid Info */}
              <div className="space-y-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Founder Name</span>
                    <p className="text-xs font-bold text-gray-800">{selectedPayment.founderName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</span>
                    <p className="text-xs font-bold text-gray-800">{selectedPayment.paymentMethod}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                  <p className="text-xs font-bold text-gray-800 font-mono">{selectedPayment.userId?.email || 'N/A'}</p>
                </div>
                {selectedPayment.userId?.mobile && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</span>
                    <p className="text-xs font-bold text-gray-800 font-mono">{selectedPayment.userId.mobile}</p>
                  </div>
                )}

                {(() => {
                  const details = parseTransactionDetails(selectedPayment.transactionId);
                  if (details.isParsed) {
                    return (
                      <>
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaction ID / UTR</span>
                          <p className="text-xs font-mono font-bold text-purple-600 select-all">{details.utr}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sender Bank Name</span>
                            <p className="text-xs font-bold text-gray-700">{details.bank}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Holder Name</span>
                            <p className="text-xs font-bold text-gray-700">{details.holder}</p>
                          </div>
                        </div>
                      </>
                    );
                  }
                  return (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaction ID / UTR</span>
                      <p className="text-xs font-mono font-bold text-purple-600 select-all">{selectedPayment.transactionId}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Screenshot Image (if any) */}
              {selectedPayment.screenshot && selectedPayment.screenshot !== 'no_screenshot' ? (
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Screenshot Receipt Proof</span>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-48 flex items-center justify-center bg-gray-100">
                    <img src={selectedPayment.screenshot} alt="Payment Screenshot" className="object-contain w-full h-full" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 bg-gray-50 border border-gray-200 border-dashed rounded-2xl text-[11px] text-gray-400 font-semibold">
                  ℹ️ No screenshot proof uploaded (Manual entry)
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedPayment(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              {selectedPayment.status === 'pending_verification' && (
                <>
                  <button
                    onClick={() => {
                      handleAction(selectedPayment._id, 'approve');
                      setSelectedPayment(null);
                    }}
                    disabled={actionLoading === selectedPayment._id}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-70"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
