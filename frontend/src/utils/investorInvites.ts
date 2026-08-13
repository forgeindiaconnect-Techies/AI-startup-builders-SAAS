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
    inviteUrl: `${origin}/investor-signup?invitationToken=${token}&fullName=${encodeURIComponent(lead.fullName)}&email=${encodeURIComponent(lead.email)}&linkedinUrl=${encodeURIComponent(lead.linkedinUrl)}`,
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

export const deleteInvestorLead = (id: string): void => {
  const leads = getInvestorLeads();
  const updated = leads.filter(l => l.id !== id && l.invitationToken !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('investor_invites_updated'));
};

export const INITIAL_INVESTOR_APPLICATIONS = [
  {
    id: 'INV-2026-9812',
    fullName: 'Dr. Vikramaditya Sen',
    email: 'vikram.sen@nexuscap.com',
    mobile: '+91 98200 11223',
    investorType: 'Investment Firm / VC',
    companyName: 'Nexus Capital India',
    designation: 'Senior Partner',
    experienceYears: '10+ years',
    location: 'Bengaluru, India',
    linkedinUrl: 'https://linkedin.com/in/vikram-sen-vc',
    website: 'https://nexuscap.com',
    bio: 'Partnering with early-stage Generative AI, SaaS, and DeepTech founders in India.',
    preferredIndustries: ['Artificial Intelligence', 'SaaS', 'DeepTech'],
    investmentStages: ['Seed', 'Series A'],
    investmentRange: '₹1 Crore – ₹5 Crores',
    preferredLocation: 'India',
    investmentFocus: 'Proprietary AI tech stack, scalable B2B SaaS revenue, strong founder domain depth.',
    previousExperience: '12 years in VC, led 20+ seed/series A investments across B2B SaaS and AI.',
    startupsInvestedCount: '24',
    portfolioCompanies: 'AI Flow Inc, CloudScale Systems, DataSense Labs',
    notableInvestments: 'Series A lead in CloudScale (Acquired for $45M)',
    areasOfExpertise: 'GTM Acceleration, Series A/B Syndication, Board Advisory',
    investmentThesis: 'AI infra and workflow automation layers will generate 10x value over non-AI SaaS.',
    kycDocName: 'Vikram_Govt_ID_Passport.pdf',
    kycDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
    orgProofName: 'Nexus_Capital_Registration_Cert.pdf',
    orgProofUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop',
    supportingDocName: 'Fund_II_Authorization_Letter.pdf',
    supportingDocUrl: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop',
    status: 'PENDING_VERIFICATION',
    adminNotes: 'Met via LinkedIn outreach. High conviction lead for AI startup syndicate.',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INV-2026-7734',
    fullName: 'Priya Nambiar',
    email: 'priya@nambiarfamily.in',
    mobile: '+91 99300 44556',
    investorType: 'Angel Investor',
    companyName: 'Nambiar Capital',
    designation: 'Angel Investor & Advisor',
    experienceYears: '5 - 10 years',
    location: 'Mumbai, India',
    linkedinUrl: 'https://linkedin.com/in/priya-nambiar-angel',
    website: 'https://nambiarcapital.in',
    bio: 'Ex-VP Product at FinTech unicorn. Active angel investor backing AI-driven FinTech & HealthTech.',
    preferredIndustries: ['FinTech', 'HealthTech', 'Artificial Intelligence'],
    investmentStages: ['Pre-Seed', 'Seed'],
    investmentRange: '₹25 Lakhs – ₹1 Crore',
    preferredLocation: 'India',
    previousExperience: 'Angel investor in 14 early stage companies with 3 exits.',
    startupsInvestedCount: '14',
    portfolioCompanies: 'PayFlow, MedPulse AI, CareConnect',
    status: 'APPROVED',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INV-2026-4410',
    fullName: 'Rohan Mehta',
    email: 'rohan.m@mehtaholdings.com',
    mobile: '+91 98111 22334',
    investorType: 'Individual Investor',
    companyName: 'Mehta Holdings',
    designation: 'Managing Director',
    experienceYears: '3 - 5 years',
    location: 'Delhi NCR, India',
    linkedinUrl: 'https://linkedin.com/in/rohan-mehta-investor',
    website: 'https://mehtaholdings.com',
    bio: 'Investing in consumer tech and AI-assisted e-commerce tools.',
    preferredIndustries: ['E-commerce', 'Consumer Technology'],
    investmentStages: ['Seed'],
    investmentRange: '₹5 Lakhs – ₹25 Lakhs',
    status: 'REJECTED',
    rejectionReason: 'Government ID verification image was unreadable and missing tax identification document.',
    submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    rejectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const getInvestorApplications = (): any[] => {
  try {
    const stored = localStorage.getItem('ai_startup_builder_investor_apps');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem('ai_startup_builder_investor_apps', JSON.stringify(INITIAL_INVESTOR_APPLICATIONS));
  return INITIAL_INVESTOR_APPLICATIONS;
};
