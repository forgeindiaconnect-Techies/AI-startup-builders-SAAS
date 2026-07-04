import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, TrendingUp, Search, Filter } from 'lucide-react';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Discover, evaluate, and invest in AI-validated startups.</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-sm text-white">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Deployed Capital</p>
          <p className="text-3xl font-bold">$1.2M</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Investments</p>
              <p className="text-3xl font-bold text-gray-900">4</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Briefcase size={20}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Portfolio Avg ROI</p>
              <p className="text-3xl font-bold text-green-500">+24%</p>
            </div>
            <div className="p-2 bg-green-50 text-green-500 rounded-lg"><TrendingUp size={20}/></div>
          </div>
        </div>
      </div>

      {/* Startup Marketplace */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-bold text-gray-900">Startups Marketplace</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search startups..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><Filter size={18}/></button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Startup Card */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-[#10B981] transition-all hover:shadow-md group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">N</div>
              <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md border border-green-100">Raising $500k</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">NexAI Analytics</h3>
            <p className="text-sm text-gray-500 mb-4">Predictive customer churn analysis for mid-market SaaS companies.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium">AI Score</p>
                <p className="font-bold text-gray-900">94/100</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Revenue Model</p>
                <p className="font-bold text-gray-900 text-sm">B2B SaaS</p>
              </div>
            </div>
            
            <button className="w-full py-2 bg-gray-50 group-hover:bg-[#10B981] text-gray-700 group-hover:text-white rounded-lg font-medium text-sm transition-colors">
              View Deal Room
            </button>
          </div>
          
          {/* Startup Card */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-[#10B981] transition-all hover:shadow-md group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center font-bold text-xl">E</div>
              <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md border border-green-100">Raising $1.2M</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">EcoPackage Hub</h3>
            <p className="text-sm text-gray-500 mb-4">Sustainable packaging marketplace connecting green manufacturers with D2C brands.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium">AI Score</p>
                <p className="font-bold text-gray-900">92/100</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Revenue Model</p>
                <p className="font-bold text-gray-900 text-sm">Marketplace</p>
              </div>
            </div>
            
            <button className="w-full py-2 bg-gray-50 group-hover:bg-[#10B981] text-gray-700 group-hover:text-white rounded-lg font-medium text-sm transition-colors">
              View Deal Room
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
