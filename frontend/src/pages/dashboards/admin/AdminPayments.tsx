import React from 'react';
import { DollarSign, Download, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const transactions = [
  { id: 'PAY-9821', user: 'Sarah Jenkins', plan: 'Growth', amount: '+$49.00', date: 'Jul 1, 2026', method: 'Visa •••• 4242', type: 'Subscription', status: 'Success' },
  { id: 'PAY-9820', user: 'Tom Chen', plan: 'Scale', amount: '+$149.00', date: 'Jul 1, 2026', method: 'Mastercard •••• 1234', type: 'Subscription', status: 'Success' },
  { id: 'PAY-9819', user: 'Peter Zhao', plan: 'Scale', amount: '-$149.00', date: 'Jun 28, 2026', method: 'Visa •••• 9012', type: 'Failed Charge', status: 'Failed' },
  { id: 'PAY-9818', user: 'Anna Kim', plan: 'Growth', amount: '+$49.00', date: 'Jun 15, 2026', method: 'Stripe Link', type: 'Subscription', status: 'Refunded' },
  { id: 'PAY-9817', user: 'James Park', plan: 'Growth → Scale', amount: '+$100.00', date: 'Jun 10, 2026', method: 'Visa •••• 7777', type: 'Upgrade', status: 'Success' },
];

const statusStyle: Record<string, { cls: string; icon: React.ElementType }> = {
  Success: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: CheckCircle2 },
  Failed: { cls: 'bg-red-50 text-red-600 border border-red-100', icon: AlertCircle },
  Refunded: { cls: 'bg-amber-50 text-amber-600 border border-amber-100', icon: Clock },
};

const AdminPayments: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Monitor all payment transactions across the platform in real-time.</p>
      </div>
      <button 
        onClick={() => window.alert('Exporting transactions report to CSV...')}
        className="flex items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
      >
        <Download size={16} className="mr-2" /> Export CSV
      </button>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Revenue (Jul)', val: '$8,450', trend: '+15%', color: 'text-emerald-600' },
        { label: 'Successful', val: '182', trend: '95.3%', color: 'text-blue-600' },
        { label: 'Failed Charges', val: '9', trend: '-3', color: 'text-red-600' },
        { label: 'Refunds', val: '$245', trend: '3 issued', color: 'text-amber-600' },
      ].map(s => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{s.label}</p>
          <p className="text-2xl font-extrabold text-gray-900 mb-1">{s.val}</p>
          <p className={`text-xs font-bold ${s.color}`}>{s.trend}</p>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><DollarSign size={18} className="text-[#5B21B6]" /> Recent Transactions</h2>
      </div>
      <div className="overflow-x-auto">
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
              const S = statusStyle[t.status];
              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">{t.user}</p>
                    <p className="text-xs text-gray-400">{t.plan}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.type}</td>
                  <td className={`px-6 py-4 font-bold ${t.amount.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{t.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${S.cls}`}>
                      <S.icon size={11} /> {t.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminPayments;
