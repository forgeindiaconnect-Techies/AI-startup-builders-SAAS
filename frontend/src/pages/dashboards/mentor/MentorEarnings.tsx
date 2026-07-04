import React from 'react';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, FileText } from 'lucide-react';

const MentorEarnings: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
        <p className="text-gray-500 mt-1">Track your income from startup reviews and 1:1 consultation calls.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={80} />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-2">Available for Payout</p>
          <p className="text-4xl font-bold mb-4">$1,450.00</p>
          <button 
            onClick={() => window.alert('Processing withdrawal of $1,450.00 to your bank account...')}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
          >
            Withdraw Funds
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600"><TrendingUp size={24} /></div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={16} className="mr-1" /> +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">$3,200.00</p>
          <p className="text-sm font-medium text-gray-500">Total Earnings (30 Days)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600"><FileText size={24} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">24</p>
          <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <button 
            onClick={() => window.alert('Opening date picker filter...')}
            className="text-sm font-medium text-[#5B21B6] hover:text-[#7C3AED] transition-colors flex items-center"
          >
            <Calendar size={16} className="mr-2" />
            Filter by Date
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 24, 2026</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Review</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">EcoPackage Hub - Detailed Review</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center w-fit">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">+$150.00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 22, 2026</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">1:1 Call</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">Strategy Session - SaaS Metrics</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center w-fit">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">+$250.00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 18, 2026</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Payout</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">Bank Transfer (**** 4291)</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center w-fit">
                    Processed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 text-right">-$1,200.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MentorEarnings;
