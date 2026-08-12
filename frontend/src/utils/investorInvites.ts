import { API_URL } from '../config/api';

export interface InvestorInviteLead {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  designation?: string;
  investorType: string;
  linkedinUrl: string;
  website?: string;
  location?: string;
  interestedIndustries?: string[];
  investmentStage?: string[];
  investmentRange?: string;
  adminNotes?: string;
  invitationToken: string;
  inviteUrl: string;
  status: 'INVITED' | 'ACCEPTED' | 'EXPIRED' | 'DISABLED';
  createdAt: string;
  expiryDate: string;
  acceptedAt?: string;
}

const STORAGE_KEY = 'ai_startup_builder_investor_invite_leads';

export const INITIAL_INVESTOR_LEADS: InvestorInviteLead[] = [
  {
    id: 'inv_lead_1',
    fullName: 'Rajesh Singhania',
    email: 'rajesh@singhaniavc.com',
    phone: '+91 98765 43210',
    companyName: 'Singhania Family Office',
    designation: 'Managing Partner',
    investorType: 'Family Office',
    linkedinUrl: 'https://linkedin.com/in/rajesh-singhania-vc',
    website: 'https://singhaniavc.com',
    location: 'Mumbai, India',
    interestedIndustries: ['Artificial Intelligence', 'SaaS', 'FinTech'],
    investmentStage: ['Seed', 'Series A'],
    investmentRange: '₹25 Lakhs – ₹1 Crore',
    adminNotes: 'Found via LinkedIn. Expressed interest in early-stage AI SaaS startups.',
    invitationToken: 'inv_token_singhania_9912',
    inviteUrl: `${window.location.origin}/investor-signup?invitationToken=inv_token_singhania_9912`,
    status: 'INVITED',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv_lead_2',
    fullName: 'Ananya Deshmukh',
    email: 'ananya@angelnetwork.in',
    phone: '+91 91234 56789',
    companyName: 'Indian Angel Network',
    designation: 'Angel Investor',
    investorType: 'Angel Investor',
    linkedinUrl: 'https://linkedin.com/in/ananya-deshmukh-angel',
    website: 'https://angelnetwork.in',
    location: 'Bengaluru, India',
    interestedIndustries: ['HealthTech', 'EdTech', 'SaaS'],
    investmentStage: ['Pre-Seed', 'Seed'],
    investmentRange: '₹5 Lakhs – ₹25 Lakhs',
    adminNotes: 'Active angel investor in B2B SaaS and Healthcare technology.',
    invitationToken: 'inv_token_ananya_8810',
    inviteUrl: `${window.location.origin}/investor-signup?invitationToken=inv_token_ananya_8810`,
    status: 'INVITED',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const getInvestorLeads = (): InvestorInviteLead[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVESTOR_LEADS));
  return INITIAL_INVESTOR_LEADS;
};

export const saveInvestorLead = (lead: Omit<InvestorInviteLead, 'id' | 'invitationToken' | 'inviteUrl' | 'status' | 'createdAt' | 'expiryDate'>): InvestorInviteLead => {
  const token = `inv_tok_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const origin = window.location.origin || 'http://localhost:5173';
  const newLead: InvestorInviteLead = {
    id: `inv_lead_${Date.now()}`,
    ...lead,
    invitationToken: token,
    inviteUrl: `${origin}/investor-signup?invitationToken=${token}`,
    status: 'INVITED',
    createdAt: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const leads = getInvestorLeads();
  const updated = [newLead, ...leads];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investor_invites_updated'));
  return newLead;
};

export const getLeadByToken = (token: string): InvestorInviteLead | null => {
  const leads = getInvestorLeads();
  return leads.find(l => l.invitationToken === token) || null;
};
