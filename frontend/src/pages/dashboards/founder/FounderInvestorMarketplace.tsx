import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ShieldCheck, Building2, Briefcase, MapPin,
  TrendingUp, ExternalLink, Send, Eye, X, CheckCircle, AlertCircle, Sparkles, Award, FileText
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getInvestorApplications, getInvestorLeads } from '../../../utils/investorInvites';
import { getStartups } from '../../../utils/localStorageHelper';
import {
  saveInvestmentRequest, getStartupVisibilityMap, setStartupInvestorVisibility
} from '../../../utils/investorModuleStorage';

import { API_URL } from '../../../config/api';

const CATEGORIES = ['All', 'Individual Investor', 'Angel Investor', 'Family Office', 'Investment Firm / VC', 'Micro VC'];
const INDUSTRIES = ['All', 'Artificial Intelligence', 'SaaS', 'FinTech', 'HealthTech', 'DeepTech', 'EdTech', 'E-commerce'];
const STAGES = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B+'];
const RANGES = ['All', '₹5 Lakhs – ₹25 Lakhs', '₹25 Lakhs – ₹1 Crore', '₹1 Crore – ₹5 Crores', '₹5 Crores+'];

const FounderInvestorMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const { user, getAllUsers } = useAuth();
  const [investors, setInvestors] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({});

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedRange, setSelectedRange] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Modals state
  const [viewingInvestor, setViewingInvestor] = useState<any | null>(null);
  const [requestInvestor, setRequestInvestor] = useState<any | null>(null);

  // Request form state
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [fundingAmount, setFundingAmount] = useState('₹50,00,000');
  const [fundingStage, setFundingStage] = useState('Seed');
  const [shortIntro, setShortIntro] = useState('');
  const [whySeeking, setWhySeeking] = useState('');
  const [optionalMessage, setOptionalMessage] = useState('');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [confirmSuccessModal, setConfirmSuccessModal] = useState<{ investorName: string; investorFirm: string; startupName: string } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    // 1. Fetch startups
    const userStartups = await getStartups();
    setStartups(userStartups);
    if (userStartups.length > 0) {
      setSelectedStartupId(userStartups[0].id || userStartups[0].startupId);
    }
    setVisibilityMap(getStartupVisibilityMap());

    // 2. Fetch admin approved investors (API + local storage fallback)
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

    // Process fetched DB users with investor role
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

    // Process stored investor applications with APPROVED status
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

    // Process stored leads with ACCEPTED status
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
          bio: lead.adminNotes || 'Active angel investor looking for scalable tech startups.',
          preferredIndustries: lead.interestedIndustries || ['SaaS', 'EdTech', 'HealthTech'],
          investmentStages: lead.investmentStage || ['Seed'],
          investmentRange: lead.investmentRange || '₹10 Lakhs – ₹50 Lakhs',
          investmentFocus: 'Early revenue traction and clean cap tables.',
          portfolioCompanies: 'CareConnect, EduLabs',
          verificationStatus: 'APPROVED',
          avatar: lead.fullName ? lead.fullName.charAt(0).toUpperCase() : 'I',
        });
      }
    });

    setInvestors(approvedList);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('investor_invites_updated', loadData);
    window.addEventListener('startup_visibility_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('investor_invites_updated', loadData);
      window.removeEventListener('startup_visibility_updated', loadData);
    };
  }, []);

  // Filtered Investors
  const filteredInvestors = investors.filter((inv) => {
    const matchesSearch =
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.companyName.toLowerCase().includes(search.toLowerCase()) ||
      inv.bio.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || inv.investorType.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || (inv.preferredIndustries && inv.preferredIndustries.some((ind: string) => ind.toLowerCase().includes(selectedIndustry.toLowerCase())));
    const matchesStage = selectedStage === 'All' || (inv.investmentStages && inv.investmentStages.some((stg: string) => stg.toLowerCase().includes(selectedStage.toLowerCase())));
    const matchesRange = selectedRange === 'All' || inv.investmentRange === selectedRange;
    const matchesLocation = selectedLocation === 'All' || inv.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCategory && matchesIndustry && matchesStage && matchesRange && matchesLocation;
  });

  const handleOpenSendRequest = (investor: any) => {
    setRequestInvestor(investor);
    const activeStartupsList = startups.length > 0 ? startups : [];
    if (activeStartupsList.length > 0) {
      const currentId = selectedStartupId || activeStartupsList[0].id || activeStartupsList[0].startupId;
      setSelectedStartupId(currentId);
      const currentStartup = activeStartupsList.find(s => (s.id === currentId || s.startupId === currentId)) || activeStartupsList[0];
      if (currentStartup) {
        const ind = currentStartup.aiGenerated?.branding?.logoStyle || currentStartup.aiGenerated?.ideaAnalysis?.businessModel || 'Tech & AI';
        const stg = currentStartup.status === 'generated' ? 'Seed' : 'Pre-Seed';
        setFundingStage(stg);
        setSelectedIndustry(ind);
        setShortIntro(`Requesting investment for ${currentStartup.startupName || 'my startup'}. ${currentStartup.startupIdea || ''}`);
        setWhySeeking(`Seeking investment from ${investor.companyName || 'Independent Investor'} due to your strong focus in ${Array.isArray(investor.preferredIndustries) ? investor.preferredIndustries.join(', ') : 'our sector'}.`);
      }
    }
  };

  const handleSendRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestInvestor) return;

    const targetStartup = startups.find(s => (s.id === selectedStartupId || s.startupId === selectedStartupId));
    if (!targetStartup) {
      showToast('Please select a valid startup.', 'error');
      return;
    }

    const isVisible = visibilityMap[targetStartup.id || targetStartup.startupId];
    if (!isVisible) {
      showToast(`Investor Visibility is currently OFF for ${targetStartup.startupName}. Please enable visibility below before sending request.`, 'warning');
      return;
    }

    saveInvestmentRequest({
      founderId: user?.id || user?._id || 'f_1',
      founderName: user?.fullName || user?.name || 'Renu',
      founderEmail: user?.email || 'renugopal24022000@gmail.com',
      investorId: requestInvestor.id,
      investorName: requestInvestor.name,
      investorEmail: requestInvestor.email,
      investorFirm: requestInvestor.companyName,
      startupId: targetStartup.id || targetStartup.startupId,
      startupName: targetStartup.startupName || 'Startup',
      fundingAmount,
      fundingStage,
      shortIntro,
      whySeeking,
      optionalMessage,
    });

    setConfirmSuccessModal({
      investorName: requestInvestor.name,
      investorFirm: requestInvestor.companyName || 'Verified Investor',
      startupName: targetStartup.startupName || 'Startup'
    });
    setRequestInvestor(null);
    setOptionalMessage('');
  };

  const toggleVisibility = (startupId: string, currentVal: boolean) => {
    setStartupInvestorVisibility(startupId, !currentVal);
    setVisibilityMap(prev => ({ ...prev, [startupId]: !currentVal }));
    showToast(`Investor Visibility for startup updated to ${!currentVal ? 'ON (Visible)' : 'OFF (Private)'}.`);
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-[#5B21B6] via-[#6C4CF1] to-[#4C1D95] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <span className="px-3.5 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider border border-amber-400/30 inline-flex items-center gap-1.5 mb-3">
            <ShieldCheck size={14} /> Verified Investor Network
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Investor Marketplace</h1>
          <p className="text-purple-100 mt-2 text-base leading-relaxed">
            Discover and connect directly with Admin-verified Angel Investors, Venture Capitalists, and Family Offices actively seeking high-potential startups.
          </p>
        </div>
      </div>

      {/* Startup Visibility Control Strip */}
      <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={16} className="text-[#5B21B6]" /> Startup Investor Visibility Settings
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Only startups marked as <span className="font-bold text-[#5B21B6]">Investor Visible</span> can send funding requests or be discovered by investors.
            </p>
          </div>
          {startups.length === 0 ? (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              No startups created yet.
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {startups.map((s) => {
                const sId = s.id || s.startupId;
                const isVis = !!visibilityMap[sId];
                return (
                  <div key={sId} className="flex items-center gap-2 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-800">{s.startupName || 'Startup'}</span>
                    <button
                      onClick={() => toggleVisibility(sId, isVis)}
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase transition-all shadow-sm ${
                        isVis
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isVis ? 'ON (Visible)' : 'OFF (Private)'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search investors by name, firm, thesis, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5B21B6] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Filter By:</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Investor Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#5B21B6]"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Industry Focus</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#5B21B6]"
            >
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Investment Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#5B21B6]"
            >
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Investment Range</label>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#5B21B6]"
            >
              {RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Investors Grid */}
      {filteredInvestors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Approved Investors Found</h3>
          <p className="text-sm text-gray-500 mt-1">Try resetting your search query or filter criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedIndustry('All');
              setSelectedStage('All');
              setSelectedRange('All');
            }}
            className="mt-4 px-4 py-2 bg-[#5B21B6] text-white font-bold text-xs rounded-xl hover:bg-[#4C1D95] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestors.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
              <div className="p-6">
                {/* Header Profile Info */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-lg font-black shadow-md shrink-0">
                      {inv.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#5B21B6] transition-colors">
                        {inv.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">{inv.designation} • {inv.companyName}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>

                {/* Category & Location */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold text-gray-600">
                  <span className="px-2.5 py-0.5 bg-purple-50 text-[#5B21B6] rounded-md border border-purple-100">
                    {inv.investorType}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 text-[11px]">
                    <MapPin size={12} /> {inv.location}
                  </span>
                </div>

                {/* Investment Range & Experience */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl mb-4 text-xs">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block">Check Size</span>
                    <span className="font-bold text-gray-900">{inv.investmentRange}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block">Experience</span>
                    <span className="font-bold text-gray-900">{inv.experienceYears}</span>
                  </div>
                </div>

                {/* Preferred Industries */}
                <div className="mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1.5">Preferred Sectors</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(inv.preferredIndustries) && inv.preferredIndustries.map((ind: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-semibold">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Investment Thesis Snippet */}
                <p className="text-xs text-gray-600 line-clamp-2 italic mb-2">
                  "{inv.investmentFocus || inv.bio}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => navigate(`/founder/investors/${inv.id}`)}
                  className="flex-1 py-2 px-2 bg-white hover:bg-gray-100 text-gray-800 rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1 min-w-[95px]"
                >
                  <Eye size={13} /> View Profile
                </button>
                <button
                  onClick={() => handleOpenSendRequest(inv)}
                  className="flex-1 py-2 px-2 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1 min-w-[100px]"
                >
                  <FileText size={13} /> Send Request
                </button>
                <button
                  onClick={() => handleOpenSendRequest(inv)}
                  className="flex-1 py-2 px-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 min-w-[130px]"
                >
                  <Send size={13} /> Connect with Investor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── INVESTOR PROFILE MODAL ─── */}
      {viewingInvestor && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingInvestor(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0">
                {viewingInvestor.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">{viewingInvestor.name}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#5B21B6]">{viewingInvestor.designation} at {viewingInvestor.companyName}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin size={13} /> {viewingInvestor.location}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Category</span>
                  <span className="font-bold text-gray-900">{viewingInvestor.investorType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Investment Range</span>
                  <span className="font-bold text-gray-900">{viewingInvestor.investmentRange}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Experience</span>
                  <span className="font-bold text-gray-900">{viewingInvestor.experienceYears}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">About & Bio</h4>
                <p className="text-gray-700 leading-relaxed font-medium">{viewingInvestor.bio}</p>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Preferred Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(viewingInvestor.preferredIndustries) && viewingInvestor.preferredIndustries.map((ind: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-lg text-xs font-bold">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Target Investment Stages</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(viewingInvestor.investmentStages) && viewingInvestor.investmentStages.map((stg: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                      {stg}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Investment Focus & Thesis</h4>
                <p className="text-gray-700 bg-purple-50/50 p-4 rounded-xl border border-purple-100/60 font-medium italic">
                  "{viewingInvestor.investmentFocus || 'Focusing on early stage high-growth founders with proprietary IP.'}"
                </p>
              </div>

              {viewingInvestor.portfolioCompanies && (
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Notable Portfolio Highlights</h4>
                  <p className="text-gray-800 font-semibold">{viewingInvestor.portfolioCompanies}</p>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                {viewingInvestor.linkedinUrl && (
                  <a
                    href={viewingInvestor.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#5B21B6] hover:underline flex items-center gap-1"
                  >
                    LinkedIn Profile <ExternalLink size={12} />
                  </a>
                )}
                {viewingInvestor.website && (
                  <a
                    href={viewingInvestor.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#5B21B6] hover:underline flex items-center gap-1"
                  >
                    Official Website <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setViewingInvestor(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const inv = viewingInvestor;
                  setViewingInvestor(null);
                  handleOpenSendRequest(inv);
                }}
                className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Send size={14} /> Send Investment Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SEND CONNECTION REQUEST MODAL ─── */}
      {requestInvestor && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto font-sans my-auto">
            <button
              onClick={() => setRequestInvestor(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="px-3.5 py-1 bg-purple-100 text-[#5B21B6] rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 mb-2">
                <Send size={12} /> Connection Request
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Send Connection Request</h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Initiate a direct line of communication with <span className="font-bold text-gray-800">{requestInvestor.name}</span> ({requestInvestor.companyName || 'Verified Investor'}).
              </p>
            </div>

            {/* Privacy notice banner */}
            <div className="mb-5 p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
              <ShieldCheck size={18} className="text-[#5B21B6] shrink-0 mt-0.5" />
              <div className="leading-normal">
                <p className="font-bold text-[#5B21B6]">Non-Confidential Introduction</p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Only high-level non-confidential details are shared. Detailed business plans, pitch decks, financials, and KYC documents are protected and only shared after connection acceptance.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendRequestSubmit} className="space-y-4 text-xs font-medium">
              {/* Select Startup */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Select Your Startup *</label>
                <select
                  value={selectedStartupId}
                  onChange={(e) => {
                    setSelectedStartupId(e.target.value);
                    const s = startups.find(st => (st.id === e.target.value || st.startupId === e.target.value));
                    if (s) {
                      const ind = s.aiGenerated?.branding?.logoStyle || s.aiGenerated?.ideaAnalysis?.businessModel || 'Tech & AI';
                      const stg = s.status === 'generated' ? 'Seed' : 'Pre-Seed';
                      setFundingStage(stg);
                      setSelectedIndustry(ind);
                      setShortIntro(s.startupIdea || `${s.startupName || 'Our startup'} is building innovative solutions for high market growth.`);
                    }
                  }}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                >
                  {startups.map((s) => {
                    const sId = s.id || s.startupId;
                    const isVis = !!visibilityMap[sId];
                    return (
                      <option key={sId} value={sId}>
                        {s.startupName || 'Startup'} {isVis ? '(Investor Visible)' : '(Private - Needs Visibility)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Auto-filled Readonly Profile Context */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Investor Name</span>
                  <span className="font-bold text-gray-900 truncate block">{requestInvestor.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Founder Name</span>
                  <span className="font-bold text-gray-900 truncate block">{user?.fullName || 'Founder'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Industry Sector</span>
                  <span className="font-bold text-purple-700 truncate block">{selectedIndustry !== 'All' ? selectedIndustry : 'Tech & Innovation'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block">Startup Stage</span>
                  <span className="font-bold text-purple-700 truncate block">{fundingStage}</span>
                </div>
              </div>

              {/* Funding Required & Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Funding Required *</label>
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
                    required
                  >
                    <option value="Pre-Seed">Pre-Seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Pre-Series A">Pre-Series A</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B+">Series B+</option>
                  </select>
                </div>
              </div>

              {/* Startup Summary */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Short Startup Summary *</label>
                <textarea
                  rows={2}
                  value={shortIntro}
                  onChange={(e) => setShortIntro(e.target.value)}
                  placeholder="Brief non-confidential elevator summary of your product and value prop..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                />
              </div>

              {/* Why I'm Connecting */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Why I'm Connecting *</label>
                <textarea
                  rows={2}
                  value={whySeeking}
                  onChange={(e) => setWhySeeking(e.target.value)}
                  placeholder="Short reason why their thesis or background aligns with your startup..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                  Status after sending: <span className="font-black">Pending</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestInvestor(null)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Send size={13} /> Send Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SUCCESS POPUP CONFIRMATION MODAL ─── */}
      {confirmSuccessModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle size={36} />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">Request Sent Successfully!</h3>
            
            <p className="text-xs text-gray-600 leading-relaxed mb-6 bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
              Your connection proposal for <span className="font-bold text-[#5B21B6]">{confirmSuccessModal.startupName}</span> has been sent. These details have been forwarded to:
              <br /><br />
              • <span className="font-bold text-gray-900">{confirmSuccessModal.investorName}</span> ({confirmSuccessModal.investorFirm}) on their Investor Dashboard
              <br />
              • <span className="font-bold text-gray-900">Admin Dashboard</span> Notifications Page
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSuccessModal(null)}
                className="flex-1 py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Got It
              </button>
              <button
                onClick={() => {
                  setConfirmSuccessModal(null);
                  navigate('/dashboard/founder/investment-requests');
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
              >
                Track Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderInvestorMarketplace;
