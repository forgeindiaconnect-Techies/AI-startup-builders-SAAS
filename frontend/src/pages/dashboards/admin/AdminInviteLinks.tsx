import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2, Plus, Copy, CheckCircle2, AlertCircle, Trash2, X, RefreshCw,
  Send, Ban, Users, Clock, CheckCircle, XCircle, Mail, Briefcase,
  Calendar, MessageSquare, ExternalLink,
} from 'lucide-react';
import {
  getInvites, createInvite, deleteInvite, disableInvite, resendInvite,
  type MentorInvite,
} from '../../../utils/inviteLinks';

const AdminInviteLinks: React.FC = () => {
  const [invites, setInvites] = useState<MentorInvite[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired' | 'disabled'>('all');

  // Create form state
  const [form, setForm] = useState({ mentorName: '', mentorEmail: '', expertise: '', expiryDate: '', message: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Generated link state
  const [generatedLink, setGeneratedLink] = useState<MentorInvite | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadInvites = useCallback(() => setInvites(getInvites()), []);

  useEffect(() => {
    loadInvites();
    const interval = setInterval(loadInvites, 2000);
    return () => clearInterval(interval);
  }, [loadInvites]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  };

  const isExpired = (inv: MentorInvite) => inv.status === 'active' && new Date(inv.expiryDate) < new Date();

  const copyToClipboard = (text: string, id: string) => {
    const fullUrl = `${window.location.origin}${text}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(id);
      showToast('Invite link copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 3000);
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  const handleCreate = () => {
    const errs: Record<string, string> = {};
    if (!form.mentorName.trim()) errs.mentorName = 'Mentor name is required';
    if (!form.mentorEmail.trim()) errs.mentorEmail = 'Email is required';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.mentorEmail)) errs.mentorEmail = 'Invalid email';
    if (!form.expertise) errs.expertise = 'Expertise is required';
    if (!form.expiryDate) errs.expiryDate = 'Expiry date is required';
    else if (new Date(form.expiryDate) <= new Date()) errs.expiryDate = 'Expiry must be a future date';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const invite = createInvite({
      mentorName: form.mentorName.trim(),
      mentorEmail: form.mentorEmail.trim(),
      expertise: form.expertise,
      expiryDate: form.expiryDate,
      message: form.message.trim(),
    });
    setGeneratedLink(invite);
    loadInvites();
    showToast('Invite link created successfully!', 'success');
  };

  const handleDelete = (token: string) => {
    if (!window.confirm('Are you sure you want to delete this invite? This cannot be undone.')) return;
    deleteInvite(token);
    loadInvites();
    showToast('Invite deleted.', 'success');
  };

  const handleDisable = (token: string) => {
    disableInvite(token);
    loadInvites();
    showToast('Invite disabled.', 'success');
  };

  const handleResend = (token: string) => {
    resendInvite(token);
    loadInvites();
    showToast('Invite timestamp refreshed.', 'success');
  };

  const filtered = invites.filter((inv) => {
    if (filter === 'all') return true;
    if (filter === 'expired') return inv.status === 'expired' || isExpired(inv);
    return inv.status === filter;
  });

  const stats = {
    total: invites.length,
    active: invites.filter((i) => i.status === 'active' && !isExpired(i)).length,
    used: invites.filter((i) => i.status === 'used').length,
    expired: invites.filter((i) => i.status === 'expired' || isExpired(i)).length,
  };

  return (
    <div className="animate-fade-in-up pb-10 space-y-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Invite Links</h1>
          <p className="text-gray-500 mt-1">Create and manage invite links for mentors. Mentors cannot sign up directly.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadInvites}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={() => { setShowCreateModal(true); setGeneratedLink(null); setForm({ mentorName: '', mentorEmail: '', expertise: '', expiryDate: '', message: '' }); setFormErrors({}); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold rounded-xl text-sm shadow-md hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all"
          >
            <Plus size={16} /> Create Mentor Invite
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Invites', value: stats.total, icon: Users, color: 'text-[#6C4CF1]', bg: 'bg-[#6C4CF1]/10' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Used', value: stats.used, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Expired', value: stats.expired, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'used', 'expired', 'disabled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-[#5B21B6] text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {f === 'all' ? 'All' : f}
            <span className="ml-1.5 text-xs opacity-70">
              ({f === 'all' ? invites.length : invites.filter((i) => f === 'expired' ? (i.status === 'expired' || isExpired(i)) : i.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <Link2 size={16} className="text-[#5B21B6]" />
          <span className="text-sm font-bold text-gray-700">Mentor Invites</span>
          <span className="ml-auto text-xs font-bold text-gray-400">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Mentor Name</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Invite Link</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Link2 size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No invites found</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first mentor invite to get started</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const effectiveStatus = inv.status === 'active' && isExpired(inv) ? 'expired' : inv.status;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-xs font-black shadow">
                            {inv.mentorName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{inv.mentorName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{inv.mentorEmail}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 max-w-[180px] truncate block">
                            {inv.inviteUrl}
                          </code>
                          <button
                            onClick={() => copyToClipboard(inv.inviteUrl, inv.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Copy link"
                          >
                            {copiedId === inv.id
                              ? <CheckCircle size={14} className="text-emerald-500" />
                              : <Copy size={14} className="text-gray-400 hover:text-[#6C4CF1]" />
                            }
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
                          effectiveStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          effectiveStatus === 'used' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          effectiveStatus === 'expired' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {effectiveStatus === 'active' && <CheckCircle size={10} />}
                          {effectiveStatus === 'used' && <CheckCircle2 size={10} />}
                          {effectiveStatus === 'expired' && <Clock size={10} />}
                          {effectiveStatus === 'disabled' && <XCircle size={10} />}
                          {effectiveStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(inv.createdAt)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(inv.expiryDate)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {effectiveStatus === 'active' && (
                            <>
                              <button
                                onClick={() => copyToClipboard(inv.inviteUrl, inv.id)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                title="Copy Link"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                onClick={() => handleResend(inv.inviteToken)}
                                className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                                title="Resend"
                              >
                                <Send size={14} />
                              </button>
                              <button
                                onClick={() => handleDisable(inv.inviteToken)}
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                                title="Disable"
                              >
                                <Ban size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(inv.inviteToken)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Link2 size={16} className="text-[#5B21B6]" />
                {generatedLink ? 'Invite Link Created' : 'Create Mentor Invite'}
              </h3>
              <button onClick={() => { setShowCreateModal(false); setGeneratedLink(null); }} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {generatedLink ? (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Invite Created!</h4>
                    <p className="text-gray-500 text-sm mt-1">Share this link with <strong>{generatedLink.mentorName}</strong></p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Invite Link</label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-[#6C4CF1] font-mono flex-1 break-all bg-white px-3 py-2 rounded-lg border border-gray-100">
                        {window.location.origin}{generatedLink.inviteUrl}
                      </code>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Status</span>
                      <span className="text-sm font-bold text-emerald-600">Active</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Expires</span>
                      <span className="text-sm font-bold text-gray-900">{formatDate(generatedLink.expiryDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyToClipboard(generatedLink.inviteUrl, 'generated')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-sm rounded-xl shadow-md hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all"
                    >
                      {copiedId === 'generated' ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                    </button>
                    <button
                      onClick={() => { setShowCreateModal(false); setGeneratedLink(null); }}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mentor Name *</label>
                    <div className="relative">
                      <Users size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        className={`block w-full pl-9 px-4 py-3 border-2 ${formErrors.mentorName ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                        placeholder="John Smith"
                        value={form.mentorName}
                        onChange={(e) => { setForm({ ...form, mentorName: e.target.value }); if (formErrors.mentorName) setFormErrors({ ...formErrors, mentorName: '' }); }}
                      />
                    </div>
                    {formErrors.mentorName && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.mentorName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mentor Email *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        className={`block w-full pl-9 px-4 py-3 border-2 ${formErrors.mentorEmail ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                        placeholder="mentor@example.com"
                        value={form.mentorEmail}
                        onChange={(e) => { setForm({ ...form, mentorEmail: e.target.value }); if (formErrors.mentorEmail) setFormErrors({ ...formErrors, mentorEmail: '' }); }}
                      />
                    </div>
                    {formErrors.mentorEmail && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.mentorEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Expertise *</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <select
                        value={form.expertise}
                        onChange={(e) => { setForm({ ...form, expertise: e.target.value }); if (formErrors.expertise) setFormErrors({ ...formErrors, expertise: '' }); }}
                        className={`block w-full pl-9 px-4 py-3 border-2 ${formErrors.expertise ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium appearance-none`}
                      >
                        <option value="">Select expertise</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Marketing & Growth">Marketing & Growth</option>
                        <option value="Technology & Engineering">Technology & Engineering</option>
                        <option value="Finance & Accounting">Finance & Accounting</option>
                        <option value="Legal & Compliance">Legal & Compliance</option>
                        <option value="Sales & Business Dev">Sales & Business Dev</option>
                        <option value="HR & People Ops">HR & People Ops</option>
                        <option value="Design & UX">Design & UX</option>
                        <option value="Fundraising & IR">Fundraising & IR</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {formErrors.expertise && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.expertise}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Link Expiry Date *</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        className={`block w-full pl-9 px-4 py-3 border-2 ${formErrors.expiryDate ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                        value={form.expiryDate}
                        onChange={(e) => { setForm({ ...form, expiryDate: e.target.value }); if (formErrors.expiryDate) setFormErrors({ ...formErrors, expiryDate: '' }); }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {formErrors.expiryDate && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.expiryDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Optional Message</label>
                    <div className="relative">
                      <MessageSquare size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <textarea
                        className="block w-full pl-9 px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium resize-none"
                        placeholder="Welcome to AI Startup Builder! We'd love to have you as a mentor..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!generatedLink && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => { setShowCreateModal(false); setGeneratedLink(null); }}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-sm rounded-xl shadow-md hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all"
                >
                  <Link2 size={15} /> Generate Invite Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInviteLinks;
