import React, { useState, useEffect, useRef } from 'react';
import { Bell, Info, Star, Rocket, MessageSquare } from 'lucide-react';
import { getNotifications } from '../../utils/localStorageHelper';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getTypeStyles = (type?: string) => {
  switch (type) {
    case 'mentor_review': return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    case 'ai_builder': return { icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' };
    default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' };
  }
};

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Load notifications from local storage
    const loadNotifications = () => {
      const stored = getNotifications().map((n: any) => ({
        id: n.id || Date.now(),
        title: n.title,
        desc: n.message || n.desc,
        time: n.time || 'Just now',
        read: !n.unread,
        ...getTypeStyles(n.type)
      }));
      setNotifications(stored);
    };
    
    if (isOpen) {
      loadNotifications();
    } else {
      // Load once on mount to get unread count
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-fade-in-up origin-top-right">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <span className="text-xs font-semibold text-[#5B21B6] bg-purple-100 px-2 py-0.5 rounded-full">
              {unreadCount} New
            </span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                You're all caught up!
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => {
                const Icon = notif.icon;
                return (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notif.read ? 'opacity-70' : ''}`}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/dashboard/${user?.role}/inbox`);
                    }}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg shrink-0 h-fit ${notif.bg} ${notif.color}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold mb-0.5 ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-1">{notif.desc}</p>
                        <p className="text-[10px] font-medium text-gray-400">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate(`/dashboard/${user?.role}/inbox`);
              }}
              className="text-sm font-semibold text-[#5B21B6] hover:text-[#7C3AED] transition-colors"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
