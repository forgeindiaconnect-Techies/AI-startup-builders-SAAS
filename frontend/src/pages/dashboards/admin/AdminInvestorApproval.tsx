import React, { useState, useEffect } from 'react';
import {
  TrendingUp, UserPlus, CheckCircle2, XCircle, Clock, Eye, AlertCircle,
  FileText, ShieldCheck, Mail, Phone, Building2, MapPin, Globe, Link2,
  Lock, Copy, Check, Search, Filter, Sparkles, AlertTriangle, ChevronRight,
  Shield, RefreshCw, X, ArrowUpRight, Trash2, Video, CalendarClock, Calendar,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { addNotification } from '../../../utils/localStorageHelper';
import { getInvestorLeads, saveInvestorLead, deleteInvestorLead, getInvestorApplications, type InvestorInviteLead } from '../../../utils/investorInvites';
import { getInvestorMeetingInvites, saveInvestorMeetingInvite, createInvestorMeeting, type InvestorMeetingInvite } from '../../../utils/investorModuleStorage';
import { API_URL } from '../../../config/api';

type TabType = 'all' | 'invited';

export interface InvestorApplication {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  investorType: string;
  companyName?: string;
  designation?: string;
  experienceYears?: string;
  location?: string;
  linkedinUrl?: string;
  website?: string;
  bio?: string;
  preferredIndustries?: string[];
  investmentStages?: string[];
  investmentRange?: string;
  preferredLocation?: string;
  investmentFocus?: string;
  previousExperience?: string;
  startupsInvestedCount?: string;
  portfolioCompanies?: string;
  notableInvestments?: string;
  areasOfExpertise?: string;
  investmentThesis?: string;
  kycDocUrl?: string;
  kycDocName?: string;
  panTaxDocUrl?: string;
  panTaxDocName?: string;
  addressProofUrl?: string;
  addressProofName?: string;
  investorProofUrl?: string;
  investorProofName?: string;
  orgProofUrl?: string;
  orgProofName?: string;
  repProofUrl?: string;
  repProofName?: string;
  supportingDocUrl?: string;
  supportingDocName?: string;
  additionalDocUrl?: string;
  additionalDocName?: string;
  status: 'INVITED' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  adminNotes?: string;
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  invitationToken?: string;
}

const INITIAL_INVESTOR_APPLICATIONS: InvestorApplication[] = [
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
    notableInvestments: 'Series A lead in CloudScale (Acquired for ₹370 Crores)',
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
    fullName: 'Ananya Deshmukh',
    email: 'ananya@angelnetwork.in',
    mobile: '+91 99300 44556',
    investorType: 'Angel Investor',
    companyName: 'Mumbai Angels Network',
    designation: 'Lead Investor',
    experienceYears: '5 - 10 years',
    location: 'Mumbai, India',
    linkedinUrl: 'https://linkedin.com/in/ananya-d-angel',
    website: 'https://angelnetwork.in',
    bio: 'Active angel investor focusing on B2B SaaS and AI productivity solutions.',
    preferredIndustries: ['Artificial Intelligence', 'FinTech', 'SaaS'],
    investmentStages: ['Pre-Seed', 'Seed'],
    investmentRange: '₹25 Lakhs – ₹1 Crore',
    preferredLocation: 'India',
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

const INDUSTRIES_LIST = [
  'Artificial Intelligence', 'SaaS', 'FinTech', 'HealthTech', 'EdTech',
  'Agritech', 'E-commerce', 'CleanTech', 'DeepTech', 'Cybersecurity', 'Consumer Technology', 'Other'
];

const STAGES_LIST = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth Stage'];
const RANGE_LIST = [
  '₹1 Lakh – ₹5 Lakhs', '₹5 Lakhs – ₹25 Lakhs', '₹25 Lakhs – ₹1 Crore',
  '₹1 Crore – ₹5 Crores', '₹5 Crores+'
];

const AdminInvestorApproval: React.FC = () => {
  const { getAllUsers, getToken, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('invited');
  const [applications, setApplications] = useState<InvestorApplication[]>([]);
  const [invitedLeads, setInvitedLeads] = useState<InvestorInviteLead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const hasAutoSelectedRef = React.useRef(false);
  const [selectedApp, setSelectedApp] = useState<InvestorApplication | null>(null);
  const [selectedLead, setSelectedLead] = useState<InvestorInviteLead | null>(null);

  // Meeting Link Modal State & Invites
  const [meetingModalApp, setMeetingModalApp] = useState<InvestorApplication | null>(null);
  const [copiedMeetingLink, setCopiedMeetingLink] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [meetingDateVal, setMeetingDateVal] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [meetingTimeVal, setMeetingTimeVal] = useState('11:00');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [existingInvite, setExistingInvite] = useState<InvestorMeetingInvite | null>(null);

  useEffect(() => {
    if (meetingModalApp) {
      const invites = getInvestorMeetingInvites();
      const match = invites.find(
        i => i.investorId === meetingModalApp.id || i.investorEmail.toLowerCase() === meetingModalApp.email.toLowerCase()
      );
      if (match) {
        setExistingInvite(match);
        if (match.meetingDate) setMeetingDateVal(match.meetingDate);
        if (match.meetingTime) setMeetingTimeVal(match.meetingTime);
      } else {
        setExistingInvite(null);
      }
    }
  }, [meetingModalApp]);

  // 1. Action: Send Email Notification to Investor's Email
  const handleSendMeetingInvite = async () => {
    if (!meetingModalApp) return;
    setIsSendingInvite(true);

    const videoUrl = `https://meet.jit.si/ai-startup-builder-investor-${meetingModalApp.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const passcode = `INV-${meetingModalApp.id.slice(-4)}`;

    let apiSentSuccess = false;
    try {
      const response = await fetch(`${API_URL}/invites/send-meeting-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: meetingModalApp.email,
          fullName: meetingModalApp.fullName,
          meetingDate: meetingDateVal,
          meetingTime: meetingTimeVal,
          videoUrl,
          passcode
        })
      });
      const data = await response.json();
      if (data.success) {
        apiSentSuccess = true;
      }
    } catch (err) {
      console.error('Failed to send meeting invite via Brevo API:', err);
    }

    const newInvite: InvestorMeetingInvite = {
      id: existingInvite?.id || `mtg_${Date.now()}`,
      investorId: meetingModalApp.id,
      investorName: meetingModalApp.fullName,
      investorEmail: meetingModalApp.email,
      investorType: meetingModalApp.investorType,
      firmName: meetingModalApp.companyName || 'Independent Investor',
      meetingDate: meetingDateVal,
      meetingTime: meetingTimeVal,
      timezone: 'IST (UTC+05:30)',
      duration: '45 Mins',
      videoUrl,
      passcode,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      createdAt: existingInvite?.createdAt || new Date().toISOString(),
    };

    saveInvestorMeetingInvite(newInvite);
    setExistingInvite(newInvite);
    setIsSendingInvite(false);

    // Add email notification record for Investor
    addNotification({
      userId: 'admin',
      title: 'Meeting Email Notification Dispatched',
      message: `Official accreditation meeting invitation sent to ${meetingModalApp.fullName} (${meetingModalApp.email}) for ${meetingDateVal} at ${meetingTimeVal} IST`,
      type: 'system',
    });

    if (apiSentSuccess) {
      alert(`Meeting invitation email successfully sent via Brevo to ${meetingModalApp.email}!`);
    } else {
      // Fallback to mailto link if API delivery fails
      alert(`Direct Brevo dispatch failed. Opening default email application as fallback...`);
      const emailSubject = encodeURIComponent(`Investor Accreditation & Meeting Invitation - AI Startup Builder`);
      const emailBody = encodeURIComponent(
        `Hello ${meetingModalApp.fullName},\n\n` +
        `We would like to invite you for a virtual interview and accreditation review meeting.\n\n` +
        `Meeting Schedule Details:\n` +
        `- Date: ${meetingDateVal}\n` +
        `- Time: ${meetingTimeVal} IST (UTC+05:30)\n` +
        `- Duration: 45 Mins\n\n` +
        `Video Call Connection:\n` +
        `- Link: ${videoUrl}\n` +
        `- Passcode: ${passcode}\n\n` +
        `Please let us know if you have any questions or require adjustments to the schedule.\n\n` +
        `Best regards,\n` +
        `Admin Team`
      );
      window.location.href = `mailto:${meetingModalApp.email}?subject=${emailSubject}&body=${emailBody}`;
    }
  };

  // 2. Action: Send Invite Link to BOTH Founder & Investor Dashboard Meetings pages
  const handleSendInviteLink = async () => {
    if (!meetingModalApp) return;
    setIsSendingLink(true);

    const videoUrl = `https://meet.jit.si/ai-startup-builder-investor-${meetingModalApp.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const passcode = `INV-${meetingModalApp.id.slice(-4)}`;

    await new Promise(res => setTimeout(res, 850));

    // A. Save to Investor Meetings Schedule
    const newInvite: InvestorMeetingInvite = {
      id: existingInvite?.id || `mtg_${Date.now()}`,
      investorId: meetingModalApp.id,
      investorName: meetingModalApp.fullName,
      investorEmail: meetingModalApp.email,
      investorType: meetingModalApp.investorType,
      firmName: meetingModalApp.companyName || 'Independent Investor',
      meetingDate: meetingDateVal,
      meetingTime: meetingTimeVal,
      timezone: 'IST (UTC+05:30)',
      duration: '45 Mins',
      videoUrl,
      passcode,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      createdAt: existingInvite?.createdAt || new Date().toISOString(),
    };
    saveInvestorMeetingInvite(newInvite);

    // B. Save to Founder Meetings Schedule
    createInvestorMeeting({
      investorName: meetingModalApp.fullName,
      investorEmail: meetingModalApp.email,
      investorFirm: meetingModalApp.companyName || 'Independent Investor',
      founderEmail: 'renu@gmail.com',
      founderName: 'Renu',
      startupId: 'startup_general',
      startupName: 'Startup IT / Platform',
      proposedDate: meetingDateVal,
      proposedTime: meetingTimeVal,
      agenda: `Investor Accreditation & Pitch Review - Passcode: ${passcode}`,
      meetingLink: videoUrl,
      passcode,
      timezone: 'IST (UTC+05:30)',
      duration: '45 Mins',
      investorId: meetingModalApp.id,
      investorType: meetingModalApp.investorType
    });

    setExistingInvite(newInvite);
    setIsSendingLink(false);

    addNotification({
      userId: 'admin',
      title: 'Meeting Link Published to Dashboards',
      message: `Meeting invite for ${meetingModalApp.fullName} successfully sent to BOTH Founder and Investor Dashboard Meetings pages.`,
      type: 'system',
    });

    alert(`Meeting invite link successfully sent to BOTH Founder Dashboard & Investor Dashboard Meetings pages!`);
  };

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    designation: '',
    investorType: 'Angel Investor',
    linkedinUrl: '',
    website: '',
    location: '',
    interestedIndustries: [] as string[],
    investmentStage: [] as string[],
    investmentRange: '₹25 Lakhs – ₹1 Crore',
    adminNotes: '',
  });

  const [inviteResult, setInviteResult] = useState<InvestorInviteLead | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Rejection Dialog State
  const [rejectingApp, setRejectingApp] = useState<InvestorApplication | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  useEffect(() => {
    loadData();
  }, [getAllUsers]);

  useEffect(() => {
    window.addEventListener('storage', loadData);
    window.addEventListener('investor_invites_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('investor_invites_updated', loadData);
    };
  }, []);

  const loadData = () => {
    // 1. Load Applications from Local Storage (using getInvestorApplications)
    const loadedApps: InvestorApplication[] = getInvestorApplications();

    // 2. Load backend investor users
    const allBackendUsers = getAllUsers() || [];
    const backendInvestors: InvestorApplication[] = allBackendUsers
      .filter((u: any) => (u.role || '').toLowerCase() === 'investor')
      .map((u: any) => ({
        id: u.id || u._id || `INV-${u.email}`,
        fullName: u.fullName || u.name || 'Investor',
        email: u.email,
        mobile: u.mobile || '',
        investorType: u.investorType || u.investorCategory || 'Individual Investor',
        companyName: u.companyName || '',
        designation: u.designation || '',
        experienceYears: u.experienceYears || '',
        location: u.location || '',
        linkedinUrl: u.linkedin || u.linkedinUrl || '',
        website: u.website || '',
        bio: u.bio || '',
        preferredIndustries: Array.isArray(u.preferredIndustries) ? u.preferredIndustries : (u.preferredIndustry ? [u.preferredIndustry] : []),
        investmentStages: Array.isArray(u.investmentStages) ? u.investmentStages : [],
        investmentRange: u.investmentRange || (u.minInvestment ? `${u.minInvestment} - ${u.maxInvestment}` : ''),
        preferredLocation: u.preferredLocation || '',
        investmentFocus: u.investmentFocus || '',
        previousExperience: u.previousExperience || '',
        startupsInvestedCount: u.startupsInvestedCount || '',
        portfolioCompanies: u.portfolioCompanies || '',
        notableInvestments: u.notableInvestments || '',
        areasOfExpertise: u.areasOfExpertise || '',
        investmentThesis: u.investmentThesis || '',
        kycDocUrl: u.kycDocUrl || '',
        kycDocName: u.kycDocName || (u.kycDocUrl ? 'KYC_Document.pdf' : ''),
        panTaxDocUrl: u.panTaxDocUrl || u.panDocUrl || '',
        panTaxDocName: u.panTaxDocName || (u.panTaxDocUrl || u.panDocUrl ? 'PAN_Tax_ID.pdf' : ''),
        addressProofUrl: u.addressProofUrl || '',
        addressProofName: u.addressProofName || (u.addressProofUrl ? 'Address_Proof.pdf' : ''),
        investorProofUrl: u.investorProofUrl || '',
        investorProofName: u.investorProofName || (u.investorProofUrl ? 'Investor_Supporting_Doc.pdf' : ''),
        orgProofUrl: u.orgProofUrl || '',
        orgProofName: u.orgProofName || (u.orgProofUrl ? 'Org_Proof.pdf' : ''),
        repProofUrl: u.repProofUrl || '',
        repProofName: u.repProofName || (u.repProofUrl ? 'Rep_Proof.pdf' : ''),
        supportingDocUrl: u.supportingDocUrl || u.otherDocUrl || '',
        supportingDocName: u.supportingDocName || u.otherDocType || (u.supportingDocUrl ? 'Supporting_Doc.pdf' : ''),
        status: u.approvalStatus === 'approved' ? 'APPROVED' : u.approvalStatus === 'rejected' ? 'REJECTED' : 'PENDING_VERIFICATION',
        submittedAt: u.signupDate || u.createdAt || new Date().toISOString(),
      }));

    // Combine all apps without duplicating emails
    const existingEmails = new Set<string>();
    const mergedApps: InvestorApplication[] = [];

    for (const app of [...backendInvestors, ...loadedApps]) {
      if (app.email && !existingEmails.has(app.email.toLowerCase())) {
        existingEmails.add(app.email.toLowerCase());
        mergedApps.push(app);
      }
    }

    setApplications(mergedApps);

    // 3. Load Invited Leads (from localStorage + backend API)
    const localLeads = getInvestorLeads();
    setInvitedLeads(localLeads);

    try {
      fetch(`${API_URL}/invites`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.investorInvites)) {
            const backendLeads: InvestorInviteLead[] = data.investorInvites.map((inv: any) => ({
              id: inv.id,
              fullName: inv.fullName,
              email: inv.email,
              phone: inv.phone || '',
              companyName: inv.companyName || '',
              designation: inv.designation || '',
              investorType: inv.investorType || 'Angel Investor',
              linkedinUrl: inv.linkedinUrl || '',
              website: inv.website || '',
              location: inv.location || '',
              interestedIndustries: inv.interestedIndustries || [],
              investmentStage: inv.investmentStage || [],
              investmentRange: inv.investmentRange || '',
              adminNotes: inv.adminNotes || '',
              invitationToken: inv.invitationToken || '',
              inviteUrl: inv.inviteUrl || '',
              status: inv.status || 'INVITED',
              createdAt: inv.createdAt || new Date().toISOString(),
              expiryDate: inv.expiryDate || '',
            }));

            const mergedMap = new Map<string, InvestorInviteLead>();
            [...backendLeads, ...localLeads].forEach(l => {
              if (l.email && !mergedMap.has(l.email.toLowerCase())) {
                mergedMap.set(l.email.toLowerCase(), l);
              }
            });
            const finalLeads = Array.from(mergedMap.values());
            setInvitedLeads(finalLeads);
          }
        })
        .catch(() => {});
    } catch {}

    // Auto-select tab ONLY ONCE on initial load
    if (!hasAutoSelectedRef.current) {
      setActiveTab('invited');
      hasAutoSelectedRef.current = true;
    }
  };

  const handleSaveApplications = (newApps: InvestorApplication[]) => {
    setApplications(newApps);
    localStorage.setItem('ai_startup_builder_investor_apps', JSON.stringify(newApps));
    window.dispatchEvent(new Event('storage'));
  };

  // ── Send Investor Invitation (Admin) ───────────────────────────────────────
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.fullName || !inviteForm.email || !inviteForm.linkedinUrl) {
      alert('Full Name, Email Address, and LinkedIn Profile URL are required!');
      return;
    }

    // 1. Save local lead copy
    const lead = saveInvestorLead({
      fullName: inviteForm.fullName,
      email: inviteForm.email,
      phone: inviteForm.phone,
      companyName: inviteForm.companyName,
      designation: inviteForm.designation,
      investorType: inviteForm.investorType,
      linkedinUrl: inviteForm.linkedinUrl,
      website: inviteForm.website,
      location: inviteForm.location,
      interestedIndustries: inviteForm.interestedIndustries,
      investmentStage: inviteForm.investmentStage,
      investmentRange: inviteForm.investmentRange,
      adminNotes: inviteForm.adminNotes,
    });

    setInviteResult(lead);
    setInvitedLeads(getInvestorLeads());

    // 2. Call backend API to trigger real email delivery via Brevo
    try {
      const res = await fetch(`${API_URL}/invites/investor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: inviteForm.fullName,
          email: inviteForm.email,
          phone: inviteForm.phone,
          companyName: inviteForm.companyName,
          designation: inviteForm.designation,
          investorType: inviteForm.investorType,
          linkedinUrl: inviteForm.linkedinUrl,
          website: inviteForm.website,
          location: inviteForm.location,
          interestedIndustries: inviteForm.interestedIndustries,
          investmentStage: inviteForm.investmentStage,
          investmentRange: inviteForm.investmentRange,
          adminNotes: inviteForm.adminNotes,
        }),
      });
      const json = await res.json();
      if (json.success && json.invite?.inviteUrl) {
        setInviteResult(prev => prev ? { ...prev, inviteUrl: json.invite.inviteUrl, invitationToken: json.invite.invitationToken } : lead);
      }
    } catch (err) {
      console.warn('Backend invite notification API call fallback:', err);
    }

    setInviteForm({
      fullName: '', email: '', phone: '', companyName: '', designation: '',
      investorType: 'Angel Investor', linkedinUrl: '', website: '', location: '',
      interestedIndustries: [], investmentStage: [], investmentRange: '₹25 Lakhs – ₹1 Crore', adminNotes: ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ── Approve Investor ────────────────────────────────────────────────────────
  const handleApprove = async (app: InvestorApplication) => {
    const updated = applications.map(a =>
      a.id === app.id ? { ...a, status: 'APPROVED' as const, approvedAt: new Date().toISOString() } : a
    );
    handleSaveApplications(updated);

    // Try backend API update if available
    const token = getToken();
    try {
      await fetch(`${API_URL}/auth/admin/users/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId: app.id, action: 'approve' }),
      });
      refreshUsers();
    } catch {}

    // Send notification
    addNotification({
      id: Date.now() + Math.random(),
      userId: app.email,
      title: 'Investor Accreditation Approved! 🎉',
      desc: `Your investor profile (${app.fullName}) has been approved by Admin. You now have full access to the Investor Dashboard and Marketplace.`,
      time: 'Just now',
      read: false,
      link: '/dashboard/investor',
    });

    if (selectedApp?.id === app.id) setSelectedApp({ ...app, status: 'APPROVED' });
    alert(`✅ Investor ${app.fullName} has been approved successfully! Status: APPROVED.`);
  };

  // ── Reject Investor ─────────────────────────────────────────────────────────
  const handleConfirmReject = async () => {
    if (!rejectingApp || !rejectionReasonText.trim()) {
      alert('Please state a clear rejection reason.');
      return;
    }

    const updated = applications.map(a =>
      a.id === rejectingApp.id ? {
        ...a,
        status: 'REJECTED' as const,
        rejectionReason: rejectionReasonText.trim(),
        rejectedAt: new Date().toISOString()
      } : a
    );
    handleSaveApplications(updated);

    // Try backend API call
    const token = getToken();
    try {
      await fetch(`${API_URL}/auth/admin/users/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId: rejectingApp.id, action: 'reject', rejectionReason: rejectionReasonText.trim() }),
      });
      refreshUsers();
    } catch {}

    // Send notification
    addNotification({
      id: Date.now() + Math.random(),
      userId: rejectingApp.email,
      title: 'Investor Application Status Update ⚠️',
      desc: `Your investor application requires correction. Reason: "${rejectionReasonText.trim()}". Please update your information and resubmit.`,
      time: 'Just now',
      read: false,
      link: '/investor-signup',
    });

    if (selectedApp?.id === rejectingApp.id) {
      setSelectedApp({ ...rejectingApp, status: 'REJECTED', rejectionReason: rejectionReasonText.trim() });
    }
    setRejectingApp(null);
    setRejectionReasonText('');
    alert(`Investor application marked as REJECTED.`);
  };

  const handleSuspend = async (app: InvestorApplication) => {
    if (!window.confirm(`Are you sure you want to suspend access for ${app.fullName}?`)) return;
    const updated = applications.map(a =>
      a.id === app.id ? { ...a, status: 'SUSPENDED' as const } : a
    );
    handleSaveApplications(updated);
    if (selectedApp?.id === app.id) setSelectedApp({ ...app, status: 'SUSPENDED' });

    const token = getToken();
    try {
      await fetch(`${API_URL}/auth/admin/users/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId: app.id, action: 'updateStatus', status: 'suspended' }),
      });
      refreshUsers();
    } catch {}
  };

  const handleDeleteLead = async (lead: InvestorInviteLead) => {
    deleteInvestorLead(lead.id);
    setInvitedLeads(getInvestorLeads());

    try {
      await fetch(`${API_URL}/invites/${lead.invitationToken}`, {
        method: 'DELETE',
      });
    } catch {}
  };

  // ── Delete Investor Application ─────────────────────────────────────────────
  const handleDeleteApp = async (app: InvestorApplication) => {

    const updated = applications.filter(a => a.id !== app.id && a.email?.toLowerCase() !== app.email?.toLowerCase());
    handleSaveApplications(updated);

    const token = getToken();
    try {
      await fetch(`${API_URL}/auth/admin/users/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId: app.id, action: 'delete' }),
      });
      refreshUsers();
    } catch {}

    if (selectedApp?.id === app.id) setSelectedApp(null);
  };

  // Filtered lists
  const filteredApps = applications.filter(a => {
    const matchesSearch = (a.fullName + a.email + (a.companyName || '') + (a.investorType || '')).toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    return true;
  });

  const filteredInvitedLeads = invitedLeads.filter(l =>
    (l.fullName + l.email + (l.companyName || '')).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 bg-[#FAFAFA] min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#6C4CF1] via-[#5B21B6] to-[#4C1D95] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-[-5%] top-[-20%] w-[350px] h-[350px] rounded-full bg-[#F59E0B]/20 blur-[90px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
              <TrendingUp size={14} className="text-[#FBBF24]" /> Investor Management & Accreditation
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Investor Management</h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-xl">
              Find potential investors on LinkedIn or external networks, issue secure investor invitations, verify documents, and approve platform access.
            </p>
          </div>

          <button
            onClick={() => { setShowInviteModal(true); setInviteResult(null); }}
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 shrink-0 group cursor-pointer"
          >
            <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> + Invite Investor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 max-w-xl">
        <button
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'all' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
          }`}
        >
          <p className={`text-[11px] font-extrabold uppercase ${activeTab === 'all' ? 'text-gray-300' : 'text-gray-400'}`}>Total Leads</p>
          <p className={`text-2xl font-black mt-1 ${activeTab === 'all' ? 'text-white' : 'text-gray-900'}`}>{applications.length + invitedLeads.length}</p>
        </button>

        <button
          onClick={() => setActiveTab('invited')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'invited' ? 'bg-[#6C4CF1] text-white border-[#6C4CF1] shadow-md' : 'bg-white border-purple-100 hover:border-purple-300 shadow-sm'
          }`}
        >
          <p className={`text-[11px] font-extrabold uppercase ${activeTab === 'invited' ? 'text-purple-200' : 'text-[#6C4CF1]'}`}>Invited Leads</p>
          <p className={`text-2xl font-black mt-1 ${activeTab === 'invited' ? 'text-white' : 'text-[#6C4CF1]'}`}>{invitedLeads.length}</p>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'invited', label: 'Invited', count: invitedLeads.length },
            { id: 'all', label: 'All Investors', count: applications.length + invitedLeads.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#6C4CF1] text-white shadow-md shadow-purple-500/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search investors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6C4CF1]"
          />
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="space-y-8">
        {(activeTab === 'invited' || activeTab === 'all') && (
          /* Invited Leads Table */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Mail size={18} className="text-[#6C4CF1]" /> Admin Investor Invitations ({filteredInvitedLeads.length})
              </h3>
              <span className="text-xs text-gray-400">Outreach invitations created by Admin</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-[11px] font-extrabold uppercase text-gray-400 border-b border-gray-100">
                    <th className="p-4">Investor Name</th>
                    <th className="p-4">Type & Firm</th>
                    <th className="p-4">LinkedIn / Contact</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Invitation Link</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {filteredInvitedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No invitations match the current search filter. Click <strong>"+ Invite Investor"</strong> to issue a new invitation.
                      </td>
                    </tr>
                  ) : (
                    filteredInvitedLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{lead.fullName}</p>
                          <p className="text-[11px] text-gray-400">{lead.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#6C4CF1] border border-purple-100 inline-block mb-1">
                            {lead.investorType}
                          </span>
                          <p className="text-[11px] text-gray-600">{lead.companyName || 'N/A'}</p>
                        </td>
                        <td className="p-4">
                          <a href={lead.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#6C4CF1] hover:underline font-bold inline-flex items-center gap-1">
                            LinkedIn Profile <ArrowUpRight size={12} />
                          </a>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1.5">
                            <input readOnly value={lead.inviteUrl} className="bg-transparent text-[10px] font-mono text-gray-600 truncate flex-1 focus:outline-none" />
                            <button onClick={() => copyToClipboard(lead.inviteUrl)} className="p-1 text-gray-500 hover:text-[#6C4CF1]" title="Copy link">
                              <Copy size={13} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="px-3 py-1.5 bg-purple-50 text-[#6C4CF1] font-bold rounded-lg hover:bg-purple-100 text-xs transition-colors flex items-center gap-1 border border-purple-100"
                              title="View Investor Invitation Details"
                            >
                              <Eye size={13} /> View Details
                            </button>
                            <button
                              onClick={() => copyToClipboard(lead.inviteUrl)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 text-xs transition-colors flex items-center gap-1"
                              title="Copy Invitation Link"
                            >
                              <Copy size={13} /> Copy Link
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 text-xs transition-colors flex items-center gap-1 border border-red-200"
                              title="Delete Invitation"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab !== 'invited' && (
          /* Applications List Cards / Table */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#6C4CF1]" /> Investor Applications ({filteredApps.length})
              </h3>
            </div>

          <div className="divide-y divide-gray-100">
            {filteredApps.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No investor applications found in this tab.
              </div>
            ) : (
              filteredApps.map(app => (
                <div key={app.id} className="p-6 hover:bg-gray-50/50 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C4CF1] to-[#5B21B6] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-purple-500/20">
                      {app.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-base">{app.fullName}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          app.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200' :
                          app.status === 'SUSPENDED' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">({app.id})</span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        <strong>{app.investorType}</strong> {app.companyName ? `• ${app.companyName}` : ''} {app.location ? `• ${app.location}` : ''}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
                        <span>Email: <strong className="text-gray-900">{app.email}</strong></span>
                        {app.investmentRange && <span>Cheque: <strong className="text-[#6C4CF1]">{app.investmentRange}</strong></span>}
                      </div>

                      {app.status === 'REJECTED' && app.rejectionReason && (
                        <p className="text-xs text-red-600 font-medium mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                          Rejection Reason: "{app.rejectionReason}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Eye size={15} /> View Full Profile & Docs
                    </button>

                    <button
                      onClick={() => setMeetingModalApp(app)}
                      className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#6C4CF1] border border-purple-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      title="View or Schedule Meeting Link for Investor"
                    >
                      <Video size={15} /> Meeting Link
                    </button>

                    {app.status === 'PENDING_VERIFICATION' && (
                      <>
                        <button
                          onClick={() => handleApprove(app)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={15} /> Approve
                        </button>
                        <button
                          onClick={() => { setRejectingApp(app); setRejectionReasonText(''); }}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    )}

                    {app.status === 'APPROVED' && (
                      <button
                        onClick={() => handleSuspend(app)}
                        className="px-3.5 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold rounded-xl transition-colors"
                      >
                        Suspend
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteApp(app)}
                      className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      title="Delete Application"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>

      {/* ── MODAL 1: INVITE INVESTOR ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            {!inviteResult ? (
              <form onSubmit={handleCreateInvitation} className="space-y-5">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-[#6C4CF1] border border-purple-100 inline-block mb-2">
                    LinkedIn / Outreach Investor Invitation
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invite Investor</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Add investor leads discovered on LinkedIn or external networks and generate an invitation token link.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={inviteForm.fullName}
                      onChange={e => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6C4CF1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="investor@firm.com"
                      value={inviteForm.email}
                      onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6C4CF1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">LinkedIn Profile URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://linkedin.com/in/profile"
                      value={inviteForm.linkedinUrl}
                      onChange={e => setInviteForm({ ...inviteForm, linkedinUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6C4CF1]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/20 hover:opacity-95"
                  >
                    Generate & Send Invitation
                  </button>
                </div>
              </form>
            ) : (
              /* Success Invitation Link View */
              <div className="text-center space-y-5 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Investor Invitation Generated!</h3>
                <p className="text-xs text-gray-500">
                  Invitation created for <strong>{inviteResult.fullName}</strong> ({inviteResult.email}).
                </p>

                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => { setShowInviteModal(false); setInviteResult(null); setActiveTab('invited'); }}
                    className="px-6 py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: FULL INVESTOR APPLICATION DETAILS ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 shrink-0 pr-14">
              <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                selectedApp.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                selectedApp.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                Status: {selectedApp.status}
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">{selectedApp.fullName}</h2>
              <p className="text-xs text-gray-500">{selectedApp.investorType} • Application ID: {selectedApp.id}</p>
            </div>

            <div className="p-6 sm:p-8 py-4 overflow-y-auto flex-1 space-y-6 text-xs text-gray-700">
              {/* Personal & Profile */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2 uppercase text-[11px] text-[#6C4CF1]">Personal & Professional Info</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><span className="text-gray-400 block">Email:</span> <strong>{selectedApp.email}</strong></div>
                  <div><span className="text-gray-400 block">Phone:</span> <strong>{selectedApp.mobile || 'N/A'}</strong></div>
                  <div><span className="text-gray-400 block">Location:</span> <strong>{selectedApp.location || 'N/A'}</strong></div>
                  <div><span className="text-gray-400 block">Firm:</span> <strong>{selectedApp.companyName || 'N/A'}</strong></div>
                  <div><span className="text-gray-400 block">Designation:</span> <strong>{selectedApp.designation || 'N/A'}</strong></div>
                  <div><span className="text-gray-400 block">Experience:</span> <strong>{selectedApp.experienceYears || 'N/A'}</strong></div>
                </div>
                {selectedApp.linkedinUrl && (
                  <div className="mt-3 border-t border-gray-200/60 pt-2">
                    <a href={selectedApp.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#6C4CF1] font-bold hover:underline inline-flex items-center gap-1">
                      LinkedIn Profile <ArrowUpRight size={12} />
                    </a>
                  </div>
                )}
                {selectedApp.bio && <p className="mt-2 text-gray-600 italic">"{selectedApp.bio}"</p>}
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2 uppercase text-[11px] text-[#6C4CF1]">Investment Preferences</h4>
                <div className="space-y-2">
                  <div><span className="text-gray-400">Industries:</span> <strong>{selectedApp.preferredIndustries?.join(', ') || 'N/A'}</strong></div>
                  <div><span className="text-gray-400">Stages:</span> <strong>{selectedApp.investmentStages?.join(', ') || 'N/A'}</strong></div>
                  <div><span className="text-gray-400">Investment Range:</span> <strong className="text-[#6C4CF1]">{selectedApp.investmentRange || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Verification Documents */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2 uppercase text-[11px] text-[#6C4CF1]">Submitted Verification Documents</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(selectedApp.kycDocName || selectedApp.kycDocUrl) && (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Govt ID / KYC</span>
                        <span className="font-bold text-gray-800 truncate text-xs block">{selectedApp.kycDocName || 'KYC_Document.pdf'}</span>
                      </div>
                      {selectedApp.kycDocUrl && (
                        <a href={selectedApp.kycDocUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-50 text-[#6C4CF1] rounded-lg font-bold text-[10px] hover:bg-purple-100 shrink-0">
                          View Doc
                        </a>
                      )}
                    </div>
                  )}
                  {(selectedApp.panTaxDocName || selectedApp.panTaxDocUrl) && (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">PAN / Tax ID</span>
                        <span className="font-bold text-gray-800 truncate text-xs block">{selectedApp.panTaxDocName || 'PAN_Tax_ID.pdf'}</span>
                      </div>
                      {selectedApp.panTaxDocUrl && (
                        <a href={selectedApp.panTaxDocUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-50 text-[#6C4CF1] rounded-lg font-bold text-[10px] hover:bg-purple-100 shrink-0">
                          View Doc
                        </a>
                      )}
                    </div>
                  )}
                  {(selectedApp.orgProofName || selectedApp.orgProofUrl) && (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Org / Fund Proof</span>
                        <span className="font-bold text-gray-800 truncate text-xs block">{selectedApp.orgProofName || 'Org_Proof.pdf'}</span>
                      </div>
                      {selectedApp.orgProofUrl && (
                        <a href={selectedApp.orgProofUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-50 text-[#6C4CF1] rounded-lg font-bold text-[10px] hover:bg-purple-100 shrink-0">
                          View Doc
                        </a>
                      )}
                    </div>
                  )}
                  {(selectedApp.repProofName || selectedApp.repProofUrl) && (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Authorized Rep Proof</span>
                        <span className="font-bold text-gray-800 truncate text-xs block">{selectedApp.repProofName || 'Rep_Proof.pdf'}</span>
                      </div>
                      {selectedApp.repProofUrl && (
                        <a href={selectedApp.repProofUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-50 text-[#6C4CF1] rounded-lg font-bold text-[10px] hover:bg-purple-100 shrink-0">
                          View Doc
                        </a>
                      )}
                    </div>
                  )}
                  {(selectedApp.supportingDocName || selectedApp.supportingDocUrl) && (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Supporting Document</span>
                        <span className="font-bold text-gray-800 truncate text-xs block">{selectedApp.supportingDocName || 'Supporting_Doc.pdf'}</span>
                      </div>
                      {selectedApp.supportingDocUrl && (
                        <a href={selectedApp.supportingDocUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-50 text-[#6C4CF1] rounded-lg font-bold text-[10px] hover:bg-purple-100 shrink-0">
                          View Doc
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-4 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50/50 rounded-b-3xl">
              {selectedApp.status === 'PENDING_VERIFICATION' ? (
                <>
                  <button
                    onClick={() => { const app = selectedApp; setSelectedApp(null); setRejectingApp(app); }}
                    className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded-xl hover:bg-red-100 cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp)}
                    className="px-6 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Approve & Activate Investor
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: REJECTION REASON DIALOG ── */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-lg font-black text-gray-900 mb-1">Reject Investor Application</h3>
            <p className="text-xs text-gray-500 mb-4">
              Specify the exact reason for rejecting <strong>{rejectingApp.fullName}</strong>. The applicant will be notified and allowed to resubmit corrected info.
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Government KYC ID image is blurred or missing organization tax proof."
              value={rejectionReasonText}
              onChange={e => setRejectionReasonText(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 mb-4 resize-none"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectingApp(null)} className="px-4 py-2 border text-xs font-bold text-gray-600 rounded-xl">
                Cancel
              </button>
              <button onClick={handleConfirmReject} className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: INVESTOR INVITATION LEAD DETAILS ── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 shrink-0 pr-14">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  Status: {selectedLead.status}
                </span>
                {selectedLead.investorType && selectedLead.investorType !== 'Angel Investor' && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#6C4CF1] border border-purple-100">
                    {selectedLead.investorType}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedLead.fullName}</h2>
              <p className="text-xs text-gray-500">{selectedLead.email}</p>
            </div>

            <div className="p-6 sm:p-8 py-4 overflow-y-auto flex-1 space-y-5 text-xs text-gray-700">
              {/* Profile Details (Name, Email, LinkedIn) */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                <h4 className="font-bold text-gray-900 uppercase text-[11px] text-[#6C4CF1] flex items-center gap-1.5">
                  <Mail size={14} /> Invitation Profile Details
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Full Name:</span>
                    <strong className="text-gray-900 font-bold">{selectedLead.fullName}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Email Address:</span>
                    <strong className="text-gray-900 font-bold">{selectedLead.email}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Investor Type / Category:</span>
                    <strong className="text-[#6C4CF1] font-bold">{selectedLead.investorType || 'Angel Investor'}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Firm / Company:</span>
                    <strong className="text-gray-900 font-bold">{selectedLead.companyName || '—'}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Designation / Role:</span>
                    <strong className="text-gray-900 font-bold">{selectedLead.designation || '—'}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Phone Number:</span>
                    <strong className="text-gray-900 font-bold">{selectedLead.phone || '—'}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Location:</span>
                    <strong className="text-gray-900 font-bold">{selectedLead.location || '—'}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">LinkedIn Profile:</span>
                    {selectedLead.linkedinUrl ? (
                      <a href={selectedLead.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#6C4CF1] font-bold hover:underline inline-flex items-center gap-1">
                        LinkedIn Profile <ArrowUpRight size={13} />
                      </a>
                    ) : <strong className="text-gray-900 font-bold">—</strong>}
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Website:</span>
                    {selectedLead.website ? (
                      <a href={selectedLead.website} target="_blank" rel="noreferrer" className="text-[#6C4CF1] font-bold hover:underline inline-flex items-center gap-1">
                        {selectedLead.website} <ArrowUpRight size={13} />
                      </a>
                    ) : <strong className="text-gray-900 font-bold">—</strong>}
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Investment Range:</span>
                    <strong className="text-[#6C4CF1] font-bold">{selectedLead.investmentRange || '—'}</strong>
                  </div>

                  <div className="flex items-start justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-gray-500 font-medium">Interested Industries:</span>
                    <strong className="text-gray-900 font-bold text-right max-w-[60%]">
                      {Array.isArray(selectedLead.interestedIndustries) && selectedLead.interestedIndustries.length > 0
                        ? selectedLead.interestedIndustries.join(', ')
                        : '—'}
                    </strong>
                  </div>

                  <div className="flex items-start justify-between pb-1">
                    <span className="text-gray-500 font-medium">Investment Stages:</span>
                    <strong className="text-gray-900 font-bold text-right max-w-[60%]">
                      {Array.isArray(selectedLead.investmentStage) && selectedLead.investmentStage.length > 0
                        ? selectedLead.investmentStage.join(', ')
                        : '—'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Admin Notes if present */}
              {selectedLead.adminNotes && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-amber-900 uppercase text-[11px] mb-1">Admin Notes</h4>
                  <p className="text-xs text-amber-800 italic">"{selectedLead.adminNotes}"</p>
                </div>
              )}

              {/* Invitation Token & Link */}
              <div className="bg-gray-900 text-white p-4 rounded-2xl space-y-2">
                <p className="text-[11px] font-extrabold uppercase text-amber-400">Unique Invitation Link</p>
                <div className="bg-gray-800 border border-gray-700 p-2.5 rounded-xl flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-gray-200 truncate flex-1">{selectedLead.inviteUrl}</span>
                  <button
                    onClick={() => copyToClipboard(selectedLead.inviteUrl)}
                    className="px-3 py-1.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <Check size={13} /> : <Copy size={13} />} {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>Issued On: {new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                  <span>Expires On: {new Date(selectedLead.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>

            </div>

            {/* Action Buttons Footer */}
            <div className="p-6 sm:p-8 pt-4 border-t border-gray-100 shrink-0 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
              <button
                onClick={() => { handleDeleteLead(selectedLead); setSelectedLead(null); }}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} /> Delete Invitation
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: MEETING LINK & ACCREDITATION DETAILS ── */}
      {meetingModalApp && (() => {
        const videoUrl = `https://meet.jit.si/ai-startup-builder-investor-${meetingModalApp.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        const passcode = `INV-${meetingModalApp.id.slice(-4)}`;
        const isSent = existingInvite?.status === 'SENT' || existingInvite?.status === 'ACCEPTED';
        const formattedSentDate = existingInvite?.sentAt
          ? new Date(existingInvite.sentAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '';

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 text-left">
              <button
                onClick={() => setMeetingModalApp(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <X size={20} />
              </button>

              {/* Fixed Header */}
              <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 shrink-0 pr-14">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6C4CF1] flex items-center justify-center font-black shadow-sm shrink-0">
                      <Video size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">Investor Meeting & Accreditation Link</h3>
                      <p className="text-xs text-gray-500">Virtual interview and credential verification details.</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase shrink-0 ${
                    isSent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isSent ? 'Invite Sent ✓' : 'Pending Invite'}
                  </span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 sm:p-8 py-4 overflow-y-auto flex-1 space-y-4">
                {/* Sent Status Banner (if already sent) */}
                {isSent && (
                  <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-extrabold text-emerald-900">Meeting Invite Dispatched</p>
                        <p className="text-[11px] text-emerald-700 font-medium">Sent on {formattedSentDate || 'Today'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 truncate max-w-[180px]">
                      To: {meetingModalApp.email}
                    </span>
                  </div>
                )}
                {/* 1. Investor Details Summary */}
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">{meetingModalApp.fullName}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-[#6C4CF1]">
                      {meetingModalApp.investorType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <p>Firm: <strong className="text-gray-900">{meetingModalApp.companyName || 'Independent Investor'}</strong></p>
                    <p>Email: <strong className="text-gray-900">{meetingModalApp.email}</strong></p>
                    <p>Phone: <strong className="text-gray-900">{meetingModalApp.mobile || 'Not specified'}</strong></p>
                    <p>Target Cheque: <strong className="text-[#6C4CF1]">{meetingModalApp.investmentRange || 'Standard'}</strong></p>
                  </div>
                </div>

                {/* 2. Meeting Schedule & Timezone */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <CalendarClock size={15} className="text-[#6C4CF1]" /> Meeting Schedule
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-purple-100 text-[#6C4CF1] px-2 py-0.5 rounded-full">
                        IST (UTC+05:30)
                      </span>
                      <span className="text-[10px] font-black uppercase bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        45 Mins
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Meeting Date</label>
                      <input
                        type="date"
                        value={meetingDateVal}
                        onChange={(e) => setMeetingDateVal(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Meeting Time</label>
                      <input
                        type="time"
                        value={meetingTimeVal}
                        onChange={(e) => setMeetingTimeVal(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Generated Video Call URL & Passcode */}
                <div className="bg-gray-900 text-white p-5 rounded-2xl space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Video Call URL</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      Jitsi / Google Meet Ready
                    </span>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 p-3 rounded-xl flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-purple-200 truncate flex-1">{videoUrl}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(videoUrl);
                        setCopiedMeetingLink(true);
                        setTimeout(() => setCopiedMeetingLink(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedMeetingLink ? <Check size={13} /> : <Copy size={13} />}
                      {copiedMeetingLink ? 'Copied URL!' : 'Copy URL'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
                    <div className="flex items-center gap-2">
                      <span>Password: <strong className="text-white font-mono">{passcode}</strong></span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(passcode);
                          setCopiedPasscode(true);
                          setTimeout(() => setCopiedPasscode(false), 2000);
                        }}
                        className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedPasscode ? <Check size={11} /> : <Copy size={11} />}
                        {copiedPasscode ? 'Copied!' : 'Copy Password'}
                      </button>
                    </div>
                    <span>Max Duration: <strong className="text-white">45 Mins</strong></span>
                  </div>
                </div>

                {/* 4. Recipient Email Bar */}
                <div className="bg-purple-50/40 border border-purple-100 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <Mail size={14} className="text-[#6C4CF1]" /> Recipient Email:
                  </span>
                  <strong className="text-gray-900 font-bold font-mono">{meetingModalApp.email}</strong>
                </div>

              </div>

              {/* Fixed Footer */}
              <div className="p-6 sm:p-8 pt-4 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-3xl">
                {/* 5. Primary CTA & Secondary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => setMeetingModalApp(null)}
                    className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 order-last sm:order-first cursor-pointer shadow-sm"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 justify-end sm:flex-1">
                    <button
                      onClick={handleSendMeetingInvite}
                      disabled={isSendingInvite}
                      className={`w-full sm:w-auto py-3 px-5 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSent
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-[#6C4CF1] hover:bg-[#5B21B6] text-white shadow-purple-500/20'
                      }`}
                    >
                      {isSendingInvite ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" /> Sending Invite...
                        </>
                      ) : isSent ? (
                        <>
                          <Mail size={15} /> Resend Meeting Invite
                        </>
                      ) : (
                        <>
                          <Mail size={15} /> Send Email Invite
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSendInviteLink}
                      disabled={isSendingLink}
                      className="w-full sm:w-auto px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      title="Publish meeting invite link to both Founder & Investor Dashboard Meetings pages"
                    >
                      {isSendingLink ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" /> Sending Link...
                        </>
                      ) : (
                        <>
                          <Link2 size={15} /> Send Invite Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminInvestorApproval;
