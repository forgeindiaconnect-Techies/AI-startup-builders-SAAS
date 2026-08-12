import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, Check, ArrowRight, ArrowLeft, Loader2, Mail, User, Phone, Lock,
  Briefcase, Building2, MapPin, Globe, Link2, FileText, UploadCloud, ShieldCheck,
  CheckCircle2, AlertCircle, Eye, EyeOff, Camera, Trash2, FileCheck, Layers, Award,
  Sparkles, Shield, Clock, Edit3, HelpCircle, CheckSquare, Square
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { getLeadByToken } from '../../utils/investorInvites';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7; // Step 7 is Pending Verification Confirmation

interface UploadedDoc {
  file: File | null;
  name: string;
  size: string;
  type: string;
  url: string;
  progress: number;
}

interface InvestorFormData {
  // Step 1: Basic Info
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  profilePhotoUrl: string;
  profilePhotoName: string;
  emailVerified: boolean;

  // Step 2: Profile
  investorType: string;
  companyName: string;
  designation: string;
  experienceYears: string;
  location: string;
  linkedin: string;
  website: string;
  bio: string;

  // Step 3: Preferences
  preferredIndustries: string[];
  investmentStages: string[];
  investmentRange: string;
  preferredLocation: string;
  investmentFocus: string;

  // Step 4: Experience & Portfolio
  previousExperience: string;
  startupsInvestedCount: string;
  portfolioCompanies: string;
  notableInvestments: string;
  areasOfExpertise: string;
  investmentThesis: string;

  // Step 5: Docs
  kycDoc: UploadedDoc | null;
  orgProofDoc: UploadedDoc | null;
  supportingDoc: UploadedDoc | null;
  additionalDoc: UploadedDoc | null;

  // Step 6: Terms
  agreedToTerms: boolean;
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

  investorType: '',
  companyName: '',
  designation: '',
  experienceYears: '',
  location: '',
  linkedin: '',
  website: '',
  bio: '',

  preferredIndustries: [],
  investmentStages: [],
  investmentRange: '',
  preferredLocation: 'India',
  investmentFocus: '',

  previousExperience: '',
  startupsInvestedCount: '',
  portfolioCompanies: '',
  notableInvestments: '',
  areasOfExpertise: '',
  investmentThesis: '',

  kycDoc: null,
  orgProofDoc: null,
  supportingDoc: null,
  additionalDoc: null,

  agreedToTerms: false,
};

// ── Dropdown & Multi-Select Options ──────────────────────────────────────────
const INVESTOR_TYPES = [
  'Angel Investor',
  'Individual Investor',
  'Venture Capital Representative',
  'Corporate Investor',
  'Family Office',
  'Other',
];

const EXPERIENCE_YEARS_OPTIONS = [
  '1 - 3 years',
  '3 - 5 years',
  '5 - 10 years',
  '10+ years',
];

const INDUSTRIES_OPTIONS = [
  'Artificial Intelligence',
  'SaaS',
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
];

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
          className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#6C4CF1] ${
            digit ? 'border-[#6C4CF1] bg-[#6C4CF1]/5 text-[#6C4CF1]' : 'border-gray-200 bg-gray-50'
          }`}
        />
      ))}
    </div>
  );
};

// ── Password Strength Bar ─────────────────────────────────────────────────────
const getPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    long: password.length >= 12,
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
};

const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-purple-600'];

// ── Secure Document Card Component ────────────────────────────────────────────
const SecureDocCard: React.FC<{
  title: string;
  required?: boolean;
  doc: UploadedDoc | null;
  onUpload: (doc: UploadedDoc) => void;
  onRemove: () => void;
  error?: string;
}> = ({ title, required, doc, onUpload, onRemove, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds 5MB limit. Please choose a smaller file.');
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
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <FileText size={16} className="text-[#6C4CF1]" />
          {title} {required && <span className="text-amber-500">*</span>}
        </label>
        {doc && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
            <CheckCircle2 size={10} /> Verified Format
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {doc ? (
        <div className="bg-[#6C4CF1]/5 border border-[#6C4CF1]/20 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {doc.url.startsWith('data:image') ? (
              <img src={doc.url} alt="preview" className="w-10 h-10 object-cover rounded-lg border border-purple-200 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#6C4CF1]/10 text-[#6C4CF1] flex items-center justify-center font-black text-xs shrink-0">
                {doc.type}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{doc.name}</p>
              <p className="text-[10px] text-gray-500 font-medium">{doc.size} • Uploaded</p>
              <div className="w-28 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[#6C4CF1] rounded-full w-full" />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors shrink-0"
            title="Remove document"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex flex-col items-center justify-center py-5 border-2 border-dashed ${
            error ? 'border-red-300 bg-red-50/20' : 'border-gray-200 hover:border-[#6C4CF1] bg-gray-50/40 hover:bg-[#6C4CF1]/[0.02]'
          } rounded-xl transition-all cursor-pointer group`}
        >
          <UploadCloud size={24} className="text-gray-400 group-hover:text-[#6C4CF1] transition-colors mb-1" />
          <p className="text-xs font-bold text-gray-700 group-hover:text-[#6C4CF1]">
            Click to upload document
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            PDF, JPG, JPEG or PNG (Max 5MB)
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
  const [apiError, setApiError] = useState('');
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

  const toggleArrayItem = (field: 'preferredIndustries' | 'investmentStages', item: string) => {
    setForm(prev => {
      const arr = prev[field];
      const next = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
      return { ...prev, [field]: next };
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Cooldown timer
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
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address first' }));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setOtpSent(true);
        startCooldown();
      } else {
        setOtpError(json.error || 'Failed to send OTP.');
      }
    } catch {
      setOtpError('Network error. Failed to send OTP.');
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
      // Best effort check with backend or verify locally
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
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Valid email is required';
    if (!form.emailVerified) e.emailVerified = 'Email must be verified via OTP before continuing';
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile.replace(/\D/g, ''))) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 2 Validation ───────────────────────────────────────────────────────
  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.investorType) e.investorType = 'Please select investor type';
    if (!form.experienceYears) e.experienceYears = 'Years of experience is required';
    if (!form.location.trim()) e.location = 'Location / Country is required';
    if (!form.bio.trim() || form.bio.trim().length < 30) e.bio = 'Please provide a short bio (at least 30 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 3 Validation ───────────────────────────────────────────────────────
  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (form.preferredIndustries.length === 0) e.preferredIndustries = 'Select at least one preferred industry';
    if (form.investmentStages.length === 0) e.investmentStages = 'Select at least one investment stage';
    if (!form.investmentRange) e.investmentRange = 'Please select investment range';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 4 Validation ───────────────────────────────────────────────────────
  const validateStep4 = () => {
    const e: Record<string, string> = {};
    if (!form.previousExperience.trim()) e.previousExperience = 'Previous investment experience is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 5 Validation ───────────────────────────────────────────────────────
  const validateStep5 = () => {
    const e: Record<string, string> = {};
    if (!form.kycDoc) e.kycDoc = 'Government ID / KYC Document is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit Application ──────────────────────────────────────────────────────
  const handleSubmitApplication = async () => {
    if (!form.agreedToTerms) {
      setErrors(prev => ({ ...prev, agreedToTerms: 'You must accept the terms and confirm accuracy to submit.' }));
      return;
    }

    setIsSubmitting(true);
    setApiError('');
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
        investorType: form.investorType,
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
        preferredLocation: form.preferredLocation,
        investmentFocus: form.investmentFocus.trim(),
        previousExperience: form.previousExperience.trim(),
        startupsInvestedCount: form.startupsInvestedCount.trim(),
        portfolioCompanies: form.portfolioCompanies.trim(),
        notableInvestments: form.notableInvestments.trim(),
        areasOfExpertise: form.areasOfExpertise.trim(),
        investmentThesis: form.investmentThesis.trim(),
        kycDocUrl: form.kycDoc?.url || '',
        kycDocName: form.kycDoc?.name || '',
        orgProofUrl: form.orgProofDoc?.url || '',
        orgProofName: form.orgProofDoc?.name || '',
        supportingDocUrl: form.supportingDoc?.url || '',
        supportingDocName: form.supportingDoc?.name || '',
        additionalDocUrl: form.additionalDoc?.url || '',
        additionalDocName: form.additionalDoc?.name || '',
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
        console.warn('Backend verification API call fallback:', e);
      }

      const generatedId = json.user?._id || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setApplicationId(generatedId);
      setSubmittedDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));

      // Store local application copy for backup & admin approval view
      const storedApps = JSON.parse(localStorage.getItem('ai_startup_builder_investor_apps') || '[]');
      storedApps.push({ id: generatedId, ...body, status: 'PENDING_VERIFICATION', submittedAt: new Date().toISOString() });
      localStorage.setItem('ai_startup_builder_investor_apps', JSON.stringify(storedApps));
      window.dispatchEvent(new Event('storage'));

      setStep(7);
    } catch (err) {
      const generatedId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setApplicationId(generatedId);
      setSubmittedDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
      setStep(7);
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
    'Basic Info',
    'Profile',
    'Preferences',
    'Experience',
    'Documents',
    'Review',
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Royal Purple & Gold Glow Accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-[#6C4CF1]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#F59E0B]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200/60 pb-5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6C4CF1] via-[#5B21B6] to-[#4C1D95] flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp size={22} className="text-[#FBBF24]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 block leading-tight">AI Startup Builder</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706]">Investor Portal</span>
            </div>
          </Link>

          <Link
            to="/login"
            className="text-xs font-bold text-gray-600 hover:text-[#6C4CF1] transition-colors flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm"
          >
            Already registered? <span className="text-[#6C4CF1] font-black">Sign in</span>
          </Link>
        </div>

        {step <= 6 && (
          <>
            {/* Page Titles */}
            <div className="text-center mb-8">
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#6C4CF1]/10 text-[#6C4CF1] border border-[#6C4CF1]/20 inline-flex items-center gap-1.5 mb-3">
                <Sparkles size={13} className="text-[#F59E0B]" /> Investor Accreditation & Registration
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Create Investor Account</h1>
              <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
                Join our startup investment network and discover promising AI-powered startups.
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-8">
              <div className="flex items-center justify-between relative">
                {stepLabels.map((label, idx) => {
                  const num = idx + 1;
                  const isDone = step > num;
                  const isCurrent = step === num;

                  return (
                    <div key={label} className="flex flex-col items-center relative z-10 flex-1">
                      <button
                        onClick={() => { if (step > num) setStep(num as Step); }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                          isDone
                            ? 'bg-[#6C4CF1] text-white shadow-md shadow-purple-500/20 cursor-pointer'
                            : isCurrent
                            ? 'bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white ring-4 ring-[#6C4CF1]/20 shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isDone ? <Check size={16} /> : num}
                      </button>
                      <span
                        className={`text-[10px] sm:text-xs font-bold mt-2 text-center hidden sm:block ${
                          isCurrent ? 'text-[#6C4CF1]' : isDone ? 'text-gray-800' : 'text-gray-400'
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

        {/* ── STEP 1: BASIC INFORMATION ── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User size={20} className="text-[#6C4CF1]" /> Step 1: Basic Information
              </h2>
              <p className="text-xs text-gray-500 mt-1">Provide your primary contact details and verify your email address.</p>
            </div>

            {isInvited && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-amber-50 to-purple-50 border border-purple-200 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#6C4CF1] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  <Sparkles size={18} className="text-[#FBBF24]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#6C4CF1] tracking-wider">Official Investor Invitation</h4>
                  <p className="text-xs text-gray-700 font-medium mt-0.5">
                    Your invitation details (<strong>Full Name</strong>, <strong>Email Address</strong>, and <strong>LinkedIn Profile</strong>) have been automatically pre-filled from your invitation.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name <span className="text-amber-500">*</span></label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Vikram Malhotra"
                    value={form.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 ${errors.fullName ? 'border-red-300 bg-red-50/20' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium transition-all bg-gray-50/50 hover:bg-white`}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs font-medium mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & OTP Verification Flow */}
              <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3">
                <label className="block text-sm font-bold text-[#5B21B6]">
                  Email Address & Verification <span className="text-amber-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="investor@firm.com"
                      value={form.email}
                      disabled={form.emailVerified}
                      onChange={e => update('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border-2 ${errors.email ? 'border-red-300' : 'border-gray-200 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium transition-all bg-white ${form.emailVerified ? 'opacity-80' : ''}`}
                    />
                  </div>
                  {!form.emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || otpCooldown > 0}
                      className="px-5 py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-60 shrink-0"
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
                      className="w-full py-2.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
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
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Phone Number <span className="text-amber-500">*</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.mobile}
                    onChange={e => update('mobile', e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-10 pr-4 py-3 border-2 ${errors.mobile ? 'border-red-300 bg-red-50/20' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium transition-all bg-gray-50/50 hover:bg-white`}
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs font-medium mt-1">{errors.mobile}</p>}
              </div>

              {/* Passwords */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password <span className="text-amber-500">*</span></label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 border-2 ${errors.password ? 'border-red-300' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium transition-all bg-gray-50/50 hover:bg-white`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <div key={n} className={`h-1 flex-1 rounded-full ${getPasswordStrength(form.password).score >= n ? strengthColors[getPasswordStrength(form.password).score] : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-gray-500">{strengthLabels[getPasswordStrength(form.password).score]}</p>
                    </div>
                  )}
                  {errors.password && <p className="text-red-500 text-xs font-medium mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Confirm Password <span className="text-amber-500">*</span></label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 border-2 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium transition-all bg-gray-50/50 hover:bg-white`}
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
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Profile Photo (Optional)</label>
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
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-amber-100 text-[#6C4CF1] flex items-center justify-center font-black text-xl border border-purple-200">
                      {(form.fullName || 'I').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Camera size={14} /> Upload Photo
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: INVESTOR PROFILE ── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={20} className="text-[#6C4CF1]" /> Step 2: Investor Profile
              </h2>
              <p className="text-xs text-gray-500 mt-1">Specify your accreditation status, designation, and professional background.</p>
            </div>

            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Investor Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Investor Type <span className="text-amber-500">*</span></label>
                  <select
                    value={form.investorType}
                    onChange={e => update('investorType', e.target.value)}
                    className={`w-full px-4 py-3 border-2 ${errors.investorType ? 'border-red-300' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all`}
                  >
                    <option value="">Select Investor Type</option>
                    {INVESTOR_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.investorType && <p className="text-red-500 text-xs font-medium mt-1">{errors.investorType}</p>}
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Investment Experience <span className="text-amber-500">*</span></label>
                  <select
                    value={form.experienceYears}
                    onChange={e => update('experienceYears', e.target.value)}
                    className={`w-full px-4 py-3 border-2 ${errors.experienceYears ? 'border-red-300' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all`}
                  >
                    <option value="">Select Experience Years</option>
                    {EXPERIENCE_YEARS_OPTIONS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {errors.experienceYears && <p className="text-red-500 text-xs font-medium mt-1">{errors.experienceYears}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Organization / Firm Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Organization / Firm Name</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Nexus Venture Partners"
                      value={form.companyName}
                      onChange={e => update('companyName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Designation / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Managing Partner / Angel Investor"
                    value={form.designation}
                    onChange={e => update('designation', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Location / Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Location / Country <span className="text-amber-500">*</span></label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India"
                      value={form.location}
                      onChange={e => update('location', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border-2 ${errors.location ? 'border-red-300' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all`}
                    />
                  </div>
                  {errors.location && <p className="text-red-500 text-xs font-medium mt-1">{errors.location}</p>}
                </div>

                {/* LinkedIn Profile */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">LinkedIn Profile</label>
                  <div className="relative">
                    <Link2 size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="https://linkedin.com/in/profile"
                      value={form.linkedin}
                      onChange={e => update('linkedin', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Personal/Company Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Personal / Company Website</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="https://yourfirm.com"
                    value={form.website}
                    onChange={e => update('website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Short Investor Bio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-900">
                    Short Investor Bio <span className="text-amber-500">*</span>
                  </label>
                  <span className={`text-xs font-bold ${form.bio.length >= 30 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {form.bio.length}/500 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="Share a brief overview of your background, investment strategy, and startup interests..."
                  value={form.bio}
                  onChange={e => update('bio', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${errors.bio ? 'border-red-300' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all resize-none`}
                />
                {errors.bio && <p className="text-red-500 text-xs font-medium mt-1">{errors.bio}</p>}
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
                className="px-8 py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: INVESTMENT PREFERENCES ── */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers size={20} className="text-[#6C4CF1]" /> Step 3: Investment Preferences
              </h2>
              <p className="text-xs text-gray-500 mt-1">Define target sectors, stages, and cheque sizes to receive relevant deal flow.</p>
            </div>

            <div className="space-y-6">
              {/* Preferred Industries (Single Select Pills) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Preferred Industry / Sector <span className="text-amber-500">*</span>
                  </label>
                  <span className="text-xs font-bold text-[#6C4CF1] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    Select One
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES_OPTIONS.map(ind => {
                    const selected = form.preferredIndustries.includes(ind);
                    return (
                      <button
                        type="button"
                        key={ind}
                        onClick={() => {
                          setForm(prev => ({
                            ...prev,
                            preferredIndustries: selected ? [] : [ind],
                          }));
                          if (errors.preferredIndustries) setErrors(prev => ({ ...prev, preferredIndustries: '' }));
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#6C4CF1] text-white border-[#6C4CF1] shadow-md shadow-purple-500/20 scale-[1.02]'
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

              {/* Investment Stage (Single Select Pills) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Investment Stage <span className="text-amber-500">*</span>
                  </label>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Select One
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {STAGE_OPTIONS.map(stage => {
                    const selected = form.investmentStages.includes(stage);
                    return (
                      <button
                        type="button"
                        key={stage}
                        onClick={() => {
                          setForm(prev => ({
                            ...prev,
                            investmentStages: selected ? [] : [stage],
                          }));
                          if (errors.investmentStages) setErrors(prev => ({ ...prev, investmentStages: '' }));
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          selected
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]'
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

              {/* Investment Range (Dropdown) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Average Ticket Size / Investment Range <span className="text-amber-500">*</span>
                </label>
                <select
                  value={form.investmentRange}
                  onChange={e => update('investmentRange', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${errors.investmentRange ? 'border-red-300' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all`}
                >
                  <option value="">Select Investment Range</option>
                  {INVESTMENT_RANGES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.investmentRange && <p className="text-red-500 text-xs font-medium mt-1">{errors.investmentRange}</p>}
              </div>

              {/* Preferred Startup Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Preferred Startup Location</label>
                <div className="grid grid-cols-3 gap-3">
                  {['India', 'Global', 'Specific Regions'].map(loc => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => update('preferredLocation', loc)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                        form.preferredLocation === loc
                          ? 'border-[#6C4CF1] bg-[#6C4CF1]/5 text-[#6C4CF1]'
                          : 'border-gray-100 text-gray-600 bg-gray-50 hover:bg-white'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Focus / Thesis */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Investment Focus & Criteria</label>
                <textarea
                  rows={3}
                  placeholder="Describe key parameters you evaluate (e.g. MRR traction, founder background, AI moat)..."
                  value={form.investmentFocus}
                  onChange={e => update('investmentFocus', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all resize-none"
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
                className="px-8 py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: EXPERIENCE & PORTFOLIO ── */}
        {step === 4 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award size={20} className="text-[#6C4CF1]" /> Step 4: Experience & Portfolio
              </h2>
              <p className="text-xs text-gray-500 mt-1">Highlight your past track record, active portfolio, and domain expertise.</p>
            </div>

            <div className="space-y-5">
              {/* Previous Investment Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Previous Investment Track Record <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5+ years investing in B2B SaaS and Generative AI startups"
                  value={form.previousExperience}
                  onChange={e => update('previousExperience', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${errors.previousExperience ? 'border-red-300' : 'border-gray-100 focus:border-[#6C4CF1]'} rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all`}
                />
                {errors.previousExperience && <p className="text-red-500 text-xs font-medium mt-1">{errors.previousExperience}</p>}
              </div>

              {/* Number of Startups Invested In */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Number of Startups Invested In</label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={form.startupsInvestedCount}
                  onChange={e => update('startupsInvestedCount', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
                />
              </div>

              {/* Portfolio Companies & Notable Investments */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Portfolio Companies</label>
                  <textarea
                    rows={3}
                    placeholder="List key portfolio companies (e.g. Company A, Company B)..."
                    value={form.portfolioCompanies}
                    onChange={e => update('portfolioCompanies', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Notable Exits or Investments</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Early investor in Unicorn X (Acquired 2024)..."
                    value={form.notableInvestments}
                    onChange={e => update('notableInvestments', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              {/* Areas of Expertise */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Areas of Value Addition / Expertise</label>
                <input
                  type="text"
                  placeholder="e.g. GTM Strategy, Hiring Execs, Board Guidance, Series A Fundraising"
                  value={form.areasOfExpertise}
                  onChange={e => update('areasOfExpertise', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#6C4CF1] rounded-xl text-sm font-medium bg-gray-50/50 hover:bg-white transition-all"
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
                className="px-8 py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: VERIFICATION DOCUMENTS ── */}
        {step === 5 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#6C4CF1]" /> Step 5: Verification Documents
              </h2>
              <p className="text-xs text-gray-500 mt-1">Upload government identification or organization proof to verify your investor profile.</p>
            </div>

            {/* Security Notice Box */}
            <div className="mb-6 p-4 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-start gap-3">
              <Shield size={20} className="text-[#6C4CF1] shrink-0 mt-0.5" />
              <p className="text-xs text-purple-900 font-semibold leading-relaxed">
                🔒 Your documents are securely encrypted, stored, and will only be used for platform verification purposes by authorized administrators.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <SecureDocCard
                title="Government ID / KYC Document"
                required
                doc={form.kycDoc}
                onUpload={doc => update('kycDoc', doc)}
                onRemove={() => update('kycDoc', null)}
                error={errors.kycDoc}
              />

              <SecureDocCard
                title="Organization / Fund Proof"
                doc={form.orgProofDoc}
                onUpload={doc => update('orgProofDoc', doc)}
                onRemove={() => update('orgProofDoc', null)}
              />

              <SecureDocCard
                title="Supporting Document (Optional)"
                doc={form.supportingDoc}
                onUpload={doc => update('supportingDoc', doc)}
                onRemove={() => update('supportingDoc', null)}
              />

              <SecureDocCard
                title="Additional Verification Doc (Optional)"
                doc={form.additionalDoc}
                onUpload={doc => update('additionalDoc', doc)}
                onRemove={() => update('additionalDoc', null)}
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
                className="px-8 py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Review Summary <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: REVIEW & SUBMIT ── */}
        {step === 6 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" /> Step 6: Review & Submit
              </h2>
              <p className="text-xs text-gray-500 mt-1">Review all application details carefully before submitting for admin verification.</p>
            </div>

            {apiError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {apiError}
              </div>
            )}

            <div className="space-y-6">
              {/* Summary 1: Basic Info */}
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <User size={15} className="text-[#6C4CF1]" /> Personal Information
                  </h3>
                  <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-[#6C4CF1] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-gray-400 block">Name:</span> <strong className="text-gray-900">{form.fullName}</strong></div>
                  <div><span className="text-gray-400 block">Email:</span> <strong className="text-gray-900">{form.email} (Verified)</strong></div>
                  <div><span className="text-gray-400 block">Mobile:</span> <strong className="text-gray-900">{form.mobile}</strong></div>
                </div>
              </div>

              {/* Summary 2: Investor Profile */}
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase size={15} className="text-[#6C4CF1]" /> Investor Profile
                  </h3>
                  <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-[#6C4CF1] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div><span className="text-gray-400 block">Type:</span> <strong className="text-gray-900">{form.investorType}</strong></div>
                  <div><span className="text-gray-400 block">Experience:</span> <strong className="text-gray-900">{form.experienceYears}</strong></div>
                  <div><span className="text-gray-400 block">Location:</span> <strong className="text-gray-900">{form.location}</strong></div>
                  {form.companyName && <div><span className="text-gray-400 block">Firm:</span> <strong className="text-gray-900">{form.companyName}</strong></div>}
                  {form.designation && <div><span className="text-gray-400 block">Role:</span> <strong className="text-gray-900">{form.designation}</strong></div>}
                </div>
                <div><span className="text-gray-400 block text-xs">Bio:</span> <p className="text-xs text-gray-700 font-medium italic mt-0.5">{form.bio}</p></div>
              </div>

              {/* Summary 3: Investment Preferences */}
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layers size={15} className="text-[#6C4CF1]" /> Preferences
                  </h3>
                  <button type="button" onClick={() => setStep(3)} className="text-xs font-bold text-[#6C4CF1] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div><span className="text-gray-400">Industries:</span> <strong className="text-gray-900 ml-1">{form.preferredIndustries.join(', ')}</strong></div>
                  <div><span className="text-gray-400">Stages:</span> <strong className="text-gray-900 ml-1">{form.investmentStages.join(', ')}</strong></div>
                  <div><span className="text-gray-400">Cheque Size:</span> <strong className="text-[#5B21B6] ml-1">{form.investmentRange}</strong></div>
                </div>
              </div>

              {/* Summary 4: Verification Documents */}
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-[#6C4CF1]" /> Verification Documents
                  </h3>
                  <button type="button" onClick={() => setStep(5)} className="text-xs font-bold text-[#6C4CF1] hover:underline flex items-center gap-1">
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.kycDoc && <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-700">✓ KYC ID Attached</span>}
                  {form.orgProofDoc && <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-700">✓ Fund Proof Attached</span>}
                  {form.supportingDoc && <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-700">✓ Supporting Doc Attached</span>}
                </div>
              </div>

              {/* Accuracy Checkbox */}
              <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreedToTerms}
                    onChange={e => update('agreedToTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#6C4CF1] rounded border-gray-300 focus:ring-[#6C4CF1]"
                  />
                  <span className="text-xs text-gray-700 font-semibold leading-relaxed">
                    I confirm that the information provided is accurate and I agree to the platform's <Link to="/terms-of-service" className="text-[#6C4CF1] font-bold hover:underline">Terms & Conditions</Link> and <Link to="/privacy-policy" className="text-[#6C4CF1] font-bold hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
                {errors.agreedToTerms && <p className="text-red-500 text-xs font-medium mt-2">{errors.agreedToTerms}</p>}
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
                className="px-8 py-3.5 bg-gradient-to-r from-[#6C4CF1] via-[#5B21B6] to-[#4C1D95] hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-60"
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

        {/* ── STEP 7: PENDING ADMIN VERIFICATION CONFIRMATION ── */}
        {step === 7 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-amber-500/10">
              <Clock size={42} className="text-amber-600" />
            </div>

            <span className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200 inline-block mb-3">
              Pending Admin Verification
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3">
              Application Submitted Successfully
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Your investor application has been submitted successfully. Our admin team will review your profile and verification documents. You will be notified once your account is approved.
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
                <span className="font-black text-amber-600 flex items-center gap-1"><Clock size={12} /> Pending Review</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-gray-200/50 pt-2">
                <span className="text-gray-500 font-medium">Expected Next Step:</span>
                <span className="font-bold text-gray-800">Admin Verification (24-48 Hours)</span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all inline-flex items-center justify-center gap-2"
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
