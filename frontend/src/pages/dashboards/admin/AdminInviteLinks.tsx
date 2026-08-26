import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2, Plus, Copy, CheckCircle2, AlertCircle, Trash2, X, RefreshCw,
  Send, Ban, Users, Clock, CheckCircle, XCircle, Mail,
  Calendar, MessageSquare, Pencil, Save, Star,
} from 'lucide-react';
import { API_URL } from '../../../config/api';
import {
  getInvites, createInvite, deleteInvite, disableInvite, storeInvite,
  getInviteByToken, updateInvite,
  type MentorInvite,
} from '../../../utils/inviteLinks';

// Programmatically synthesized audio feedback using the Web Audio API
const playNotificationSound = (type: 'success' | 'error') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'success') {
      // Elegant mail sent "whoosh + chime" sound
      // Whoosh sound: white noise with bandpass filter sliding up
      const bufferSize = ctx.sampleRate * 0.3; // 0.3 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.0, ctx.currentTime);
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.25);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();
      
      // Chime sound: Sine wave C5 -> G5 -> C6
      setTimeout(() => {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08); // G5
        osc1.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.16); // C6
        
        gain1.gain.setValueAtTime(0.05, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.4);
      }, 100);
    } else {
      // Error sound: low buzzer double click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.setValueAtTime(120, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
};

interface MailNotification {
  show: boolean;
  toEmail: string;
  toName: string;
  subject: string;
  bodySnippet: string;
  status: 'sending' | 'success' | 'error';
  errorDetails?: string;
}

const AdminInviteLinks: React.FC = () => {
  const [invites, setInvites] = useState<MentorInvite[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [mailNotification, setMailNotification] = useState<MailNotification | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired' | 'disabled'>('all');

  // Create form state
  const [form, setForm] = useState({ mentorName: '', mentorEmail: '', expiryDate: '', message: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Generated link state
  const [generatedLink, setGeneratedLink] = useState<MentorInvite | null>(null);
  const [emailSentStatus, setEmailSentStatus] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Edit modal state
  const [editingInvite, setEditingInvite] = useState<MentorInvite | null>(null);
  const [editForm, setEditForm] = useState({ mentorName: '', mentorEmail: '', expertise: '', expiryDate: '', message: '', status: '' });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const loadInvites = useCallback(async () => {
    const local = getInvites();
    setInvites(local);

    try {
      const res = await fetch(`${API_URL}/invites`);
      const json = await res.json();
      if (json.success && Array.isArray(json.invites) && json.invites.length > 0) {
        const serverInvites: MentorInvite[] = json.invites.map((inv: any) => ({
          id: inv.id || inv._id,
          mentorName: inv.mentorName,
          mentorEmail: inv.mentorEmail,
          expertise: inv.expertise || '',
          inviteToken: inv.inviteToken,
          inviteUrl: inv.inviteUrl || `/signup?role=mentor&inviteToken=${inv.inviteToken}`,
          status: inv.status || 'active',
          createdAt: inv.createdAt,
          expiryDate: inv.expiryDate || inv.expiresAt,
          message: inv.message || '',
          usedAt: inv.usedAt,
        }));

        const combinedMap = new Map<string, MentorInvite>();
        serverInvites.forEach((i) => combinedMap.set(i.inviteToken, i));
        local.forEach((i) => {
          if (!combinedMap.has(i.inviteToken)) {
            combinedMap.set(i.inviteToken, i);
          }
        });

        const merged = Array.from(combinedMap.values());
        setInvites(merged);
        localStorage.setItem('ai_startup_builder_mentor_invites', JSON.stringify(merged));
      }
    } catch {
      // Use local invites if server unreachable
    }
  }, []);

  useEffect(() => {
    loadInvites();
    const interval = setInterval(loadInvites, 5000);
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

  const handleCreate = async () => {
    const errs: Record<string, string> = {};
    if (!form.mentorName.trim()) errs.mentorName = 'Mentor name is required';
    if (!form.mentorEmail.trim()) errs.mentorEmail = 'Email is required';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.mentorEmail)) errs.mentorEmail = 'Invalid email';
    if (!form.expiryDate) errs.expiryDate = 'Expiry date is required';
    else if (new Date(form.expiryDate) <= new Date()) errs.expiryDate = 'Expiry must be a future date';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSending(true);
    setMailNotification({
      show: true,
      toEmail: form.mentorEmail.trim(),
      toName: form.mentorName.trim(),
      subject: "You're Invited to Join Our Mentor Network - AI Startup Builder",
      bodySnippet: form.message.trim() || "You have been invited to join AI Startup Builder as a Mentor. Help founders validate ideas, avoid mistakes, and grow their startups with your expertise.",
      status: 'sending'
    });

    try {
      const res = await fetch(`${API_URL}/invites/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorName: form.mentorName.trim(),
          mentorEmail: form.mentorEmail.trim(),
          expertise: '',
          expiryDate: form.expiryDate,
          message: form.message.trim(),
        }),
      });
      const json = await res.json();

      if (json.success && json.invite) {
        const serverInvite = json.invite;
        const invite = storeInvite({
          id: serverInvite.id,
          mentorName: serverInvite.mentorName,
          mentorEmail: serverInvite.mentorEmail,
          expertise: serverInvite.expertise,
          inviteToken: serverInvite.inviteToken,
          inviteUrl: serverInvite.inviteUrl,
          status: serverInvite.status,
          createdAt: serverInvite.createdAt,
          expiryDate: serverInvite.expiryDate || serverInvite.expiresAt,
          message: serverInvite.message,
        });
        setGeneratedLink(invite);
        setEmailSentStatus(json.emailSent !== false);
        loadInvites();
        
        if (json.emailSent === false) {
          setMailNotification(prev => prev ? {
            ...prev,
            status: 'error',
            errorDetails: 'Brevo/SMTP delivery failed. Check SMTP configuration.'
          } : null);
          playNotificationSound('error');
        } else {
          setMailNotification(prev => prev ? {
            ...prev,
            status: 'success'
          } : null);
          playNotificationSound('success');
          setTimeout(() => {
            setMailNotification(prev => prev && prev.status === 'success' ? null : prev);
          }, 6000);
        }
        return;
      }

      throw new Error(json.error || 'Failed to create invite');
    } catch (err: any) {
      // Server offline → fall back to a local-only invite (manual copy)
      const invite = createInvite({
        mentorName: form.mentorName.trim(),
        mentorEmail: form.mentorEmail.trim(),
        expertise: '',
        expiryDate: form.expiryDate,
        message: form.message.trim(),
      });
      setGeneratedLink(invite);
      loadInvites();
      setMailNotification(prev => prev ? {
        ...prev,
        status: 'error',
        errorDetails: err.message || 'Server offline. Invitation generated locally but email could not be sent.'
      } : null);
      playNotificationSound('error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (token: string) => {
    if (!window.confirm('Are you sure you want to delete this invite? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/invites/${token}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success && res.status !== 404) {
        throw new Error(json.error || 'Failed to delete invite on server');
      }
    } catch (err) {
      // Server unreachable — continue with local-only delete
      console.warn('Server delete failed, removing locally:', err);
    }
    deleteInvite(token);
    loadInvites();
    showToast('Invite deleted.', 'success');
  };

  const openEdit = (inv: MentorInvite) => {
    setEditingInvite(inv);
    setEditForm({
      mentorName: inv.mentorName || '',
      mentorEmail: inv.mentorEmail || '',
      expertise: inv.expertise || '',
      expiryDate: inv.expiryDate ? new Date(inv.expiryDate).toISOString().split('T')[0] : '',
      message: inv.message || '',
      status: inv.status || 'active',
    });
    setEditFormErrors({});
  };

  const handleEditSave = async () => {
    if (!editingInvite) return;
    const errs: Record<string, string> = {};
    if (!editForm.mentorName.trim()) errs.mentorName = 'Mentor name is required';
    if (!editForm.mentorEmail.trim()) errs.mentorEmail = 'Email is required';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editForm.mentorEmail)) errs.mentorEmail = 'Invalid email';
    if (!editForm.expiryDate) errs.expiryDate = 'Expiry date is required';
    setEditFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`${API_URL}/invites/${editingInvite.inviteToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorName: editForm.mentorName.trim(),
          mentorEmail: editForm.mentorEmail.trim(),
          expertise: editForm.expertise.trim(),
          expiryDate: editForm.expiryDate,
          message: editForm.message.trim(),
          status: editForm.status,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to update invite on server');
      }
      updateInvite(editingInvite.inviteToken, {
        mentorName: editForm.mentorName.trim(),
        mentorEmail: editForm.mentorEmail.trim(),
        expertise: editForm.expertise.trim(),
        expiryDate: new Date(editForm.expiryDate).toISOString(),
        message: editForm.message.trim(),
        status: editForm.status as MentorInvite['status'],
      });
      setEditingInvite(null);
      loadInvites();
      showToast('Invite updated successfully!', 'success');
    } catch (err: any) {
      // Server offline — update local-only
      updateInvite(editingInvite.inviteToken, {
        mentorName: editForm.mentorName.trim(),
        mentorEmail: editForm.mentorEmail.trim(),
        expertise: editForm.expertise.trim(),
        expiryDate: new Date(editForm.expiryDate).toISOString(),
        message: editForm.message.trim(),
        status: editForm.status as MentorInvite['status'],
      });
      setEditingInvite(null);
      loadInvites();
      showToast(err.message || 'Invite updated locally (server offline)', 'success');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDisable = (token: string) => {
    disableInvite(token);
    loadInvites();
    showToast('Invite disabled.', 'success');
  };

  const handleResend = async (token: string) => {
    const inv = getInviteByToken(token);
    if (!inv) return;
    const fullUrl = `${window.location.origin}${inv.inviteUrl}`;
    setMailNotification({
      show: true,
      toEmail: inv.mentorEmail,
      toName: inv.mentorName,
      subject: "You're Invited to Join Our Mentor Network - AI Startup Builder",
      bodySnippet: inv.message || "You have been invited to join AI Startup Builder as a Mentor. Help founders validate ideas, avoid mistakes, and grow their startups with your expertise.",
      status: 'sending'
    });
    try {
      const res = await fetch(`${API_URL}/invites/${token}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteLink: fullUrl,
          mentorName: inv.mentorName,
          mentorEmail: inv.mentorEmail,
          message: inv.message || '',
          expertise: inv.expertise || '',
          expiryDate: inv.expiryDate
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadInvites();
        if (json.emailSent === false) {
          setMailNotification(prev => prev ? {
            ...prev,
            status: 'error',
            errorDetails: 'Brevo/SMTP delivery failed. Check SMTP configuration.'
          } : null);
          playNotificationSound('error');
        } else {
          setMailNotification(prev => prev ? {
            ...prev,
            status: 'success'
          } : null);
          playNotificationSound('success');
          setTimeout(() => {
            setMailNotification(prev => prev && prev.status === 'success' ? null : prev);
          }, 6000);
        }
      } else {
        setMailNotification(prev => prev ? {
          ...prev,
          status: 'error',
          errorDetails: json.error || 'Failed to resend email'
        } : null);
        playNotificationSound('error');
      }
    } catch (err: any) {
      setMailNotification(prev => prev ? {
        ...prev,
        status: 'error',
        errorDetails: err.message || 'Server offline. Could not resend email.'
      } : null);
      playNotificationSound('error');
    }
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

      {mailNotification && (
        <div className="fixed bottom-6 right-6 z-[250] w-96 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-5 duration-300">
          {/* Top Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[#6C4CF1]/10 rounded-lg text-[#6C4CF1]">
                <Mail size={14} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                AI Mailer Service
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                mailNotification.status === 'sending' ? 'bg-purple-50 text-purple-600 border border-purple-100 animate-pulse' :
                mailNotification.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {mailNotification.status === 'sending' ? 'Sending' :
                 mailNotification.status === 'success' ? 'Brevo SMTP (250 OK)' :
                 'Failed'}
              </span>
              <button
                onClick={() => setMailNotification(null)}
                className="p-1 hover:bg-gray-200/50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Email Content Details */}
          <div className="p-4 space-y-3">
            <div className="text-xs space-y-1">
              <div className="flex items-baseline">
                <span className="font-bold text-gray-400 w-12 shrink-0">From:</span>
                <span className="text-gray-600 font-medium truncate">AI Startup Builder &lt;admin@aistartupbuilder.com&gt;</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-gray-400 w-12 shrink-0">To:</span>
                <span className="text-gray-800 font-bold truncate">
                  {mailNotification.toName} &lt;{mailNotification.toEmail}&gt;
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-gray-400 w-12 shrink-0">Subject:</span>
                <span className="text-gray-950 font-extrabold truncate">{mailNotification.subject}</span>
              </div>
            </div>

            {/* Body Snippet */}
            <div className="bg-slate-50 border-l-2 border-purple-500/70 p-3 rounded-lg text-[11px] text-gray-600 leading-relaxed font-medium">
              <p className="line-clamp-3">{mailNotification.bodySnippet}</p>
            </div>

            {/* Status Footer / Progress Bar */}
            <div className="pt-1.5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  {mailNotification.status === 'sending' && (
                    <>
                      <RefreshCw size={12} className="animate-spin text-purple-600" />
                      <span className="text-purple-600 font-bold">Transmitting packets...</span>
                    </>
                  )}
                  {mailNotification.status === 'success' && (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 font-bold">Message delivered!</span>
                    </>
                  )}
                  {mailNotification.status === 'error' && (
                    <>
                      <AlertCircle size={12} className="text-red-500" />
                      <span className="text-red-600 font-bold">Delivery failed</span>
                    </>
                  )}
                </div>
                <span className="text-gray-400 text-[10px]">Just now</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  mailNotification.status === 'sending' ? 'bg-purple-500 w-2/3 animate-[pulse_1s_infinite]' :
                  mailNotification.status === 'success' ? 'bg-emerald-500 w-full' :
                  'bg-red-500 w-full'
                }`}></div>
              </div>

              {mailNotification.status === 'error' && mailNotification.errorDetails && (
                <p className="text-[10px] text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 font-semibold leading-normal">
                  Error: {mailNotification.errorDetails}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Management</h1>
          <p className="text-gray-500 mt-1">Create and manage invite links, onboarding, and approvals for mentors.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCreateModal(true); setGeneratedLink(null); setForm({ mentorName: '', mentorEmail: '', expiryDate: '', message: '' }); setFormErrors({}); }}
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
                          <button
                            onClick={() => openEdit(inv)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#6C4CF1] transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          {effectiveStatus === 'active' && (
                            <>
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
                  <div className={`w-16 h-16 ${emailSentStatus ? 'bg-emerald-100' : 'bg-red-100'} rounded-2xl flex items-center justify-center mx-auto`}>
                    {emailSentStatus ? <Mail size={32} className="text-emerald-600" /> : <AlertCircle size={32} className="text-red-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {emailSentStatus ? 'Invite Email Sent!' : 'Invite Created (Email Failed)'}
                    </h4>
                    <p className="text-gray-500 text-sm mt-1">
                      {emailSentStatus ? (
                        <>Invitation sent to <strong>{generatedLink.mentorEmail}</strong></>
                      ) : (
                        <>Could not send email to <strong>{generatedLink.mentorEmail}</strong>. Please copy the link below and send it manually.</>
                      )}
                    </p>
                    {emailSentStatus && (
                      <p className="text-gray-400 text-xs mt-1">
                        {generatedLink.mentorName} can click the link in the email to open the mentor signup page.
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Status</span>
                      <span className={`text-sm font-bold ${emailSentStatus ? 'text-emerald-600' : 'text-red-600'}`}>
                        {emailSentStatus ? 'Email Sent' : 'Email Failed'}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Expires</span>
                      <span className="text-sm font-bold text-gray-900">{formatDate(generatedLink.expiryDate)}</span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => { setShowCreateModal(false); setGeneratedLink(null); }}
                      className="w-full py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-sm rounded-xl shadow-md hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all"
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
                  disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-sm rounded-xl shadow-md hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Sending Email...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Create Invite &amp; Send Email
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editingInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Pencil size={16} className="text-[#5B21B6]" />
                Edit Mentor Invite
              </h3>
              <button onClick={() => setEditingInvite(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mentor Name *</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className={`block w-full pl-9 px-4 py-3 border-2 ${editFormErrors.mentorName ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                    placeholder="John Smith"
                    value={editForm.mentorName}
                    onChange={(e) => { setEditForm({ ...editForm, mentorName: e.target.value }); if (editFormErrors.mentorName) setEditFormErrors({ ...editFormErrors, mentorName: '' }); }}
                  />
                </div>
                {editFormErrors.mentorName && <p className="text-red-500 text-xs mt-1 font-medium">{editFormErrors.mentorName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mentor Email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    className={`block w-full pl-9 px-4 py-3 border-2 ${editFormErrors.mentorEmail ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                    placeholder="mentor@example.com"
                    value={editForm.mentorEmail}
                    onChange={(e) => { setEditForm({ ...editForm, mentorEmail: e.target.value }); if (editFormErrors.mentorEmail) setEditFormErrors({ ...editFormErrors, mentorEmail: '' }); }}
                  />
                </div>
                {editFormErrors.mentorEmail && <p className="text-red-500 text-xs mt-1 font-medium">{editFormErrors.mentorEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Expertise</label>
                <div className="relative">
                  <Star size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="block w-full pl-9 px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                    placeholder="AI/ML, SaaS, Fundraising"
                    value={editForm.expertise}
                    onChange={(e) => setEditForm({ ...editForm, expertise: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Link Expiry Date *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    className={`block w-full pl-9 px-4 py-3 border-2 ${editFormErrors.expiryDate ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                    value={editForm.expiryDate}
                    onChange={(e) => { setEditForm({ ...editForm, expiryDate: e.target.value }); if (editFormErrors.expiryDate) setEditFormErrors({ ...editFormErrors, expiryDate: '' }); }}
                  />
                </div>
                {editFormErrors.expiryDate && <p className="text-red-500 text-xs mt-1 font-medium">{editFormErrors.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Status</label>
                <select
                  className="block w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="expired">Expired</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Message</label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <textarea
                    className="block w-full pl-9 px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium resize-none"
                    placeholder="Welcome to AI Startup Builder! We'd love to have you as a mentor..."
                    value={editForm.message}
                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingInvite(null)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={savingEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-sm rounded-xl shadow-md hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingEdit ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInviteLinks;
