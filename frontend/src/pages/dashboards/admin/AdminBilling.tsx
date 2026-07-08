import React from 'react';
import { CreditCard, TrendingUp, DollarSign, Download, ArrowUpRight } from 'lucide-react';

const subscriptions = [
  { id: 'SUB-092', user: 'EcoPackage Hub', plan: 'Scale', amount: '$149.00', status: 'Paid', date: 'Jul 2, 2026' },
  { id: 'SUB-091', user: 'AI Legal Reviewer', plan: 'Growth', amount: '$49.00', status: 'Paid', date: 'Jul 1, 2026' },
  { id: 'SUB-090', user: 'Fintech Micro-SaaS', plan: 'Scale', amount: '$149.00', status: 'Failed', date: 'Jun 28, 2026' },
];

const AdminBilling: React.FC = () => {
  const handleExportCSV = () => {
    if (subscriptions.length === 0) {
      window.alert("No subscription data to export.");
      return;
    }

    const headers = ["Transaction ID", "Customer", "Plan", "Amount", "Status", "Date"];
    const rows = subscriptions.map(s => [
      s.id,
      s.user,
      s.plan,
      s.amount,
      s.status,
      s.date
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `billing_subscriptions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Subscriptions & Payments</h1>
      <p className="text-gray-500 mt-1">Monitor MRR, active subscriptions, and payment history.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'MRR', val: '$42,500', inc: '+12%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Active Subs', val: '850', inc: '+5%', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Avg Revenue / User', val: '$50', inc: '+2%', icon: TrendingUp, color: 'text-[#5B21B6]', bg: 'bg-purple-50' },
        { label: 'Failed Charges', val: '12', inc: '-2%', icon: DollarSign, color: 'text-red-500', bg: 'bg-red-50' },
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.inc.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {stat.inc}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
          <p className="text-2xl font-extrabold text-gray-900">{stat.val}</p>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-bold text-gray-900">Recent Transactions</h2>
        <button 
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-sm transition-colors border border-gray-200"
        >
          <Download size={15} className="mr-2" /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscriptions.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900">{s.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.date}</p>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">{s.user}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.plan}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{s.amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${s.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default AdminBilling;
