import React from 'react';
import { Video, Calendar, Clock, MoreVertical, Link } from 'lucide-react';

const sessions = [
  { id: 1, startup: 'EcoPackage Hub', founder: 'Sarah Jenkins', time: 'Today, 2:00 PM', duration: '45 min', status: 'upcoming' },
  { id: 2, startup: 'AI Legal Reviewer', founder: 'James Park', time: 'Tomorrow, 10:00 AM', duration: '30 min', status: 'upcoming' },
  { id: 3, startup: 'Fintech Micro-SaaS', founder: 'Tom Chen', time: 'Jul 1, 2026', duration: '60 min', status: 'completed' },
];

const MentorSessions: React.FC = () => (
  <div className="animate-fade-in-up">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mentor Sessions</h1>
        <p className="text-gray-500 mt-1">Manage your upcoming 1:1 video calls with founders.</p>
      </div>
      <button 
        onClick={() => window.alert('Redirecting to Google Calendar auth...')}
        className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors"
      >
        <Link size={16} className="mr-2" /> Connect Calendar
      </button>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-[#5B21B6]" /> Upcoming & Past Sessions</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {sessions.map(s => (
          <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.status === 'upcoming' ? 'bg-purple-100 text-[#5B21B6]' : 'bg-gray-100 text-gray-400'}`}>
                <Video size={20} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{s.startup}</p>
                <p className="text-sm text-gray-500">with {s.founder}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-gray-600"><Calendar size={14} /> {s.time}</span>
                  <span className="flex items-center gap-1 text-gray-600"><Clock size={14} /> {s.duration}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {s.status === 'upcoming' ? (
                <button 
                  onClick={() => window.alert('Opening Zoom/Meet link for the session...')}
                  className="px-4 py-2 bg-[#5B21B6] text-white font-bold rounded-lg text-sm hover:bg-[#7C3AED] transition-colors shadow"
                >
                  Join Call
                </button>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold rounded-lg text-xs">Completed</span>
              )}
              <button 
                onClick={() => window.alert('Opening session options...')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default MentorSessions;
