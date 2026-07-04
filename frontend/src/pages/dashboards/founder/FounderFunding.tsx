import React from 'react';
import { Eye, MessageCircle, FileCheck } from 'lucide-react';

const FounderFunding: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Funding & Offers</h1>
        <p className="text-gray-500 mt-1">Track investor interest, messages, and term sheet offers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-500"><Eye size={24} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">142</p>
          <p className="text-sm font-medium text-gray-500">Investor Profile Views</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-500"><MessageCircle size={24} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">4</p>
          <p className="text-sm font-medium text-gray-500">Active Conversations</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-2xl shadow-sm text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-white/20 text-white"><FileCheck size={24} /></div>
          </div>
          <p className="text-3xl font-bold text-white">1</p>
          <p className="text-sm font-medium text-green-100">Term Sheet Offers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Active Term Sheets & Offers</h2>
        
        <div className="border border-green-200 rounded-xl bg-green-50/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mb-3 inline-block">Offer Received</span>
                <h3 className="text-xl font-bold text-gray-900">Pre-Seed Investment</h3>
                <p className="text-sm text-gray-600">From: DC Ventures (David Chen) for <span className="font-semibold text-gray-900">EcoPackage Hub</span></p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-3xl font-extrabold text-gray-900">$250,000</p>
                <p className="text-sm font-medium text-gray-500">for 10% Equity</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Valuation Cap</p>
                <p className="font-bold text-gray-900">$2.5M</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Instrument</p>
                <p className="font-bold text-gray-900">SAFE</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Discount</p>
                <p className="font-bold text-gray-900">20%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Expires In</p>
                <p className="font-bold text-red-600">5 Days</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to accept this $250,000 offer for 10% equity?")) {
                    window.alert("Offer accepted! The term sheet will be generated shortly.");
                  }
                }}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
              >
                Review & Accept
              </button>
              <button 
                onClick={() => {
                  const counter = window.prompt("Enter your counter offer (e.g. $300,000 for 10% equity):");
                  if (counter) {
                    window.alert(`Counter offer of "${counter}" sent to DC Ventures.`);
                  }
                }}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-sm transition-colors shadow-sm"
              >
                Counter Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderFunding;
