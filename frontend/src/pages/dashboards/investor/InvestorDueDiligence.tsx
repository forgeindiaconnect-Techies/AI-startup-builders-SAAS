import React, { useState } from 'react';
import { Search, FolderOpen, FileText, Download, ShieldCheck, Activity, Lock } from 'lucide-react';

const dataroomData = [
  { company: 'EcoPackage Hub', filesCount: 12, updated: 'Today', status: 'Active Review', access: 'Access granted until Dec 31, 2026', docs: [
    { name: 'Financial Model 2026.pdf', date: 'Uploaded 2 days ago', size: '1.2 MB', bg: 'bg-red-100 text-red-600' },
    { name: 'Cap Table (Current).xlsx', date: 'Uploaded 1 week ago', size: '0.5 MB', bg: 'bg-blue-100 text-blue-600' },
    { name: 'Customer LOIs.pdf', date: 'Uploaded yesterday', size: '3.4 MB', bg: 'bg-purple-100 text-purple-600' },
  ]},
  { company: 'AI Legal Reviewer', filesCount: 5, updated: '2 days ago', status: 'Pending Access', access: 'Access pending founder approval', docs: [] },
  { company: 'DataSync Pro', filesCount: 24, updated: '1 week ago', status: 'Completed', access: 'Access granted indefinitely', docs: [
    { name: 'Technical Architecture.pdf', date: 'Uploaded 2 weeks ago', size: '2.1 MB', bg: 'bg-blue-100 text-blue-600' },
    { name: 'Due Diligence Report.pdf', date: 'Uploaded 1 week ago', size: '5.4 MB', bg: 'bg-emerald-100 text-emerald-600' }
  ]},
];

const InvestorDueDiligence: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeRoom, setActiveRoom] = useState(dataroomData[0]);

  const filteredRooms = dataroomData.filter(d => d.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Due Diligence</h1>
        <p className="text-gray-500 mt-1">Access secure data rooms and review confidential startup documents.</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search data rooms..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Rooms List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Data Rooms</h2>
          {filteredRooms.map(d => (
            <div 
              key={d.company} 
              onClick={() => setActiveRoom(d)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeRoom.company === d.company ? 'bg-[#5B21B6] text-white shadow-lg shadow-purple-900/20 border-transparent' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-900'}`}
            >
              <h3 className="font-bold text-base mb-1">{d.company}</h3>
              <div className={`flex items-center justify-between text-xs font-medium ${activeRoom.company === d.company ? 'text-white/70' : 'text-gray-500'}`}>
                <span className="flex items-center gap-1.5"><FolderOpen size={14} /> {d.filesCount} Files</span>
                <span>{d.updated}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${activeRoom.company === d.company ? 'bg-white/20 text-white' : d.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {d.status}
                </span>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <p className="text-sm text-gray-500 py-4">No data rooms match your search.</p>
          )}
        </div>

        {/* Active Room Content */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{activeRoom.company}</h2>
              <p className="text-sm text-gray-500 mt-1">Data Room • {activeRoom.access}</p>
            </div>
            {activeRoom.status === 'Pending Access' ? (
              <Lock size={32} className="text-amber-500" />
            ) : (
              <ShieldCheck size={32} className="text-emerald-500" />
            )}
          </div>

          <div className="flex-grow">
            {activeRoom.status === 'Pending Access' ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <Lock size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-sm">Access pending founder approval</p>
                <button 
                  onClick={() => window.alert('Sent reminder to founder for access.')}
                  className="mt-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Send Reminder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {activeRoom.docs.map(doc => (
                  <div 
                    key={doc.name}
                    onClick={() => window.alert(`Downloading ${doc.name}...`)}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className={`p-3 rounded-lg ${doc.bg}`}><FileText size={24} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm truncate w-36 sm:w-auto">{doc.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 mt-6">
            <button 
              onClick={() => window.alert(`Downloading all files for ${activeRoom.company}...`)}
              disabled={activeRoom.status === 'Pending Access'}
              className="flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} className="mr-2" /> Download All (.zip)
            </button>
            <button 
              onClick={() => window.alert(`Requesting more information for ${activeRoom.company}...`)}
              className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow"
            >
              <Activity size={16} className="mr-2" /> Request More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDueDiligence;
