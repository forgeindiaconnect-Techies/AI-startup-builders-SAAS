import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from './AuthContext';
import { addNotification } from '../utils/localStorageHelper';

export interface ChatUser {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  message: string;
  type: 'user_message' | 'admin_direct_message';
  createdAt: string;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: ChatUser[];
  gradient: string;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  notifications: Notification[];
  getOrCreateConversation: (participants: ChatUser[]) => Conversation;
  sendMessage: (conversationId: string, senderId: string, senderName: string, senderRole: string, receiverId: string, receiverName: string, receiverRole: string, text: string) => void;
  sendAdminMessage: (conversationId: string, senderId: string, senderName: string, text: string, receiverId: string, receiverName: string, receiverRole: string) => void;
  markNotificationsRead: (userId: string) => void;
}

const initialConversations: Conversation[] = [];

const initialMessages: Record<string, Message[]> = {};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_conversations');
      return saved ? JSON.parse(saved) : initialConversations;
    } catch {
      return initialConversations;
    }
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_messages');
      return saved ? JSON.parse(saved) : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ai_startup_builder_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('ai_startup_builder_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ai_startup_builder_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Listen for changes from other tabs to simulate real-time chat
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ai_startup_builder_messages' && e.newValue) {
        try { setMessages(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
      if (e.key === 'ai_startup_builder_conversations' && e.newValue) {
        try { setConversations(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
      if (e.key === 'ai_startup_builder_notifications' && e.newValue) {
        try { setNotifications(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const CONV_GRADIENTS = [
    'from-purple-500 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-blue-500 to-cyan-500',
  ];

  const getOrCreateConversation = (participants: ChatUser[]) => {
    const ids = participants.map(p => p.id).sort().join('|');
    const existing = conversations.find(c => c.participants.map(p => p.id).sort().join('|') === ids);
    if (existing) return existing;
    const conv: Conversation = {
      id: `conv_${Date.now()}`,
      participants,
      gradient: CONV_GRADIENTS[Math.floor(Math.random() * CONV_GRADIENTS.length)],
    };
    setConversations(prev => [...prev, conv]);
    return conv;
  };

  const sendMessage = (
    conversationId: string, 
    senderId: string, 
    senderName: string, 
    senderRole: string, 
    receiverId: string, 
    receiverName: string, 
    receiverRole: string, 
    text: string
  ) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderRole,
      receiverId,
      receiverName,
      receiverRole,
      message: text,
      type: 'user_message',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    // When a mentor messages a founder, surface it on the founder's Mentors
    // page and on the admin dashboard notifications page.
    if (senderRole === 'Mentor') {
      addNotification({
        userId: receiverId,
        title: 'New Message from Mentor',
        message: `${senderName} sent you a message: "${text}"`,
        type: 'mentor_message',
        actionUrl: '/dashboard/founder/mentors',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      addNotification({
        userId: 'admin',
        title: 'New Mentor Message',
        message: `${senderName} (Mentor) sent a message to ${receiverName}.`,
        type: 'mentor_message',
        actionUrl: '/dashboard/admin/notifications',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const sendAdminMessage = (
    conversationId: string, 
    senderId: string, 
    senderName: string, 
    text: string, 
    receiverId: string, 
    receiverName: string, 
    receiverRole: string
  ) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderRole: 'Admin',
      receiverId,
      receiverName,
      receiverRole,
      message: text,
      type: 'admin_direct_message',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    // Add Notification
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId: receiverId,
      title: "Admin sent you a message",
      message: `${senderName} sent you a direct message.`,
      type: "admin_message",
      isRead: false,
      actionUrl: "/dashboard/inbox",
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = (userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  };

  return (
    <ChatContext.Provider value={{ conversations, messages, notifications, getOrCreateConversation, sendMessage, sendAdminMessage, markNotificationsRead }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
