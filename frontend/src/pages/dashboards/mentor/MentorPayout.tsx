import React from 'react';
import { Building2, Wallet, Landmark, CheckCircle2 } from 'lucide-react';

const MentorPayout: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Payout Settings</h1>
      <p className="text-gray-500 mt-1">Manage your bank accounts and payout preferences.</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Current Method */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Wallet size={20} className="text-[#5B21B6]" /> Primary Payout Method</h2>
        
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
          <div className="absolute -right-4 -top-4 opacity-10"><Landmark size={120} /></div>
          <p className="text-sm font-bold text-gray-400 mb-1 tracking-wider uppercase">Bank Account</p>
          <p className="text-xl font-bold mb-6">Chase Bank **** 4589</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Routing Number</p>
              <p className="text-sm font-semibold mt-0.5">**** 2190</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 size={14} /> Active
            </div>
          </div>
        </div>

        <button className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-600 font-bold rounded-xl hover:border-[#5B21B6] hover:text-[#5B21B6] transition-colors bg-gray-50 hover:bg-purple-50">
          + Add New Bank Account
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Building2 size={20} className="text-[#5B21B6]" /> Tax & Preferences</h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Payout Schedule</label>
            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white">
              <option>Monthly (1st of the month)</option>
              <option>Bi-weekly</option>
              <option>Manual payout</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tax Form (W-9 / W-8BEN)</label>
            <div className="flex items-center justify-between p-4 border border-emerald-200 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">Form W-9 Verified</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Submitted Jan 15, 2026</p>
                </div>
              </div>
              <button className="text-sm font-bold text-[#5B21B6] hover:underline">Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MentorPayout;
