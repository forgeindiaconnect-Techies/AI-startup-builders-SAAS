import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Star, Rocket, Info, X, Calendar, ShieldCheck,
  Tag, ChevronRight, ChevronDown, CheckCircle2, User, Megaphone, IndianRupee, MessageSquare, ExternalLink
} from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../../utils/localStorageHelper';
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
  userId?: string;
  userEmail?: string;
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
  if (n.targetRole) {
    const r = String(n.targetRole).toLowerCase();
    if (r === 'founder' || r === 'investor' || r === 'mentor' || r === 'admin') return r as any;
  }
  if (n.role) {
    const r = String(n.role).toLowerCase();
    if (r === 'founder' || r === 'investor' || r === 'mentor' || r === 'admin') return r as any;
  }
  const text = `${n.title || ''} ${n.desc || ''} ${n.message || ''} ${n.actionUrl || ''}`.toLowerCase();
  
  if (
    text.includes('/investor') ||
    text.includes('investor') ||
    text.includes('investment') ||
    text.includes('funding offer') ||
    text.includes('term sheet') ||
    text.includes('check size') ||
    text.includes('investor kyc') ||
    text.includes('deal flow')
  ) {
    return 'investor';
  }
  if (
    text.includes('/mentor') ||
    text.includes('mentor') ||
    text.includes('mentoring') ||
    text.includes('session review') ||
    text.includes('mentor feedback') ||
    text.includes('mentor review') ||
    text.includes('withdrawal')
  ) {
    return 'mentor';
  }
  if (
    text.includes('/founder') ||
    text.includes('founder') ||
    text.includes('startup plan') ||
    text.includes('idea submitted') ||
    text.includes('ai builder') ||
    text.includes('mvp planner') ||
    text.includes('financial plan') ||
    text.includes('branding') ||
    text.includes('pitch deck')
  ) {
    return 'founder';
  }
  return 'founder';
};

const FounderNotifications: React.FC = () => {
  const { user: authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [allNotifs, setAllNotifs] = useState<Notif[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notif | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'founder' | 'mentor' | 'investor'>('all');

  const path = location.pathname.toLowerCase();

  // Detect current role view context from route or auth role
  let currentRole: 'founder' | 'investor' | 'mentor' | 'admin' = 'founder';
  if (path.includes('/dashboard/admin')) {
    currentRole = 'admin';
  } else if (path.includes('/dashboard/investor')) {
    currentRole = 'investor';
  } else if (path.includes('/dashboard/mentor')) {
    currentRole = 'mentor';
  } else if (path.includes('/dashboard/founder')) {
    currentRole = 'founder';
  } else if (authUser?.role) {
    currentRole = authUser.role.toLowerCase() as any;
  }

  const isAdminView = currentRole === 'admin';

  useEffect(() => {
    if (!authUser) return;

    const load = async () => {
      const userId = (authUser.id || authUser._id || '').toLowerCase();
      const userEmail = (authUser.email || '').toLowerCase();

      const raw = await getNotifications();

      const mapped: Notif[] = raw.map((n: any) => {
        const targetRole = getTargetRole(n);
        return {
          id: n.id || Date.now() + Math.random(),
          title: n.title || 'Notification',
          desc: n.message || n.desc || '',
          time: n.createdAt ? formatRelativeTime(n.createdAt) : (n.time || 'Just now'),
          fullTime: n.createdAt ? formatFullDate(n.createdAt) : (n.time || 'Just now'),
          read: n.isRead !== undefined ? n.isRead : !n.unread,
          type: n.type,
          actionUrl: n.actionUrl,
          targetRole,
          userId: n.userId ? String(n.userId).toLowerCase() : undefined,
          userEmail: n.userEmail ? String(n.userEmail).toLowerCase() : undefined,
          ...getTypeStyles(n.type)
        };
      });

      const combined = [...mapped, ...initialNotifs];
      setAllNotifs(combined);

      // Filter notifications strictly by current dashboard role (unless Admin view)
      if (!isAdminView) {
        const roleFiltered = combined.filter((n: Notif) => {
          // Addressed to specific user
          if (n.userId && (n.userId === userId || n.userId === userEmail)) return true;
          if (n.userEmail && n.userEmail === userEmail) return true;

          // Strictly match target role
          return n.targetRole === currentRole;
        });
        setNotifs(roleFiltered);
      } else {
        setNotifs(combined);
      }

      if (location.state && location.state.selectedNotifId) {
        const found = combined.find((x: Notif) => x.id === location.state.selectedNotifId);
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
  }, [authUser, location.pathname]);

  const handleSelectNotif = (n: Notif, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    markOne(n.id);
    if (selectedNotif?.id === n.id) {
      setSelectedNotif(null);
    } else {
      setSelectedNotif(n);
      // Smoothly scroll the card element into view if clicked
      const cardElem = (e?.currentTarget as HTMLElement)?.closest('.notification-card-item');
      if (cardElem) {
        cardElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const markAll = () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setAllNotifs(n => n.map(x => ({ ...x, read: true })));
  };

  const markOne = (id: string | number) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    setAllNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  const unread = notifs.filter(n => !n.read).length;

  const founderCount = allNotifs.filter(n => n.targetRole === 'founder').length;
  const mentorCount = allNotifs.filter(n => n.targetRole === 'mentor').length;
  const investorCount = allNotifs.filter(n => n.targetRole === 'investor').length;

  const filteredNotifs = isAdminView
    ? allNotifs.filter(n => {
        if (activeTab === 'all') return true;
        return n.targetRole === activeTab;
      })
    : notifs;

  const getPageHeaderTitle = () => {
    switch (currentRole) {
      case 'admin':    return 'Admin Notification Hub';
      case 'investor': return 'Investor Notifications';
      case 'mentor':   return 'Mentor Notifications';
      case 'founder':  return 'Founder Notifications';
      default:         return 'Notifications';
    }
  };

  const getPageHeaderDesc = () => {
    switch (currentRole) {
      case 'admin':    return 'Manage and monitor all platform activity notifications across Founders, Mentors, and Investors.';
      case 'investor': return 'Stay updated with new startup dealflow, pitch requests, term sheets, and agreements.';
      case 'mentor':   return 'Stay updated with session requests, startup review requests, and founder feedback.';
      case 'founder':  return 'Stay updated with your startup milestones, mentor feedback, and investment offers.';
      default:         return 'Stay updated with your latest activity and platform alerts.';
    }
  };

  return (
    <div className="animate-fade-in-up pb-10 font-sans">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-gray-900">{getPageHeaderTitle()}</h1>
            {!isAdminView && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                currentRole === 'investor' ? 'bg-emerald-100 text-emerald-700' :
                currentRole === 'mentor' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {currentRole}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm font-medium">{getPageHeaderDesc()}</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <CheckCheck size={16} className="text-[#5B21B6]" /> Mark all read
          </button>
        )}
      </div>

      {/* ── Admin Multi-Role Filter Tabs (ONLY visible on Admin Dashboard) ── */}
      {isAdminView && (
        <div className="bg-white rounded-2xl border border-gray-200 p-2 mb-6 flex flex-wrap gap-2 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#5B21B6] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>All Notifications</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
              {allNotifs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('founder')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
            type="button"
            onClick={() => setActiveTab('mentor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
            type="button"
            onClick={() => setActiveTab('investor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <Bell size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-700 font-extrabold text-base">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1 font-medium">
              {isAdminView
                ? 'No notifications found for this tab filter.'
                : `There are currently no ${currentRole} notifications.`}
            </p>
          </div>
        ) : (
          filteredNotifs.map(n => {
            const Icon = n.icon;
            const roleTag = n.targetRole || getTargetRole(n);
            const isSelected = selectedNotif?.id === n.id;
            return (
              <div
                key={n.id}
                onClick={(e) => handleSelectNotif(n, e)}
                className={`notification-card-item rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#5B21B6] ring-2 ring-[#5B21B6]/30 shadow-lg'
                    : n.read
                    ? 'bg-white border-gray-100 opacity-80 hover:opacity-100 hover:border-gray-300'
                    : 'bg-white border-[#5B21B6]/30 shadow-sm hover:shadow-md hover:border-[#5B21B6]/50'
                }`}
              >
                <div className="flex items-start gap-4 p-5">
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
                    <p className={`text-sm text-gray-600 mt-1 leading-relaxed ${isSelected ? '' : 'line-clamp-2'}`}>{n.desc}</p>
                  </div>
                  <div className="flex items-center flex-shrink-0 self-center">
                    <button
                      onClick={(e) => handleSelectNotif(n, e)}
                      className={`w-[90px] px-3 py-1.5 justify-center rounded-lg text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                        isSelected
                          ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow-sm'
                          : 'bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-[#5B21B6] border-gray-200/80 hover:border-purple-200'
                      }`}
                    >
                      {isSelected ? 'Opened' : 'View'} {isSelected ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>
                </div>

                {/* Inline Card Details (Immediate Expandable Details directly inside the card) */}
                {isSelected && (
                  <div className="px-5 pb-5 pt-2 border-t border-purple-100 bg-purple-50/40 rounded-b-2xl animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="font-semibold flex items-center gap-1 text-purple-900">
                        <Calendar size={13} className="text-[#5B21B6]" /> Received: {n.fullTime}
                      </span>
                      <span className="font-medium text-gray-400">ID: #{String(n.id).slice(-6)}</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-xs text-gray-800 leading-relaxed font-medium mb-3">
                      {n.desc}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {n.actionUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(n.actionUrl);
                          }}
                          className="px-4 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          Go to Page <ExternalLink size={13} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotif(null);
                        }}
                        className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Hide Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Notification Details Modal (React Portal attached to document.body z-[999999]) ── */}
      {selectedNotif && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={() => setSelectedNotif(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
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
                <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line">{selectedNotif.desc}</p>
              </div>

              {/* Context Breakdown */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600" /> Event Breakdown
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                    <span className="text-gray-400 font-medium block">Category</span>
                    <span className="text-gray-900 font-bold mt-0.5 block capitalize">
                      {selectedNotif.targetRole || 'general'}
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

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end items-center">
              <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3 items-center sm:justify-end">
                {selectedNotif.actionUrl && (
                  <button
                    onClick={() => {
                      const url = selectedNotif.actionUrl;
                      setSelectedNotif(null);
                      navigate(url);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 justify-center cursor-pointer"
                  >
                    Go to Page <ExternalLink size={14} />
                  </button>
                )}
                <button
                  onClick={async () => {
                    const newRead = !selectedNotif.read;
                    if (!selectedNotif.read) {
                      try {
                        await markNotificationRead(String(selectedNotif.id));
                      } catch (e) {}
                    }
                    markOne(selectedNotif.id);
                    setSelectedNotif({ ...selectedNotif, read: newRead });
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  {selectedNotif.read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default FounderNotifications;
