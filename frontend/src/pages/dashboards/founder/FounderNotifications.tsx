import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Star, Rocket, Info, X, Calendar, ShieldCheck,
  Tag, ChevronRight, CheckCircle2, Mail, LogIn, User, Megaphone, IndianRupee, MessageSquare, ExternalLink
} from 'lucide-react';
import { getNotifications } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';

type Notif = {
  id: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  desc: string;
  time: string;
  fullTime: string;
  read: boolean;
  type?: string;
  actionUrl?: string;
  targetRole?: string;
};

const initialNotifs: Notif[] = [];

const getTypeStyles = (type?: string) => {
  switch (type) {
    case 'mentor_review': return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    case 'ai_builder':    return { icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' };
    case 'funding':       return { icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' };
    case 'user_approval': return { icon: User, color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'mentor_message': return { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' };
    case 'platform':      return { icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50' };
    default:              return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' };
  }
};

const formatRelativeTime = (dateStr: string) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Just now';
  }
};

const formatFullDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

// Helper to determine recipient role category for notification item
const getTargetRole = (n: any): 'founder' | 'mentor' | 'investor' | 'admin' => {
  if (n.targetRole) return n.targetRole;
  if (n.role) return n.role;
  const text = `${n.title || ''} ${n.desc || ''} ${n.message || ''}`.toLowerCase();
  
  if (text.includes('investor') || text.includes('funding offer') || text.includes('term sheet') || text.includes('check size') || text.includes('kyc')) {
    return 'investor';
  }
  if (text.includes('mentor') || text.includes('withdrawal') || text.includes('session review') || text.includes('mentoring')) {
    return 'mentor';
  }
  if (text.includes('founder') || text.includes('startup plan') || text.includes('idea submitted') || text.includes('ai builder')) {
    return 'founder';
  }
  return 'founder';
};

const FounderNotifications: React.FC = () => {
  const { user: authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notif | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'founder' | 'mentor' | 'investor'>('all');

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  useEffect(() => {
    if (!authUser) return;

    const load = async () => {
      const userRole = (authUser.role || 'founder').toLowerCase();
      const userId = (authUser.id || authUser._id || '').toLowerCase();
      const userEmail = (authUser.email || '').toLowerCase();

      const local = (await getNotifications())
        .filter((n: any) => {
          // If explicitly addressed to admin
          if (userRole === 'admin') return true;

          // If addressed specifically by userId or userEmail
          if (n.userId && (n.userId.toLowerCase() === userId || n.userId.toLowerCase() === userEmail)) return true;
          if (n.userEmail && n.userEmail.toLowerCase() === userEmail) return true;

          // If matching user role or generic role target
          const target = getTargetRole(n);
          if (target === userRole) return true;
          if (!n.userId || n.userId === 'all') return true;

          return false;
        })
        .map((n: any) => ({
          id: n.id || Date.now(),
          title: n.title,
          desc: n.message || n.desc,
          time: n.createdAt ? formatRelativeTime(n.createdAt) : (n.time || 'Just now'),
          fullTime: n.createdAt ? formatFullDate(n.createdAt) : (n.time || 'Just now'),
          read: n.isRead !== undefined ? n.isRead : !n.unread,
          type: n.type,
          actionUrl: n.actionUrl,
          targetRole: getTargetRole(n),
          ...getTypeStyles(n.type)
        }));

      const combined = [...local, ...initialNotifs];
      setNotifs(combined);

      if (location.state && location.state.selectedNotifId) {
        const found = combined.find(x => x.id === location.state.selectedNotifId);
        if (found) {
          setSelectedNotif(found);
          markOne(found.id);
        }
      }
    };

    load();
    window.addEventListener('storage', load);
    window.addEventListener('notifications_updated', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('notifications_updated', load);
    };
  }, [authUser]);

  const markAll = () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };

  const markOne = (id: string | number) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  const unread = notifs.filter(n => !n.read).length;

  const founderCount = notifs.filter(n => (n.targetRole || getTargetRole(n)) === 'founder').length;
  const mentorCount = notifs.filter(n => (n.targetRole || getTargetRole(n)) === 'mentor').length;
  const investorCount = notifs.filter(n => (n.targetRole || getTargetRole(n)) === 'investor').length;

  const filteredNotifs = notifs.filter(n => {
    if (authUser?.role !== 'admin') return true;
    if (activeTab === 'all') return true;
    return (n.targetRole || getTargetRole(n)) === activeTab;
  });

  return (
    <div className="animate-fade-in-up pb-10">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Stay updated with your latest activity and platform alerts.</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <CheckCheck size={16} className="text-[#5B21B6]" /> Mark all read
          </button>
        )}
      </div>

      {/* ── Role Filter Tabs (Founder, Mentor, Investor) - ADMIN ONLY ── */}
      {authUser?.role === 'admin' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-2 mb-6 flex flex-wrap gap-2 shadow-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-[#5B21B6] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>All Notifications</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
              {notifs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('founder')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'founder'
                ? 'bg-[#5B21B6] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Rocket size={14} />
            <span>Founder Notifications</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'founder' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
              {founderCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mentor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'mentor'
                ? 'bg-[#5B21B6] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <User size={14} />
            <span>Mentor Notifications</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'mentor' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
              {mentorCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('investor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'investor'
                ? 'bg-[#5B21B6] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <IndianRupee size={14} />
            <span>Investor Notifications</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'investor' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
              {investorCount}
            </span>
          </button>
        </div>
      )}

      {/* ── Unread Banner ── */}
      {unread > 0 && (
        <div className="mb-5 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
          <Bell size={18} className="text-[#5B21B6]" />
          <p className="text-sm font-bold text-[#5B21B6]">
            You have {unread} unread notification{unread > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* ── Notification List ── */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Bell size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No notifications in this tab</p>
            <p className="text-gray-400 text-sm mt-1">Select another tab to view other notifications.</p>
          </div>
        ) : (
          filteredNotifs.map(n => {
            const Icon = n.icon;
            const roleTag = n.targetRole || getTargetRole(n);
            return (
              <div
                key={n.id}
                onClick={() => { markOne(n.id); setSelectedNotif(n); }}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white border-gray-100 opacity-75 hover:opacity-100 hover:border-gray-300'
                    : 'bg-white border-[#5B21B6]/30 shadow-sm hover:shadow-md hover:border-[#5B21B6]/50'
                }`}
              >
                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${n.bg}`}>
                  <Icon size={22} className={n.color} />
                  {!n.read && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#5B21B6] border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        roleTag === 'founder' ? 'bg-purple-100 text-purple-700' :
                        roleTag === 'mentor' ? 'bg-blue-100 text-blue-700' :
                        roleTag === 'investor' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {roleTag}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap font-medium">{n.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
                </div>
                <div className="flex items-center flex-shrink-0 self-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); markOne(n.id); setSelectedNotif(n); }}
                    className="w-[80px] px-3 py-1.5 justify-center bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-[#5B21B6] rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-gray-200/80 hover:border-purple-200"
                  >
                    View <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Notification Details Modal ── */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedNotif.bg}`}>
                  {React.createElement(selectedNotif.icon, { size: 20, className: selectedNotif.color })}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Notification Details</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar size={12} /> {selectedNotif.fullTime}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Sender profile if admin */}
              {authUser && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-sm font-black shrink-0">
                    {(authUser.fullName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{authUser.fullName}</p>
                    <p className="text-[10px] text-gray-500">{authUser.email} · {authUser.role}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    selectedNotif.read
                      ? 'bg-gray-100 text-gray-700 border-gray-200'
                      : 'bg-purple-100 text-[#5B21B6] border-purple-200'
                  }`}>
                    {selectedNotif.read ? 'Read' : 'New Unread Alert'}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Tag size={12} /> ID: #{String(selectedNotif.id).slice(-6)}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 leading-snug">{selectedNotif.title}</h4>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Message</p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedNotif.desc}</p>
              </div>

              {/* Context Breakdown */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600" /> Event Breakdown
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                    <span className="text-gray-400 font-medium block">Category</span>
                    <span className="text-gray-900 font-bold mt-0.5 block">
                      {selectedNotif.type === 'ai_builder' ? 'Startup Activity'
                        : selectedNotif.type === 'funding' ? 'Funding & Investments'
                        : selectedNotif.type === 'mentor_review' ? 'Mentorship'
                        : selectedNotif.type === 'user_approval' ? 'User Management'
                        : selectedNotif.type === 'platform' ? 'Platform Update'
                        : 'General'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                    <span className="text-gray-400 font-medium block">Status</span>
                    <span className="text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Logged &amp; Recorded
                    </span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                    <span className="text-gray-400 font-medium block">Received</span>
                    <span className="text-gray-900 font-bold mt-0.5 block">{selectedNotif.time}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                    <span className="text-gray-400 font-medium block">Read Status</span>
                    <span className={`font-bold mt-0.5 block ${selectedNotif.read ? 'text-gray-500' : 'text-purple-600'}`}>
                      {selectedNotif.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
              {selectedNotif.actionUrl && (
                <button
                  onClick={() => {
                    setSelectedNotif(null);
                    navigate(selectedNotif.actionUrl || '/');
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  <ExternalLink size={13} className="inline mr-1.5 -mt-0.5" />
                  Go to Page
                </button>
              )}
              <div className={`flex ${selectedNotif.actionUrl ? '' : 'w-full'} flex-col sm:flex-row gap-3 items-center sm:justify-end`}>
              <button
                onClick={() => {
                  const newRead = !selectedNotif.read;
                  setNotifs(n => n.map(x => x.id === selectedNotif.id ? { ...x, read: newRead } : x));
                  setSelectedNotif({ ...selectedNotif, read: newRead });
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                {selectedNotif.read ? 'Mark as Unread' : 'Mark as Read'}
              </button>
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderNotifications;
