import React, { useState, useMemo, useEffect } from 'react';
import { Search, Send, ShieldAlert, ChevronDown, Users } from 'lucide-react';
import { useChat } from '../../../context/ChatContext';
import type { Conversation, ChatUser } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';

const SharedMessages: React.FC = () => {
  const { user } = useAuth();
  const { conversations, messages, sendMessage, sendAdminMessage } = useChat();
  
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  
  // Admin selected target for moderation messages
  const [adminTargetUserId, setAdminTargetUserId] = useState<string>('');

  // Filter conversations for the current user (admin sees all)
  const myConversations = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return conversations;
    return conversations.filter(c => c.participants.some(p => p.id === user.id || p.role === user.role));
  }, [conversations, user]);

  const [active, setActive] = useState<string>(myConversations[0]?.id || '');

  // If the active conversation disappears (e.g. log in as someone else), reset active
  useEffect(() => {
    if (myConversations.length > 0 && !myConversations.some(c => c.id === active)) {
      setActive(myConversations[0].id);
    }
  }, [myConversations, active]);

  const activeConv = myConversations.find(c => c.id === active);
  
  // Set default admin target when active conversation changes
  useEffect(() => {
    if (user?.role === 'admin' && activeConv) {
       // By default, target the first participant
       setAdminTargetUserId(activeConv.participants[0].id);
    }
  }, [active, activeConv, user]);

  // Format Helper for Conversation Title (e.g., Sarah Jenkins (Founder) & Capital Ventures (Investor))
  const formatConvTitle = (c: Conversation, separator: string = ' & ') => {
    if (c.participants.length < 2) return c.participants[0]?.name || 'Unknown';
    const p1 = c.participants[0];
    const p2 = c.participants[1];
    return `${p1.name} (${p1.role.charAt(0).toUpperCase() + p1.role.slice(1)}) ${separator} ${p2.name} (${p2.role.charAt(0).toUpperCase() + p2.role.slice(1)})`;
  };

  const filteredConvs = myConversations.filter(c => {
    const title = formatConvTitle(c);
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const activeMessages = messages[active] || [];
  
  // Filter messages based on admin moderation logic
  const visibleMessages = useMemo(() => {
    if (!user) return [];
    return activeMessages.filter(m => {
      // User messages visible to everyone
      if (m.type === 'user_message') return true;
      // Admin messages visible only to Admin and the Receiver
      return user.role === 'admin' || user.id === m.receiverId;
    });
  }, [activeMessages, user]);

  const send = (sendToAll: boolean = false) => {
    if (!input.trim() || !user || !activeConv) return;
    
    const currentId = user.id; 
    const currentName = user.name;
    const currentRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    if (user.role === 'admin') {
      if (sendToAll) {
        // Send separate direct messages to all participants
        activeConv.participants.forEach(p => {
          sendAdminMessage(active, currentId, currentName, input, p.id, p.name, p.role.charAt(0).toUpperCase() + p.role.slice(1));
        });
      } else {
        // Send to selected target
        const targetUser = activeConv.participants.find(p => p.id === adminTargetUserId);
        if (targetUser) {
          sendAdminMessage(active, currentId, currentName, input, targetUser.id, targetUser.name, targetUser.role.charAt(0).toUpperCase() + targetUser.role.slice(1));
        }
      }
    } else {
      // Find the other participant in the chat to be the receiver
      const receiver = activeConv.participants.find(p => p.id !== user.id) || activeConv.participants[0];
      sendMessage(active, currentId, currentName, currentRole, receiver.id, receiver.name, receiver.role.charAt(0).toUpperCase() + receiver.role.slice(1), input);
    }
    
    setInput('');
  };

  // Format Time Helper
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  if (myConversations.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Support Center Inbox' : 'Messages'}
          </h1>
        </div>
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
          No conversations found.
        </div>
      </div>
    );
  }

  if (!activeConv) return null;

  return (
    <div className="animate-fade-in-up flex flex-col h-[calc(100vh-160px)] min-h-[500px]">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'Support Center Inbox' : 'Messages'}
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.role === 'admin' 
            ? 'Monitor and moderate platform communications.' 
            : 'Chat with your connections in real time.'}
        </p>
      </div>

      <div className="flex-1 flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">
        {/* Left panel */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search messages..." 
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredConvs.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No messages found.</div>
            ) : filteredConvs.map(c => {
              const title = formatConvTitle(c, ' & ');
              const lastMsg = messages[c.id]?.[messages[c.id].length - 1];
              return (
                <button key={c.id} onClick={() => setActive(c.id)} className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors ${active === c.id ? 'bg-purple-50/70 border-l-4 border-[#5B21B6]' : 'border-l-4 border-transparent'}`}>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}>
                    {c.participants[0].avatar}{c.participants.length > 1 ? c.participants[1].avatar : ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate leading-tight">{title}</p>
                    <p className="text-[12px] text-gray-500 truncate mt-1">
                      {lastMsg ? (lastMsg.type === 'admin_direct_message' ? '⚠️ Admin Message' : lastMsg.message) : 'No messages'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeConv.gradient} flex items-center justify-center text-white font-bold shadow-sm`}>
               {activeConv.participants[0].avatar}{activeConv.participants.length > 1 ? activeConv.participants[1].avatar : ''}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-[15px]">{formatConvTitle(activeConv, ' ↔ ')}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-[#FAFAFA]">
            {visibleMessages.map((m, i) => {
              let isRight = user?.id === m.senderId;
              if (user?.role === 'admin' && m.senderRole !== 'Admin') {
                isRight = m.senderRole.toLowerCase() === 'founder';
              }
              const isAdminMsg = m.type === 'admin_direct_message';

              return (
                <div key={i} className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                  {/* Always show sender name and role for clarity */}
                  <div className={`flex flex-col mb-1.5 ${isRight ? 'items-end mr-1' : 'items-start ml-1'}`}>
                    <span className="text-[13px] font-bold text-gray-700 leading-none">{m.senderName}</span>
                    <span className="text-[10px] uppercase font-bold text-[#FBBF24] tracking-wider mt-1">{m.senderRole}</span>
                  </div>
                  
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    isAdminMsg 
                      ? 'bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-bl-sm shadow-[0_2px_10px_-3px_rgba(239,68,68,0.3)]' 
                      : isRight 
                        ? 'bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-tr-sm shadow-md shadow-purple-900/10' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                  }`}>
                    {isAdminMsg && (
                      <div className="flex items-center gap-1.5 mb-2 text-[#DC2626] font-extrabold text-[11px] uppercase tracking-widest border-b border-[#FCA5A5]/30 pb-1.5">
                        <ShieldAlert size={14} />
                        ADMIN MODERATION (To: {m.receiverName})
                      </div>
                    )}
                    {m.message}
                  </div>
                  <span className={`text-[10px] text-gray-400 mt-1.5 font-medium ${isRight ? 'mr-1' : 'ml-1'}`}>{formatTime(m.createdAt)}</span>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-3 flex-shrink-0 bg-white">
            {user?.role === 'admin' && (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select 
                    value={adminTargetUserId}
                    onChange={(e) => setAdminTargetUserId(e.target.value)}
                    className="appearance-none w-full bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF4444] shadow-sm cursor-pointer"
                  >
                    {activeConv.participants.map(p => (
                      <option key={p.id} value={p.id}>Direct to: {p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EF4444] pointer-events-none" size={16} />
                </div>
                <button 
                  onClick={() => send(true)} 
                  disabled={!input.trim()}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-bold flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  <Users size={16} />
                  Send to All
                </button>
              </div>
            )}
            <div className="flex gap-3 items-center">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && send(false)}
                placeholder={user?.role === 'admin' ? "Send a moderation message..." : `Type your message...`}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6] transition-all"
              />
              <button 
                onClick={() => send(false)} 
                disabled={!input.trim()}
                className={`px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50 ${user?.role === 'admin' ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-red-900/20' : 'bg-[#5B21B6] hover:bg-[#7C3AED] text-white shadow-purple-900/20'}`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedMessages;
