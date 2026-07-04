import React from 'react';
import { Camera, Save, Target } from 'lucide-react';

const InvestorProfileDetails: React.FC = () => {
  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investor Profile</h1>
          <p className="text-gray-500 mt-1">Manage your investment thesis and public profile.</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
          <Save size={16} className="mr-2" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-4xl font-black shadow-xl">
              C
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-[#5B21B6] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#7C3AED] transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <p className="font-bold text-gray-900 text-lg">Capital Ventures</p>
          <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest mt-1">Institutional Investor</p>
          <p className="text-sm text-gray-500 mt-3">Silicon Valley, CA</p>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100 flex items-center gap-2">
              <Target size={18} className="text-[#5B21B6]" /> Investment Thesis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Typical Check Size</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white">
                  <option>$50k - $250k</option>
                  <option>$250k - $1M</option>
                  <option>$1M+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Preferred Stages</label>
                <input type="text" defaultValue="Pre-Seed, Seed" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Sectors of Interest</label>
                <input type="text" defaultValue="AI, ClimateTech, FinTech, B2B SaaS" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorProfileDetails;
