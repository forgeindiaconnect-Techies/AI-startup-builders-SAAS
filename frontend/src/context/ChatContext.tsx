import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from './AuthContext';

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
  sendMessage: (conversationId: string, senderId: string, senderName: string, senderRole: string, receiverId: string, receiverName: string, receiverRole: string, text: string) => void;
  sendAdminMessage: (conversationId: string, senderId: string, senderName: string, text: string, receiverId: string, receiverName: string, receiverRole: string) => void;
  markNotificationsRead: (userId: string) => void;
}

const initialConversations: Conversation[] = [
  {
    id: 'conv_1',
    participants: [
      { id: '1', name: 'Sarah Jenkins', role: 'founder', avatar: 'S' },
      { id: '2', name: 'Alex Rivera', role: 'mentor', avatar: 'A' }
    ],
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'conv_2',
    participants: [
      { id: '1', name: 'Sarah Jenkins', role: 'founder', avatar: 'S' },
      { id: '3', name: 'Capital Ventures', role: 'investor', avatar: 'C' }
    ],
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'conv_3',
    participants: [
      { id: '1', name: 'Sarah Jenkins', role: 'founder', avatar: 'S' },
      { id: 'mentor_maria', name: 'Maria Lopez', role: 'mentor', avatar: 'M' }
    ],
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'conv_4',
    participants: [
      { id: '1', name: 'Sarah Jenkins', role: 'founder', avatar: 'S' },
      { id: 'investor_techseed', name: 'TechSeed Fund', role: 'investor', avatar: 'T' }
    ],
    gradient: 'from-orange-500 to-red-500',
  }
];

// Provide some clean initial messages matching the new schema
const createMockMessage = (id: string, convId: string, sId: string, sName: string, sRole: string, rId: string, rName: string, rRole: string, msg: string, timeOffset: number): Message => ({
  id,
  conversationId: convId,
  senderId: sId,
  senderName: sName,
  senderRole: sRole,
  receiverId: rId,
  receiverName: rName,
  receiverRole: rRole,
  message: msg,
  type: 'user_message',
  createdAt: new Date(Date.now() - timeOffset).toISOString(),
  isRead: true
});

const initialMessages: Record<string, Message[]> = {
  'conv_1': [
    createMockMessage('m1', 'conv_1', '2', 'Alex Rivera', 'Mentor', '1', 'Sarah Jenkins', 'Founder', 'Hey Sarah! I reviewed your latest startup submission. Really solid problem-solution fit.', 3600000),
    createMockMessage('m2', 'conv_1', '1', 'Sarah Jenkins', 'Founder', '2', 'Alex Rivera', 'Mentor', 'Thank you Alex! I worked hard on the market analysis section.', 3300000),
    createMockMessage('m3', 'conv_1', '2', 'Alex Rivera', 'Mentor', '1', 'Sarah Jenkins', 'Founder', 'It shows! One suggestion — tighten up the Go to Market slide. Investors want to see a clear 90-day plan.', 3000000),
  ],
  'conv_2': [
    createMockMessage('m4', 'conv_2', '3', 'Capital Ventures', 'Investor', '1', 'Sarah Jenkins', 'Founder', 'Hi Sarah, we reviewed your pitch deck. There is a lot of potential here.', 86400000),
  ],
  'conv_3': [
    createMockMessage('m5', 'conv_3', 'mentor_maria', 'Maria Lopez', 'Mentor', '1', 'Sarah Jenkins', 'Founder', 'I left feedback on your AI report. Check the comments section.', 172800000),
  ],
  'conv_4': [
    createMockMessage('m6', 'conv_4', '1', 'Sarah Jenkins', 'Founder', 'investor_techseed', 'TechSeed Fund', 'Investor', 'Hi! I sent over our latest pitch deck. Would love your feedback.', 259200000),
    createMockMessage('m7', 'conv_4', 'investor_techseed', 'TechSeed Fund', 'Investor', '1', 'Sarah Jenkins', 'Founder', 'Thanks for the deck, reviewing now.', 258000000),
  ]
};

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
    <ChatContext.Provider value={{ conversations, messages, notifications, sendMessage, sendAdminMessage, markNotificationsRead }}>
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
