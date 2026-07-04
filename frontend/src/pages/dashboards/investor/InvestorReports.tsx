import React from 'react';
import { FileText, Download, BarChart2 } from 'lucide-react';

const reports = [
  { id: 1, title: 'Q2 2026 Portfolio Performance', type: 'Quarterly Update', date: 'Jul 1, 2026' },
  { id: 2, title: 'Market Analysis: AI in LegalTech', type: 'Industry Insight', date: 'Jun 15, 2026' },
  { id: 3, title: 'EcoPackage Hub - Due Diligence Summary', type: 'Startup Report', date: 'May 20, 2026' },
];

const InvestorReports: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Investor Reports</h1>
      <p className="text-gray-500 mt-1">Access AI-generated portfolio updates and industry insights.</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {reports.map(r => (
        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#5B21B6] mb-4">
            {r.type.includes('Update') ? <BarChart2 size={24} /> : <FileText size={24} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{r.type}</span>
          <h3 className="font-bold text-gray-900 mb-2 leading-snug">{r.title}</h3>
          <p className="text-xs text-gray-500 mb-6">{r.date}</p>
          
          <button className="mt-auto flex items-center justify-center w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors border border-gray-200">
            <Download size={16} className="mr-2" /> Download PDF
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default InvestorReports;
