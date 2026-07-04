import React from 'react';
import { Handshake, Clock, CheckCircle2, XCircle } from 'lucide-react';

const requests = [
  { id: 1, startup: 'EcoPackage Hub', date: 'Jul 2, 2026', status: 'Pending', type: 'Pitch Deck Request', note: 'Requested full financials and cap table.' },
  { id: 2, startup: 'AI Legal Reviewer', date: 'Jun 28, 2026', status: 'Accepted', type: 'Intro Meeting', note: 'Founder accepted. Call scheduled for Jul 5.' },
  { id: 3, startup: 'Fintech Micro-SaaS', date: 'Jun 15, 2026', status: 'Declined', type: 'Term Sheet Sent', note: 'Founder went with another lead investor.' },
];

const statusStyles: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  Pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  Accepted: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  Declined: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
};

const InvestorRequests: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Investment Requests</h1>
      <p className="text-gray-500 mt-1">Track outreach, pitch deck requests, and term sheets sent to founders.</p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Handshake size={18} className="text-[#5B21B6]" /> Active Requests</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {requests.map(r => {
          const StatusIcon = statusStyles[r.status].icon;
          return (
            <div key={r.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900">{r.startup}</h3>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[r.status].bg} ${statusStyles[r.status].color}`}>
                    <StatusIcon size={12} /> {r.status}
                  </span>
                </div>
                <p className="text-sm text-[#5B21B6] font-semibold mb-2">{r.type}</p>
                <p className="text-sm text-gray-600 italic">"{r.note}"</p>
              </div>
              <div className="flex flex-col sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0">
                <span className="text-xs font-medium text-gray-400">Sent on {r.date}</span>
                {r.status === 'Pending' && (
                  <button className="mt-3 sm:mt-0 text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                    Cancel Request
                  </button>
                )}
                {r.status === 'Accepted' && (
                  <button className="mt-3 sm:mt-0 px-4 py-2 bg-[#5B21B6] text-white text-sm font-bold rounded-lg hover:bg-[#7C3AED] transition-colors shadow">
                    View Next Steps
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default InvestorRequests;
