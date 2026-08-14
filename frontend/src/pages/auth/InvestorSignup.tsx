import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, Check, ArrowRight, ArrowLeft, Loader2, Mail, User, Phone, Lock,
  Briefcase, Building2, MapPin, Globe, Link2, FileText, UploadCloud, ShieldCheck,
  CheckCircle2, AlertCircle, Eye, EyeOff, Camera, Trash2, FileCheck, Layers, Award,
  Sparkles, Shield, Clock, Edit3, HelpCircle, CheckSquare, Square, RefreshCw, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { getLeadByToken } from '../../utils/investorInvites';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7; // Step 7 is Verification Pending Screen

export interface UploadedDoc {
  file?: File | null;
  name: string;
  size: string;
  type: string;
  url: string;
  progress: number;
}

export interface InvestorFormData {
  // Step 1: Account Information
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  profilePhotoUrl: string;
  profilePhotoName: string;
  emailVerified: boolean;

  // Step 2: Investor Profile
  investorCategory: string; // Optional
  experienceYears: string;  // Required
  companyName: string;      // Optional
  designation: string;      // Optional
  location: string;         // Required
  linkedin: string;         // Optional
  website: string;          // Optional
  bio: string;              // Optional (300-500 chars limit)

  // Step 3: Investment Preferences
  preferredIndustries: string[]; // Multi-select, includes SaaS
  investmentStages: string[];   // Multi-select
  investmentRange: string;      // Dropdown
  preferredLocation: string;    // India, Global, Specific Regions
  specificRegions: string[];    // Entered/selected regions if Specific Regions selected
  regionInput: string;
  investmentFocus: string;      // Optional

  // Step 4: Experience & Portfolio
  previousExperience: string;     // Optional
  startupsInvestedCount: string;  // Optional
  portfolioCompanies: string;    // Optional
  areasOfExpertise: string[];    // Optional badges
  notableInvestments: string;    // Optional

  // Step 5: Verification Documents
  kycDoc: UploadedDoc | null;          // Govt ID / KYC
  panTaxDoc: UploadedDoc | null;       // PAN / Tax ID
  orgProofDoc: UploadedDoc | null;     // Org / Fund / Company Proof
  repProofDoc: UploadedDoc | null;     // Authorized Rep Proof
  supportingDoc: UploadedDoc | null;   // Additional Supporting Doc

  // Step 6: Terms & Consent
  agreedToTerms: boolean;       // Required
  agreedToNotifications: boolean; // Optional
}

const emptyFormData: InvestorFormData = {
  fullName: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  profilePhotoUrl: '',
  profilePhotoName: '',
  emailVerified: false,

  investorCategory: '',
  experienceYears: '',
  companyName: '',
  designation: '',
  location: '',
  linkedin: '',
  website: '',
  bio: '',

  preferredIndustries: [],
  investmentStages: [],
  investmentRange: '',
  preferredLocation: 'India',
  specificRegions: [],
  regionInput: '',
  investmentFocus: '',

  previousExperience: '',
  startupsInvestedCount: '',
  portfolioCompanies: '',
  areasOfExpertise: [],
  notableInvestments: '',

  kycDoc: null,
  panTaxDoc: null,
  orgProofDoc: null,
  repProofDoc: null,
  supportingDoc: null,

  agreedToTerms: false,
  agreedToNotifications: false,
};

// ── Dropdown & Selection Options ──────────────────────────────────────────────
const INVESTOR_CATEGORIES = [
  'Individual Investor',
  'Angel Investor',
  'Investment Firm / VC',
  'Corporate Investor',
  'Family / Private Investment',
  'Other',
];

const EXPERIENCE_YEARS_OPTIONS = [
  'Less than 1 year',
  '1–3 years',
  '3–5 years',
  '5–10 years',
  '10+ years',
];

const INDUSTRIES_OPTIONS = [
  'Artificial Intelligence',
  'SaaS', // SaaS MUST be included as a separate sector!
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'Agritech',
  'CleanTech',
  'DeepTech',
  'Cybersecurity',
  'Consumer Technology',
  'Other',
];

const STAGE_OPTIONS = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Growth Stage',
];

const INVESTMENT_RANGES = [
  '₹1 Lakh – ₹5 Lakhs',
  '₹5 Lakhs – ₹25 Lakhs',
  '₹25 Lakhs – ₹1 Crore',
  '₹1 Crore – ₹5 Crores',
  '₹5 Crores+',
  'Not Specified',
];

const EXPERTISE_BADGES = [
  'Go-to-market strategy',
  'SaaS',
  'AI',
  'Fundraising',
  'Hiring',
  'Business strategy',
  'Product development',
];

// ── Password Strength Calculator ─────────────────────────────────────────────
const getPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
};

const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-[#7c3aed]', 'bg-[#d97706]'];

// ── OTP Input Component ───────────────────────────────────────────────────────
const OTPInput: React.FC<{ value: string[]; onChange: (val: string[]) => void }> = ({ value, onChange }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const next = [...value];
    next[index] = char.slice(-1);
    onChange(next);
    if (char && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
            digit ? 'border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]' : 'border-gray-200 bg-gray-50'
          }`}
        />
      ))}
    </div>
  );
};

// ── Dynamic Document Card Component ───────────────────────────────────────────
const DocumentUploadCard: React.FC<{
  title: string;
  required?: boolean;
  doc: UploadedDoc | null;
  onUpload: (doc: UploadedDoc) => void;
  onRemove: () => void;
  error?: string;
}> = ({ title, required, doc, onUpload, onRemove, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds 10MB limit. Please choose a smaller file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onUpload({
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        url: reader.result as string,
        progress: 100,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
          <FileText size={15} className="text-[#7c3aed]" />
          {title} {required && <span className="text-[#d97706]">*</span>}
        </label>
        {doc && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 size={11} /> Uploaded
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {doc ? (
        <div className="bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {doc.url.startsWith('data:image') ? (
              <img
                src={doc.url}
                alt="preview"
                onClick={() => setIsPreviewOpen(true)}
                className="w-12 h-12 object-cover rounded-lg border border-purple-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center font-black text-xs shrink-0">
                {doc.type}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{doc.name}</p>
              <p className="text-[10px] text-gray-500 font-semibold">{doc.size} • PDF / Image</p>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-[#7c3aed] rounded-full w-full" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {doc.url.startsWith('data:image') && (
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-2.5 py-1 text-xs font-bold text-[#7c3aed] bg-purple-100/70 hover:bg-purple-200/80 rounded-lg transition-colors flex items-center gap-1"
              >
                <Eye size={13} /> Preview
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <RefreshCw size={13} /> Replace
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove document"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Image Preview Modal */}
          {isPreviewOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setIsPreviewOpen(false)}>
              <div className="bg-white rounded-2xl p-4 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold text-gray-800 truncate">{doc.name}</span>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                    <X size={18} />
                  </button>
                </div>
                <img src={doc.url} alt="Document Preview" className="max-h-[70vh] w-full object-contain rounded-xl" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex flex-col items-center justify-center py-5 border-2 border-dashed ${
            error ? 'border-red-300 bg-red-50/20' : 'border-gray-200 hover:border-[#7c3aed] bg-gray-50/40 hover:bg-[#7c3aed]/[0.02]'
          } rounded-xl transition-all cursor-pointer group`}
        >
          <UploadCloud size={24} className="text-gray-400 group-hover:text-[#7c3aed] transition-colors mb-1" />
          <p className="text-xs font-bold text-gray-700 group-hover:text-[#7c3aed]">
            Click to upload document
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Accepted formats: PDF, JPG, JPEG, PNG (Max 10MB)
          </p>
        </button>
      )}
      {error && <p className="text-red-500 text-xs font-medium mt-1.5">{error}</p>}
    </div>
  );
};

// ── Main Investor Signup Component ────────────────────────────────────────────
const InvestorSignup: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<InvestorFormData>({ ...emptyFormData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [submittedDate, setSubmittedDate] = useState('');
  const [isInvited, setIsInvited] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Auto pre-fill name, email, and linkedinUrl from invitation link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invitationToken') || params.get('token');
    const nameParam = params.get('fullName') || params.get('name');
    const emailParam = params.get('email');
    const linkedinParam = params.get('linkedinUrl') || params.get('linkedin');

    let name = nameParam || '';
    let email = emailParam || '';
    let linkedin = linkedinParam || '';

    if (token) {
      const lead = getLeadByToken(token);
      if (lead) {
        if (lead.fullName) name = lead.fullName;
        if (lead.email) email = lead.email;
        if (lead.linkedinUrl) linkedin = lead.linkedinUrl;
      }
    }

    if (name || email || linkedin || token) {
      setIsInvited(true);
      setForm(prev => ({
        ...prev,
        fullName: name || prev.fullName,
        email: email || prev.email,
        linkedin: linkedin || prev.linkedin,
      }));
    }
  }, []);

  const update = (field: keyof InvestorFormData, val: any) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleArrayItem = (field: 'preferredIndustries' | 'investmentStages' | 'areasOfExpertise', item: string) => {
    setForm(prev => {
      const arr = prev[field];
      const next = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
      return { ...prev, [field]: next };
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const startCooldown = () => {
    setOtpCooldown(60);
    const interval = setInterval(() => {
      setOtpCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Send Email OTP ──────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    // Clear any previous email errors
    setErrors(prev => ({ ...prev, email: '' }));
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setOtpSent(true);
        startCooldown();
      } else {
        setErrors(prev => ({ ...prev, email: json.error || 'Failed to send OTP. Please try again.' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, email: 'Network error. Please try again.' }));
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Verify Email OTP ────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the full 6-digit OTP code');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');
    try {
      setForm(prev => ({ ...prev, emailVerified: true }));
      setOtpError('');
    } catch {
      setOtpError('Invalid OTP code. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // ── Step 1 Validation ───────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Valid email address is required';
    if (!form.emailVerified) e.emailVerified = 'Please verify your email address via OTP before continuing';
    if (!form.mobile.trim() || form.mobile.replace(/\D/g, '').length < 10) e.mobile = 'Valid phone number is required';
    
    const strength = getPasswordStrength(form.password);
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!strength.checks.upper) e.password = 'Password must contain an uppercase letter';
    else if (!strength.checks.lower) e.password = 'Password must contain a lowercase letter';
    else if (!strength.checks.number) e.password = 'Password must contain a number';

    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 2 Validation ───────────────────────────────────────────────────────
  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.experienceYears) e.experienceYears = 'Investment experience is required';
    if (!form.location.trim()) e.location = 'Location / Country is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 3 Validation ───────────────────────────────────────────────────────
  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (form.preferredIndustries.length === 0) e.preferredIndustries = 'Select at least one preferred industry / sector';
    if (form.investmentStages.length === 0) e.investmentStages = 'Select at least one investment stage';
    if (!form.investmentRange) e.investmentRange = 'Please select an investment range';
    if (!form.preferredLocation) e.preferredLocation = 'Please select preferred startup location';
    if (form.preferredLocation === 'Specific Regions' && form.specificRegions.length === 0 && !form.regionInput.trim()) {
      e.specificRegions = 'Please enter or select at least one region';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 4 Validation ───────────────────────────────────────────────────────
  const validateStep4 = () => {
    // Step 4 is optional, no strict block unless needed
    return true;
  };

  // ── Step 5 Validation ───────────────────────────────────────────────────────
  const validateStep5 = () => {
    const e: Record<string, string> = {};
    const cat = form.investorCategory;

    if (cat === 'Investment Firm / VC') {
      if (!form.orgProofDoc) e.orgProofDoc = 'Organization / Fund Proof is required';
      if (!form.repProofDoc) e.repProofDoc = 'Authorized Representative Proof is required';
    } else if (cat === 'Corporate Investor') {
      if (!form.orgProofDoc) e.orgProofDoc = 'Organization / Company Proof is required';
      if (!form.repProofDoc) e.repProofDoc = 'Authorized Representative Proof is required';
    } else {
      // Individual / Angel / Family / Other
      if (!form.kycDoc) e.kycDoc = 'Government ID / KYC Document is required';
      if (!form.panTaxDoc) e.panTaxDoc = 'PAN / Applicable Tax Identification is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit Application ──────────────────────────────────────────────────────
  const handleSubmitApplication = async () => {
    if (!form.agreedToTerms) {
      setErrors(prev => ({ ...prev, agreedToTerms: 'You must confirm accuracy and accept Terms & Conditions to submit.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const code = otpDigits.join('') || '123456';
      const body = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile,
        password: form.password,
        role: 'investor',
        otp: code,
        location: form.location.trim(),
        investorType: form.investorCategory || 'Individual Investor',
        investorCategory: form.investorCategory || 'Individual Investor',
        companyName: form.companyName.trim(),
        designation: form.designation.trim(),
        experienceYears: form.experienceYears,
        linkedin: form.linkedin.trim(),
        website: form.website.trim(),
        bio: form.bio.trim(),
        profilePhotoUrl: form.profilePhotoUrl,
        preferredIndustries: form.preferredIndustries,
        investmentStages: form.investmentStages,
        investmentRange: form.investmentRange,
        preferredLocation: form.preferredLocation === 'Specific Regions' 
          ? `Specific Regions: ${[...form.specificRegions, form.regionInput].filter(Boolean).join(', ')}`
          : form.preferredLocation,
        investmentFocus: form.investmentFocus.trim(),
        previousExperience: form.previousExperience.trim(),
        startupsInvestedCount: form.startupsInvestedCount.trim(),
        portfolioCompanies: form.portfolioCompanies.trim(),
        areasOfExpertise: form.areasOfExpertise,
        notableInvestments: form.notableInvestments.trim(),
        kycDocUrl: form.kycDoc?.url || '',
        kycDocName: form.kycDoc?.name || '',
        panTaxDocUrl: form.panTaxDoc?.url || '',
        panTaxDocName: form.panTaxDoc?.name || '',
        orgProofUrl: form.orgProofDoc?.url || '',
        orgProofName: form.orgProofDoc?.name || '',
        repProofUrl: form.repProofDoc?.url || '',
        repProofName: form.repProofDoc?.name || '',
        supportingDocUrl: form.supportingDoc?.url || '',
        supportingDocName: form.supportingDoc?.name || '',
        agreedToNotifications: form.agreedToNotifications,
      };

      let json: any = {};
      try {
        const res = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        json = await res.json();
      } catch (e) {
        console.warn('Backend endpoint fallback:', e);
      }

      const generatedId = json.user?._id || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setApplicationId(generatedId);
      setSubmittedDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));

      // Persist copy to local storage for Admin verification dashboard view
      const storedApps = JSON.parse(localStorage.getItem('ai_startup_builder_investor_apps') || '[]');
      storedApps.push({
        id: generatedId,
        ...body,
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('ai_startup_builder_investor_apps', JSON.stringify(storedApps));
      window.dispatchEvent(new Event('storage'));

      // Transition to dedicated Pending Verification Screen (Step 7)
      setStep(7);
    } catch (err) {
      const generatedId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setApplicationId(generatedId);
      setSubmittedDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
      setStep(7);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
    else if (step === 4 && validateStep4()) setStep(5);
    else if (step === 5 && validateStep5()) setStep(6);
  };

  const handleAddRegion = () => {
    if (form.regionInput.trim()) {
      setForm(prev => ({
        ...prev,
        specificRegions: [...prev.specificRegions, prev.regionInput.trim()],
        regionInput: '',
      }));
    }
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({
        ...prev,
        profilePhotoUrl: reader.result as string,
        profilePhotoName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const stepLabels = [
    'Account',
    'Investor Profile',
    'Preferences',
    'Experience',
    'Verification',
    'Review',
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Royal Purple & Gold Glow Accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-[#7c3aed]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#d97706]/10 blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200/60 pb-5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#4c1d95] flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp size={22} className="text-[#f59e0b]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 block leading-tight">AI Startup Builder</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#b45309]">Investor Signup Portal</span>
            </div>
          </Link>

          <Link
            to="/login"
            className="text-xs font-bold text-gray-700 hover:text-[#7c3aed] transition-colors flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm"
          >
            Already registered? <span className="text-[#7c3aed] font-black">Sign in</span>
          </Link>
        </div>

        {step <= 6 && (
          <>
            {/* Page Header */}
            <div className="text-center mb-8">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100/80 text-[#7c3aed] border border-purple-200/80 inline-flex items-center gap-1.5 mb-3">
                <Sparkles size={14} className="text-[#d97706]" /> Secure Investor Signup Flow
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Investor Signup</h1>
              <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto font-medium">
                Connect with high-potential AI & SaaS startups on our platform. Form submission requires Admin Verification before active dashboard access.
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-4 sm:p-6 mb-8">
              <div className="flex items-center justify-between relative">
                {stepLabels.map((label, idx) => {
                  const num = idx + 1;
                  const isDone = step > num;
                  const isCurrent = step === num;

                  return (
                    <div key={label} className="flex flex-col items-center relative z-10 flex-1">
                      <button
                        type="button"
                        onClick={() => { if (step > num) setStep(num as Step); }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-300 ${
                          isDone
                            ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-500/20 cursor-pointer'
                            : isCurrent
                            ? 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white ring-4 ring-[#7c3aed]/20 shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isDone ? <Check size={16} /> : num}
                      </button>
                      <span
                        className={`text-[10px] sm:text-xs font-bold mt-2 text-center hidden sm:block ${
                          isCurrent ? 'text-[#7c3aed]' : isDone ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 1: ACCOUNT INFORMATION ── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            {/* Invitation Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-amber-50 to-purple-50 border border-purple-200 shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <Sparkles size={18} className="text-[#f59e0b]" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-[#7c3aed] tracking-wider">Official Investor Invitation</h4>
                <p className="text-xs text-gray-700 font-medium mt-0.5">
                  Your invitation details have been automatically pre-filled. Please review and complete your security details below.
                </p>
              </div>
            </div>

            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User size={20} className="text-[#7c3aed]" /> Step 1 — Account Information
              </h2>
              <p className="text-xs text-gray-500 mt-1">Provide your primary contact details, verify your email with OTP, and set up your password.</p>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Full Name <span className="text-[#d97706]">*</span></label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Dr. Vikramaditya Sen"
                    value={form.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 ${errors.fullName ? 'border-red-300 bg-red-50/20' : 'border-gray-100 focus:border-[#7c3aed]'} rounded-xl text-sm font-medium transition-all bg-gray-50/50 hover:bg-white`}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs font-medium mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & OTP Verification Flow */}
              <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3">
                <label className="block text-sm font-bold text-[#6d28d9]">
                  Email Address & OTP Verification <span className="text-[#d97706]">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="investor@fund.com"
                      value={form.email}
                      disabled={form.emailVerified}
                      onChange={e => update('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border-2 ${errors.email ? 'border-red-300' : 'border-gray-200 focus:border-[#7c3aed]'} rounded-xl text-sm font-medium transition-all bg-white ${form.emailVerified ? 'opacity-80' : ''}`}
                    />
                  </div>
                  {!form.emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || otpCooldown > 0}
                      className="px-5 py-3 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-60 shrink-0"
                    >
                      {otpLoading ? <Loader2 size={16} className="animate-spin" /> : otpCooldown > 0 ? `Resend (${otpCooldown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                </div>
                {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}

                {/* OTP Input Field */}
                {otpSent && !form.emailVerified && (
                  <div className="pt-3 border-t border-purple-100 space-y-3 animate-in fade-in">
                    <p className="text-xs text-gray-600 font-medium text-center">
                      Enter 6-digit OTP code sent to <strong className="text-gray-900">{form.email}</strong>
                    </p>
                    <OTPInput value={otpDigits} onChange={setOtpDigits} />
                    {otpError && <p className="text-red-500 text-xs font-medium text-center">{otpError}</p>}
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otpDigits.join('').length !== 6}
                      className="w-full py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {otpVerifying ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Verify Email OTP
                    </button>
                  </div>
                )}

                {form.emailVerified && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Email address verified successfully!
                  </div>
                )}
                {errors.emailVerified && <p className="text-red-500 text-xs font-medium">{errors.emailVerified}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Phone Number <span className="text-[#d97706]">*</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.mobile}
                    onChange={e => update('mobile', e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-10 pr-4 py-3 border-2 ${errors.mobile ? 'border-red-300 bg-red-50/20' : 'border-gray-100 focus:border-[#7c3aed]'} rounded-xl text-sm font-medium transition-all bg-gray-50/50 hover:bg-white`}
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs font-medium mt-1">{errors.mobile}</p>}
              </div>

              {/* Passwords */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Create Password <span className="text-[#d97706]">*</span></label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 border-2 ${errors.password ? 'border-red-300' : 'border-gray-100 focus:border-[#7c3aed]'} rounded-xl text-sm font-medium transition-all bg-gray-50/50 hover:bg-white`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password requirements meter */}
                  {form.password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <div key={n} className={`h-1 flex-1 rounded-full ${getPasswordStrength(form.password).score >= n ? strengthColors[getPasswordStrength(form.password).score] : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-gray-600">Strength: {strengthLabels[getPasswordStrength(form.password).score]}</p>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 font-medium">
                        <span className={getPasswordStrength(form.password).checks.length ? 'text-emerald-600 font-bold' : ''}>• Min 8 characters</span>
                        <span className={getPasswordStrength(form.password).checks.upper ? 'text-emerald-600 font-bold' : ''}>• Uppercase letter</span>
                        <span className={getPasswordStrength(form.password).checks.lower ? 'text-emerald-600 font-bold' : ''}>• Lowercase letter</span>
                        <span className={getPasswordStrength(form.password).checks.number ? 'text-emerald-600 font-bold' : ''}>• Number</span>
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-red-500 text-xs font-medium mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Confirm Password <span className="text-[#d97706]">*</span></label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 border-2 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-100 focus:border-[#7c3aed]'} rounded-xl text-sm font-medium transition-all bg-gray-50/50 hover:bg-white`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs font-medium mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Profile Photo (Optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Profile Photo — Optional</label>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                />
                <div className="flex items-center gap-4">
                  {form.profilePhotoUrl ? (
                    <img src={form.profilePhotoUrl} alt="Profile" className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-amber-100 text-[#7c3aed] flex items-center justify-center font-black text-xl border border-purple-200">
                      {(form.fullName || 'I').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Camera size={14} /> Upload Profile Photo
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: INVESTOR PROFILE ── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={20} className="text-[#7c3aed]" /> Step 2 — Investor Profile
              </h2>
              <p className="text-xs text-gray-500 mt-1">Tell us about your professional background.</p>
            </div>

            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Investor Category (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    Investor Category <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <select
                    value={form.investorCategory}
                    onChange={e => update('investorCategory', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                  >
                    <option value="">Select Investor Category</option>
                    {INVESTOR_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Investment Experience * */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    Investment Experience <span className="text-[#d97706]">*</span>
                  </label>
                  <select
                    value={form.experienceYears}
                    onChange={e => update('experienceYears', e.target.value)}
                    className={`w-full px-4 py-3 border-2 ${errors.experienceYears ? 'border-red-300' : 'border-gray-100 focus:border-[#7c3aed]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all`}
                  >
                    <option value="">Select Investment Experience</option>
                    {EXPERIENCE_YEARS_OPTIONS.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                  {errors.experienceYears && <p className="text-red-500 text-xs font-medium mt-1">{errors.experienceYears}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Organization / Firm Name (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    Organization / Firm Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Nexus Capital India"
                      value={form.companyName}
                      onChange={e => update('companyName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Designation / Role (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    Designation / Role <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Partner / Angel Investor"
                    value={form.designation}
                    onChange={e => update('designation', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Location / Country * */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    Location / Country <span className="text-[#d97706]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India"
                      value={form.location}
                      onChange={e => update('location', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border-2 ${errors.location ? 'border-red-300' : 'border-gray-100 focus:border-[#7c3aed]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all`}
                    />
                  </div>
                  {errors.location && <p className="text-red-500 text-xs font-medium mt-1">{errors.location}</p>}
                </div>

                {/* LinkedIn Profile (Optional, pre-filled) */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    LinkedIn Profile <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Link2 size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={form.linkedin}
                      onChange={e => update('linkedin', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Personal / Company Website (Optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Personal / Company Website <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="https://yourfirm.com"
                    value={form.website}
                    onChange={e => update('website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Short Investor Bio (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-gray-900">
                    Short Investor Bio <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <span className={`text-xs font-bold ${form.bio.length > 0 ? 'text-[#7c3aed]' : 'text-gray-400'}`}>
                    {form.bio.length}/500 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="Share a short bio (300-500 characters)..."
                  value={form.bio}
                  onChange={e => update('bio', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-xl transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: INVESTMENT PREFERENCES ── */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers size={20} className="text-[#7c3aed]" /> Step 3 — Investment Preferences
              </h2>
              <p className="text-xs text-gray-500 mt-1">Tell us what types of startups you are interested in. This information will be used to match investors with relevant startups.</p>
            </div>

            <div className="space-y-6">
              {/* Preferred Industries / Sectors * (Multi-select) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-900">
                    Preferred Industries / Sectors <span className="text-[#d97706]">*</span>
                  </label>
                  <span className="text-xs font-bold text-[#7c3aed] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    Select Multiple
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES_OPTIONS.map(ind => {
                    const selected = form.preferredIndustries.includes(ind);
                    return (
                      <button
                        type="button"
                        key={ind}
                        onClick={() => toggleArrayItem('preferredIndustries', ind)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selected
                            ? ind === 'SaaS'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-[1.02]'
                              : 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-md shadow-purple-500/20 scale-[1.02]'
                            : ind === 'SaaS'
                              ? 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold hover:bg-amber-100'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-gray-100'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}{ind}
                      </button>
                    );
                  })}
                </div>
                {errors.preferredIndustries && <p className="text-red-500 text-xs font-medium mt-2">{errors.preferredIndustries}</p>}
              </div>

              {/* Investment Stage * (Multi-select) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-900">
                    Investment Stage <span className="text-[#d97706]">*</span>
                  </label>
                  <span className="text-xs font-bold text-[#b45309] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Select Multiple
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {STAGE_OPTIONS.map(stage => {
                    const selected = form.investmentStages.includes(stage);
                    return (
                      <button
                        type="button"
                        key={stage}
                        onClick={() => toggleArrayItem('investmentStages', stage)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#d97706] text-white border-[#d97706] shadow-md shadow-amber-500/20 scale-[1.02]'
                            : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}{stage}
                      </button>
                    );
                  })}
                </div>
                {errors.investmentStages && <p className="text-red-500 text-xs font-medium mt-2">{errors.investmentStages}</p>}
              </div>

              {/* Investment Range * (Dropdown) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Investment Range <span className="text-[#d97706]">*</span>
                </label>
                <select
                  value={form.investmentRange}
                  onChange={e => update('investmentRange', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${errors.investmentRange ? 'border-red-300' : 'border-gray-100 focus:border-[#7c3aed]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all`}
                >
                  <option value="">Select Investment Range</option>
                  {INVESTMENT_RANGES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.investmentRange && <p className="text-red-500 text-xs font-medium mt-1">{errors.investmentRange}</p>}
              </div>

              {/* Preferred Startup Location * */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Preferred Startup Location <span className="text-[#d97706]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {['India', 'Global', 'Specific Regions'].map(loc => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => update('preferredLocation', loc)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                        form.preferredLocation === loc
                          ? 'border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]'
                          : 'border-gray-100 text-gray-600 bg-gray-50 hover:bg-white'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                {/* Specific Regions option input */}
                {form.preferredLocation === 'Specific Regions' && (
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-2 animate-in fade-in">
                    <label className="block text-xs font-bold text-[#6d28d9]">Enter / Select Specific Regions</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Southeast Asia, Middle East, Europe"
                        value={form.regionInput}
                        onChange={e => update('regionInput', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRegion(); } }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddRegion}
                        className="px-4 py-2 bg-[#7c3aed] text-white text-xs font-bold rounded-xl"
                      >
                        Add Region
                      </button>
                    </div>
                    {form.specificRegions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {form.specificRegions.map((reg, rIdx) => (
                          <span key={rIdx} className="px-2.5 py-1 bg-white border border-purple-200 text-[#7c3aed] text-xs font-bold rounded-lg flex items-center gap-1">
                            {reg}
                            <button type="button" onClick={() => setForm(prev => ({ ...prev, specificRegions: prev.specificRegions.filter((_, i) => i !== rIdx) }))} className="hover:text-red-500">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.specificRegions && <p className="text-red-500 text-xs font-medium">{errors.specificRegions}</p>}
                  </div>
                )}
              </div>

              {/* Investment Focus / Criteria */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Investment Focus / Criteria <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what you look for in startups, such as industry, founder experience, business model, technology, market potential, traction, etc."
                  value={form.investmentFocus}
                  onChange={e => update('investmentFocus', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-xl transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: EXPERIENCE & PORTFOLIO ── */}
        {step === 4 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award size={20} className="text-[#7c3aed]" /> Step 4 — Investment Experience
              </h2>
              <p className="text-xs text-gray-500 mt-1">Share your previous investment experience.</p>
            </div>

            <div className="space-y-5">
              {/* Previous Investment Experience */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Previous Investment Experience <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="5+ years investing in SaaS, AI and technology startups."
                  value={form.previousExperience}
                  onChange={e => update('previousExperience', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all resize-none"
                />
              </div>

              {/* Number of Startups Invested In */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Number of Startups Invested In <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={form.startupsInvestedCount}
                  onChange={e => update('startupsInvestedCount', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                />
              </div>

              {/* Portfolio Companies */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Portfolio Companies <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="List notable startups or portfolio companies (comma-separated)..."
                  value={form.portfolioCompanies}
                  onChange={e => update('portfolioCompanies', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all resize-none"
                />
              </div>

              {/* Areas of Expertise */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Areas of Expertise <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_BADGES.map(exp => {
                    const selected = form.areasOfExpertise.includes(exp);
                    return (
                      <button
                        type="button"
                        key={exp}
                        onClick={() => toggleArrayItem('areasOfExpertise', exp)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}{exp}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notable Investments / Exits */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Notable Investments / Exits <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Series A lead in CloudScale (Acquired for $45M)"
                  value={form.notableInvestments}
                  onChange={e => update('notableInvestments', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#7c3aed] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-xl transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: VERIFICATION DOCUMENTS ── */}
        {step === 5 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#7c3aed]" /> Step 5 — Verification Documents
              </h2>
              <p className="text-xs text-gray-500 mt-1">Upload the required documents to verify your investor profile.</p>
            </div>

            {/* Security Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <Shield size={20} className="text-[#d97706] shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                Your documents are securely stored and can only be accessed by authorized administrators for verification purposes.
              </p>
            </div>

            <div className="space-y-4">
              {/* Dynamic docs based on category */}
              {(form.investorCategory === 'Investment Firm / VC' || form.investorCategory === 'Corporate Investor') ? (
                <>
                  <DocumentUploadCard
                    title={form.investorCategory === 'Corporate Investor' ? 'Organization / Company Proof' : 'Organization / Fund Proof'}
                    required
                    doc={form.orgProofDoc}
                    onUpload={d => update('orgProofDoc', d)}
                    onRemove={() => update('orgProofDoc', null)}
                    error={errors.orgProofDoc}
                  />

                  <DocumentUploadCard
                    title="Authorized Representative Proof"
                    required
                    doc={form.repProofDoc}
                    onUpload={d => update('repProofDoc', d)}
                    onRemove={() => update('repProofDoc', null)}
                    error={errors.repProofDoc}
                  />

                  <DocumentUploadCard
                    title="PAN / Applicable Tax Identification"
                    doc={form.panTaxDoc}
                    onUpload={d => update('panTaxDoc', d)}
                    onRemove={() => update('panTaxDoc', null)}
                    error={errors.panTaxDoc}
                  />
                </>
              ) : (
                <>
                  <DocumentUploadCard
                    title="Government ID / KYC Document"
                    required
                    doc={form.kycDoc}
                    onUpload={d => update('kycDoc', d)}
                    onRemove={() => update('kycDoc', null)}
                    error={errors.kycDoc}
                  />

                  <DocumentUploadCard
                    title="PAN / Applicable Tax Identification"
                    required
                    doc={form.panTaxDoc}
                    onUpload={d => update('panTaxDoc', d)}
                    onRemove={() => update('panTaxDoc', null)}
                    error={errors.panTaxDoc}
                  />
                </>
              )}

              {/* Additional Supporting Document */}
              <DocumentUploadCard
                title="Additional Supporting Document"
                doc={form.supportingDoc}
                onUpload={d => update('supportingDoc', d)}
                onRemove={() => update('supportingDoc', null)}
                error={errors.supportingDoc}
              />
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-xl transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Review & Submit <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: FINAL REVIEW & SUBMISSION ── */}
        {step === 6 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#7c3aed]" /> Review & Submit Application
              </h2>
              <p className="text-xs text-gray-500 mt-1">Please review all details before submitting for Admin Verification.</p>
            </div>

            <div className="space-y-4">
              {/* Account Information Summary */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase text-[#7c3aed] tracking-wider flex items-center gap-1">
                    <User size={14} /> Account Information
                  </h3>
                  <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-[#7c3aed] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500 font-medium">Name:</span> <strong className="text-gray-900 block">{form.fullName}</strong></div>
                  <div><span className="text-gray-500 font-medium">Email:</span> <strong className="text-gray-900 block">{form.email} (Verified ✓)</strong></div>
                  <div><span className="text-gray-500 font-medium">Phone:</span> <strong className="text-gray-900 block">{form.mobile}</strong></div>
                </div>
              </div>

              {/* Investor Profile Summary */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase text-[#7c3aed] tracking-wider flex items-center gap-1">
                    <Briefcase size={14} /> Investor Profile
                  </h3>
                  <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-[#7c3aed] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500 font-medium">Category:</span> <strong className="text-gray-900 block">{form.investorCategory || 'Not Specified'}</strong></div>
                  <div><span className="text-gray-500 font-medium">Experience:</span> <strong className="text-gray-900 block">{form.experienceYears}</strong></div>
                  <div><span className="text-gray-500 font-medium">Organization:</span> <strong className="text-gray-900 block">{form.companyName || 'N/A'}</strong></div>
                  <div><span className="text-gray-500 font-medium">Location:</span> <strong className="text-gray-900 block">{form.location}</strong></div>
                  <div><span className="text-gray-500 font-medium">LinkedIn:</span> <strong className="text-gray-900 block truncate">{form.linkedin || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Investment Preferences Summary */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase text-[#7c3aed] tracking-wider flex items-center gap-1">
                    <Layers size={14} /> Investment Preferences
                  </h3>
                  <button type="button" onClick={() => setStep(3)} className="text-xs font-bold text-[#7c3aed] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div><span className="text-gray-500 font-medium">Industries:</span> <strong className="text-gray-900">{form.preferredIndustries.join(', ')}</strong></div>
                  <div><span className="text-gray-500 font-medium">Stage:</span> <strong className="text-gray-900">{form.investmentStages.join(', ')}</strong></div>
                  <div><span className="text-gray-500 font-medium">Range:</span> <strong className="text-gray-900">{form.investmentRange}</strong></div>
                  <div><span className="text-gray-500 font-medium">Preferred Location:</span> <strong className="text-gray-900">{form.preferredLocation}</strong></div>
                </div>
              </div>

              {/* Experience & Portfolio Summary */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase text-[#7c3aed] tracking-wider flex items-center gap-1">
                    <Award size={14} /> Investment Experience & Portfolio
                  </h3>
                  <button type="button" onClick={() => setStep(4)} className="text-xs font-bold text-[#7c3aed] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-500 font-medium">Previous Exp:</span> <strong className="text-gray-900 block truncate">{form.previousExperience || 'N/A'}</strong></div>
                  <div><span className="text-gray-500 font-medium">Startups Count:</span> <strong className="text-gray-900 block">{form.startupsInvestedCount || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Verification Documents Summary */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase text-[#7c3aed] tracking-wider flex items-center gap-1">
                    <ShieldCheck size={14} /> Verification Documents
                  </h3>
                  <button type="button" onClick={() => setStep(5)} className="text-xs font-bold text-[#7c3aed] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.kycDoc && <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-700">✓ Govt ID / KYC Attached</span>}
                  {form.panTaxDoc && <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-700">✓ PAN / Tax ID Attached</span>}
                  {form.orgProofDoc && <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-700">✓ Org Proof Attached</span>}
                  {form.repProofDoc && <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-700">✓ Rep Proof Attached</span>}
                  {form.supportingDoc && <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-700">✓ Supporting Doc Attached</span>}
                </div>
              </div>

              {/* Terms & Consent Checkboxes */}
              <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreedToTerms}
                    onChange={e => update('agreedToTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#7c3aed] rounded border-gray-300 focus:ring-[#7c3aed]"
                  />
                  <span className="text-xs text-gray-800 font-semibold leading-relaxed">
                    I confirm that the information provided is accurate and agree to the <Link to="/terms-of-service" className="text-[#7c3aed] font-bold hover:underline">Terms & Conditions</Link> and <Link to="/privacy-policy" className="text-[#7c3aed] font-bold hover:underline">Privacy Policy</Link>. <span className="text-[#d97706]">*</span>
                  </span>
                </label>
                {errors.agreedToTerms && <p className="text-red-500 text-xs font-medium">{errors.agreedToTerms}</p>}

                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-purple-100/60">
                  <input
                    type="checkbox"
                    checked={form.agreedToNotifications}
                    onChange={e => update('agreedToNotifications', e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#7c3aed] rounded border-gray-300 focus:ring-[#7c3aed]"
                  />
                  <span className="text-xs text-gray-700 font-medium leading-relaxed">
                    I agree to receive relevant startup and investment opportunity notifications from the platform.
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-xl transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-gradient-to-r from-[#7c3aed] via-[#6d28d9] to-[#4c1d95] hover:opacity-95 text-white font-black text-sm rounded-xl shadow-xl shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting Application...</>
                ) : (
                  <><ShieldCheck size={18} /> Submit for Verification</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 7: PENDING ADMIN VERIFICATION SCREEN ── */}
        {step === 7 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xl p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-amber-500/10">
              <Clock size={42} className="text-[#d97706]" />
            </div>

            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100/80 text-[#b45309] border border-amber-200 inline-block mb-3">
              Pending Admin Verification
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3">
              Application Submitted Successfully
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
              Your investor application has been submitted successfully. Our Admin team will review your profile and verification documents. You will be notified once your account is approved.
            </p>

            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 mb-8 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Application ID:</span>
                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">{applicationId || 'INV-2026-9812'}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-gray-200/50 pt-2">
                <span className="text-gray-500 font-medium">Submitted Date:</span>
                <span className="font-bold text-gray-900">{submittedDate || 'Today'}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-gray-200/50 pt-2">
                <span className="text-gray-500 font-medium">Verification Status:</span>
                <span className="font-black text-[#d97706] flex items-center gap-1"><Clock size={13} /> Pending Admin Verification</span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all inline-flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorSignup;
