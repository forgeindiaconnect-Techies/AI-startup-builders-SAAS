import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Download, X, AlertCircle, CheckCircle, ChevronDown, ExternalLink, Pencil, Loader2, Copy } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getMentorProfile, updateMentorProfileAdmin } from '../../../utils/mentorApi';
import { getInvestorLeads, deleteInvestorLead } from '../../../utils/investorInvites';

const WEEKDAYS: { label: string; value: number }[] = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const TIME_SLOTS: { label: string; value: string }[] = [
  { label: '9:00', value: '09:00' },
  { label: '10:00', value: '10:00' },
  { label: '11:00', value: '11:00' },
  { label: '12:00', value: '12:00' },
  { label: '1:00', value: '13:00' },
  { label: '2:00', value: '14:00' },
  { label: '3:00', value: '15:00' },
  { label: '4:00', value: '16:00' },
  { label: '5:00', value: '17:00' },
  { label: '6:00', value: '18:00' },
];
const DEFAULT_AVAIL_SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

const roleColors: Record<string, string> = {
  founder: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  mentor: 'bg-blue-100 text-blue-700 border border-blue-200',
  investor: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  admin: 'bg-purple-100 text-[#5B21B6] border border-purple-200',
};

const statusDotColors: Record<string, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-gray-400',
  suspended: 'bg-red-500',
};

const statusBgColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  suspended: 'bg-red-50 text-red-600 border-red-200',
};

const approvalDotColors: Record<string, string> = {
  approved: 'bg-emerald-500',
  pending: 'bg-amber-400',
  rejected: 'bg-red-500',
};

const approvalBgColors: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const AdminUsers: React.FC = () => {
  const { user: currentUser, getAllUsers, deleteUser, approveUser, rejectUser, updateUserStatus, refreshUsers, getTokenRole } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Edit Mentor Profile modal state
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [mentorForm, setMentorForm] = useState({
    fullName: '',
    title: '',
    expertise: '',
    industry: '',
    categories: '',
    bio: '',
    experienceYears: '8',
    linkedin: '',
    photoUrl: '',
    location: '',
    sessionDuration: '45',
    sessionFee: '0',
    mentorSharePercentage: 80,
    platformCommissionPercentage: 20,
    isActive: true,
    availableDays: [1, 2, 3, 4, 5, 6],
    availableSlots: DEFAULT_AVAIL_SLOTS,
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Tracks when the next background refresh is allowed (locked after manual changes)
  const lockUntilRef = React.useRef<number>(0);

  const loadUsers = (force = false) => {
    if (!force && Date.now() < lockUntilRef.current) return; // skip if locked
    refreshUsers();
    const fetched = getAllUsers() || [];
    
    // Load local storage investor applications and invited leads
    const storedApps = JSON.parse(localStorage.getItem('ai_startup_builder_investor_apps') || '[]');
    const storedLeads = getInvestorLeads() || [];

    // Create maps by email for fast lookup & enrichment
    const appsByEmail = new Map<string, any>();
    storedApps.forEach((app: any) => {
      if (app.email) appsByEmail.set(app.email.toLowerCase(), app);
    });

    const leadsByEmail = new Map<string, any>();
    storedLeads.forEach((lead: any) => {
      if (lead.email) leadsByEmail.set(lead.email.toLowerCase(), lead);
    });

    const processedEmails = new Set<string>();

    // 1. Map & Enrich fetched users from backend
    const enrichedFetched = fetched.map((u: any) => {
      const emailKey = (u.email || '').toLowerCase();
      if (emailKey) processedEmails.add(emailKey);

      const appData = appsByEmail.get(emailKey) || {};
      const leadData = leadsByEmail.get(emailKey) || {};

      return {
        ...u,
        mobile: u.mobile || appData.mobile || leadData.phone || '',
        location: u.location || appData.location || leadData.location || '',
        companyName: u.companyName || appData.companyName || leadData.companyName || '',
        designation: u.designation || appData.designation || leadData.designation || '',
        investorType: u.investorType || appData.investorType || appData.investorCategory || leadData.investorType || '',
        experienceYears: u.experienceYears || appData.experienceYears || leadData.experienceYears || '',
        linkedin: u.linkedin || appData.linkedinUrl || appData.linkedin || leadData.linkedinUrl || '',
        website: u.website || appData.website || leadData.website || '',
        bio: u.bio || appData.bio || leadData.adminNotes || '',
        preferredIndustries: (u.preferredIndustries && u.preferredIndustries.length > 0) ? u.preferredIndustries : (appData.preferredIndustries || leadData.interestedIndustries || []),
        investmentStages: (u.investmentStages && u.investmentStages.length > 0) ? u.investmentStages : (appData.investmentStages || leadData.investmentStage || []),
        investmentRange: u.investmentRange || appData.investmentRange || leadData.investmentRange || '',
        preferredLocation: u.preferredLocation || appData.preferredLocation || '',
        investmentFocus: u.investmentFocus || appData.investmentFocus || '',
        previousExperience: u.previousExperience || appData.previousExperience || '',
        startupsInvestedCount: u.startupsInvestedCount || appData.startupsInvestedCount || '',
        portfolioCompanies: u.portfolioCompanies || appData.portfolioCompanies || '',
        notableInvestments: u.notableInvestments || appData.notableInvestments || '',
        areasOfExpertise: u.areasOfExpertise || appData.areasOfExpertise || '',
        kycDocUrl: u.kycDocUrl || appData.kycDocUrl || '',
        kycDocName: u.kycDocName || appData.kycDocName || '',
        panTaxDocUrl: u.panTaxDocUrl || appData.panTaxDocUrl || '',
        panTaxDocName: u.panTaxDocName || appData.panTaxDocName || '',
        orgProofUrl: u.orgProofUrl || appData.orgProofUrl || '',
        orgProofName: u.orgProofName || appData.orgProofName || '',
        repProofUrl: u.repProofUrl || appData.repProofUrl || '',
        repProofName: u.repProofName || appData.repProofName || '',
        supportingDocUrl: u.supportingDocUrl || appData.supportingDocUrl || '',
        supportingDocName: u.supportingDocName || appData.supportingDocName || '',
        inviteUrl: u.inviteUrl || appData.inviteUrl || leadData.inviteUrl || '',
        inviteStatus: leadData.status || appData.status || '',
      };
    });

    // 2. Merge local investor applications not in fetched users
    const localInvestors = storedApps
      .filter((app: any) => app.email && !processedEmails.has(app.email.toLowerCase()))
      .map((app: any) => {
        processedEmails.add(app.email.toLowerCase());
        const leadData = leadsByEmail.get(app.email.toLowerCase()) || {};
        return {
          id: app.id,
          name: app.fullName,
          fullName: app.fullName,
          email: app.email,
          role: 'investor',
          status: app.status === 'APPROVED' ? 'active' : 'active',
          approvalStatus: app.status === 'APPROVED' ? 'approved' : app.status === 'REJECTED' ? 'rejected' : 'pending',
          signupDate: app.submittedAt || new Date().toISOString(),
          lastLoginAt: null,
          loginCount: 0,
          mobile: app.mobile || leadData.phone || '',
          location: app.location || leadData.location || '',
          companyName: app.companyName || leadData.companyName || '',
          designation: app.designation || leadData.designation || '',
          investorType: app.investorType || app.investorCategory || leadData.investorType || 'Individual Investor',
          experienceYears: app.experienceYears || '',
          linkedin: app.linkedinUrl || app.linkedin || leadData.linkedinUrl || '',
          website: app.website || leadData.website || '',
          bio: app.bio || leadData.adminNotes || '',
          preferredIndustries: app.preferredIndustries || leadData.interestedIndustries || [],
          investmentStages: app.investmentStages || leadData.investmentStage || [],
          investmentRange: app.investmentRange || leadData.investmentRange || '',
          preferredLocation: app.preferredLocation || '',
          investmentFocus: app.investmentFocus || '',
          previousExperience: app.previousExperience || '',
          startupsInvestedCount: app.startupsInvestedCount || '',
          portfolioCompanies: app.portfolioCompanies || '',
          notableInvestments: app.notableInvestments || '',
          areasOfExpertise: app.areasOfExpertise || '',
          kycDocUrl: app.kycDocUrl || '',
          kycDocName: app.kycDocName || '',
          panTaxDocUrl: app.panTaxDocUrl || '',
          panTaxDocName: app.panTaxDocName || '',
          orgProofUrl: app.orgProofUrl || '',
          orgProofName: app.orgProofName || '',
          repProofUrl: app.repProofUrl || '',
          repProofName: app.repProofName || '',
          supportingDocUrl: app.supportingDocUrl || '',
          supportingDocName: app.supportingDocName || '',
          inviteUrl: app.inviteUrl || leadData.inviteUrl || '',
          inviteStatus: app.status || leadData.status || '',
        };
      });

    // 3. Merge invited investor leads not in fetched or localInvestors
    const localInvited = storedLeads
      .filter((lead: any) => lead.email && !processedEmails.has(lead.email.toLowerCase()))
      .map((lead: any) => {
        processedEmails.add(lead.email.toLowerCase());
        return {
          id: lead.id,
          name: lead.fullName,
          fullName: lead.fullName,
          email: lead.email,
          role: 'investor',
          status: lead.status === 'ACCEPTED' ? 'active' : 'inactive',
          approvalStatus: lead.status === 'ACCEPTED' ? 'approved' : 'pending',
          isInvitedLead: true,
          inviteStatus: lead.status || 'INVITED',
          signupDate: lead.createdAt || new Date().toISOString(),
          lastLoginAt: null,
          loginCount: 0,
          mobile: lead.phone || '',
          location: lead.location || '',
          companyName: lead.companyName || '',
          designation: lead.designation || '',
          investorType: lead.investorType || 'Angel Investor',
          experienceYears: lead.experienceYears || '',
          linkedin: lead.linkedinUrl || '',
          website: lead.website || '',
          bio: lead.adminNotes || '',
          investmentRange: lead.investmentRange || '',
          preferredIndustries: lead.interestedIndustries || [],
          investmentStages: lead.investmentStage || [],
          inviteUrl: lead.inviteUrl || '',
        };
      });

    setUsersList([...enrichedFetched, ...localInvestors, ...localInvited]);
  };

  useEffect(() => {
    loadUsers(true);
    const handleStorageChange = () => loadUsers(true);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('investor_invites_updated', handleStorageChange);

    if (getTokenRole() !== 'admin') return;
    const interval = setInterval(() => loadUsers(), 10000); // poll every 10s
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('investor_invites_updated', handleStorageChange);
    };
  }, []);

  const filtered = usersList.filter(u =>
    (roleFilter === 'All' || (u.role || '').toLowerCase() === roleFilter.toLowerCase()) &&
    ((u.name || '').toLowerCase().includes(search.toLowerCase()) ||
     (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
     (u.fullName || '').toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${name}?`)) {
      deleteUser(id);
      deleteInvestorLead(id);
      const storedApps = JSON.parse(localStorage.getItem('ai_startup_builder_investor_apps') || '[]');
      const updatedApps = storedApps.filter((a: any) => a.id !== id && a.email?.toLowerCase() !== name.toLowerCase());
      localStorage.setItem('ai_startup_builder_investor_apps', JSON.stringify(updatedApps));

      if (selectedUser?.id === id) setSelectedUser(null);
      loadUsers(true);
      showToast(`User "${name}" deleted successfully.`);
    }
  };

  const handleStatusChange = (userId: string, userName: string, newStatus: string) => {
    if (newStatus === 'inactive' || newStatus === 'suspended') {
      if (!window.confirm(`Set ${userName} to "${newStatus}"? They will not be able to access the dashboard.`)) {
        loadUsers();
        return;
      }
    }
    updateUserStatus(userId, newStatus);
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
    loadUsers();
    showToast(`${userName}'s status updated to "${newStatus}".`);
  };

  const handleApprovalChange = (userId: string, userName: string, newApproval: string) => {
    if (newApproval === 'rejected') {
      if (!window.confirm(`Reject ${userName}'s account? They will not be able to log in.`)) {
        return;
      }
      // Lock polling for 10s so background refresh doesn't overwrite this change
      lockUntilRef.current = Date.now() + 10000;
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'rejected' } : u));
      rejectUser(userId);
      showToast(`${userName}'s account has been rejected.`);
    } else if (newApproval === 'approved') {
      // Lock polling for 10s so background refresh doesn't overwrite this change
      lockUntilRef.current = Date.now() + 10000;
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'approved' } : u));
      approveUser(userId);
      showToast(`${userName}'s account has been approved.`);
    }
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, approvalStatus: newApproval });
    }
  };

  const openEditMentor = async (u: any) => {
    setEditingMentor(u);
    setEditLoading(true);
    setMentorForm({
      fullName: u.fullName || u.name || '',
      title: u.title || 'Startup Mentor',
      expertise: Array.isArray(u.expertise) ? u.expertise.join(', ') : (u.expertise || ''),
      industry: u.industry || '',
      categories: Array.isArray(u.categories) ? u.categories.join(', ') : (u.categories || ''),
      bio: u.bio || '',
      experienceYears: u.experienceYears ? String(u.experienceYears).replace(/[^0-9]/g, '') : '8',
      linkedin: u.linkedin || '',
      photoUrl: u.photoUrl || '',
      location: u.location || '',
      sessionDuration: String(u.sessionDuration || 45),
      sessionFee: String(u.sessionFee ?? 0),
      mentorSharePercentage: u.mentorSharePercentage ?? 80,
      platformCommissionPercentage: u.platformCommissionPercentage ?? 20,
      isActive: u.isActive !== false,
      availableDays: [1, 2, 3, 4, 5, 6],
      availableSlots: DEFAULT_AVAIL_SLOTS,
    });
    try {
      const full = await getMentorProfile(u.id);

      const daySet = new Set<number>();
      const slotSet = new Set<string>();
      (full.availability || []).forEach((a: any) => {
        const d = new Date(`${a.date}T00:00:00`);
        if (!isNaN(d.getTime())) daySet.add(d.getDay());
        (a.slots || []).forEach((s: string) => slotSet.add(s));
      });

      setMentorForm({
        fullName: full.name || u.fullName || '',
        title: full.title || 'Startup Mentor',
        expertise: (full.expertise || []).join(', '),
        industry: full.industry || '',
        categories: (full.categories || []).join(', '),
        bio: full.bio || '',
        experienceYears: full.experienceYears ? String(full.experienceYears) : '8',
        linkedin: full.linkedin || '',
        photoUrl: full.photoUrl || '',
        location: full.location || '',
        sessionDuration: String(full.sessionDuration || 45),
        sessionFee: String(full.sessionFee ?? 0),
        mentorSharePercentage: full.mentorSharePercentage ?? 80,
        platformCommissionPercentage: full.platformCommissionPercentage ?? 20,
        isActive: full.isActive !== false,
        availableDays: daySet.size ? [...daySet].sort() : [1, 2, 3, 4, 5, 6],
        availableSlots: slotSet.size ? TIME_SLOTS.filter((t) => slotSet.has(t.value)).map((t) => t.value) : DEFAULT_AVAIL_SLOTS,
      });
    } catch {
      // fall back to the admin list data
    } finally {
      setEditLoading(false);
    }
  };

  const updateForm = (key: keyof typeof mentorForm, value: string | boolean | number) => {
    setMentorForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day: number) => {
    setMentorForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const toggleSlot = (slot: string) => {
    setMentorForm((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter((s) => s !== slot)
        : [...prev.availableSlots, slot],
    }));
  };

  const handleSaveMentor = async () => {
    if (!editingMentor) return;
    if (!mentorForm.fullName.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    const share = Number(mentorForm.mentorSharePercentage) || 0;
    const commission = Number(mentorForm.platformCommissionPercentage) || 0;
    if (Math.abs(share + commission - 100) > 0.01) {
      showToast(`Mentor Share (${share}%) + Platform Commission (${commission}%) must equal 100%.`, 'error');
      return;
    }
    setEditSaving(true);
    try {
      const expertiseStr = mentorForm.expertise.split(',').map(s => s.trim()).filter(Boolean).join(', ');
      const categoriesStr = mentorForm.categories.split(',').map(s => s.trim()).filter(Boolean).join(', ');
      await updateMentorProfileAdmin(editingMentor.id, {
        fullName: mentorForm.fullName.trim(),
        title: mentorForm.title.trim(),
        expertise: expertiseStr,
        industry: mentorForm.industry.trim(),
        categories: categoriesStr,
        bio: mentorForm.bio.trim(),
        experienceYears: Number(mentorForm.experienceYears) || 0,
        linkedin: mentorForm.linkedin.trim(),
        photoUrl: mentorForm.photoUrl.trim(),
        location: mentorForm.location.trim(),
        sessionDuration: Number(mentorForm.sessionDuration) || 45,
        sessionFee: Number(mentorForm.sessionFee) || 0,
        mentorSharePercentage: share,
        platformCommissionPercentage: commission,
        isActive: mentorForm.isActive,
        availableDays: mentorForm.availableDays,
        availableSlots: mentorForm.availableSlots,
      });
      // Reflect the changes immediately and lock background polling for 10s
      lockUntilRef.current = Date.now() + 10000;
      setUsersList(prev => prev.map(u => u.id === editingMentor.id ? {
        ...u,
        fullName: mentorForm.fullName.trim(),
        name: mentorForm.fullName.trim(),
        expertise: expertiseStr,
        experienceYears: `${mentorForm.experienceYears || '8'}+`,
        linkedin: mentorForm.linkedin.trim(),
        bio: mentorForm.bio.trim(),
        location: mentorForm.location.trim(),
      } : u));
      refreshUsers();
      setEditingMentor(null);
      showToast(`Mentor "${mentorForm.fullName.trim()}" profile updated successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update mentor profile.', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (usersList.length === 0) {
      window.alert("No user data available to export.");
      return;
    }
    const headers = ["User ID", "Name", "Email", "Role", "Status", "Approval", "Signup Date", "Last Login", "Login Count", "Trial Expiry", "Subscription Expiry"];
    const rows = usersList.map(u => [
      u.id, u.name || u.fullName, u.email, u.role, u.status || 'active',
      u.approvalStatus || 'approved', u.signupDate || '',
      u.lastLoginAt || 'Never', u.loginCount || 0,
      u.trialEndDate || '', u.subscriptionEndDate || ''
    ]);
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `platform_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const isSelf = (u: any) => currentUser && u.id === currentUser.id;

  const renderStatusDropdown = (u: any) => {
    const disabled = isSelf(u) && u.role === 'admin';
    const currentStatus = u.status || 'active';
    return (
      <div className="relative inline-flex">
        <select
          value={currentStatus}
          disabled={disabled}
          onChange={(e) => handleStatusChange(u.id, u.name || u.fullName, e.target.value)}
          className={`appearance-none pl-6 pr-6 py-1 rounded-full text-[11px] font-bold border cursor-pointer outline-none transition-all hover:shadow-sm ${
            disabled ? 'opacity-60 cursor-not-allowed ' : ''
          }${statusBgColors[currentStatus] || statusBgColors.active}`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${statusDotColors[currentStatus] || statusDotColors.active}`} />
        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none" />
      </div>
    );
  };

  const renderApprovalDropdown = (u: any) => {
    const disabled = isSelf(u);
    const currentApproval = u.approvalStatus || 'approved';
    return (
      <div className="relative inline-flex">
        <select
          value={currentApproval}
          disabled={disabled}
          onChange={(e) => handleApprovalChange(u.id, u.name || u.fullName, e.target.value)}
          className={`appearance-none pl-6 pr-6 py-1 rounded-full text-[11px] font-bold border cursor-pointer outline-none transition-all hover:shadow-sm ${
            disabled ? 'opacity-60 cursor-not-allowed ' : ''
          }${approvalBgColors[currentApproval] || approvalBgColors.approved}`}
        >
          <option value="pending" disabled>Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${approvalDotColors[currentApproval] || approvalDotColors.approved}`} />
        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">View and manage all registered platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 text-sm transition-colors shadow-sm"
          >
            <Download size={15} className="mr-2 text-gray-600" /> Export CSV
          </button>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="px-3 py-1.5 bg-purple-100 text-[#5B21B6] rounded-lg">{usersList.length} Total</span>
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">{usersList.filter(u => u.status === 'active').length} Active</span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg">{usersList.filter(u => u.status === 'inactive').length} Inactive</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search users..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'founder', 'mentor', 'investor', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${roleFilter === r ? 'bg-[#5B21B6] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Signup Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Login Count</th>
                {!['admin', 'mentor', 'investor'].includes(roleFilter) && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trial Expiry</th>}
                {!['admin', 'mentor', 'investor'].includes(roleFilter) && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subscription Expiry</th>}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Approval</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-sm font-black shadow flex-shrink-0">
                        {(u.name || u.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{u.name || u.fullName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[(u.role || '').toLowerCase()] || roleColors.founder}`}>
                      {(!u.role || u.role.toLowerCase() === 'user' || u.role.toLowerCase() === 'founder') ? 'founder' : u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.signupDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.lastLoginAt ? formatDate(u.lastLoginAt) : <span className="text-gray-400 italic">Never</span>}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{u.loginCount || 0}</td>
                  {!['admin', 'mentor', 'investor'].includes(roleFilter) && (
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.trialEndDate ? (
                        <span className={`font-medium ${new Date(u.trialEndDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDate(u.trialEndDate)}
                          {new Date(u.trialEndDate) < new Date() && <span className="ml-1 text-[10px] font-bold text-red-500">(Expired)</span>}
                        </span>
                      ) : <span className="text-gray-400 italic">—</span>}
                    </td>
                  )}
                  {!['admin', 'mentor', 'investor'].includes(roleFilter) && (
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.subscriptionEndDate ? (
                        <span className={`font-medium ${new Date(u.subscriptionEndDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDate(u.subscriptionEndDate)}
                          {new Date(u.subscriptionEndDate) < new Date() && <span className="ml-1 text-[10px] font-bold text-red-500">(Expired)</span>}
                        </span>
                      ) : <span className="text-gray-400 italic">—</span>}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    {renderStatusDropdown(u)}
                  </td>
                  <td className="px-6 py-4">
                    {renderApprovalDropdown(u)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye size={14} /> View
                      </button>
                      {u.role === 'mentor' && (
                        <button
                          onClick={() => openEditMentor(u)}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                          title="Edit Mentor Profile"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                      )}
                      {!isSelf(u) && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name || u.fullName)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                          title="Delete User"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-6 px-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg flex flex-col my-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-base font-black shadow flex-shrink-0">
                  {(selectedUser.name || selectedUser.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 text-lg">{selectedUser.name || selectedUser.fullName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[selectedUser.role] || roleColors.founder}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-6 overflow-y-auto text-sm text-gray-700 space-y-0">
              {/* Basic Information */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-[#5B21B6]"></span> Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Role</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleColors[selectedUser.role] || roleColors.founder}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Login Count</span>
                    <span className="font-bold text-gray-900 text-base">{selectedUser.loginCount || 0}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mobile Number</span>
                    <span className="font-bold text-gray-900">{selectedUser.mobile || selectedUser.phone || '—'}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Location</span>
                    <span className="font-bold text-gray-900">{selectedUser.location || selectedUser.preferredLocation || '—'}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Signup Date</span>
                    <span className="font-bold text-gray-900">{formatDate(selectedUser.signupDate)}</span>
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100" />

              {/* Role-Specific Details */}
              {selectedUser.role === 'mentor' && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-blue-500"></span> Mentor Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Expertise</span>
                        <span className="font-bold text-gray-900">{selectedUser.expertise || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Experience</span>
                        <span className="font-bold text-gray-900">{selectedUser.experienceYears ? `${selectedUser.experienceYears} Years` : '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">LinkedIn</span>
                        {selectedUser.linkedin ? (
                          <a href={selectedUser.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-[#5B21B6] hover:underline truncate block">
                            {selectedUser.linkedin}
                          </a>
                        ) : (
                          <span className="font-bold text-gray-900">—</span>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mobile</span>
                        <span className="font-bold text-gray-900">{selectedUser.mobile || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Location</span>
                        <span className="font-bold text-gray-900">{selectedUser.location || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Verification Status</span>
                        <span className="font-bold text-gray-900 capitalize">{selectedUser.approvalStatus || 'pending'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Bio</span>
                        <p className="text-sm text-gray-800">{selectedUser.bio || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="my-4 border-t border-gray-100" />

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-amber-500"></span> KYC / Proof Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Aadhaar Number</span>
                        <span className="font-bold text-gray-900">{selectedUser.aadharNumber || '—'}</span>
                        {selectedUser.aadharDocUrl && (
                          <a href={selectedUser.aadharDocUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#5B21B6] hover:underline mt-1.5">
                            <ExternalLink size={12} /> View Aadhaar Document
                          </a>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">PAN Number</span>
                        <span className="font-bold text-gray-900">{selectedUser.panNumber || '—'}</span>
                        {selectedUser.panDocUrl && (
                          <a href={selectedUser.panDocUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#5B21B6] hover:underline mt-1.5">
                            <ExternalLink size={12} /> View PAN Document
                          </a>
                        )}
                      </div>
                      {selectedUser.otherDocType && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Additional Document ({selectedUser.otherDocType})</span>
                          <span className="font-bold text-gray-900">{selectedUser.otherDocNumber || '—'}</span>
                          {selectedUser.otherDocUrl && (
                            <a href={selectedUser.otherDocUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#5B21B6] hover:underline mt-1.5">
                              <ExternalLink size={12} /> View Additional Document
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="my-4 border-t border-gray-100" />
                </>
              )}

              {selectedUser.role === 'founder' && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-yellow-500"></span> Founder Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Startup Name</span>
                        <span className="font-bold text-gray-900">{selectedUser.startupName || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Industry</span>
                        <span className="font-bold text-gray-900">{selectedUser.industry || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Startup Stage</span>
                        <span className="font-bold text-gray-900">{selectedUser.startupStage || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Current Role</span>
                        <span className="font-bold text-gray-900">{selectedUser.currentRole || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mobile</span>
                        <span className="font-bold text-gray-900">{selectedUser.mobile || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="my-4 border-t border-gray-100" />
                </>
              )}

              {((selectedUser.role || '').toLowerCase().includes('investor') || !!selectedUser.investorType || !!selectedUser.isInvitedLead) && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-emerald-500"></span> Investor Profile & Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Company / Firm</span>
                        <span className="font-bold text-gray-900">{selectedUser.companyName || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Investor Type / Category</span>
                        <span className="font-bold text-gray-900">{selectedUser.investorType || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Designation</span>
                        <span className="font-bold text-gray-900">{selectedUser.designation || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Experience</span>
                        <span className="font-bold text-gray-900">{selectedUser.experienceYears || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mobile</span>
                        <span className="font-bold text-gray-900">{selectedUser.mobile || selectedUser.phone || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Location</span>
                        <span className="font-bold text-gray-900">{selectedUser.location || selectedUser.preferredLocation || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">LinkedIn</span>
                        {(selectedUser.linkedin || selectedUser.linkedinUrl) ? (
                          <a href={selectedUser.linkedin || selectedUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-[#5B21B6] hover:underline truncate block">
                            {selectedUser.linkedin || selectedUser.linkedinUrl}
                          </a>
                        ) : <span className="font-bold text-gray-900">—</span>}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Website</span>
                        {selectedUser.website ? (
                          <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="font-bold text-[#5B21B6] hover:underline truncate block">
                            {selectedUser.website}
                          </a>
                        ) : <span className="font-bold text-gray-900">—</span>}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Investment Range</span>
                        <span className="font-bold text-[#5B21B6]">
                          {selectedUser.investmentRange || (selectedUser.minInvestment ? `₹${selectedUser.minInvestment} - ₹${selectedUser.maxInvestment}` : '—')}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Preferred Location</span>
                        <span className="font-bold text-gray-900">{selectedUser.preferredLocation || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Preferred Industries</span>
                        <span className="font-bold text-gray-900">
                          {Array.isArray(selectedUser.preferredIndustries) && selectedUser.preferredIndustries.length > 0
                            ? selectedUser.preferredIndustries.join(', ')
                            : (selectedUser.preferredIndustry || '—')}
                        </span>
                      </div>
                      {Array.isArray(selectedUser.investmentStages) && selectedUser.investmentStages.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Investment Stages</span>
                          <span className="font-bold text-gray-900">{selectedUser.investmentStages.join(', ')}</span>
                        </div>
                      )}
                      {selectedUser.investmentFocus && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Investment Focus & Strategy</span>
                          <p className="text-xs text-gray-800">{selectedUser.investmentFocus}</p>
                        </div>
                      )}
                      {selectedUser.previousExperience && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Previous Investment Experience</span>
                          <p className="text-xs text-gray-800">{selectedUser.previousExperience}</p>
                        </div>
                      )}
                      {(selectedUser.startupsInvestedCount || selectedUser.portfolioCompanies || selectedUser.notableInvestments) && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2 space-y-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Portfolio & Investment Track Record</span>
                          {selectedUser.startupsInvestedCount && <div><span className="text-gray-400">Startups Invested:</span> <strong>{selectedUser.startupsInvestedCount}</strong></div>}
                          {selectedUser.portfolioCompanies && <div><span className="text-gray-400">Portfolio Companies:</span> <strong>{selectedUser.portfolioCompanies}</strong></div>}
                          {selectedUser.notableInvestments && <div><span className="text-gray-400">Notable Investments:</span> <strong>{selectedUser.notableInvestments}</strong></div>}
                        </div>
                      )}
                      {selectedUser.areasOfExpertise && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Areas of Expertise</span>
                          <span className="font-bold text-gray-900">
                            {Array.isArray(selectedUser.areasOfExpertise) ? selectedUser.areasOfExpertise.join(', ') : selectedUser.areasOfExpertise}
                          </span>
                        </div>
                      )}
                      {selectedUser.bio && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Bio / Overview</span>
                          <p className="text-xs text-gray-700 italic">{selectedUser.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invitation Details if Invited Lead */}
                  {selectedUser.inviteUrl && (
                    <div className="mt-4 p-4 bg-gray-900 text-white rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase text-amber-400">Unique Investor Invitation Link</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                          {selectedUser.inviteStatus || 'INVITED'}
                        </span>
                      </div>
                      <div className="bg-gray-800 border border-gray-700 p-2.5 rounded-xl flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-gray-200 truncate flex-1">{selectedUser.inviteUrl}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser.inviteUrl);
                            showToast('Invitation link copied!');
                          }}
                          className="px-3 py-1.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Copy size={13} /> Copy Link
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verification Documents */}
                  {(selectedUser.kycDocUrl || selectedUser.panTaxDocUrl || selectedUser.orgProofUrl || selectedUser.repProofUrl || selectedUser.supportingDocUrl) && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="w-1 h-4 rounded-full bg-purple-500"></span> Uploaded Verification Documents
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedUser.kycDocUrl && (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Government ID / KYC</span>
                              <span className="text-xs font-bold text-gray-800 truncate block">{selectedUser.kycDocName || 'KYC_Document'}</span>
                            </div>
                            <a href={selectedUser.kycDocUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-100 text-[#5B21B6] font-bold text-[10px] rounded-lg hover:bg-purple-200">
                              View
                            </a>
                          </div>
                        )}
                        {selectedUser.panTaxDocUrl && (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">PAN / Tax ID</span>
                              <span className="text-xs font-bold text-gray-800 truncate block">{selectedUser.panTaxDocName || 'PAN_Tax_ID'}</span>
                            </div>
                            <a href={selectedUser.panTaxDocUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-100 text-[#5B21B6] font-bold text-[10px] rounded-lg hover:bg-purple-200">
                              View
                            </a>
                          </div>
                        )}
                        {selectedUser.orgProofUrl && (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Org / Fund Proof</span>
                              <span className="text-xs font-bold text-gray-800 truncate block">{selectedUser.orgProofName || 'Org_Proof'}</span>
                            </div>
                            <a href={selectedUser.orgProofUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-100 text-[#5B21B6] font-bold text-[10px] rounded-lg hover:bg-purple-200">
                              View
                            </a>
                          </div>
                        )}
                        {selectedUser.repProofUrl && (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Authorized Rep Proof</span>
                              <span className="text-xs font-bold text-gray-800 truncate block">{selectedUser.repProofName || 'Rep_Proof'}</span>
                            </div>
                            <a href={selectedUser.repProofUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-100 text-[#5B21B6] font-bold text-[10px] rounded-lg hover:bg-purple-200">
                              View
                            </a>
                          </div>
                        )}
                        {selectedUser.supportingDocUrl && (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Supporting Doc</span>
                              <span className="text-xs font-bold text-gray-800 truncate block">{selectedUser.supportingDocName || 'Supporting_Doc'}</span>
                            </div>
                            <a href={selectedUser.supportingDocUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-100 text-[#5B21B6] font-bold text-[10px] rounded-lg hover:bg-purple-200">
                              View
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="my-4 border-t border-gray-100" />
                </>
              )}

              {/* Account Status */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-emerald-500"></span> Account Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Status</span>
                    {renderStatusDropdown(selectedUser)}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Approval Status</span>
                    {renderApprovalDropdown(selectedUser)}
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100" />

              {/* Login Activity */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-blue-500"></span> Login Activity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Last Login</span>
                    <span className="font-bold text-gray-900">{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : <span className="text-gray-400 italic">Never logged in</span>}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Login Count</span>
                    <span className="font-bold text-gray-900">{selectedUser.loginCount || 0}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50/60 rounded-b-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {!isSelf(selectedUser) && (
                  <button
                    onClick={() => { handleDeleteUser(selectedUser.id, selectedUser.name || selectedUser.fullName); setSelectedUser(null); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete User
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mentor Profile Modal */}
      {editingMentor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-6 px-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-2xl flex flex-col my-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-base font-black shadow flex-shrink-0">
                  {(mentorForm.fullName || 'M').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Edit Mentor Profile</h3>
                  <p className="text-xs text-gray-500">{editingMentor.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMentor(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-6 overflow-y-auto">
              {editLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-[#5B21B6]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input
                      value={mentorForm.fullName}
                      onChange={(e) => updateForm('fullName', e.target.value)}
                      placeholder="Mentor full name"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Title / Professional Title</label>
                    <input
                      value={mentorForm.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      placeholder="e.g. Finance & Fundraising Mentor"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Experience (Years)</label>
                    <input
                      type="number"
                      min={0}
                      value={mentorForm.experienceYears}
                      onChange={(e) => updateForm('experienceYears', e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
                    <input
                      value={mentorForm.location}
                      onChange={(e) => updateForm('location', e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Industry</label>
                    <input
                      value={mentorForm.industry}
                      onChange={(e) => updateForm('industry', e.target.value)}
                      placeholder="e.g. SaaS / FinTech"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Session Duration (min)</label>
                    <input
                      type="number"
                      min={15}
                      step={5}
                      value={mentorForm.sessionDuration}
                      onChange={(e) => updateForm('sessionDuration', e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Session Fee (₹) per session</label>
                    <input
                      type="number"
                      min={0}
                      value={mentorForm.sessionFee}
                      onChange={(e) => updateForm('sessionFee', e.target.value)}
                      placeholder="0 for free sessions"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Shown to founders on the Mentors dashboard and used for booking.</p>
                  </div>

                  {/* Revenue / Commission Split */}
                  <div className="sm:col-span-2 bg-purple-50/70 border border-purple-100 rounded-xl p-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Revenue Split (Commission Settings)</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Mentor Share (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={mentorForm.mentorSharePercentage}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                            setMentorForm((prev) => ({
                              ...prev,
                              mentorSharePercentage: val,
                              platformCommissionPercentage: Math.round((100 - val) * 100) / 100,
                            }));
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#5B21B6] focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20"
                        />
                      </div>
                      <span className="text-gray-400 font-bold text-base mt-4">+</span>
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Platform Commission (%)</label>
                        <input
                          type="number"
                          value={mentorForm.platformCommissionPercentage}
                          readOnly
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-amber-600 cursor-not-allowed"
                        />
                      </div>
                      <span className="text-gray-400 font-bold text-base mt-4">=</span>
                      <div className="mt-4 text-sm font-black text-emerald-600">
                        {mentorForm.mentorSharePercentage + mentorForm.platformCommissionPercentage}%
                      </div>
                    </div>
                    {Number(mentorForm.sessionFee) > 0 && (
                      <div className="mt-3 text-xs bg-white p-2.5 rounded-lg border border-purple-100 flex flex-wrap gap-4 text-gray-700 font-medium">
                        <span>Fee: <strong className="text-gray-900">₹{Number(mentorForm.sessionFee)}</strong></span>
                        <span>Mentor Gets (80% default): <strong className="text-emerald-700">₹{((Number(mentorForm.sessionFee) * mentorForm.mentorSharePercentage) / 100).toFixed(2)}</strong></span>
                        <span>Platform Cut: <strong className="text-amber-700">₹{((Number(mentorForm.sessionFee) * mentorForm.platformCommissionPercentage) / 100).toFixed(2)}</strong></span>
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expertise (comma separated)</label>
                    <input
                      value={mentorForm.expertise}
                      onChange={(e) => updateForm('expertise', e.target.value)}
                      placeholder="e.g. Financial Planning, Fundraising, Valuation"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bio</label>
                    <textarea
                      value={mentorForm.bio}
                      onChange={(e) => updateForm('bio', e.target.value)}
                      rows={3}
                      placeholder="Short professional biography"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
                    <input
                      value={mentorForm.linkedin}
                      onChange={(e) => updateForm('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => {
                        const active = mentorForm.availableDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                              active
                                ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Select which weekdays this mentor is available for sessions.</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Available Time Slots</label>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((t) => {
                        const active = mentorForm.availableSlots.includes(t.value);
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => toggleSlot(t.value)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                              active
                                ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Available times are shown to founders when booking a session.</p>
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Active on Mentors Dashboard</p>
                      <p className="text-xs text-gray-500 mt-0.5">Only approved &amp; active mentors appear for founders to book.</p>
                    </div>
                    <button
                      onClick={() => updateForm('isActive', !mentorForm.isActive)}
                      className={`relative w-12 h-6.5 rounded-full transition-colors ${mentorForm.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      title={mentorForm.isActive ? 'Active' : 'Inactive'}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${mentorForm.isActive ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50/60 rounded-b-3xl">
              <button
                onClick={() => setEditingMentor(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMentor}
                disabled={editLoading || editSaving}
                className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl transition-colors shadow inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editSaving && <Loader2 size={14} className="animate-spin" />}
                <CheckCircle size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
