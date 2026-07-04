import React from 'react';
import { Search, FolderOpen, FileText, Download, ShieldCheck, Activity } from 'lucide-react';

const dataroom = [
  { company: 'EcoPackage Hub', files: 12, updated: 'Today', status: 'Active Review' },
  { company: 'AI Legal Reviewer', files: 5, updated: '2 days ago', status: 'Pending Access' },
  { company: 'DataSync Pro', files: 24, updated: '1 week ago', status: 'Completed' },
];

const InvestorDueDiligence: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Due Diligence</h1>
      <p className="text-gray-500 mt-1">Access secure data rooms and review confidential startup documents.</p>
    </div>

    <div className="relative mb-8 max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input type="text" placeholder="Search data rooms..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Data Rooms List */}
      <div className="lg:col-span-1 space-y-3">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Data Rooms</h2>
        {dataroom.map(d => (
          <div key={d.company} className={`p-4 rounded-2xl border transition-all cursor-pointer ${d.status === 'Active Review' ? 'bg-[#5B21B6] text-white shadow-lg shadow-purple-900/20 border-transparent' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-900'}`}>
            <h3 className="font-bold text-base mb-1">{d.company}</h3>
            <div className={`flex items-center justify-between text-xs font-medium ${d.status === 'Active Review' ? 'text-white/70' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1.5"><FolderOpen size={14} /> {d.files} Files</span>
              <span>{d.updated}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${d.status === 'Active Review' ? 'bg-white/20 text-white' : d.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {d.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Room Content */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">EcoPackage Hub</h2>
            <p className="text-sm text-gray-500 mt-1">Data Room • Access granted until Dec 31, 2026</p>
          </div>
          <ShieldCheck size={32} className="text-emerald-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg"><FileText size={24} /></div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Financial Model 2026.pdf</p>
              <p className="text-xs text-gray-500 mt-1">Uploaded 2 days ago • 1.2 MB</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FileText size={24} /></div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Cap Table (Current).xlsx</p>
              <p className="text-xs text-gray-500 mt-1">Uploaded 1 week ago • 0.5 MB</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><FileText size={24} /></div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Customer LOIs.pdf</p>
              <p className="text-xs text-gray-500 mt-1">Uploaded yesterday • 3.4 MB</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
          <button className="flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
            <Download size={16} className="mr-2" /> Download All (.zip)
          </button>
          <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow">
            <Activity size={16} className="mr-2" /> Request More Info
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default InvestorDueDiligence;
