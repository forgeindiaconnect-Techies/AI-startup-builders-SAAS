import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Video, Clock, Link, CheckCircle2, ArrowUpRight, ShieldCheck, Mail } from 'lucide-react';
import InvestorSubNav from '../../../components/shared/InvestorSubNav';
import { getInvestorMeetingInvites, type InvestorMeetingInvite } from '../../../utils/investorModuleStorage';

const InvestorMeetings: React.FC = () => {
  const syncDateRef = useRef<HTMLInputElement>(null);
  const rescheduleDateRef = useRef<HTMLInputElement>(null);
  const [meetingInvites, setMeetingInvites] = useState<InvestorMeetingInvite[]>([]);

  const loadMeetings = () => {
    const invites = getInvestorMeetingInvites();
    setMeetingInvites(invites);
  };

  useEffect(() => {
    loadMeetings();
    window.addEventListener('storage', loadMeetings);
    window.addEventListener('investor_meetings_updated', loadMeetings);
    return () => {
      window.removeEventListener('storage', loadMeetings);
      window.removeEventListener('investor_meetings_updated', loadMeetings);
    };
  }, []);

  return (
    <div className="animate-fade-in-up pb-10 font-sans">
      <InvestorSubNav activeTab="meetings" />
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investor Meetings & Accreditation Calls</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your scheduled video calls, pitch reviews, and platform accreditation sessions.</p>
        </div>
        <div className="relative">
          <input 
            type="date" 
            ref={syncDateRef} 
            className="absolute inset-0 opacity-0 pointer-events-none" 
            onChange={(e) => {
              if(e.target.value) window.alert(`Calendar synced from: ${e.target.value}`);
            }} 
          />
          <button 
            onClick={() => syncDateRef.current?.showPicker()}
            className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors cursor-pointer"
          >
            <Link size={16} className="mr-2" /> Sync Google Calendar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Calendar size={18} className="text-[#5B21B6]" /> Scheduled Meetings ({meetingInvites.length})
          </h2>
        </div>

        {meetingInvites.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Video size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-700">No Scheduled Meetings Found</p>
            <p className="text-xs text-gray-400 mt-1">Admin accreditation call invites and pitch reviews will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {meetingInvites.map(m => (
              <div key={m.id} className="p-6 hover:bg-gray-50/60 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#5B21B6] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Video size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base">{m.investorName}</h3>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-[#6C4CF1] px-2.5 py-0.5 rounded-full">
                        {m.investorType}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {m.status} ✓
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Firm: <strong className="text-gray-800">{m.firmName || 'Independent Investor'}</strong> • Email: <strong className="text-gray-800">{m.investorEmail}</strong>
                    </p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <Calendar size={13} className="text-[#6C4CF1]" /> {m.meetingDate}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <Clock size={13} className="text-[#6C4CF1]" /> {m.meetingTime} IST
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                        Passcode: <strong className="font-mono text-gray-900">{m.passcode}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                  <a
                    href={m.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                  >
                    <Video size={15} /> Join Call <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorMeetings;
