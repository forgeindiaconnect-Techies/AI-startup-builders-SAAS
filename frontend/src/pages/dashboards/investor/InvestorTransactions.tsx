import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, Clock, Plus, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../../../context/FundingContext';

const transactions = [
  { id: 'TRX-9821', date: 'Jun 15, 2026', startup: 'EcoPackage Hub', amount: '$50,000', type: 'SAFE Investment', status: 'Completed', pnl: '+12%' },
  { id: 'TRX-7734', date: 'May 02, 2026', startup: 'AI Legal Reviewer', amount: '$25,000', type: 'Convertible Note', status: 'Completed', pnl: '+5%' },
  { id: 'TRX-9012', date: 'Jul 01, 2026', startup: 'DataSync Pro', amount: '$100,000', type: 'Equity (Priced Round)', status: 'Pending', pnl: 'N/A' },
];

const InvestorTransactions: React.FC = () => {
  const { user } = useAuth();
  const { sendOffer } = useFunding();

  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [offerData, setOfferData] = useState({
    startupName: '',
    founderName: '',
    investorName: '',
    investorCompany: '',
    investorEmail: '',
    investorAddress: '',
    offerAmount: '',
    currency: 'USD',
    equityPercentage: '',
    valuationCap: '',
    instrument: 'SAFE',
    discount: '20',
    expiresInDays: '14',
    investorMessage: ''
  });

  const handleSendOffer = () => {
    if (!user) return;

    sendOffer({
      startupId: `startup_${Date.now()}`, // Generated since they are manually typing it
      startupName: offerData.startupName || 'Unknown Startup',
      founderId: "1", // Hardcoded for demo as founder is usually ID '1' in this demo
      founderName: offerData.founderName || 'Founder', 
      investorId: user.id,
      investorName: offerData.investorName || user.name,
      investorCompany: offerData.investorCompany || "DC Ventures",
      investorEmail: offerData.investorEmail,
      investorAddress: offerData.investorAddress,
      offerAmount: Number(offerData.offerAmount),
      currency: offerData.currency,
      equityPercentage: Number(offerData.equityPercentage),
      valuationCap: Number(offerData.valuationCap),
      instrument: offerData.instrument,
      discount: Number(offerData.discount),
      expiresInDays: Number(offerData.expiresInDays),
      investorMessage: offerData.investorMessage
    });

    window.alert("Investment offer sent successfully!");
    setIsAddPaymentModalOpen(false);
    setOfferData({
      startupName: '',
      founderName: '',
      investorName: '',
      investorCompany: '',
      investorEmail: '',
      investorAddress: '',
      offerAmount: '',
      currency: 'USD',
      equityPercentage: '',
      valuationCap: '',
      instrument: 'SAFE',
      discount: '20',
      expiresInDays: '14',
      investorMessage: ''
    });
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">Track your investment history and capital deployed.</p>
        </div>
        <button 
          onClick={() => setIsAddPaymentModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Send Investment Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-500 mb-1">Total Deployed</p>
          <p className="text-3xl font-extrabold text-gray-900">$75,000</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-500 mb-1">Pending Investments</p>
          <p className="text-3xl font-extrabold text-amber-600">$100,000</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-sm p-6 text-white">
          <p className="text-sm font-bold text-emerald-100 mb-1">Avg. Unrealised Return</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-extrabold">+8.5%</p>
            <ArrowUpRight size={24} className="text-emerald-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Startup</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{t.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.date}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{t.startup}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.type}</td>
                  <td className="px-6 py-4 font-bold text-[#5B21B6]">{t.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {t.status === 'Completed' ? <DollarSign size={12} /> : <Clock size={12} />} {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Investment Offer Modal */}
      {isAddPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <DollarSign size={20} className="text-[#5B21B6]" /> Send Investment Offer
              </h3>
              <button 
                onClick={() => setIsAddPaymentModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Startup Name</label>
                  <input 
                    type="text" 
                    value={offerData.startupName}
                    onChange={(e) => setOfferData({...offerData, startupName: e.target.value})}
                    placeholder="e.g. EcoPackage Hub"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Founder Name</label>
                  <input 
                    type="text" 
                    value={offerData.founderName}
                    onChange={(e) => setOfferData({...offerData, founderName: e.target.value})}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Investor Name</label>
                  <input 
                    type="text" 
                    value={offerData.investorName}
                    onChange={(e) => setOfferData({...offerData, investorName: e.target.value})}
                    placeholder="e.g. David Chen"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Investor Company Name</label>
                  <input 
                    type="text" 
                    value={offerData.investorCompany}
                    onChange={(e) => setOfferData({...offerData, investorCompany: e.target.value})}
                    placeholder="e.g. DC Ventures"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Investor Email</label>
                  <input 
                    type="email" 
                    value={offerData.investorEmail}
                    onChange={(e) => setOfferData({...offerData, investorEmail: e.target.value})}
                    placeholder="david@dcventures.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Investor Address</label>
                  <input 
                    type="text" 
                    value={offerData.investorAddress}
                    onChange={(e) => setOfferData({...offerData, investorAddress: e.target.value})}
                    placeholder="123 Sand Hill Rd, Menlo Park"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Offer Amount</label>
                  <input 
                    type="number" 
                    value={offerData.offerAmount}
                    onChange={(e) => setOfferData({...offerData, offerAmount: e.target.value})}
                    placeholder="250000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Currency</label>
                  <select 
                    value={offerData.currency}
                    onChange={(e) => setOfferData({...offerData, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Equity Percentage (%)</label>
                  <input 
                    type="number" 
                    value={offerData.equityPercentage}
                    onChange={(e) => setOfferData({...offerData, equityPercentage: e.target.value})}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Investment Type (Instrument)</label>
                  <select 
                    value={offerData.instrument}
                    onChange={(e) => setOfferData({...offerData, instrument: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  >
                    <option value="SAFE">SAFE</option>
                    <option value="Convertible Note">Convertible Note</option>
                    <option value="Equity">Equity (Priced Round)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Valuation Cap ($)</label>
                  <input 
                    type="number" 
                    value={offerData.valuationCap}
                    onChange={(e) => setOfferData({...offerData, valuationCap: e.target.value})}
                    placeholder="2500000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Discount (%)</label>
                  <input 
                    type="number" 
                    value={offerData.discount}
                    onChange={(e) => setOfferData({...offerData, discount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Expires In (Days)</label>
                  <input 
                    type="number" 
                    value={offerData.expiresInDays}
                    onChange={(e) => setOfferData({...offerData, expiresInDays: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Investor Message / Notes</label>
                <textarea 
                  value={offerData.investorMessage}
                  onChange={(e) => setOfferData({...offerData, investorMessage: e.target.value})}
                  rows={3}
                  placeholder="Additional terms or messages to the founder..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddPaymentModalOpen(false)} 
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendOffer} 
                className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorTransactions;
