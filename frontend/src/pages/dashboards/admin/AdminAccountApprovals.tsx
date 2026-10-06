import React, { useState, useEffect } from 'react';
import { Check, X, UserCheck, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminAccountApprovals: React.FC = () => {
  const { getPendingApprovals, approveUser, rejectUser } = useAuth();
  const [pending, setPending] = useState<any[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const loadPending = () => {
    setPending(getPendingApprovals());
  };

  useEffect(() => {
    loadPending();
    const interval = setInterval(loadPending, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (id: string, name: string) => {
    if (window.confirm(`Approve ${name}?`)) {
      approveUser(id);
      loadPending();
    }
  };

  const handleReject = (id: string, name: string) => {
    if (window.confirm(`Reject ${name}'s account request?`)) {
      rejectUser(id);
      loadPending();
    }
  };

  if (pending.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <UserCheck size={48} className="mx-auto text-emerald-400 mb-4" />
        <h3 className="font-bold text-gray-900 text-lg mb-1">No Pending Approvals</h3>
        <p className="text-sm text-gray-500">All mentor and investor accounts have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((u: any) => {
        const isExpanded = expandedUserId === u.id;
        const isInvestor = (u.role || '').toLowerCase().includes('investor');
        const isMentor = (u.role || '').toLowerCase() === 'mentor';
        const isFounder = (u.role || '').toLowerCase() === 'founder';

        // Check if user has any profile details
        const hasDetails = 
          u.companyName || u.investorType || u.designation || u.experienceYears ||
          u.mobile || u.phone || u.location || u.preferredLocation ||
          u.linkedin || u.linkedinUrl || u.expertise || u.startupName || 
          u.currentRole || u.startupStage || u.industry ||
          u.kycDocUrl || u.aadharDocUrl || u.panTaxDocUrl || u.panDocUrl ||
          u.orgProofUrl || u.repProofUrl || u.supportingDocUrl || u.otherDocUrl;

        return (
          <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                  {(u.name || u.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{u.name || u.fullName}</h3>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                      {u.role}
                    </span>
                    <span className="text-xs text-gray-400">Pending approval</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {hasDetails && (
                  <button
                    onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>
                )}
                <button
                  onClick={() => handleReject(u.id, u.name || u.fullName)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <X size={14} /> Reject
                </button>
                <button
                  onClick={() => handleApprove(u.id, u.name || u.fullName)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-xs transition-colors shadow cursor-pointer"
                >
                  <Check size={14} /> Approve
                </button>
              </div>
            </div>

            {/* Collapsible details panel */}
            {isExpanded && hasDetails && (
              <div className="border-t border-gray-100 pt-4 mt-2 space-y-4 animate-in fade-in duration-200 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {/* Role-specific details */}
                  {isInvestor && (
                    <>
                      {u.companyName && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Company / Fund</span>
                          <strong className="text-gray-900 text-xs">{u.companyName}</strong>
                        </div>
                      )}
                      {u.investorType && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Investor Type</span>
                          <strong className="text-gray-900 text-xs">{u.investorType}</strong>
                        </div>
                      )}
                      {u.designation && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Designation</span>
                          <strong className="text-gray-900 text-xs">{u.designation}</strong>
                        </div>
                      )}
                      {u.experienceYears && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Experience</span>
                          <strong className="text-gray-900 text-xs">{u.experienceYears} Years</strong>
                        </div>
                      )}
                      {u.investmentRange && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Investment Ticket Range</span>
                          <strong className="text-[#6C4CF1] text-xs">{u.investmentRange}</strong>
                        </div>
                      )}
                    </>
                  )}

                  {isMentor && (
                    <>
                      {u.companyName && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Organization / Company</span>
                          <strong className="text-gray-900 text-xs">{u.companyName}</strong>
                        </div>
                      )}
                      {u.designation && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Designation / Title</span>
                          <strong className="text-gray-900 text-xs">{u.designation}</strong>
                        </div>
                      )}
                      {u.expertise && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Expertise</span>
                          <strong className="text-gray-900 text-xs">{u.expertise}</strong>
                        </div>
                      )}
                      {u.experienceYears && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Experience</span>
                          <strong className="text-gray-900 text-xs">{u.experienceYears} Years</strong>
                        </div>
                      )}
                    </>
                  )}

                  {isFounder && (
                    <>
                      {u.startupName && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Startup Name</span>
                          <strong className="text-gray-900 text-xs">{u.startupName}</strong>
                        </div>
                      )}
                      {u.currentRole && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Founder Role</span>
                          <strong className="text-gray-900 text-xs">{u.currentRole}</strong>
                        </div>
                      )}
                      {u.startupStage && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Startup Stage</span>
                          <strong className="text-gray-900 text-xs">{u.startupStage}</strong>
                        </div>
                      )}
                      {u.industry && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Industry</span>
                          <strong className="text-gray-900 text-xs">{u.industry}</strong>
                        </div>
                      )}
                    </>
                  )}

                  {/* Common details */}
                  {(u.mobile || u.phone) && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Mobile Contact</span>
                      <strong className="text-gray-900 text-xs">{u.mobile || u.phone}</strong>
                    </div>
                  )}

                  {(u.location || u.preferredLocation) && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Location</span>
                      <strong className="text-gray-900 text-xs">{u.location || u.preferredLocation}</strong>
                    </div>
                  )}

                  {(u.linkedin || u.linkedinUrl) && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">LinkedIn Profile</span>
                      <a href={u.linkedin || u.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#5B21B6] font-bold hover:underline truncate block text-xs">
                        {u.linkedin || u.linkedinUrl}
                      </a>
                    </div>
                  )}
                </div>

                {/* Verification Documents block */}
                {(u.kycDocUrl || u.aadharDocUrl || u.panTaxDocUrl || u.panDocUrl || u.orgProofUrl || u.repProofUrl || u.supportingDocUrl || u.otherDocUrl) && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Verification Documents</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(u.kycDocUrl || u.aadharDocUrl) && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Govt ID / Aadhaar</span>
                            <span className="text-[11px] font-semibold text-gray-600 truncate block max-w-[200px]">{u.aadharNumber || 'KYC_Document.pdf'}</span>
                          </div>
                          <a href={u.kycDocUrl || u.aadharDocUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-[#5B21B6] font-bold text-[10px] rounded-lg inline-flex items-center gap-1 shrink-0">
                            View <ExternalLink size={10} />
                          </a>
                        </div>
                      )}

                      {(u.panTaxDocUrl || u.panDocUrl) && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">PAN / Tax ID</span>
                            <span className="text-[11px] font-semibold text-gray-600 truncate block max-w-[200px]">{u.panNumber || 'PAN_Document.pdf'}</span>
                          </div>
                          <a href={u.panTaxDocUrl || u.panDocUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-[#5B21B6] font-bold text-[10px] rounded-lg inline-flex items-center gap-1 shrink-0">
                            View <ExternalLink size={10} />
                          </a>
                        </div>
                      )}

                      {u.orgProofUrl && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Org / Fund Proof</span>
                            <span className="text-[11px] font-semibold text-gray-600 truncate block max-w-[200px]">Org_Proof.pdf</span>
                          </div>
                          <a href={u.orgProofUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-[#5B21B6] font-bold text-[10px] rounded-lg inline-flex items-center gap-1 shrink-0">
                            View <ExternalLink size={10} />
                          </a>
                        </div>
                      )}

                      {u.repProofUrl && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Authorized Rep Proof</span>
                            <span className="text-[11px] font-semibold text-gray-600 truncate block max-w-[200px]">Rep_Proof.pdf</span>
                          </div>
                          <a href={u.repProofUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-[#5B21B6] font-bold text-[10px] rounded-lg inline-flex items-center gap-1 shrink-0">
                            View <ExternalLink size={10} />
                          </a>
                        </div>
                      )}

                      {(u.supportingDocUrl || u.otherDocUrl) && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Additional Supporting Doc</span>
                            <span className="text-[11px] font-semibold text-gray-600 truncate block max-w-[200px]">Supporting_Document.pdf</span>
                          </div>
                          <a href={u.supportingDocUrl || u.otherDocUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-[#5B21B6] font-bold text-[10px] rounded-lg inline-flex items-center gap-1 shrink-0">
                            View <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminAccountApprovals;
