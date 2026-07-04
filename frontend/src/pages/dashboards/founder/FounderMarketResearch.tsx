import React, { useState } from 'react';
import { Search, TrendingUp, Users, DollarSign, Globe } from 'lucide-react';

const competitors = [
  { name: 'CompetitorA', pricing: '$49/mo', userBase: '50k+', strength: 'Brand recognition', weakness: 'No AI features', rating: 4.2 },
  { name: 'CompetitorB', pricing: '$29/mo', userBase: '20k+', strength: 'Low price point', weakness: 'Outdated UI', rating: 3.8 },
  { name: 'CompetitorC', pricing: '$99/mo', userBase: '100k+', strength: 'Enterprise features', weakness: 'Too complex for SMBs', rating: 4.5 },
];

const FounderMarketResearch: React.FC = () => {
  const [keyword, setKeyword] = useState('');

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Market Research</h1>
        <p className="text-gray-500 mt-1">AI-powered market analysis — understand your TAM, SAM, SOM and competitive landscape.</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-2">Research your market</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g. AI legal tech for small businesses..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
            />
          </div>
          <button className="px-5 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow">
            Analyse
          </button>
        </div>
      </div>

      {/* Market sizing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-gradient-to-br from-[#4C1D95] to-[#6D28D9] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={20} className="text-[#FBBF24]" />
            <span className="text-sm font-bold text-white/70">TAM</span>
          </div>
          <p className="text-3xl font-extrabold">$18.2B</p>
          <p className="text-sm text-white/60 mt-1">Total Addressable Market</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-blue-500" />
            <span className="text-sm font-bold text-gray-500">SAM</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">$4.1B</p>
          <p className="text-sm text-gray-500 mt-1">Serviceable Addressable Market</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-emerald-500" />
            <span className="text-sm font-bold text-gray-500">SOM</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">$410M</p>
          <p className="text-sm text-gray-500 mt-1">Serviceable Obtainable Market</p>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Key Market Insights</h2>
          <ul className="space-y-3">
            {['Market growing at 24% CAGR through 2030', '78% of SMBs cannot afford traditional legal fees', 'AI legal tools adoption grew 3x last year', 'Top use case: contract review (62% of users)', 'North America leads with 41% market share'].map((ins, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-[#5B21B6] flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-gray-700">{ins}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Competitive Landscape</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                <th className="pb-2">Name</th><th className="pb-2">Price</th><th className="pb-2">Rating</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {competitors.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2.5 font-semibold text-gray-800">{c.name}</td>
                    <td className="py-2.5 text-gray-500">{c.pricing}</td>
                    <td className="py-2.5">
                      <span className="text-yellow-500 font-bold">{'★'.repeat(Math.round(c.rating))}</span>
                      <span className="text-gray-300">{'★'.repeat(5 - Math.round(c.rating))}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderMarketResearch;
