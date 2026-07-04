import React from 'react';
import { Calendar, Video, Clock, Link, CheckCircle2 } from 'lucide-react';

const meetings = [
  { id: 1, startup: 'EcoPackage Hub', founder: 'Sarah Jenkins', type: 'Initial Pitch', date: 'Jul 4, 2026', time: '10:00 AM - 10:45 AM', status: 'upcoming' },
  { id: 2, startup: 'DataSync Pro', founder: 'Mark Voltas', type: 'Due Diligence Q&A', date: 'Jul 5, 2026', time: '2:00 PM - 3:00 PM', status: 'upcoming' },
  { id: 3, startup: 'AI Legal Reviewer', founder: 'James Park', type: 'Founder Intro', date: 'Jun 28, 2026', time: '11:00 AM - 11:30 AM', status: 'completed' },
];

const InvestorMeetings: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-500 mt-1">Manage your calendar and upcoming video calls with founders.</p>
      </div>
      <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
        <Link size={16} className="mr-2" /> Sync Google Calendar
      </button>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-[#5B21B6]" /> Schedule</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {meetings.map(m => (
          <div key={m.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${m.status === 'upcoming' ? 'bg-purple-100 text-[#5B21B6]' : 'bg-gray-100 text-gray-400'}`}>
                {m.status === 'upcoming' ? <Video size={20} /> : <CheckCircle2 size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{m.startup}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{m.type}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1.5">with {m.founder}</p>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {m.date}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {m.time}</span>
                </div>
              </div>
            </div>
            
            {m.status === 'upcoming' ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Reschedule
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2 bg-[#5B21B6] text-white font-bold rounded-lg text-sm hover:bg-[#7C3AED] transition-colors shadow">
                  Join Call
                </button>
              </div>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 font-bold rounded-lg text-xs self-start sm:self-auto">Completed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default InvestorMeetings;
