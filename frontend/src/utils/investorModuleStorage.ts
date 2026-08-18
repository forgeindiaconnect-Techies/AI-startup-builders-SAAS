import { API_URL } from '../config/api';

export interface InvestorConnectionFormData {
  startupId: string;
  startupName: string;
  fundingAmount: string;
  fundingStage: string;
  shortIntro: string;
  whySeeking: string;
  optionalMessage?: string;
  founderEmail?: string;
  investorEmail?: string;
  investorFirm?: string;
}

export interface InvestmentRequest {
  id: string;
  founderId: string;
  founder_id?: string;
  investorId: string;
  investor_id?: string;
  founderName: string;
  founder_name?: string;
  investorName: string;
  investor_name?: string;
  founderEmail: string;
  investorEmail: string;
  investorFirm: string;
  startupId: string;
  startupName: string;
  fundingAmount: string;
  fundingStage: string;
  shortIntro: string;
  whySeeking: string;
  optionalMessage?: string;
  form_data: InvestorConnectionFormData;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'COMPLETED' | 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
  responseNote?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
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
  REQUESTS: 'investor_connection_requests',
  MESSAGES: 'ai_startup_builder_investor_messages',
  MEETINGS: 'ai_startup_builder_investor_meetings',
  TRANSACTIONS: 'ai_startup_builder_funding_transactions',
  VISIBILITY: 'ai_startup_builder_startup_visibility',
};

// ─── Initial Seed Data ───

const INITIAL_REQUESTS: InvestmentRequest[] = [
  {
    id: 'req_conn_demo_1',
    founderId: 'f_1',
    founder_id: 'f_1',
    investorId: 'inv_1',
    investor_id: 'inv_1',
    founderName: 'Renu Gopal',
    founder_name: 'Renu Gopal',
    founderEmail: 'renugopal24022000@gmail.com',
    investorName: 'Rakesh',
    investor_name: 'Rakesh',
    investorEmail: 'rakesh@investor.com',
    investorFirm: 'Nexus Venture Partners',
    startupId: 'startup_mock_1',
    startupName: 'Tourists Platform AI',
    fundingAmount: '₹50,00,000',
    fundingStage: 'Seed',
    shortIntro: 'Requesting investment for Tourists Platform AI. Hyper-personalized AI itinerary and travel booking copilot.',
    whySeeking: 'Seeking investment from Nexus Venture Partners due to your strong track record in AI & Consumer Tech startups.',
    optionalMessage: 'We have 10k monthly active users and 40% MoM growth. Would love to present our pitch deck.',
    form_data: {
      startupId: 'startup_mock_1',
      startupName: 'Tourists Platform AI',
      fundingAmount: '₹50,00,000',
      fundingStage: 'Seed',
      shortIntro: 'Requesting investment for Tourists Platform AI. Hyper-personalized AI itinerary and travel booking copilot.',
      whySeeking: 'Seeking investment from Nexus Venture Partners due to your strong track record in AI & Consumer Tech startups.',
      optionalMessage: 'We have 10k monthly active users and 40% MoM growth. Would love to present our pitch deck.',
      founderEmail: 'renugopal24022000@gmail.com',
      investorEmail: 'rakesh@investor.com',
      investorFirm: 'Nexus Venture Partners',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req_conn_demo_2',
    founderId: 'f_2',
    founder_id: 'f_2',
    investorId: 'inv_1',
    investor_id: 'inv_1',
    founderName: 'Ananya Sharma',
    founder_name: 'Ananya Sharma',
    founderEmail: 'ananya@healthpulse.ai',
    investorName: 'Rakesh',
    investor_name: 'Rakesh',
    investorEmail: 'rakesh@investor.com',
    investorFirm: 'Nexus Venture Partners',
    startupId: 'startup_mock_2',
    startupName: 'HealthPulse AI',
    fundingAmount: '₹1,00,00,000',
    fundingStage: 'Pre-Seed',
    shortIntro: 'Building predictive diagnostic workflow AI for clinics and diagnostic labs.',
    whySeeking: 'Looking for seed lead investors with HealthTech domain expertise.',
    optionalMessage: 'Completed clinical trials with 94% diagnostic precision.',
    form_data: {
      startupId: 'startup_mock_2',
      startupName: 'HealthPulse AI',
      fundingAmount: '₹1,00,00,000',
      fundingStage: 'Pre-Seed',
      shortIntro: 'Building predictive diagnostic workflow AI for clinics and diagnostic labs.',
      whySeeking: 'Looking for seed lead investors with HealthTech domain expertise.',
      optionalMessage: 'Completed clinical trials with 94% diagnostic precision.',
      founderEmail: 'ananya@healthpulse.ai',
      investorEmail: 'rakesh@investor.com',
      investorFirm: 'Nexus Venture Partners',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
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
    const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS) || localStorage.getItem('ai_startup_builder_investment_requests');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem('ai_startup_builder_investment_requests', JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
};

export const saveInvestmentRequest = (reqData: {
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
}): InvestmentRequest => {
  const nowIso = new Date().toISOString();
  const reqId = `req_conn_${Date.now()}`;

  const formData: InvestorConnectionFormData = {
    startupId: reqData.startupId,
    startupName: reqData.startupName,
    fundingAmount: reqData.fundingAmount,
    fundingStage: reqData.fundingStage,
    shortIntro: reqData.shortIntro,
    whySeeking: reqData.whySeeking,
    optionalMessage: reqData.optionalMessage || '',
    founderEmail: reqData.founderEmail,
    investorEmail: reqData.investorEmail,
    investorFirm: reqData.investorFirm,
  };

  const newReq: InvestmentRequest = {
    id: reqId,
    founderId: reqData.founderId,
    founder_id: reqData.founderId,
    investorId: reqData.investorId,
    investor_id: reqData.investorId,
    founderName: reqData.founderName,
    founder_name: reqData.founderName,
    investorName: reqData.investorName,
    investor_name: reqData.investorName,
    founderEmail: reqData.founderEmail,
    investorEmail: reqData.investorEmail,
    investorFirm: reqData.investorFirm,
    startupId: reqData.startupId,
    startupName: reqData.startupName,
    fundingAmount: reqData.fundingAmount,
    fundingStage: reqData.fundingStage,
    shortIntro: reqData.shortIntro,
    whySeeking: reqData.whySeeking,
    optionalMessage: reqData.optionalMessage,
    form_data: formData,
    status: 'pending',
    createdAt: nowIso,
    created_at: nowIso,
    updatedAt: nowIso,
    updated_at: nowIso,
  };

  // 1. Create single source of truth Investor Connection Request record
  const requests = getInvestmentRequests();
  const updated = [newReq, ...requests];
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));

  // Also sync to legacy key for backwards compatibility
  try {
    localStorage.setItem('ai_startup_builder_investment_requests', JSON.stringify(updated));
  } catch (e) {}

  // 2. Transactionally create notifications for Investor and Admin
  try {
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const reqDetailsText = [
      `Startup: ${reqData.startupName}`,
      `Funding Stage: ${reqData.fundingStage}`,
      `Funding Requirement: ${reqData.fundingAmount}`,
      `Short Intro: ${reqData.shortIntro}`,
      `Why Seeking: ${reqData.whySeeking}`,
      reqData.optionalMessage ? `Optional Note: ${reqData.optionalMessage}` : ''
    ].filter(Boolean).join('\n');

    // Admin Investor Notification
    const adminNotif = {
      id: `notif_conn_admin_${Date.now()}`,
      userId: 'admin',
      targetRole: 'investor',
      title: 'New Investor Connection Request',
      message: `Founder: ${reqData.founderName}\nInvestor: ${reqData.investorName}\nRequest Date: ${formattedDate}\n\nRequest Details:\n${reqDetailsText}\n\nStatus:\nPending`,
      type: 'investor',
      isRead: false,
      actionUrl: '/dashboard/investor/requests',
      createdAt: nowIso,
    };

    // Investor Notification
    const investorNotif = {
      id: `notif_conn_inv_${Date.now()}`,
      userId: reqData.investorId || reqData.investorEmail,
      userEmail: reqData.investorEmail,
      targetRole: 'investor',
      title: `New Investor Connection Request from ${reqData.founderName}`,
      message: `${reqData.founderName} sent a connection request for ${reqData.startupName} (${reqData.fundingStage} • ${reqData.fundingAmount}).`,
      type: 'investor',
      isRead: false,
      actionUrl: '/dashboard/investor/requests',
      createdAt: nowIso,
    };

    const storedNotifs = localStorage.getItem('ai_startup_builder_notifications');
    const parsedNotifs = storedNotifs ? JSON.parse(storedNotifs) : [];
    localStorage.setItem('ai_startup_builder_notifications', JSON.stringify([adminNotif, investorNotif, ...parsedNotifs]));
  } catch (err) {
    console.warn('Could not save connection request notifications:', err);
  }

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investment_requests_updated'));
  window.dispatchEvent(new Event('notifications_updated'));
  return newReq;
};

export const updateInvestmentRequestStatus = (requestId: string, newStatus: InvestmentRequest['status'], responseNote?: string): void => {
  const requests = getInvestmentRequests();
  let targetReq: InvestmentRequest | null = null;
  const normalizedStatus = (newStatus || 'pending').toLowerCase() as InvestmentRequest['status'];

  const updated = requests.map(r => {
    if (r.id === requestId) {
      targetReq = {
        ...r,
        status: normalizedStatus,
        responseNote: responseNote || r.responseNote,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return targetReq;
    }
    return r;
  });
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
  try {
    localStorage.setItem('ai_startup_builder_investment_requests', JSON.stringify(updated));
  } catch (e) {}

  // Generate notifications for Founder and Admin when Investor accepts/declines proposal
  if (targetReq) {
    try {
      const nowIso = new Date().toISOString();
      const isAccepted = newStatus === 'ACCEPTED';
      const isRejected = newStatus === 'REJECTED';

      if (isAccepted || isRejected) {
        // Notification for Founder
        const founderNotif = {
          id: `notif_resp_fnd_${Date.now()}`,
          userId: targetReq.founderId || targetReq.founderEmail,
          userEmail: targetReq.founderEmail,
          targetRole: 'founder',
          title: isAccepted ? `Connection Accepted by ${targetReq.investorName}` : `Request Update from ${targetReq.investorName}`,
          message: isAccepted
            ? `${targetReq.investorName} (${targetReq.investorFirm}) accepted your connection request for ${targetReq.startupName}! You can now start messaging or schedule a meeting.`
            : `${targetReq.investorName} (${targetReq.investorFirm}) declined your investment request for ${targetReq.startupName}.`,
          type: 'funding',
          isRead: false,
          actionUrl: '/dashboard/founder/investment-requests',
          createdAt: nowIso,
        };

        // Notification for Admin
        const adminNotif = {
          id: `notif_resp_adm_${Date.now()}`,
          userId: 'admin',
          targetRole: 'investor',
          title: `Connection Request ${isAccepted ? 'Accepted' : 'Declined'}`,
          message: `${targetReq.investorName} (${targetReq.investorFirm}) ${isAccepted ? 'accepted' : 'declined'} the connection request from ${targetReq.founderName} for ${targetReq.startupName}.`,
          type: 'funding',
          isRead: false,
          actionUrl: '/dashboard/admin/investors',
          createdAt: nowIso,
        };

        const storedNotifs = localStorage.getItem('ai_startup_builder_notifications');
        const parsedNotifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        localStorage.setItem('ai_startup_builder_notifications', JSON.stringify([founderNotif, adminNotif, ...parsedNotifs]));
      }
    } catch (err) {
      console.warn('Could not save status update notifications:', err);
    }
  }

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investment_requests_updated'));
  window.dispatchEvent(new Event('notifications_updated'));
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
  // By default, set empty map
  const defaults = {};
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
