import React from 'react';
import { ShieldAlert, CheckCircle2, Upload } from 'lucide-react';

const InvestorKYC: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">KYC & Accreditation</h1>
      <p className="text-gray-500 mt-1">Verify your identity and accredited investor status.</p>
    </div>

    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <p className="font-bold text-emerald-900 text-lg">Fully Verified</p>
          <p className="text-sm text-emerald-700">Your account is verified for investments up to $5M.</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Identity Verification</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
          <span className="text-sm font-semibold text-gray-700">Government ID</span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Approved</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <span className="text-sm font-semibold text-gray-700">Proof of Address</span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Approved</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Accreditation Document</h2>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer mb-4">
          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-bold text-gray-700">Upload new document</p>
          <p className="text-xs text-gray-400 mt-1">CPA Letter, Tax Returns, etc.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ShieldAlert size={16} className="text-amber-500" />
          Current document expires on Dec 31, 2026.
        </div>
      </div>
    </div>
  </div>
);

export default InvestorKYC;
