import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CheckCheck, Star, Rocket, Info, X, Calendar, ShieldCheck, Tag, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getNotifications } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';

type Notif = { id: number; icon: React.ElementType; color: string; bg: string; title: string; desc: string; time: string; read: boolean; type?: string };

const initialNotifs: Notif[] = [];

const getTypeStyles = (type?: string) => {
  switch (type) {
    case 'mentor_review': return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    case 'ai_builder': return { icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' };
    default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' };
  }
};

const FounderNotifications: React.FC = () => {
  const { user: authUser } = useAuth();
  const location = useLocation();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notif | null>(null);

  useEffect(() => {
    if (!authUser) return;
    
    const load = () => {
      const local = getNotifications()
        .filter((n: any) => 
          !n.userId || 
          n.userId === authUser.id || 
          n.userId === 'all' || 
          n.userId === 'founder_demo_user' ||
          (authUser.role === 'admin' && n.userId === 'admin')
        )
        .map((n: any) => ({
          id: n.id || Date.now(),
          title: n.title,
          desc: n.message || n.desc,
          time: n.time || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'),
          read: n.isRead !== undefined ? n.isRead : !n.unread,
          type: n.type,
          ...getTypeStyles(n.type)
        }));
      const combined = [...local, ...initialNotifs];
      setNotifs(combined);

      // If navigated from NotificationDropdown with selectedNotifId, auto open details
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
    return () => window.removeEventListener('storage', load);
  }, [authUser]);

  const markAll = () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };
  
  const markOne = (id: number) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in-up pb-10">
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
              onClick={() => {
                markOne(n.id);
                setSelectedNotif(n);
              }}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                n.read 
                  ? 'bg-white border-gray-100 opacity-75 hover:opacity-100 hover:border-gray-300' 
                  : 'bg-white border-[#5B21B6]/30 shadow-sm hover:shadow-md hover:border-[#5B21B6]/50'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${n.bg}`}>
                <Icon size={22} className={n.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-bold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 font-medium">{n.time}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0 self-center">
                {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-[#5B21B6]" />}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markOne(n.id);
                    setSelectedNotif(n);
                  }}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-[#5B21B6] rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-gray-200/80 hover:border-purple-200"
                >
                  View Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Details Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedNotif.bg}`}>
                  {React.createElement(selectedNotif.icon, { size: 20, className: selectedNotif.color })}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Notification Details</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar size={12} /> {selectedNotif.time}
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
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    selectedNotif.read 
                      ? 'bg-gray-100 text-gray-700 border-gray-200' 
                      : 'bg-purple-100 text-[#5B21B6] border-purple-200'
                  }`}>
                    {selectedNotif.read ? 'Read Status' : 'New Unread Alert'}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Tag size={12} /> ID: #NT-{selectedNotif.id}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 leading-snug">{selectedNotif.title}</h4>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Alert Message</p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {selectedNotif.desc}
                </p>
              </div>

              {/* Dynamic Context Breakdown */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600" /> Event Breakdown & Context
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                    <span className="text-gray-400 font-medium block">Category</span>
                    <span className="text-gray-900 font-bold mt-0.5 block">
                      {selectedNotif.title.toLowerCase().includes('funding') || selectedNotif.title.toLowerCase().includes('offer')
                        ? 'Funding & Investments'
                        : selectedNotif.title.toLowerCase().includes('mentor')
                        ? 'Mentorship & Matching'
                        : selectedNotif.title.toLowerCase().includes('message')
                        ? 'Direct Communications'
                        : 'Platform Activity'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                    <span className="text-gray-400 font-medium block">System Status</span>
                    <span className="text-emerald-700 font-bold mt-0.5 block flex items-center gap-1">
                      <CheckCircle2 size={13} /> Logged & Recorded
                    </span>
                  </div>
                  {(selectedNotif.title.toLowerCase().includes('funding') || selectedNotif.desc.toLowerCase().includes('offer')) && (
                    <>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                        <span className="text-gray-400 font-medium block">Action Protocol</span>
                        <span className="text-gray-900 font-bold mt-0.5 block">Term Sheet Verification</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100/60">
                        <span className="text-gray-400 font-medium block">Required Action</span>
                        <span className="text-indigo-600 font-bold mt-0.5 block">Review Details</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <button
                onClick={() => {
                  const newReadStatus = !selectedNotif.read;
                  setNotifs(n => n.map(x => x.id === selectedNotif.id ? { ...x, read: newReadStatus } : x));
                  setSelectedNotif({ ...selectedNotif, read: newReadStatus });
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                {selectedNotif.read ? 'Mark as Unread' : 'Mark as Read'}
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="flex-1 sm:flex-initial px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors"
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
