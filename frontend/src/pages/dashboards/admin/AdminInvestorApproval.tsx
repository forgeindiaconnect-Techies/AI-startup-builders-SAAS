import React, { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';

const initialInvestors = [
  {
    id: 1, name: 'Capital Ventures LLC', contact: 'John Whitmore', type: 'Institutional', checkSize: '$250k - $1M',
    sectors: 'AI, SaaS, FinTech', applied: '2 hours ago', kyc: 'Submitted', accreditation: 'Submitted', status: 'Pending',
  },
  {
    id: 2, name: 'Maria Lopez', contact: 'Maria Lopez', type: 'Angel Investor', checkSize: '$25k - $100k',
    sectors: 'ClimateTech, HealthTech', applied: '1 day ago', kyc: 'Submitted', accreditation: 'Pending', status: 'Pending',
  },
  {
    id: 3, name: 'NexGen Fund', contact: 'David Kim', type: 'Venture Fund', checkSize: '$1M+',
    sectors: 'DeepTech, Web3', applied: '3 days ago', kyc: 'Verified', accreditation: 'Submitted', status: 'Under Review',
  },
];

const docStatus = (val: string) =>
  val === 'Verified'
    ? <span className="text-emerald-600 font-bold text-xs">✓ Verified</span>
    : val === 'Submitted'
    ? <span className="text-amber-600 font-bold text-xs">● Submitted</span>
    : <span className="text-gray-400 font-bold text-xs">○ Pending</span>;

const AdminInvestorApproval: React.FC = () => {
  const [investors, setInvestors] = useState(initialInvestors);

  const handleApprove = (id: number, name: string) => {
    setInvestors(prev => prev.map(i => i.id === id ? { ...i, status: 'Approved' } : i));
    window.alert(`✅ ${name} has been approved as an Investor!`);
  };

  const handleReject = (id: number, name: string) => {
    setInvestors(prev => prev.map(i => i.id === id ? { ...i, status: 'Rejected' } : i));
    window.alert(`❌ ${name}'s KYC application has been rejected.`);
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Investor Approval</h1>
        <p className="text-gray-500 mt-1">Review KYC documents and accreditation letters for investor accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending KYC Review', val: investors.filter(i => i.status === 'Pending' || i.status === 'Under Review').length, color: 'text-amber-600' },
          { label: 'Verified This Month', val: investors.filter(i => i.status === 'Approved').length + 8, color: 'text-emerald-600' },
          { label: 'Rejected', val: investors.filter(i => i.status === 'Rejected').length + 1, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.val}</div>
            <div className="text-sm text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {investors.map(inv => (
          <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                    {inv.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{inv.name}</h3>
                    <p className="text-sm text-gray-500">Contact: {inv.contact} · {inv.type}</p>
                  </div>
                  <span className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    inv.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    inv.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    inv.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Check Size</p>
                    <p className="text-sm font-bold text-gray-800">{inv.checkSize}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Sectors</p>
                    <p className="text-xs font-bold text-gray-800">{inv.sectors}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">KYC</p>
                    {docStatus(inv.kyc)}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Accreditation</p>
                    {docStatus(inv.accreditation)}
                  </div>
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> Applied {inv.applied}</p>
              </div>

              {inv.status === 'Approved' || inv.status === 'Rejected' ? (
                <div className="flex items-center">
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                    inv.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>{inv.status}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 lg:flex-col lg:items-stretch">
                  <button
                    onClick={() => handleReject(inv.id, inv.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 font-bold rounded-xl text-sm transition-colors"
                  >
                    <X size={15} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(inv.id, inv.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow"
                  >
                    <Check size={15} /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInvestorApproval;
