import React from 'react';
import { ScrollText, Download, TrendingUp, Users, DollarSign, Rocket } from 'lucide-react';

const reports = [
  { id: 1, title: 'Platform Growth Report — Q2 2026', type: 'Growth', icon: TrendingUp, date: 'Jul 1, 2026', size: '2.4 MB', desc: 'User acquisition, retention, churn rate, and MoM growth breakdown.' },
  { id: 2, title: 'Revenue & MRR Report — June 2026', type: 'Revenue', icon: DollarSign, date: 'Jul 1, 2026', size: '1.1 MB', desc: 'Monthly recurring revenue, failed payments, upgrades/downgrades, and ARR projection.' },
  { id: 3, title: 'Startup Performance Index — H1 2026', type: 'Startups', icon: Rocket, date: 'Jun 30, 2026', size: '3.8 MB', desc: 'AI-scored startup rankings, sector distribution, and funding success rates.' },
  { id: 4, title: 'User Engagement Report — Q2 2026', type: 'Engagement', icon: Users, date: 'Jun 30, 2026', size: '1.7 MB', desc: 'DAU/MAU ratios, feature adoption rates, and session analytics by role.' },
  { id: 5, title: 'AI Usage & Cost Report — June 2026', type: 'AI', icon: ScrollText, date: 'Jul 1, 2026', size: '0.9 MB', desc: 'Token consumption, API cost breakdown, and model performance by use case.' },
];

const typeColors: Record<string, string> = {
  Growth: 'bg-blue-100 text-blue-700',
  Revenue: 'bg-emerald-100 text-emerald-700',
  Startups: 'bg-purple-100 text-[#5B21B6]',
  Engagement: 'bg-amber-100 text-amber-700',
  AI: 'bg-gray-100 text-gray-700',
};

const AdminReports: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Download AI-generated platform performance and revenue reports.</p>
      </div>
      <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
        <ScrollText size={16} className="mr-2" /> Generate Custom Report
      </button>
    </div>

    <div className="space-y-4">
      {reports.map(r => (
        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#5B21B6] flex-shrink-0 shadow-sm">
            <r.icon size={22} />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">{r.title}</h3>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColors[r.type]}`}>{r.type}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{r.desc}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
              <span>Generated: {r.date}</span>
              <span>·</span>
              <span>{r.size}</span>
            </div>
          </div>

          <div className="flex gap-2 sm:flex-col sm:items-stretch">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
              <Download size={15} /> PDF
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
              <Download size={15} /> CSV
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminReports;
