import React, { useState } from 'react';
import { DollarSign, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFunding } from '../../context/FundingContext';

interface SendInvestmentOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStartupName?: string;
  initialFounderName?: string;
}

const SendInvestmentOfferModal: React.FC<SendInvestmentOfferModalProps> = ({ 
  isOpen, 
  onClose, 
  initialStartupName = '', 
  initialFounderName = '' 
}) => {
  const { user } = useAuth();
  const { sendOffer } = useFunding();

  const [offerData, setOfferData] = useState({
    startupName: initialStartupName,
    founderName: initialFounderName,
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
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    investorMessage: ''
  });

  if (!isOpen) return null;

  const handleSendOffer = () => {
    if (!user) return;

    sendOffer({
      startupId: `startup_${Date.now()}`,
      startupName: offerData.startupName || 'Unknown Startup',
      founderId: "1", // Hardcoded for demo
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
      expiresInDays: Math.max(1, Math.ceil((new Date(offerData.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      investorMessage: offerData.investorMessage
    });

    window.alert("Investment offer sent successfully!");
    onClose();
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
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      investorMessage: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <DollarSign size={20} className="text-[#5B21B6]" /> Send Investment Offer
          </h3>
          <button 
            onClick={onClose} 
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
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Offer Expiry Date</label>
              <input 
                type="date" 
                value={offerData.expiryDate}
                onChange={(e) => setOfferData({...offerData, expiryDate: e.target.value})}
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
            onClick={onClose} 
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
  );
};

export default SendInvestmentOfferModal;
