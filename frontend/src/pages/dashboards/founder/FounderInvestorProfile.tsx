import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Building2, Briefcase, MapPin, TrendingUp, ExternalLink,
  Send, ChevronLeft, Award, User, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getInvestorApplications, getInvestorLeads } from '../../../utils/investorInvites';
import { getStartups } from '../../../utils/localStorageHelper';
import {
  saveInvestmentRequest, getStartupVisibilityMap
} from '../../../utils/investorModuleStorage';

import { API_URL } from '../../../config/api';

const FounderInvestorProfile: React.FC = () => {
  const { investorId } = useParams<{ investorId: string }>();
  const navigate = useNavigate();
  const { user, getAllUsers } = useAuth();

  const [investor, setInvestor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState<any[]>([]);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({});

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [fundingAmount, setFundingAmount] = useState('₹50,00,000');
  const [fundingStage, setFundingStage] = useState('Seed');
  const [shortIntro, setShortIntro] = useState('');
  const [whySeeking, setWhySeeking] = useState('');
  const [optionalMessage, setOptionalMessage] = useState('');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadInvestorData = async () => {
    setLoading(true);
    // 1. Fetch startups
    const userStartups = await getStartups();
    setStartups(userStartups);
    if (userStartups.length > 0) {
      setSelectedStartupId(userStartups[0].id || userStartups[0].startupId);
    }
    setVisibilityMap(getStartupVisibilityMap());

    // 2. Load all investors (API + local fallback)
    const approvedList: any[] = [];
    const processedEmails = new Set<string>();

    try {
      const apiRes = await fetch(`${API_URL}/investors`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.success && Array.isArray(apiData.investors)) {
          apiData.investors.forEach((u: any) => {
            const emailKey = (u.email || '').trim().toLowerCase();
            if (emailKey) processedEmails.add(emailKey);
            approvedList.push({
              id: u.id || u._id,
              name: u.name || u.fullName || 'Approved Investor',
              email: u.email,
              companyName: u.companyName || u.organization || 'Independent Investor',
              designation: u.designation || 'Angel Investor',
              investorType: u.investorType || u.investorCategory || 'Angel Investor',
              experienceYears: u.experienceYears || u.previousExperience || '5+ years',
              location: u.location || 'India',
              linkedinUrl: u.linkedinUrl || u.linkedin || '',
              website: u.website || '',
              bio: u.bio || 'Active investor supporting high-growth startups.',
              preferredIndustries: Array.isArray(u.preferredIndustries) ? u.preferredIndustries : ['Artificial Intelligence', 'SaaS', 'FinTech'],
              investmentStages: Array.isArray(u.investmentStages) ? u.investmentStages : ['Seed', 'Series A'],
              investmentRange: u.investmentRange || '₹25 Lakhs – ₹1 Crore',
              investmentFocus: u.investmentFocus || u.investmentThesis || 'Proprietary technology stack and strong market potential.',
              portfolioCompanies: u.portfolioCompanies || '',
              notableInvestments: u.notableInvestments || '',
              areasOfExpertise: u.areasOfExpertise || '',
              verificationStatus: 'APPROVED',
              avatar: u.name ? u.name.charAt(0).toUpperCase() : 'I',
            });
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch backend investors API:', err);
    }

    const fetchedUsers = getAllUsers() || [];
    const storedApps = getInvestorApplications() || [];
    const storedLeads = getInvestorLeads() || [];

    fetchedUsers.forEach((u: any) => {
      const role = (u.role || '').toLowerCase();
      if (role === 'investor' && (u.approvalStatus === 'approved' || u.status === 'active')) {
        const emailKey = (u.email || '').trim().toLowerCase();
        if (emailKey) processedEmails.add(emailKey);
        approvedList.push({
          id: u.id || u._id,
          name: u.fullName || u.name || 'Approved Investor',
          email: u.email,
          companyName: u.companyName || u.organization || 'Independent Investor',
          designation: u.designation || 'Angel Investor',
          investorType: u.investorType || u.investorCategory || 'Angel Investor',
          experienceYears: u.experienceYears || '5+ years',
          location: u.location || 'India',
          linkedinUrl: u.linkedin || u.linkedinUrl || '',
          website: u.website || '',
          bio: u.bio || 'Active investor supporting high-growth AI and B2B SaaS startups.',
          preferredIndustries: u.preferredIndustries || ['Artificial Intelligence', 'SaaS', 'FinTech'],
          investmentStages: u.investmentStages || ['Seed', 'Series A'],
          investmentRange: u.investmentRange || '₹25 Lakhs – ₹1 Crore',
          investmentFocus: u.investmentFocus || u.investmentThesis || 'Proprietary technology stack, strong market potential, and committed founders.',
          portfolioCompanies: u.portfolioCompanies || 'CloudScale AI, DataPulse, PayFlow',
          notableInvestments: u.notableInvestments || 'Early Seed lead in CloudScale AI',
          areasOfExpertise: u.areasOfExpertise || 'GTM Strategy, Fundraising Advisory',
          verificationStatus: 'APPROVED',
          avatar: u.fullName ? u.fullName.charAt(0).toUpperCase() : 'I',
        });
      }
    });

    storedApps.forEach((app: any) => {
      const emailKey = (app.email || '').trim().toLowerCase();
      if (app.status === 'APPROVED' && emailKey && !processedEmails.has(emailKey)) {
        processedEmails.add(emailKey);
        approvedList.push({
          id: app.id,
          name: app.fullName,
          email: app.email,
          companyName: app.companyName || 'Investment Syndicate',
          designation: app.designation || 'Managing Director',
          investorType: app.investorType || app.investorCategory || 'Angel Investor',
          experienceYears: app.experienceYears || '5 - 10 years',
          location: app.location || 'Bengaluru, India',
          linkedinUrl: app.linkedinUrl || '',
          website: app.website || '',
          bio: app.bio || 'Ex-VP Product turned active angel investor backing AI and SaaS founders.',
          preferredIndustries: app.preferredIndustries || ['FinTech', 'HealthTech', 'Artificial Intelligence'],
          investmentStages: app.investmentStages || ['Pre-Seed', 'Seed'],
          investmentRange: app.investmentRange || '₹25 Lakhs – ₹1 Crore',
          investmentFocus: app.investmentFocus || app.investmentThesis || 'Backing mission-driven founders creating innovative products.',
          portfolioCompanies: app.portfolioCompanies || 'PayFlow, MedPulse AI',
          notableInvestments: app.notableInvestments || 'Seed Lead in PayFlow',
          areasOfExpertise: app.areasOfExpertise || 'Product Strategy, Angel Syndicates',
          verificationStatus: 'APPROVED',
          avatar: app.fullName ? app.fullName.charAt(0).toUpperCase() : 'I',
        });
      }
    });

    storedLeads.forEach((lead: any) => {
      const emailKey = (lead.email || '').trim().toLowerCase();
      if (lead.status === 'ACCEPTED' && emailKey && !processedEmails.has(emailKey)) {
        processedEmails.add(emailKey);
        approvedList.push({
          id: lead.id,
          name: lead.fullName,
          email: lead.email,
          companyName: lead.companyName || 'Angel Network',
          designation: lead.designation || 'Angel Member',
          investorType: lead.investorType || 'Angel Investor',
          experienceYears: lead.experienceYears || '5+ years',
          location: lead.location || 'Mumbai, India',
          linkedinUrl: lead.linkedinUrl || '',
          website: lead.website || '',
          bio: lead.adminNotes || 'Active angel investor backing tech founders.',
          preferredIndustries: lead.interestedIndustries || ['SaaS', 'EdTech', 'HealthTech'],
          investmentStages: lead.investmentStage || ['Seed'],
          investmentRange: lead.investmentRange || '₹10 Lakhs – ₹50 Lakhs',
          investmentFocus: 'Early revenue traction and clean cap tables.',
          portfolioCompanies: lead.portfolioCompanies || 'CareConnect, EduLabs',
          verificationStatus: 'APPROVED',
          avatar: lead.fullName ? lead.fullName.charAt(0).toUpperCase() : 'I',
        });
      }
    });

    const matched = approvedList.find(inv => inv.id === investorId);
    setInvestor(matched || null);
    setLoading(false);
  };

  useEffect(() => {
    loadInvestorData();
  }, [investorId]);

  const handleOpenSendRequest = () => {
    if (!investor) return;
    setShowRequestModal(true);
    if (startups.length > 0) {
      const currentId = selectedStartupId || startups[0].id;
      const currentStartup = startups.find(s => (s.id === currentId || s.startupId === currentId));
      if (currentStartup) {
        setShortIntro(`Requesting investment for ${currentStartup.startupName || 'my startup'}. ${currentStartup.startupIdea || ''}`);
        setWhySeeking(`Seeking investment from ${investor.companyName} due to your strong focus in ${Array.isArray(investor.preferredIndustries) ? investor.preferredIndustries.join(', ') : 'our sector'}.`);
      }
    }
  };

  const handleSendRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartupId) {
      showToast('Please select a startup.', 'error');
      return;
    }

    const currentStartup = startups.find(s => (s.id === selectedStartupId || s.startupId === selectedStartupId));
    if (!currentStartup) {
      showToast('Selected startup not found.', 'error');
      return;
    }

    // Readiness / visibility check
    const isVisible = visibilityMap[currentStartup.id || currentStartup.startupId];
    const isReady = currentStartup.aiGenerated?.aiReport?.investmentReadinessScore >= 70;

    if (!isVisible) {
      showToast(`Cannot connect: "${currentStartup.startupName || 'Startup'}" must be set to "Investor Visible" (ON) in Startup details.`, 'warning');
      return;
    }

    saveInvestmentRequest({
      startupId: currentStartup.id || currentStartup.startupId,
      startupName: currentStartup.startupName || 'My Startup',
      founderId: user?.id || user?._id || 'founder_id',
      founderName: user?.fullName || user?.name || 'Founder Name',
      founderEmail: user?.email || 'renugopal24022000@gmail.com',
      investorId: investor.id,
      investorName: investor.name,
      investorEmail: investor.email,
      investorFirm: investor.companyName,
      fundingAmount,
      fundingStage,
      shortIntro,
      whySeeking,
      optionalMessage,
    });

    showToast(`Investment Request submitted successfully to ${investor.name}!`, 'success');
    setShowRequestModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-[#5B21B6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm font-sans">
        <AlertCircle size={44} className="mx-auto text-red-500 mb-3" />
        <h3 className="text-lg font-black text-gray-900">Investor Profile Not Found</h3>
        <p className="text-xs text-gray-500 mt-2">
          The requested investor profile is either unavailable or has not been approved.
        </p>
        <button
          onClick={() => navigate('/founder/investors')}
          className="mt-6 px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-12 font-sans max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'warning' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Back Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#5B21B6] transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <span className="px-3 py-1 bg-purple-50 text-[#5B21B6] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 border border-purple-100 shadow-2xs">
          <ShieldCheck size={14} className="text-amber-500" /> Admin Approved
        </span>
      </div>

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-3xl font-black shadow-md shrink-0">
            {investor.avatar}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-gray-900 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {investor.name}
            </h1>
            <p className="text-sm font-bold text-[#5B21B6] mt-1">{investor.designation} at {investor.companyName}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1"><Building2 size={14} /> {investor.investorType}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {investor.location}</span>
              <span className="flex items-center gap-1"><Briefcase size={14} /> {investor.experienceYears} Experience</span>
            </div>

            {/* Social / Direct Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              {investor.linkedinUrl && (
                <a
                  href={investor.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors inline-flex items-center gap-1"
                >
                  LinkedIn <ExternalLink size={12} />
                </a>
              )}
              {investor.website && (
                <a
                  href={investor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors inline-flex items-center gap-1"
                >
                  Website <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <button
            onClick={handleOpenSendRequest}
            className="w-full sm:w-auto px-6 py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 self-center sm:self-start"
          >
            <Send size={14} /> Send Request
          </button>
        </div>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Columns - Detailed Meta & Thesis */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio / About */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">About / Bio</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {investor.bio}
            </p>
          </div>

          {/* Investment Thesis & Focus */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Investment Focus & Thesis</h3>
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-xs text-purple-950 font-semibold italic leading-relaxed">
              "{investor.investmentFocus}"
            </div>
          </div>

          {/* Portfolio highlights */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award size={16} className="text-[#FBBF24]" /> Portfolio Highlights
            </h3>
            <div className="flex flex-wrap gap-2">
              {String(investor.portfolioCompanies || '').split(',').map((company: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800"
                >
                  {company.trim()}
                </span>
              ))}
            </div>
            {investor.notableInvestments && (
              <p className="text-xs text-gray-500 mt-3 font-semibold">
                Notable: <span className="text-[#5B21B6]">{investor.notableInvestments}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Investment Thesis Criteria */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase block mb-1.5">Preferred Industries</span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(investor.preferredIndustries) && investor.preferredIndustries.map((ind: string) => (
                  <span key={ind} className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-extrabold uppercase">
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Investment Range</span>
              <span className="text-sm font-black text-[#5B21B6]">{investor.investmentRange}</span>
            </div>

            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Investment Stages</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {Array.isArray(investor.investmentStages) && investor.investmentStages.map((stg: string) => (
                  <span key={stg} className="px-2 py-0.5 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-md text-[10px] font-bold">
                    {stg}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Location</span>
              <span className="text-xs font-semibold text-gray-700">{investor.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SEND REQUEST MODAL ─── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-full text-xs font-black uppercase tracking-wider inline-block mb-2">
                Investment Proposal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Connect with {investor.name}</h2>
              <p className="text-xs text-gray-500 mt-1">Submit your startup profile and details for investment consideration.</p>
            </div>

            <form onSubmit={handleSendRequestSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Select Startup *</label>
                <select
                  value={selectedStartupId}
                  onChange={(e) => setSelectedStartupId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                >
                  {startups.map((s) => (
                    <option key={s.id || s.startupId} value={s.id || s.startupId}>
                      {s.startupName || 'Startup'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Funding Amount Required *</label>
                  <input
                    type="text"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="e.g. ₹50,00,000"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Funding Stage *</label>
                  <select
                    value={fundingStage}
                    onChange={(e) => setFundingStage(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  >
                    <option value="Pre-Seed">Pre-Seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B+">Series B+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Short Pitch Introduction *</label>
                <textarea
                  rows={2}
                  value={shortIntro}
                  onChange={(e) => setShortIntro(e.target.value)}
                  placeholder="Elevator pitch of your startup..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Why Seeking this Investor? *</label>
                <textarea
                  rows={2}
                  value={whySeeking}
                  onChange={(e) => setWhySeeking(e.target.value)}
                  placeholder="How does their thesis align with your startup?"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Optional Message</label>
                <textarea
                  rows={2}
                  value={optionalMessage}
                  onChange={(e) => setOptionalMessage(e.target.value)}
                  placeholder="Add any extra notes or special request details..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderInvestorProfile;
