import React, { useMemo, useState } from 'react';
import { DollarSign, Download, TrendingUp, AlertCircle, CheckCircle2, Clock, Check, X, Image as ImageIcon } from 'lucide-react';
import { useBilling } from '../../../context/BillingContext';

const statusStyle: Record<string, { cls: string; icon: React.ElementType }> = {
  Success: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: CheckCircle2 },
  Failed: { cls: 'bg-red-50 text-red-600 border border-red-100', icon: AlertCircle },
  Refunded: { cls: 'bg-amber-50 text-amber-600 border border-amber-100', icon: Clock },
  Pending: { cls: 'bg-blue-50 text-blue-600 border border-blue-100', icon: Clock },
};

const AdminPayments: React.FC = () => {
  const { transactions, paymentRequests, approvePayment, rejectPayment } = useBilling();
  
  const [activeTab, setActiveTab] = useState<'history' | 'approvals'>('approvals');
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);

  // Calculate dynamic metrics based on SUCCESSFUL transactions only
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let successful = 0;
    let failed = 0;
    let refunded = 0;

    transactions.forEach(t => {
      const amountVal = parseInt(t.amount.replace(/[^0-9.-]+/g, '')) || 0;
      if (t.status === 'Success') {
        successful++;
        if (amountVal > 0) totalRevenue += amountVal;
      } else if (t.status === 'Failed') {
        failed++;
      } else if (t.status === 'Refunded') {
        if (amountVal > 0) refunded += amountVal;
      }
    });

    return {
      revenue: `$${totalRevenue.toLocaleString()}`,
      successful: successful.toString(),
      failed: failed.toString(),
      refunds: `$${refunded.toLocaleString()}`
    };
  }, [transactions]);
  
  const pendingRequests = paymentRequests.filter(p => p.status === 'pending_verification');

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      window.alert("No transaction data to export.");
      return;
    }

    const headers = ["Transaction ID", "Customer Name", "Plan", "Type", "Amount", "Method", "Date", "Status"];
    const rows = transactions.map(t => [
      t.id,
      t.userName,
      t.plan,
      t.type,
      t.amount,
      t.method,
      t.date,
      t.status
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payment_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Approvals</h1>
          <p className="text-gray-500 mt-1">Review manual payment proofs and monitor transactions.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
        >
          <Download size={16} className="mr-2" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', val: metrics.revenue, trend: 'Live', color: 'text-emerald-600' },
          { label: 'Successful', val: metrics.successful, trend: 'Transactions', color: 'text-blue-600' },
          { label: 'Pending Approvals', val: pendingRequests.length.toString(), trend: 'Requires action', color: 'text-amber-600' },
          { label: 'Failed Charges', val: metrics.failed, trend: 'Rejected/Failed', color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{s.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 mb-1">{s.val}</p>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${s.color}`}>{s.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-gray-100 flex p-2 gap-2 bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'approvals' ? 'bg-white text-[#5B21B6] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Pending Approvals 
            {pendingRequests.length > 0 && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px]">{pendingRequests.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-[#5B21B6] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Transaction History
          </button>
        </div>
        
        {activeTab === 'approvals' && (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {['Founder', 'Plan Info', 'Payment Details', 'Txn / UTR', 'Screenshot', 'Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingRequests.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{p.founderName}</p>
                      <p className="text-[11px] font-semibold text-gray-400 mt-0.5">ID: {p.founderId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#5B21B6]">{p.planName}</p>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">{p.billingCycle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-gray-900">${p.amount}.00</p>
                      <p className="text-[11px] font-bold text-gray-500 mt-0.5">{p.paymentMethod}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg inline-block">
                        <p className="text-[12px] font-mono font-bold text-gray-700">{p.transactionId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.screenshot ? (
                        <button 
                          onClick={() => setScreenshotModal(p.screenshot)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          <ImageIcon size={14} /> View
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400 italic">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-100">
                        <button 
                          onClick={() => approvePayment(p.id)}
                          title="Approve & Activate Plan"
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-100 shadow-sm"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => rejectPayment(p.id)}
                          title="Reject Payment"
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-100 shadow-sm"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-3">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">All caught up!</p>
                      <p className="text-xs text-gray-500 mt-1">No pending payments to review.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Transaction ID', 'Customer', 'Type', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map(t => {
                  const S = statusStyle[t.status] || statusStyle['Success'];
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">{t.userName}</p>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mt-0.5">{t.plan}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.type}</td>
                      <td className={`px-6 py-4 font-bold ${t.amount.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{t.amount}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-600">{t.method}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-500">{t.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${S.cls}`}>
                          <S.icon size={11} /> {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <ImageIcon size={18} className="text-[#5B21B6]"/> Payment Screenshot
              </h3>
              <button onClick={() => setScreenshotModal(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-100 max-h-[70vh] overflow-auto">
              <img src={screenshotModal} alt="Payment Proof" className="max-w-full h-auto rounded-xl shadow-md border border-gray-200" />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end">
              <button 
                onClick={() => setScreenshotModal(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
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

export default AdminPayments;
