import React from 'react';
import { IndianRupee, ArrowUpRight, Clock } from 'lucide-react';

const transactions: any[] = [];

const InvestorTransactions: React.FC = () => {
  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">Track your investment history and capital deployed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-500 mb-1">Total Deployed</p>
          <p className="text-3xl font-extrabold text-gray-900">₹75,00,000</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-500 mb-1">Pending Investments</p>
          <p className="text-3xl font-extrabold text-amber-600">₹1,00,00,000</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-sm p-6 text-white">
          <p className="text-sm font-bold text-emerald-100 mb-1">Avg. Unrealised Return</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-extrabold">+8.5%</p>
            <ArrowUpRight size={24} className="text-emerald-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Startup</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{t.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.date}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{t.startup}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.type}</td>
                  <td className="px-6 py-4 font-bold text-[#5B21B6]">{t.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {t.status === 'Completed' ? <IndianRupee size={12} /> : <Clock size={12} />} {t.status}
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

export default InvestorTransactions;
