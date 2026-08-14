import { API_URL } from '../config/api';

export interface InvestmentRequest {
  id: string;
  founderId: string;
  founderName: string;
  founderEmail: string;
  investorId: string;
  investorName: string;
  investorEmail: string;
  investorFirm: string;
  startupId: string;
  startupName: string;
  fundingAmount: string;
  fundingStage: string;
  shortIntro: string;
  whySeeking: string;
  optionalMessage?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  responseNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'founder' | 'investor';
  receiverEmail: string;
  receiverName: string;
  startupName: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
  isRead: boolean;
}

export interface InvestorMeeting {
  id: string;
  founderEmail: string;
  founderName: string;
  investorEmail: string;
  investorName: string;
  investorFirm: string;
  startupId: string;
  startupName: string;
  proposedDate: string;
  proposedTime: string;
  agenda: string;
  status: 'Requested' | 'Scheduled' | 'Completed' | 'Cancelled';
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundingTransaction {
  id: string;
  startupId: string;
  startupName: string;
  founderName: string;
  investorName: string;
  investorFirm: string;
  fundingAmount: string;
  investmentStage: string;
  transactionStatus: 'Drafting' | 'Term Sheet Signed' | 'Due Diligence Complete' | 'Agreement Finalized' | 'Investment Completed';
  transactionDate: string;
  referenceId: string;
  dealNotes?: string;
}

const STORAGE_KEYS = {
  REQUESTS: 'ai_startup_builder_investment_requests',
  MESSAGES: 'ai_startup_builder_investor_messages',
  MEETINGS: 'ai_startup_builder_investor_meetings',
  TRANSACTIONS: 'ai_startup_builder_funding_transactions',
  VISIBILITY: 'ai_startup_builder_startup_visibility',
};

// ─── Initial Seed Data ───

const INITIAL_REQUESTS: InvestmentRequest[] = [
  {
    id: 'req_inv_101',
    founderId: 'f_1',
    founderName: 'Renu',
    founderEmail: 'renugopal24022000@gmail.com',
    investorId: 'inv_1',
    investorName: 'Priya Nambiar',
    investorEmail: 'priya@nambiarfamily.in',
    investorFirm: 'Nambiar Capital',
    startupId: 'startup_mock_1',
    startupName: 'Tourists Platform AI',
    fundingAmount: '₹50,00,000',
    fundingStage: 'Seed',
    shortIntro: 'An AI-powered travel & itinerary booking engine for modern urban travelers.',
    whySeeking: 'Priya has deep expertise in FinTech/HealthTech and angel syndicates in India.',
    optionalMessage: 'We would love to share our pitch deck and early metrics with you.',
    status: 'ACCEPTED',
    responseNote: 'Great proposal! We are very interested in AI-driven travel & booking apps. Let us connect in messages and schedule an intro call.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req_inv_102',
    founderId: 'f_1',
    founderName: 'Renu',
    founderEmail: 'renugopal24022000@gmail.com',
    investorId: 'inv_2',
    investorName: 'Dr. Vikramaditya Sen',
    investorEmail: 'vikram.sen@nexuscap.com',
    investorFirm: 'Nexus Capital India',
    startupId: 'startup_mock_1',
    startupName: 'Tourists Platform AI',
    fundingAmount: '₹1,50,00,000',
    fundingStage: 'Pre-Series A',
    shortIntro: 'AI agent platform automating regional corporate travel bookings.',
    whySeeking: 'Nexus Capital leads B2B SaaS and AI infrastructure investments across India.',
    optionalMessage: 'Looking for VC participation in our upcoming seed extension round.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_MESSAGES: InvestorMessage[] = [
  {
    id: 'msg_1',
    senderEmail: 'priya@nambiarfamily.in',
    senderName: 'Priya Nambiar',
    senderRole: 'investor',
    receiverEmail: 'renugopal24022000@gmail.com',
    receiverName: 'Renu',
    startupName: 'Tourists Platform AI',
    text: 'Hello Renu! We reviewed your AI Analysis and pitch deck for Tourists Platform AI. The market size and unit economics look very promising.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg_2',
    senderEmail: 'renugopal24022000@gmail.com',
    senderName: 'Renu',
    senderRole: 'founder',
    receiverEmail: 'priya@nambiarfamily.in',
    receiverName: 'Priya Nambiar',
    startupName: 'Tourists Platform AI',
    text: 'Thank you Priya! We have also attached our latest financial projections and pilot customer feedback for your review.',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg_3',
    senderEmail: 'priya@nambiarfamily.in',
    senderName: 'Priya Nambiar',
    senderRole: 'investor',
    receiverEmail: 'renugopal24022000@gmail.com',
    receiverName: 'Renu',
    startupName: 'Tourists Platform AI',
    text: 'Sounds great. Let us schedule a 30-minute video call this week to discuss term sheet specifics.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  }
];

const INITIAL_MEETINGS: InvestorMeeting[] = [
  {
    id: 'meet_101',
    founderEmail: 'renugopal24022000@gmail.com',
    founderName: 'Renu',
    investorEmail: 'priya@nambiarfamily.in',
    investorName: 'Priya Nambiar',
    investorFirm: 'Nambiar Capital',
    startupId: 'startup_mock_1',
    startupName: 'Tourists Platform AI',
    proposedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    proposedTime: '15:00',
    agenda: 'Introductory Pitch & Investment Term Sheet Discussion',
    status: 'Scheduled',
    meetingLink: 'https://meet.jit.si/ai-startup-builder-meeting-priya-renu',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_TRANSACTIONS: FundingTransaction[] = [
  {
    id: 'tx_901',
    startupId: 'startup_mock_1',
    startupName: 'Tourists Platform AI',
    founderName: 'Renu',
    investorName: 'Priya Nambiar',
    investorFirm: 'Nambiar Capital',
    fundingAmount: '₹50,00,000',
    investmentStage: 'Seed Round',
    transactionStatus: 'Term Sheet Signed',
    transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    referenceId: 'TX-2026-NAMBIAR-901',
    dealNotes: 'Term Sheet signed for ₹50L seed investment at ₹5Cr pre-money valuation.',
  }
];

// ─── Helpers ───

export const getInvestmentRequests = (): InvestmentRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
};

export const saveInvestmentRequest = (reqData: Omit<InvestmentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): InvestmentRequest => {
  const newReq: InvestmentRequest = {
    id: `req_inv_${Date.now()}`,
    ...reqData,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const requests = getInvestmentRequests();
  const updated = [newReq, ...requests];
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investment_requests_updated'));
  return newReq;
};

export const updateInvestmentRequestStatus = (requestId: string, newStatus: InvestmentRequest['status'], responseNote?: string): void => {
  const requests = getInvestmentRequests();
  const updated = requests.map(r => {
    if (r.id === requestId) {
      return {
        ...r,
        status: newStatus,
        responseNote: responseNote || r.responseNote,
        updatedAt: new Date().toISOString(),
      };
    }
    return r;
  });
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investment_requests_updated'));
};

// ─── Messages Helpers ───

export const getInvestorMessages = (): InvestorMessage[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  return INITIAL_MESSAGES;
};

export const sendInvestorMessage = (msgData: Omit<InvestorMessage, 'id' | 'createdAt' | 'isRead'>): InvestorMessage => {
  const newMsg: InvestorMessage = {
    id: `msg_${Date.now()}`,
    ...msgData,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  const messages = getInvestorMessages();
  const updated = [...messages, newMsg];
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investor_messages_updated'));
  return newMsg;
};

// ─── Meetings Helpers ───

export const getInvestorMeetings = (): InvestorMeeting[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(INITIAL_MEETINGS));
  return INITIAL_MEETINGS;
};

export const createInvestorMeeting = (meetingData: Omit<InvestorMeeting, 'id' | 'createdAt' | 'updatedAt' | 'meetingLink' | 'status'>): InvestorMeeting => {
  const meetingId = `meet_${Date.now()}`;
  const newMeeting: InvestorMeeting = {
    id: meetingId,
    ...meetingData,
    status: 'Scheduled',
    meetingLink: `https://meet.jit.si/ai-startup-builder-meeting-${meetingId}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const meetings = getInvestorMeetings();
  const updated = [newMeeting, ...meetings];
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investor_meetings_updated'));
  return newMeeting;
};

export const updateMeetingStatus = (meetingId: string, newStatus: InvestorMeeting['status']): void => {
  const meetings = getInvestorMeetings();
  const updated = meetings.map(m => m.id === meetingId ? { ...m, status: newStatus, updatedAt: new Date().toISOString() } : m);
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investor_meetings_updated'));
};

// ─── Transactions Helpers ───

export const getFundingTransactions = (): FundingTransaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  return INITIAL_TRANSACTIONS;
};

export const saveFundingTransaction = (txData: Omit<FundingTransaction, 'id' | 'referenceId' | 'transactionDate'>): FundingTransaction => {
  const newTx: FundingTransaction = {
    id: `tx_${Date.now()}`,
    ...txData,
    referenceId: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    transactionDate: new Date().toISOString(),
  };
  const txs = getFundingTransactions();
  const updated = [newTx, ...txs];
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('funding_transactions_updated'));
  return newTx;
};

// ─── Startup Investor Visibility Helpers ───

export const getStartupVisibilityMap = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VISIBILITY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // By default, set startup_mock_1 to true for demo
  const defaults = { startup_mock_1: true };
  localStorage.setItem(STORAGE_KEYS.VISIBILITY, JSON.stringify(defaults));
  return defaults;
};

export const setStartupInvestorVisibility = (startupId: string, isVisible: boolean): void => {
  if (!startupId) return;
  const map = getStartupVisibilityMap();
  map[startupId] = isVisible;
  localStorage.setItem(STORAGE_KEYS.VISIBILITY, JSON.stringify(map));

  // Sync with local storage startup item if available
  try {
    const sKey = startupId.startsWith('startup_') ? startupId : `startup_${startupId}`;
    const raw = localStorage.getItem(sKey) || localStorage.getItem(startupId);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.investorVisible = isVisible;
      parsed.isInvestorVisible = isVisible;
      localStorage.setItem(sKey, JSON.stringify(parsed));
    }
  } catch {}

  // Sync to backend MongoDB if valid ObjectId
  const cleanId = startupId.replace(/^startup_/, '');
  if (cleanId && cleanId.match(/^[0-9a-fA-F]{24}$/)) {
    fetch(`${API_URL}/startups/${cleanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ investorVisible: isVisible }),
    }).catch(err => console.warn('Could not sync startup visibility to backend:', err));
  }

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('startup_visibility_updated'));
};
