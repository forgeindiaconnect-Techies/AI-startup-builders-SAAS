import React from 'react';
import { Check, X, UserCheck, ShieldAlert } from 'lucide-react';

const approvals = [
  { id: 1, type: 'Investor KYC', name: 'Capital Ventures', requestDate: '2 hours ago', status: 'Pending Review', notes: 'Uploaded W-9 and SEC accreditation letter' },
  { id: 2, type: 'Mentor Application', name: 'Alex Rivera', requestDate: '1 day ago', status: 'Pending Review', notes: 'Ex-VC partner. LinkedIn profile verified.' },
  { id: 3, type: 'Investor KYC', name: 'Maria Lopez', requestDate: '2 days ago', status: 'Pending Review', notes: 'Uploaded AngelList syndicate details.' },
];

const AdminApprovals: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500 mt-1">Review pending Mentor applications and Investor KYC documents.</p>
      </div>
      <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold text-sm flex items-center shadow-sm">
        <ShieldAlert size={16} className="mr-2" /> 3 Pending Actions
      </div>
    </div>

    <div className="space-y-4">
      {approvals.map(a => (
        <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${a.type.includes('Investor') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              <UserCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-lg">{a.name}</h3>
                <span className="text-[10px] uppercase tracking-widest font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{a.type}</span>
              </div>
              <p className="text-sm text-gray-500 italic mb-2">"{a.notes}"</p>
              <p className="text-xs font-semibold text-gray-400">Requested: {a.requestDate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <X size={16} /> Reject
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow flex items-center justify-center gap-2">
              <Check size={16} /> Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminApprovals;
