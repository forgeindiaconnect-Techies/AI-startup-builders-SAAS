import React from 'react';
import { Star, Building2, MapPin, Users, Rocket, ExternalLink, Trash2 } from 'lucide-react';

const saved = [
  { id: 1, name: 'EcoPackage Hub', sector: 'ClimateTech', stage: 'Seed', traction: '$12k MRR', team: 4, location: 'Berlin, DE', rating: 94, logo: 'bg-emerald-500' },
  { id: 2, name: 'AI Legal Reviewer', sector: 'LegalTech', stage: 'Pre-Seed', traction: '1k Waitlist', team: 2, location: 'London, UK', rating: 88, logo: 'bg-blue-600' },
  { id: 3, name: 'Fintech Micro-SaaS', sector: 'FinTech', stage: 'Series A', traction: '$85k MRR', team: 12, location: 'New York, USA', rating: 91, logo: 'bg-purple-600' },
];

const InvestorSaved: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Saved Startups</h1>
      <p className="text-gray-500 mt-1">Startups you have bookmarked for later review.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {saved.map(s => (
        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group relative">
          <button className="absolute top-4 right-4 p-2 text-yellow-400 hover:text-gray-300 transition-colors bg-white rounded-full shadow-sm"><Star size={18} className="fill-current" /></button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md ${s.logo}`}>
              {s.name.charAt(0)}
            </div>
            <div className="pr-8">
              <h3 className="font-bold text-gray-900 truncate">{s.name}</h3>
              <p className="text-xs text-gray-500 font-medium">{s.sector}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Rocket size={14} /> Stage</div>
              <p className="text-sm font-bold text-gray-800">{s.stage}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Building2 size={14} /> Traction</div>
              <p className="text-sm font-bold text-gray-800">{s.traction}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-6 px-1">
            <span className="flex items-center gap-1"><Users size={14} /> {s.team} members</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> {s.location}</span>
          </div>

          <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                {s.rating}
              </span>
              <span className="text-xs font-bold text-gray-400">AI Score</span>
            </div>
            <button className="text-[#5B21B6] hover:text-[#7C3AED] font-bold text-sm flex items-center gap-1 transition-colors">
              View Profile <ExternalLink size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default InvestorSaved;
