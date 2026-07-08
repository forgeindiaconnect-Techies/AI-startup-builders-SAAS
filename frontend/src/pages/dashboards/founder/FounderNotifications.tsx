import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Star, MessageSquare, TrendingUp, Users, Rocket, Info } from 'lucide-react';
import { getNotifications, addNotification } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';

type Notif = { id: number; icon: React.ElementType; color: string; bg: string; title: string; desc: string; time: string; read: boolean };

const initialNotifs: Notif[] = [
  { id: 1, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', title: 'New Mentor Match!', desc: 'Alex Rivera has been matched as your mentor based on your startup profile.', time: '2 minutes ago', read: false },
  { id: 2, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'AI Report Ready', desc: 'Your market analysis for "AI Legal Tech" is ready to view.', time: '1 hour ago', read: false },
  { id: 3, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', title: 'New Message from Capital Ventures', desc: 'They want to schedule a call to discuss your pitch deck.', time: '3 hours ago', read: false },
  { id: 4, icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Startup Submitted', desc: 'Your startup "EcoPackage Hub" has been submitted for AI review.', time: 'Yesterday', read: true },
  { id: 5, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Team Invite Accepted', desc: 'James Park accepted your invitation to join your startup workspace.', time: '2 days ago', read: true },
];

const getTypeStyles = (type?: string) => {
  switch (type) {
    case 'mentor_review': return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    case 'ai_builder': return { icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' };
    default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' };
  }
};

const FounderNotifications: React.FC = () => {
  const { user: authUser } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => {
    if (!authUser) return;
    
    const local = getNotifications()
      .filter((n: any) => n.userId === authUser.id || (authUser.role === 'admin' && n.userId === 'admin') || n.userId === 'all')
      .map((n: any) => ({
        id: n.id || Date.now(),
        title: n.title,
        desc: n.message || n.desc,
        time: n.time || new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || 'Just now',
        read: n.isRead !== undefined ? n.isRead : !n.unread,
        ...getTypeStyles(n.type)
      }));
    setNotifs([...local, ...initialNotifs]);
  }, [authUser]);

  const markAll = () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    // Real app would update localStorage here as well
  };
  
  const markOne = (id: number) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your latest activity and platform alerts.</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <CheckCheck size={16} className="text-[#5B21B6]" /> Mark all read
          </button>
        )}
      </div>

      {unread > 0 && (
        <div className="mb-6 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
          <Bell size={18} className="text-[#5B21B6]" />
          <p className="text-sm font-bold text-[#5B21B6]">You have {unread} unread notification{unread > 1 ? 's' : ''}</p>
        </div>
      )}

      <div className="space-y-3">
        {notifs.map(n => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={() => markOne(n.id)}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${n.read ? 'bg-white border-gray-100 opacity-70 hover:opacity-100' : 'bg-white border-[#5B21B6]/20 shadow-sm hover:shadow-md'}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${n.bg}`}>
                <Icon size={22} className={n.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-bold ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">{n.time}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-[#5B21B6] flex-shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FounderNotifications;
