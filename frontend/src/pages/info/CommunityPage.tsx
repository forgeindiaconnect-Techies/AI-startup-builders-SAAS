import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Users, MessageSquare, Calendar, Award } from 'lucide-react';

const highlights = [
  { icon: Users, title: '1,200+ Members', desc: 'Active founders, mentors, and investors', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: MessageSquare, title: '500+ Discussions', desc: 'Weekly conversations about startups', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Calendar, title: 'Monthly Meetups', desc: 'Virtual networking and pitch sessions', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Award, title: 'Top Mentors', desc: 'Industry experts with proven track records', color: 'text-amber-500', bg: 'bg-amber-50' },
];

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#5B21B6] font-medium text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-2 rounded-lg">
            <Rocket size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1F2937]">Community</h1>
        </div>
        <p className="text-[#6B7280] mb-10 ml-12">Connect with fellow founders, mentors, and investors.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {highlights.map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-xl ${h.bg} flex items-center justify-center shrink-0`}>
                <h.icon size={22} className={h.color} />
              </div>
              <div>
                <h3 className="font-bold text-[#1F2937] text-sm">{h.title}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <Users size={48} className="mx-auto text-[#5B21B6] mb-4" />
          <h2 className="text-xl font-bold text-[#1F2937] mb-2">Join Our Community</h2>
          <p className="text-sm text-[#6B7280] mb-6 max-w-md mx-auto">
            Get access to exclusive discussions, expert Q&A sessions, virtual pitch events, and a network of passionate startup builders.
          </p>
          <button
            onClick={() => window.alert('Community access is coming soon! Sign up to get notified.')}
            className="px-6 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            Join Now — Free
          </button>
        </div>

        <div className="mt-8 bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Upcoming Events</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <Calendar size={18} className="text-[#FBBF24]" />
              <div>
                <p className="font-bold text-sm">Founder Pitch Night</p>
                <p className="text-xs text-indigo-200">July 25, 2026 — 7:00 PM EST</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <Calendar size={18} className="text-[#FBBF24]" />
              <div>
                <p className="font-bold text-sm">AI for Startups Workshop</p>
                <p className="text-xs text-indigo-200">August 5, 2026 — 6:00 PM EST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
