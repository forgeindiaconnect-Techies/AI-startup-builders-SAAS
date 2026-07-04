import React from 'react';
import { Search, Filter, Cpu, ArrowRight, Bookmark, Target } from 'lucide-react';

const InvestorMarketplace: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Flow Marketplace</h1>
          <p className="text-gray-500 mt-1">Discover, filter, and evaluate AI-vetted startup opportunities.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
          <Bookmark size={20} className="mr-2" />
          Saved Deals (2)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by keyword, industry, or founder..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm transition-shadow"
            />
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm text-gray-700 font-medium bg-white outline-none">
              <option>All Industries</option>
              <option>SaaS / Enterprise</option>
              <option>FinTech</option>
              <option>HealthTech</option>
              <option>ClimateTech</option>
            </select>
            <button className="flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
              <Filter size={18} className="mr-2" />
              More Filters
            </button>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 self-center">AI Score:</span>
          <button className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-bold hover:bg-green-100 transition-colors">90+ Score</button>
          <button className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">80-89 Score</button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-4 mr-2 self-center">Stage:</span>
          <button className="px-3 py-1.5 bg-[#5B21B6] text-white border border-[#5B21B6] rounded-full text-xs font-medium shadow-sm">Pre-Seed</button>
          <button className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">Seed</button>
        </div>
      </div>

      {/* Startups List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Deal Card 1 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#5B21B6]/40 hover:shadow-lg transition-all group flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                E
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">EcoPackage Hub</h3>
                <p className="text-sm text-gray-500 font-medium">B2B Marketplace • Pre-Seed</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-100 text-green-700 rounded-lg">
                <Cpu size={14} className="text-green-600" />
                <span className="font-bold text-sm">92/100</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">AI Rating</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow">
            Sustainable packaging marketplace connecting certified green manufacturers directly with D2C e-commerce brands, eliminating middlemen and reducing costs by 15%.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Target Raise</p>
              <p className="font-bold text-gray-900">$500k</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Valuation Cap</p>
              <p className="font-bold text-gray-900">$2.5M</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Committed</p>
              <p className="font-bold text-green-600">60%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Traction</p>
              <p className="font-bold text-gray-900">12 Pilots</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center">
              <Bookmark size={16} className="mr-2" />
              Save
            </button>
            <button className="flex-[2] py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center group-hover:shadow-lg">
              View Data Room
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Deal Card 2 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#5B21B6]/40 hover:shadow-lg transition-all group flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                F
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">FinFlow AI</h3>
                <p className="text-sm text-gray-500 font-medium">FinTech SaaS • Idea Stage</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-lg">
                <Target size={14} className="text-yellow-600" />
                <span className="font-bold text-sm">85/100</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">AI Rating</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow">
            Automated financial forecasting for SaaS companies using LLM-based data extraction from existing accounting tools. Connects to Xero/QBO in one click.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Target Raise</p>
              <p className="font-bold text-gray-900">$250k</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Valuation Cap</p>
              <p className="font-bold text-gray-900">$1.5M</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Committed</p>
              <p className="font-bold text-yellow-600">0%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Traction</p>
              <p className="font-bold text-gray-900">Prototype</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center">
              <Bookmark size={16} className="mr-2" />
              Save
            </button>
            <button className="flex-[2] py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center group-hover:shadow-lg">
              View Profile
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvestorMarketplace;
