import React from 'react';
import { Briefcase, TrendingUp, Activity, PieChart, ChevronRight } from 'lucide-react';

const InvestorPortfolio: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
        <p className="text-gray-500 mt-1">Track your active portfolio, deployed capital, and equity distribution.</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-[#5B21B6] p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-20">
            <PieChart size={160} />
          </div>
          <p className="text-indigo-200 font-medium mb-2">Total Deployed Capital</p>
          <p className="text-5xl font-extrabold mb-6">$1,250,000</p>
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Active Investments</p>
              <p className="text-xl font-bold">4</p>
            </div>
            <div className="w-px bg-indigo-700/50"></div>
            <div>
              <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Avg Equity</p>
              <p className="text-xl font-bold">6.5%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp size={20} /></div>
            <span className="font-bold text-sm">Est. Portfolio IRR</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">24.5%</p>
          <p className="text-sm text-gray-500 font-medium">Tracking above benchmark</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4 text-orange-600">
            <div className="p-2 bg-orange-50 rounded-lg"><Activity size={20} /></div>
            <span className="font-bold text-sm">Pending Deals</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">2</p>
          <p className="text-sm text-gray-500 font-medium">$150k in term sheets</p>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Briefcase className="mr-2 text-gray-400" size={20} /> Active Holdings
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Startup</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invested</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instrument</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equity %</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Mark</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Row 1 */}
              <tr className="hover:bg-gray-50 transition-colors group cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">L</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">LumiAI</p>
                      <p className="text-xs text-gray-500">Seed • Dec 2025</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-semibold text-gray-900">$500,000</td>
                <td className="px-6 py-5">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Priced Round</span>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-gray-900">8.0%</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-emerald-600">$750,000</p>
                  <p className="text-xs text-emerald-600 flex items-center">↑ 1.5x</p>
                </td>
                <td className="px-6 py-5 text-right">
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-[#5B21B6] transition-colors" />
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr className="hover:bg-gray-50 transition-colors group cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold">E</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">EcoPackage Hub</p>
                      <p className="text-xs text-orange-500 font-medium">Pending Close</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-semibold text-gray-900">$250,000</td>
                <td className="px-6 py-5">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">SAFE</span>
                  <p className="text-xs text-gray-400 mt-1">$2.5M Cap</p>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-gray-900">~10.0%</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-gray-900">$250,000</p>
                  <p className="text-xs text-gray-500 flex items-center">- 1.0x</p>
                </td>
                <td className="px-6 py-5 text-right">
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-[#5B21B6] transition-colors" />
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-gray-50 transition-colors group cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">N</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Nova Security</p>
                      <p className="text-xs text-gray-500">Pre-Seed • Aug 2025</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-semibold text-gray-900">$500,000</td>
                <td className="px-6 py-5">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Convertible Note</span>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-gray-900">15.0%</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-gray-900">$500,000</p>
                  <p className="text-xs text-gray-500 flex items-center">- 1.0x</p>
                </td>
                <td className="px-6 py-5 text-right">
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-[#5B21B6] transition-colors" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvestorPortfolio;
