import React, { useState } from 'react';
import { Search, TrendingUp, Users, DollarSign, Globe, Target, AlertTriangle } from 'lucide-react';

interface Props {
  startupData: any;
  setStartupData: (data: any) => void;
}

const FounderMarketResearch: React.FC<Props> = ({ startupData }) => {
  const [keyword, setKeyword] = useState('');

  const mr = startupData?.aiGenerated?.marketResearch;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Market Research</h1>
        <p className="text-gray-500 mt-1">AI-powered market analysis — understand your TAM, SAM, SOM and competitive landscape.</p>
      </div>

      {!startupData ? (
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center mb-8">
          <p className="text-[#5B21B6] font-bold">Please generate a startup in the AI Idea Generator first to view your custom market research.</p>
        </div>
      ) : (
        <>
          {/* Market sizing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-gradient-to-br from-[#4C1D95] to-[#6D28D9] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={20} className="text-[#FBBF24]" />
                <span className="text-sm font-bold text-white/70">TAM</span>
              </div>
              <p className="text-3xl font-extrabold">{mr?.tam || 'N/A'}</p>
              <p className="text-sm text-white/60 mt-1">Total Addressable Market</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users size={20} className="text-blue-500" />
                <span className="text-sm font-bold text-gray-500">SAM</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{mr?.sam || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-1">Serviceable Addressable Market</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={20} className="text-emerald-500" />
                <span className="text-sm font-bold text-gray-500">SOM</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{mr?.som || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-1">Serviceable Obtainable Market</p>
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-[#5B21B6]" /> Market Trends</h2>
              <ul className="space-y-3">
                {mr?.marketTrends?.map((ins: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-[#5B21B6] flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-gray-700">{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><Target size={16} className="text-[#5B21B6]" /> Competitor Analysis</h2>
              <ul className="space-y-3">
                {mr?.competitors?.map((ins: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5B21B6] flex-shrink-0 mt-1.5" />
                    <span className="text-gray-700">{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /> Opportunities</h2>
              <ul className="space-y-3">
                {mr?.opportunities?.map((ins: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                    <span className="text-gray-700">{ins}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Pricing Suggestions</h3>
                  <ul className="space-y-2">
                    {mr?.pricingSuggestions?.map((ins: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 leading-relaxed">• {ins}</li>
                    ))}
                  </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> Risks & Threats</h2>
              <ul className="space-y-3">
                {mr?.risks?.map((ins: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                    <span className="text-gray-700">{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FounderMarketResearch;
