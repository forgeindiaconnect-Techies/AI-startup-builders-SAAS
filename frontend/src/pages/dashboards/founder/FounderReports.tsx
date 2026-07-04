import React from 'react';
import { Download, FileText, CheckCircle2, AlertTriangle, TrendingUp, Cpu } from 'lucide-react';

const FounderReports: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Analysis Reports</h1>
        <p className="text-gray-500 mt-1">Review the AI-generated business insights for your startups.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Report View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">EcoPackage Hub</h2>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center">
                    <Cpu size={14} className="mr-1"/> AI Generated
                  </span>
                </div>
                <p className="text-gray-500">Comprehensive Business Analysis • Generated Oct 24, 2026</p>
              </div>
              <button className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors">
                <Download size={18} className="mr-2" />
                Export PDF
              </button>
            </div>

            <div className="space-y-8">
              {/* Score Section */}
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center bg-white shadow-sm shrink-0">
                  <span className="text-3xl font-bold text-gray-900">92</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Investment Readiness Score</h3>
                  <p className="text-sm text-gray-600">Your startup has high potential. The market size is large and growing, and your proposed solution has clear differentiation. Focus on customer acquisition costs in the next iteration.</p>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center text-green-700">
                    <CheckCircle2 size={20} className="mr-2" /> Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100">
                      <span className="font-bold mr-2 text-green-700">1.</span>
                      Strong market timing with increasing ESG regulations worldwide.
                    </li>
                    <li className="flex items-start text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100">
                      <span className="font-bold mr-2 text-green-700">2.</span>
                      Clear monetization strategy through marketplace transaction fees.
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center text-orange-600">
                    <AlertTriangle size={20} className="mr-2" /> Risk Factors
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <span className="font-bold mr-2 text-orange-700">1.</span>
                      Supply side constraints: Finding reliable green manufacturers.
                    </li>
                    <li className="flex items-start text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <span className="font-bold mr-2 text-orange-700">2.</span>
                      High upfront costs to verify sustainability claims.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Market Analysis */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp size={20} className="mr-2 text-blue-500" /> Market Analysis Summary
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  The global sustainable packaging market size was valued at USD 271.86 billion in 2023 and is expected to grow at a compound annual growth rate (CAGR) of 6.0% from 2024 to 2030. EcoPackage Hub's specific target market (D2C brands) represents approximately 15% of this total addressable market.
                </p>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="bg-[#5B21B6] w-[15%] h-full" title="TAM (15%)"></div>
                  <div className="bg-purple-300 w-[85%] h-full"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>Target Niche (15%)</span>
                  <span>Broader Market (85%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Your Reports</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-left transition-colors">
                <FileText className="text-[#5B21B6] mr-3" size={20} />
                <div>
                  <p className="text-sm font-bold text-indigo-900">EcoPackage Hub</p>
                  <p className="text-xs text-indigo-700">Score: 92/100</p>
                </div>
              </button>
              <button className="w-full flex items-center p-3 border border-transparent hover:bg-gray-50 rounded-xl text-left transition-colors">
                <FileText className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm font-bold text-gray-700">FinFlow AI</p>
                  <p className="text-xs text-gray-500">Score: 85/100</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderReports;
