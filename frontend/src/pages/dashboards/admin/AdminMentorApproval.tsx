import React, { useState, useEffect } from 'react';
import { Check, X, GraduationCap, Calendar, ExternalLink, Mail, Phone, MapPin, Globe, MessageSquare, Star, ChevronDown, ChevronUp, CheckCircle, Pencil, Save, Loader2 } from 'lucide-react';
import { getStartups } from '../../../utils/localStorageHelper';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import { updateMentorProfileAdmin } from '../../../utils/mentorApi';

const initialApplicants: any[] = [];

// ─── Edit Mentor Modal ─────────────────────────────────────────────────────────
interface EditModalProps {
  mentor: any;
  onClose: () => void;
  onSaved: () => void;
}

const EditMentorModal: React.FC<EditModalProps> = ({ mentor, onClose, onSaved }) => {
  const [sessionFee, setSessionFee] = useState<number>(mentor.sessionFee || 0);
  const [mentorShare, setMentorShare] = useState<number>(mentor.mentorSharePercentage ?? 80);
  const [status, setStatus] = useState<string>(mentor.status || 'active');
  const [approvalStatus, setApprovalStatus] = useState<string>(
    mentor.status === 'Approved' ? 'approved' : mentor.status === 'Rejected' ? 'rejected' : 'pending'
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const platformCommission = Math.round((100 - mentorShare) * 100) / 100;

  const handleSave = async () => {
    if (mentorShare < 0 || mentorShare > 100) {
      setSaveError('Mentor Share must be between 0 and 100.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await updateMentorProfileAdmin(mentor.rawId || mentor.id, {
        sessionFee,
        mentorSharePercentage: mentorShare,
        platformCommissionPercentage: platformCommission,
        status: status as any,
        approvalStatus: approvalStatus as any,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Edit Mentor Settings</h2>
            <p className="text-purple-200 text-sm">{mentor.name}</p>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Session Fee */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Session Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={sessionFee}
              onChange={(e) => setSessionFee(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
              placeholder="e.g. 2000"
            />
          </div>

          {/* Commission Split */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm font-bold text-gray-700 mb-3">Commission Split</p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mentor Share (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mentorShare}
                  onChange={(e) => setMentorShare(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-none text-sm font-bold text-[#5B21B6]"
                />
              </div>
              <span className="text-gray-400 font-bold text-lg mt-4">+</span>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Platform Commission (%)</label>
                <input
                  type="number"
                  value={platformCommission}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-amber-600 cursor-not-allowed"
                />
              </div>
              <span className="text-gray-400 font-bold text-lg mt-4">=</span>
              <div className="mt-5 text-lg font-black text-emerald-600">
                {mentorShare + platformCommission}%
              </div>
            </div>
            {mentorShare + platformCommission !== 100 && (
              <p className="text-xs text-red-600 font-semibold">⚠ Total must equal 100% (currently {mentorShare + platformCommission}%)</p>
            )}
            {mentorShare + platformCommission === 100 && (
              <p className="text-xs text-emerald-600 font-semibold">✓ Commission split is valid</p>
            )}
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Approval Status</label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-none"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {saveError && (
            <p className="text-sm text-red-600 font-semibold bg-red-50 rounded-lg px-3 py-2 border border-red-100">{saveError}</p>
          )}
          {saveSuccess && (
            <p className="text-sm text-emerald-600 font-semibold bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">✓ Saved successfully!</p>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || mentorShare + platformCommission !== 100}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminMentorApproval: React.FC = () => {
  const { getToken } = useAuth();
  const [applicants, setApplicants] = useState<any[]>(initialApplicants);
  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [editingMentor, setEditingMentor] = useState<any>(null); 

  const loadApplicants = async () => {
    // 1. Load real mentor accounts from the backend
    let dbMentors: any[] = [];
    const token = getToken();
    if (token) {
      try {
        const res = await fetch(`${API_URL}/auth/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.users) {
          dbMentors = data.users
            .filter((u: any) => u.role === 'mentor')
            .map((u: any) => ({
              id: u._id,
              name: u.fullName || 'Anonymous Mentor',
              expertise: u.expertise || `${u.industry || 'SaaS'} Specialist`,
              experience: u.experienceYears || '10+ years',
              applied: u.createdAt || 'Just now',
              linkedin: u.linkedin || 'linkedin.com',
              bio: u.bio || 'Experienced mentor.',
              email: u.email || 'mentor@private.email',
              phone: u.mobile || 'N/A (Private)',
              location: u.location || 'Location not specified',
              category: u.industry || 'SaaS',
              availability: 'Available',
              languages: 'English',
              status: u.approvalStatus === 'approved' ? 'Approved' :
                      u.approvalStatus === 'rejected' ? 'Rejected' : 'Pending',
              rawId: u._id,
              source: 'db'
            }));
        }
      } catch (err) {
        console.error('Failed to load mentor users:', err);
      }
    }

    // 2. Load locally saved mentor profiles (demo/legacy)
    let localMentors: any[] = [];
    try {
      const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
      if (stored) {
        const parsed = JSON.parse(stored);
        localMentors = parsed.map((p: any, idx: number) => ({
          id: p.id || `mentor_dynamic_${idx}`,
          name: p.name || 'Anonymous Mentor',
          expertise: p.expertise || `${p.category || 'SaaS'} Specialist`,
          experience: p.experienceYears || '10+ years',
          applied: p.updatedAt || 'Just now',
          linkedin: p.linkedin || 'linkedin.com',
          bio: p.bio || 'Experienced mentor.',
          email: p.email || 'mentor@private.email',
          phone: p.phone || 'N/A (Private)',
          location: p.location || 'Location not specified',
          category: p.category || 'SaaS',
          availability: p.availability || 'Available',
          languages: p.languages || 'English',
          status: p.verificationStatus === 'Verified' ? 'Approved' : 
                  p.verificationStatus === 'Rejected' ? 'Rejected' : 'Pending',
          rawId: p.id,
          source: 'local'
        }));
      }
    } catch (e) {}

    // 3. Merge DB mentors first, then local profiles not already present, then demo applicants
    const combined = [...dbMentors];
    localMentors.forEach(m => {
      if (!combined.some(c => c.rawId === m.rawId || c.email === m.email || c.name === m.name)) {
        combined.push(m);
      }
    });
    initialApplicants.forEach(sample => {
      if (!combined.some(c => c.name === sample.name || c.id === sample.id)) {
        combined.push(sample);
      }
    });
    setApplicants(combined);
  };

  useEffect(() => {
    loadApplicants();
    window.addEventListener('storage', loadApplicants as any);
    window.addEventListener('mentor_profile_updated', loadApplicants as any);
    
    // Load all startups to find reviews
    getStartups().then(startups => setAllStartups(startups));
    
    return () => {
      window.removeEventListener('storage', loadApplicants as any);
      window.removeEventListener('mentor_profile_updated', loadApplicants as any);
    };
  }, []);

  const persistDbAction = async (applicant: any, action: string) => {
    const token = getToken();
    if (!token || !applicant || applicant.source !== 'db') return;
    try {
      await fetch(`${API_URL}/auth/admin/users/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: applicant.rawId || applicant.id, action })
      });
      loadApplicants();
    } catch (err) {
      console.error('Failed to update mentor approval:', err);
    }
  };

  const handleApprove = async (id: any, name: string) => {
    const applicant = applicants.find(a => a.id === id);
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    if (applicant?.source === 'db') {
      await persistDbAction(applicant, 'approve');
    } else {
      try {
        const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((p: any) => (p.id === id || p.name === name) ? { ...p, verificationStatus: 'Verified' } : p);
          localStorage.setItem('ai_startup_builder_mentor_profiles', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('mentor_profile_updated'));
        }
      } catch (e) {}
    }
    window.alert(`✅ ${name} has been approved as a Mentor!`);
  };

  const handleReject = async (id: any, name: string) => {
    const applicant = applicants.find(a => a.id === id);
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
    if (applicant?.source === 'db') {
      await persistDbAction(applicant, 'reject');
    } else {
      try {
        const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((p: any) => (p.id === id || p.name === name) ? { ...p, verificationStatus: 'Pending' } : p);
          localStorage.setItem('ai_startup_builder_mentor_profiles', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('mentor_profile_updated'));
        }
      } catch (e) {}
    }
    window.alert(`❌ ${name}'s application has been rejected.`);
  };

  return (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Mentor Approval</h1>
      <p className="text-gray-500 mt-1">Review and approve mentor applications before they go live on the platform.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Pending Review', val: applicants.filter(a => a.status === 'Pending').length, color: 'text-amber-600' },
        { label: 'Under Review', val: applicants.filter(a => a.status === 'Under Review').length, color: 'text-blue-600' },
        { label: 'Approved This Month', val: applicants.filter(a => a.status === 'Approved').length + 14, color: 'text-emerald-600' },
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
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    a.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    a.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    a.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>{a.status}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#5B21B6] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                    {a.category || 'SaaS'} Specialist
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    a.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    a.availability === 'Busy' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {a.availability || 'Available'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-2">{a.expertise}</p>
                <p className="text-sm text-gray-600 italic mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">"{a.bio}"</p>
                
                {/* Public Metadata */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 font-medium mb-4">
                  <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-[#5B21B6]" /> {a.experience} experience</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {a.location || 'Location not set'}</span>
                  <span className="flex items-center gap-1.5"><Globe size={14} className="text-blue-500" /> Languages: {a.languages || 'English'}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> Applied {a.applied}</span>
                  <a href={a.linkedin?.startsWith('http') ? a.linkedin : `https://${a.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline font-bold"><ExternalLink size={13} /> LinkedIn</a>
                </div>

                {/* Private Contact Box (Admin Only) */}
                <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-purple-950 font-medium">
                    <span className="flex items-center gap-1.5 font-bold"><Mail size={14} className="text-[#5B21B6]" /> {a.email || 'N/A'}</span>
                    <span className="flex items-center gap-1.5 font-bold"><Phone size={14} className="text-[#5B21B6]" /> {a.phone || 'N/A'}</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#5B21B6] text-white px-2 py-0.5 rounded uppercase tracking-wider">🔒 Admin Private View</span>
                </div>

                {/* Reviews Given by this Mentor */}
                {(() => {
                  const mentorReviews = allStartups.filter(
                    (s: any) => s.mentorReview && (s.mentorReview.mentorId === a.rawId || s.mentorReview.mentorId === a.id || s.mentorReview.mentorName === a.name)
                  );
                  if (mentorReviews.length === 0) return null;
                  const isExpanded = !!expandedReviews[a.id];
                  return (
                    <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedReviews(prev => ({ ...prev, [a.id]: !prev[a.id] }))}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-bold text-gray-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare size={15} className="text-[#5B21B6]" />
                          Reviews Given ({mentorReviews.length})
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isExpanded && (
                        <div className="divide-y divide-gray-100">
                          {mentorReviews.map((s: any, rIdx: number) => {
                            const review = s.mentorReview;
                            return (
                              <div key={rIdx} className="px-4 py-4 bg-white">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="font-bold text-gray-900 text-sm">{s.startupName}</span>
                                  {review.rating && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                                      review.rating === 'Good' ? 'bg-green-100 text-green-700 border-green-200' :
                                      review.rating === 'Average' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                      'bg-red-100 text-red-700 border-red-200'
                                    }`}>{review.rating}</span>
                                  )}
                                  <span className="text-xs text-gray-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                                </div>
                                {review.feedback && (
                                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 mb-2">{review.feedback}</p>
                                )}
                                {review.founderReply && (
                                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <CheckCircle size={12} className="text-green-600" />
                                      <span className="text-xs font-bold text-green-700">Founder's Reply</span>
                                    </div>
                                    <p className="text-xs text-green-800">{review.founderReply}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {a.status === 'Approved' || a.status === 'Rejected' ? (
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  a.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>{a.status}</span>
                {a.source === 'db' && (
                  <button
                    onClick={() => setEditingMentor(a)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-[#5B21B6] border border-gray-200 hover:border-purple-200 font-bold rounded-xl text-xs transition-colors"
                  >
                    <Pencil size={12} /> Edit Settings
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 lg:flex-col lg:items-stretch">
                <button 
                  onClick={() => handleReject(a.id, a.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 font-bold rounded-xl text-sm transition-colors"
                >
                  <X size={15} /> Reject
                </button>
                <button 
                  onClick={() => handleApprove(a.id, a.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow"
                >
                  <Check size={15} /> Approve
                </button>
                {a.source === 'db' && (
                  <button
                    onClick={() => setEditingMentor(a)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-[#5B21B6] border border-gray-200 hover:border-purple-200 font-bold rounded-xl text-sm transition-colors"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    {editingMentor && (
      <EditMentorModal
        mentor={editingMentor}
        onClose={() => setEditingMentor(null)}
        onSaved={() => loadApplicants()}
      />
    )}
  </div>
  );
};

export default AdminMentorApproval;
