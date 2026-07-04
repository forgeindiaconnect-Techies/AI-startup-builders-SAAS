import React from 'react';
import { Check, X, GraduationCap, Star, Calendar, ExternalLink } from 'lucide-react';

const applicants = [
  {
    id: 1, name: 'Dr. Priya Sharma', expertise: 'AI/ML, Product Strategy', experience: '12 years', location: 'Bangalore, IN',
    applied: '2 hours ago', linkedin: 'linkedin.com/in/priyasharma', bio: 'Former Google PM with expertise in AI products. Mentored 40+ startups.',
    rating: 4.9, sessions: 0, status: 'Pending',
  },
  {
    id: 2, name: 'Marcus Webb', expertise: 'B2B SaaS, Sales', experience: '8 years', location: 'Austin, TX',
    applied: '1 day ago', linkedin: 'linkedin.com/in/marcuswebb', bio: 'Scaled two B2B SaaS companies to $10M ARR. YC alumni.',
    rating: null, sessions: 0, status: 'Pending',
  },
  {
    id: 3, name: 'Amelia Torres', expertise: 'ClimateTech, Fundraising', experience: '15 years', location: 'London, UK',
    applied: '3 days ago', linkedin: 'linkedin.com/in/ameliatorres', bio: 'Partner at Green Ventures. Led 30+ climate-tech deals.',
    rating: null, sessions: 0, status: 'Under Review',
  },
];

const AdminMentorApproval: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Mentor Approval</h1>
      <p className="text-gray-500 mt-1">Review and approve mentor applications before they go live on the platform.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Pending Review', val: 2, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Under Review', val: 1, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Approved This Month', val: 14, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      ].map(s => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.val}</div>
          <div className="text-sm text-gray-500 font-medium">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="space-y-5">
      {applicants.map(a => (
        <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white text-xl font-black shadow-lg flex-shrink-0">
                {a.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{a.name}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${a.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {a.status}
                  </span>
                </div>
                <p className="text-sm text-[#5B21B6] font-semibold mb-2">{a.expertise}</p>
                <p className="text-sm text-gray-600 italic mb-4">"{a.bio}"</p>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><GraduationCap size={13} /> {a.experience} experience</span>
                  <span className="flex items-center gap-1.5"><Calendar size={13} /> Applied {a.applied}</span>
                  <a href={`https://${a.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline"><ExternalLink size={13} /> LinkedIn Profile</a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:flex-col lg:items-stretch">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 font-bold rounded-xl text-sm transition-colors">
                <X size={15} /> Reject
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow">
                <Check size={15} /> Approve
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminMentorApproval;
