import React, { useState, useEffect } from 'react';
import {
  TrendingUp, UserPlus, CheckCircle2, XCircle, Clock, Eye, AlertCircle,
  FileText, ShieldCheck, Mail, Phone, Building2, MapPin, Globe, Link2,
  Lock, Copy, Check, Search, Filter, Sparkles, AlertTriangle, ChevronRight,
  Shield, RefreshCw, X, ArrowUpRight
} from 'lucide-react';
import { addNotification } from '../../../utils/localStorageHelper';
import { getInvestorLeads, saveInvestorLead, type InvestorInviteLead } from '../../../utils/investorInvites';
import { API_URL } from '../../../config/api';

type TabType = 'all' | 'invited' | 'pending' | 'approved' | 'rejected' | 'suspended';

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
  orgProofUrl?: string;
  orgProofName?: string;
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
    investorType: 'Venture Capital Representative',
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
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [applications, setApplications] = useState<InvestorApplication[]>([]);
  const [invitedLeads, setInvitedLeads] = useState<InvestorInviteLead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<InvestorApplication | null>(null);

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
    window.addEventListener('storage', loadData);
    window.addEventListener('investor_invites_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('investor_invites_updated', loadData);
    };
  }, []);

  const loadData = () => {
    // 1. Load Applications
    const storedApps = localStorage.getItem('ai_startup_builder_investor_apps');
    let loadedApps: InvestorApplication[] = [];
    if (storedApps) {
      try { loadedApps = JSON.parse(storedApps); } catch {}
    }
    // Combine with demo apps if empty
    if (loadedApps.length === 0) {
      localStorage.setItem('ai_startup_builder_investor_apps', JSON.stringify(INITIAL_INVESTOR_APPLICATIONS));
      loadedApps = INITIAL_INVESTOR_APPLICATIONS;
    }
    setApplications(loadedApps);

    // 2. Load Invited Leads
    setInvitedLeads(getInvestorLeads());
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
    try {
      await fetch(`${API_URL}/auth/admin/users/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: app.id, action: 'approve' }),
      });
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
    try {
      await fetch(`${API_URL}/auth/admin/users/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: rejectingApp.id, action: 'reject', rejectionReason: rejectionReasonText.trim() }),
      });
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

  // ── Suspend Investor ───────────────────────────────────────────────────────
  const handleSuspend = (app: InvestorApplication) => {
    if (!window.confirm(`Are you sure you want to suspend access for ${app.fullName}?`)) return;
    const updated = applications.map(a =>
      a.id === app.id ? { ...a, status: 'SUSPENDED' as const } : a
    );
    handleSaveApplications(updated);
    if (selectedApp?.id === app.id) setSelectedApp({ ...app, status: 'SUSPENDED' });
  };

  // Filtered lists
  const filteredApps = applications.filter(a => {
    const matchesSearch = (a.fullName + a.email + (a.companyName || '') + (a.investorType || '')).toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return a.status === 'PENDING_VERIFICATION';
    if (activeTab === 'approved') return a.status === 'APPROVED';
    if (activeTab === 'rejected') return a.status === 'REJECTED';
    if (activeTab === 'suspended') return a.status === 'SUSPENDED';
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase text-gray-400">Total Leads</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{applications.length + invitedLeads.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase text-[#6C4CF1]">Invited Leads</p>
          <p className="text-2xl font-black text-[#6C4CF1] mt-1">{invitedLeads.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase text-amber-600">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{applications.filter(a => a.status === 'PENDING_VERIFICATION').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase text-emerald-600">Approved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{applications.filter(a => a.status === 'APPROVED').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase text-red-500">Rejected</p>
          <p className="text-2xl font-black text-red-500 mt-1">{applications.filter(a => a.status === 'REJECTED').length}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'pending', label: 'Pending Verification', count: applications.filter(a => a.status === 'PENDING_VERIFICATION').length },
            { id: 'invited', label: 'Invited', count: invitedLeads.length },
            { id: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'APPROVED').length },
            { id: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'REJECTED').length },
            { id: 'suspended', label: 'Suspended', count: applications.filter(a => a.status === 'SUSPENDED').length },
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
      {activeTab === 'invited' ? (
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
                        <button
                          onClick={() => copyToClipboard(lead.inviteUrl)}
                          className="px-3 py-1.5 bg-purple-50 text-[#6C4CF1] font-bold rounded-lg hover:bg-purple-100 text-xs transition-colors"
                        >
                          Copy Link
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 1: INVITE INVESTOR ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
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

                <div className="grid sm:grid-cols-2 gap-4">
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
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Investor Type *</label>
                    <select
                      value={inviteForm.investorType}
                      onChange={e => setInviteForm({ ...inviteForm, investorType: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6C4CF1]"
                    >
                      <option value="Angel Investor">Angel Investor</option>
                      <option value="Individual Investor">Individual Investor</option>
                      <option value="Venture Capital Representative">Venture Capital Representative</option>
                      <option value="Corporate Investor">Corporate Investor</option>
                      <option value="Family Office">Family Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Organization / Firm Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Nexus Venture Partners"
                      value={inviteForm.companyName}
                      onChange={e => setInviteForm({ ...inviteForm, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6C4CF1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Partner / Angel Investor"
                      value={inviteForm.designation}
                      onChange={e => setInviteForm({ ...inviteForm, designation: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6C4CF1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Admin Notes (Private - Admins Only)</label>
                  <textarea
                    rows={2}
                    placeholder="Private notes e.g. Met on LinkedIn. Active SaaS VC in SEA."
                    value={inviteForm.adminNotes}
                    onChange={e => setInviteForm({ ...inviteForm, adminNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6C4CF1] resize-none"
                  />
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
                  Invitation created for <strong>{inviteResult.fullName}</strong> ({inviteResult.email}). Send them the link below:
                </p>

                <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl flex items-center justify-between gap-2 text-left">
                  <span className="font-mono text-xs text-gray-800 truncate flex-1">{inviteResult.inviteUrl}</span>
                  <button
                    onClick={() => copyToClipboard(inviteResult.inviteUrl)}
                    className="px-4 py-2 bg-[#6C4CF1] text-white font-bold text-xs rounded-xl hover:bg-[#5B21B6] transition-colors flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />} {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => { setShowInviteModal(false); setInviteResult(null); setActiveTab('invited'); }}
                    className="px-6 py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800"
                  >
                    Close & View Invitations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: FULL INVESTOR APPLICATION DETAILS ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6 border-b border-gray-100 pb-4">
              <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                selectedApp.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                selectedApp.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                Status: {selectedApp.status}
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">{selectedApp.fullName}</h2>
              <p className="text-xs text-gray-500">{selectedApp.investorType} • Application ID: {selectedApp.id}</p>
            </div>

            <div className="space-y-6 text-xs text-gray-700">
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
                  {selectedApp.kycDocName && (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-800 truncate">{selectedApp.kycDocName}</span>
                      <a href={selectedApp.kycDocUrl} target="_blank" rel="noreferrer" className="px-2 py-1 bg-purple-50 text-[#6C4CF1] rounded font-bold text-[10px]">
                        View Doc
                      </a>
                    </div>
                  )}
                  {selectedApp.orgProofName && (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-800 truncate">{selectedApp.orgProofName}</span>
                      <a href={selectedApp.orgProofUrl} target="_blank" rel="noreferrer" className="px-2 py-1 bg-purple-50 text-[#6C4CF1] rounded font-bold text-[10px]">
                        View Doc
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              {selectedApp.status === 'PENDING_VERIFICATION' && (
                <>
                  <button
                    onClick={() => { const app = selectedApp; setSelectedApp(null); setRejectingApp(app); }}
                    className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded-xl hover:bg-red-100"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp)}
                    className="px-6 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
                  >
                    Approve & Activate Investor
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: REJECTION REASON DIALOG ── */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
    </div>
  );
};

export default AdminInvestorApproval;
