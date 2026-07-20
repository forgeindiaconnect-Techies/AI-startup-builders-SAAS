import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Rocket, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight,
  Loader2, Mail, User, Phone, Lock, Check, Gift, Zap,
  Briefcase, TrendingUp, Building2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type UserRole = 'founder' | 'mentor' | 'investor';
type Step = 'role' | 'form' | 'email_otp' | 'welcome';

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  // Mentor fields
  expertise: string;
  experienceYears: string;
  linkedin: string;
  bio: string;
  // Investor fields
  companyName: string;
  investorType: string;
  preferredIndustry: string;
  minInvestment: string;
  maxInvestment: string;
}

const emptyForm: FormData = {
  fullName: '', email: '', mobile: '', password: '', confirmPassword: '',
  expertise: '', experienceYears: '', linkedin: '', bio: '',
  companyName: '', investorType: '', preferredIndustry: '', minInvestment: '', maxInvestment: '',
};

// ── Role Definitions ──────────────────────────────────────────────────────────
const ROLES: { id: UserRole; title: string; icon: React.FC<any>; color: string; bg: string; desc: string }[] = [
  { id: 'founder',  title: 'Founder',  icon: Rocket,        color: 'text-purple-700', bg: 'bg-purple-100', desc: 'Build your startup with AI-powered tools and mentor guidance.' },
  { id: 'mentor',   title: 'Mentor',   icon: Briefcase,     color: 'text-blue-700',   bg: 'bg-blue-100',   desc: 'Guide founders and share your expertise to shape the future.' },
  { id: 'investor', title: 'Investor', icon: TrendingUp,    color: 'text-amber-700',  bg: 'bg-amber-100',  desc: 'Discover promising startups and grow your investment portfolio.' },
];

// ── OTP Input ─────────────────────────────────────────────────────────────────
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...value];
    pasted.split('').forEach((char, i) => { next[i] = char; });
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
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
          className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6C4CF1] focus:border-transparent ${
            digit ? 'border-[#6C4CF1] bg-[#6C4CF1]/5 text-[#6C4CF1]' : 'border-gray-200 bg-gray-50/50'
          }`}
        />
      ))}
    </div>
  );
};

// ── Password Strength ─────────────────────────────────────────────────────────
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
const strengthColors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'];

// ── Free Trial Welcome Screen ─────────────────────────────────────────────────
const FreeTrialWelcome: React.FC<{ name: string; role: UserRole; onContinue: () => void }> = ({ name, role, onContinue }) => (
  <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 py-4">
    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
      <Gift size={40} className="text-white" />
    </div>
    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome, {name.split(' ')[0]}!</h2>
    <p className="text-gray-500 text-sm mb-6 max-w-xs">
      {role === 'founder' ? (
        <>Your account is ready. We've activated your <strong className="text-[#6C4CF1]">1-Day Free Trial</strong> — explore everything AI Startup Builder has to offer!</>
      ) : role === 'mentor' ? (
        <>Your mentor account is created! Your profile is under review. You'll be notified once approved.</>
      ) : (
        <>Your investor account is created! Start exploring promising startups and connect with founders.</>
      )}
    </p>

    {role === 'founder' && (
      <div className="w-full bg-[#6C4CF1]/5 border border-[#6C4CF1]/20 rounded-2xl p-5 mb-6 text-left">
        <p className="text-xs font-bold text-[#6C4CF1] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Zap size={12} /> Free Trial Includes
        </p>
        <ul className="space-y-2">
          {[
            'Basic AI Startup Idea Generator',
            'Basic Business Plan',
            'Basic Pitch Deck',
            'Basic Market Research',
            'Limited AI Reports',
            'Limited Document Export',
            'Live trial countdown display',
          ].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-800">
              <Check size={14} className="text-emerald-500 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {role === 'founder' && (
      <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-center gap-2 text-left">
        <AlertCircle size={16} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          Your free trial lasts <strong>24 hours</strong>. After it expires, choose a Pro or Premium plan to continue.
        </p>
      </div>
    )}

    <button onClick={onContinue} className="w-full h-12 text-sm font-bold rounded-xl shadow-md bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all flex items-center justify-center gap-2">
      Go to Dashboard <ArrowRight size={16} />
    </button>
  </div>
);

// ── Left Panel ────────────────────────────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <div className="hidden lg:flex flex-col justify-between bg-[#6C4CF1] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
          <Rocket size={22} />
        </div>
        <span className="text-xl font-bold tracking-tight">AI Startup Builder</span>
      </div>

      <h1 className="text-4xl font-extrabold leading-tight mb-4">
        Build the next big<br />
        <span className="opacity-90">startup with AI.</span>
      </h1>
      <p className="text-white/70 text-base leading-relaxed max-w-xs">
        Turn your startup idea into a successful business with AI-powered guidance, expert mentors, and investor connections.
      </p>
    </div>

    <div className="relative z-10 space-y-3 mt-8">
      {[
        { icon: '🤖', title: 'AI Business Plan Generator', desc: 'Create investor-ready plans instantly' },
        { icon: '🎯', title: 'Expert Mentor Network', desc: 'Connect with 500+ startup mentors' },
        { icon: '💰', title: 'Investor Connections', desc: 'Access to curated investor pool' },
      ].map(({ icon, title, desc }) => (
        <div key={title} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-white/60 text-xs">{desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
      {[
        { val: '10K+', label: 'Founders' },
        { val: '500+', label: 'Mentors' },
        { val: '$2M+', label: 'Funded' },
      ].map(({ val, label }) => (
        <div key={label} className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-xl font-black">{val}</p>
          <p className="text-white/60 text-xs font-medium">{label}</p>
        </div>
      ))}
    </div>
  </div>
);

// ── Input Component ───────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string; icon: React.ReactNode; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
  maxLength?: number; inputMode?: string; rows?: number;
}> = ({ label, icon, type = 'text', placeholder, value, onChange, error, maxLength, inputMode, rows }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-1.5">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-2.5 h-4 w-4 text-gray-400">{icon}</div>}
      {rows ? (
        <textarea
          className={`block w-full ${icon ? 'pl-9' : 'pl-4'} px-4 py-3 border-2 ${error ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium resize-none`}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          className={`block w-full ${icon ? 'pl-9' : 'pl-4'} px-4 py-3 border-2 ${error ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
          placeholder={placeholder}
          value={value}
          onChange={e => {
            let val = e.target.value;
            if (maxLength && (type === 'tel' || inputMode === 'numeric')) {
              val = val.replace(/\D/g, '').slice(0, maxLength);
            }
            onChange(val);
          }}
          maxLength={maxLength}
          inputMode={inputMode as any}
        />
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const PasswordField: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; error?: string;
  showStrength?: boolean;
}> = ({ label, value, onChange, show, onToggle, error, showStrength }) => {
  const strength = getPasswordStrength(value);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          className={`block w-full pl-9 pr-10 px-4 py-3 border-2 ${error ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
          placeholder="Min. 8 characters"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#6C4CF1] transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2 space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= n ? strengthColors[strength.score] : 'bg-gray-100'}`} />
            ))}
          </div>
          <p className={`text-[10px] font-semibold ${strength.score <= 2 ? 'text-red-500' : strength.score <= 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
            {strengthLabels[strength.score]}
          </p>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Email OTP state
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
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

  // ── Validation ────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = 'Full name must be at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) e.email = 'Please enter a valid email address';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(form.mobile)) e.mobile = 'Mobile number must be exactly 10 digits';
    if (!form.password) e.password = 'Password is required';
    else {
      if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(form.password)) e.password = 'Must contain at least one uppercase letter';
      else if (!/[0-9]/.test(form.password)) e.password = 'Must contain at least one number';
      else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = 'Must contain at least one special character';
    }
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    // Mentor-specific
    if (selectedRole === 'mentor') {
      if (!form.expertise.trim()) e.expertise = 'Expertise is required';
      if (!form.experienceYears.trim()) e.experienceYears = 'Years of experience is required';
    }

    // Investor-specific
    if (selectedRole === 'investor') {
      if (!form.companyName.trim()) e.companyName = 'Company / Firm name is required';
      if (!form.investorType.trim()) e.investorType = 'Investor type is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Send Email OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedOtp(json.otp || '');
        setEmailOtp(['', '', '', '', '', '']);
        setOtpError('');
        startCooldown();
        setStep('email_otp');
      } else {
        setApiError(json.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setIsSubmitting(true);
    setOtpError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedOtp(json.otp || '');
        setEmailOtp(['', '', '', '', '', '']);
        setOtpError('');
        startCooldown();
      } else {
        setOtpError(json.error || 'Failed to resend OTP.');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Verify OTP & Create Account ─────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = emailOtp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          otp: code,
          password: form.password,
          role: selectedRole,
          fullName: form.fullName.trim(),
          mobile: form.mobile,
          // Mentor fields
          expertise: form.expertise,
          experienceYears: form.experienceYears,
          linkedin: form.linkedin,
          bio: form.bio,
          // Investor fields
          companyName: form.companyName,
          investorType: form.investorType,
          preferredIndustry: form.preferredIndustry,
          minInvestment: form.minInvestment,
          maxInvestment: form.maxInvestment,
        }),
      });
      const json = await res.json();

      if (json.success && json.token) {
        localStorage.setItem('ai_startup_builder_jwt', json.token);
        await checkAuth();
        setStep('welcome');
      } else {
        setOtpError(json.error || 'Failed to create account. Please try again.');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    if (selectedRole === 'mentor') navigate('/dashboard/mentor', { replace: true });
    else if (selectedRole === 'investor') navigate('/dashboard/investor', { replace: true });
    else navigate('/dashboard/founder', { replace: true });
  };

  // ── Step Indicator ──────────────────────────────────────────────────────
  const steps = step === 'role'
    ? [{ num: 1, label: 'Choose Role' }]
    : step === 'form'
    ? [{ num: 1, label: 'Choose Role' }, { num: 2, label: 'Account Details' }]
    : step === 'email_otp'
    ? [{ num: 1, label: 'Choose Role' }, { num: 2, label: 'Account Details' }, { num: 3, label: 'Verify Email' }]
    : [{ num: 1, label: 'Choose Role' }, { num: 2, label: 'Account Details' }, { num: 3, label: 'Verify Email' }];

  const currentStepIdx = step === 'role' ? 0 : step === 'form' ? 1 : 2;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_1.1fr] gap-6 items-stretch">
        <LeftPanel />

        <div className="flex flex-col">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-[#6C4CF1] rounded-xl flex items-center justify-center shadow-sm">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AI Startup Builder</span>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-8 flex-1">
            {/* Step indicator (hide on role selection & welcome) */}
            {step !== 'role' && step !== 'welcome' && (
              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        idx < currentStepIdx ? 'bg-emerald-500 text-white' :
                        idx === currentStepIdx ? 'bg-[#6C4CF1] text-white' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {idx < currentStepIdx ? <Check size={13} /> : s.num}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block ${
                        idx === currentStepIdx ? 'text-[#6C4CF1]' :
                        idx < currentStepIdx ? 'text-emerald-600' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${idx < currentStepIdx ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* ── STEP 1: Role Selection ── */}
            {step === 'role' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create your account</h2>
                  <p className="text-gray-500 text-sm mt-1">How would you like to use AI Startup Builder?</p>
                </div>

                <div className="space-y-3">
                  {ROLES.map(role => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => { setSelectedRole(role.id); setStep('form'); }}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-[#6C4CF1]/30 hover:bg-[#6C4CF1]/[0.02] transition-all duration-200 text-left group"
                      >
                        <div className={`w-12 h-12 rounded-xl ${role.bg} ${role.color} flex items-center justify-center shrink-0`}>
                          <Icon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-base">{role.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{role.desc}</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-[#6C4CF1] transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>

                <p className="text-center text-sm text-gray-500 font-medium mt-8">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            {/* ── STEP 2: Form ── */}
            {step === 'form' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => { setStep('role'); setForm({ ...emptyForm }); setErrors({}); }} className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
                      ← Back
                    </button>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {selectedRole === 'founder' && 'Create Founder Account'}
                    {selectedRole === 'mentor' && 'Create Mentor Account'}
                    {selectedRole === 'investor' && 'Create Investor Account'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedRole === 'founder' && 'Join thousands of founders building the future.'}
                    {selectedRole === 'mentor' && 'Share your expertise and guide the next generation.'}
                    {selectedRole === 'investor' && 'Discover promising startups to invest in.'}
                  </p>
                </div>

                {apiError && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="font-medium">{apiError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Common fields */}
                  {selectedRole === 'investor' ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Full Name *" icon={<User size={16} />} placeholder="John Doe" value={form.fullName} onChange={v => update('fullName', v)} error={errors.fullName} />
                      <Field label="Company / Firm Name *" icon={<Building2 size={16} />} placeholder="Acme Ventures" value={form.companyName} onChange={v => update('companyName', v)} error={errors.companyName} />
                    </div>
                  ) : (
                    <Field label="Full Name *" icon={<User size={16} />} placeholder="John Doe" value={form.fullName} onChange={v => update('fullName', v)} error={errors.fullName} />
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Email Address *" icon={<Mail size={16} />} type="email" placeholder="name@gmail.com" value={form.email} onChange={v => update('email', v.trim())} error={errors.email} />
                    <Field label="Mobile Number *" icon={<Phone size={16} />} type="tel" placeholder="10-digit number" value={form.mobile} onChange={v => update('mobile', v)} error={errors.mobile} maxLength={10} inputMode="numeric" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <PasswordField label="Password *" value={form.password} onChange={v => update('password', v)} show={showPassword} onToggle={() => setShowPassword(!showPassword)} error={errors.password} showStrength />
                    <PasswordField label="Confirm Password *" value={form.confirmPassword} onChange={v => update('confirmPassword', v)} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} error={errors.confirmPassword} />
                  </div>

                  {/* ── Mentor-specific fields ── */}
                  {selectedRole === 'mentor' && (
                    <>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mentor Details</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Expertise *</label>
                          <select
                            value={form.expertise}
                            onChange={e => update('expertise', e.target.value)}
                            className={`block w-full px-4 py-3 border-2 ${errors.expertise ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                          >
                            <option value="">Select expertise</option>
                            <option value="Product Management">Product Management</option>
                            <option value="Marketing & Growth">Marketing & Growth</option>
                            <option value="Technology & Engineering">Technology & Engineering</option>
                            <option value="Finance & Accounting">Finance & Accounting</option>
                            <option value="Legal & Compliance">Legal & Compliance</option>
                            <option value="Sales & Business Dev">Sales & Business Dev</option>
                            <option value="HR & People Ops">HR & People Ops</option>
                            <option value="Design & UX">Design & UX</option>
                            <option value="Fundraising & IR">Fundraising & IR</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.expertise && <p className="text-red-500 text-xs mt-1 font-medium">{errors.expertise}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Years of Experience *</label>
                          <select
                            value={form.experienceYears}
                            onChange={e => update('experienceYears', e.target.value)}
                            className={`block w-full px-4 py-3 border-2 ${errors.experienceYears ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                          >
                            <option value="">Select years</option>
                            <option value="1-3">1 - 3 years</option>
                            <option value="3-5">3 - 5 years</option>
                            <option value="5-10">5 - 10 years</option>
                            <option value="10+">10+ years</option>
                          </select>
                          {errors.experienceYears && <p className="text-red-500 text-xs mt-1 font-medium">{errors.experienceYears}</p>}
                        </div>
                      </div>
                      <Field label="LinkedIn Profile" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>} placeholder="https://linkedin.com/in/yourprofile" value={form.linkedin} onChange={v => update('linkedin', v)} />
                      <Field label="Short Bio" icon={null} placeholder="Tell us about your experience and what you can help with..." value={form.bio} onChange={v => update('bio', v)} rows={3} />
                    </>
                  )}

                  {/* ── Investor-specific fields ── */}
                  {selectedRole === 'investor' && (
                    <>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Investment Details</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Investor Type *</label>
                          <select
                            value={form.investorType}
                            onChange={e => update('investorType', e.target.value)}
                            className={`block w-full px-4 py-3 border-2 ${errors.investorType ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium`}
                          >
                            <option value="">Select type</option>
                            <option value="Angel Investor">Angel Investor</option>
                            <option value="Venture Capitalist">Venture Capitalist</option>
                            <option value="Accelerator / Incubator">Accelerator / Incubator</option>
                            <option value="Corporate Investor">Corporate Investor</option>
                            <option value="Family Office">Family Office</option>
                            <option value="Individual">Individual</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.investorType && <p className="text-red-500 text-xs mt-1 font-medium">{errors.investorType}</p>}
                        </div>
                        <Field label="Preferred Industry" icon={<Briefcase size={16} />} placeholder="e.g. FinTech, HealthTech" value={form.preferredIndustry} onChange={v => update('preferredIndustry', v)} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Minimum Investment" icon={<span className="text-xs font-bold text-gray-400">₹</span>} placeholder="e.g. 1,00,000" value={form.minInvestment} onChange={v => update('minInvestment', v)} />
                        <Field label="Maximum Investment" icon={<span className="text-xs font-bold text-gray-400">₹</span>} placeholder="e.g. 50,00,000" value={form.maxInvestment} onChange={v => update('maxInvestment', v)} />
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                    className="w-full h-12 text-sm font-bold rounded-xl shadow-md bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white hover:from-[#5B21B6] hover:to-[#4C1D95] disabled:opacity-70 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</>
                    ) : (
                      <>Send Verification OTP <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 3: Email OTP Verification ── */}
            {step === 'email_otp' && (
              <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="w-16 h-16 bg-[#6C4CF1]/10 rounded-2xl flex items-center justify-center mb-5 ring-4 ring-[#6C4CF1]/5">
                  <Mail size={32} className="text-[#6C4CF1]" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verify your email</h2>
                <p className="text-gray-500 text-sm mb-1">
                  We sent a 6-digit OTP to
                </p>
                <p className="font-bold text-gray-900 text-sm mb-4">{form.email}</p>

                {generatedOtp && (
                  <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl w-full max-w-xs">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Demo Mode — Your OTP</p>
                    <p className="text-2xl font-black text-amber-700 tracking-[0.3em] font-mono">{generatedOtp}</p>
                  </div>
                )}

                <div className="w-full mb-6">
                  <OTPInput value={emailOtp} onChange={setEmailOtp} />
                </div>

                {otpError && (
                  <div className="w-full mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{otpError}</span>
                  </div>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || emailOtp.join('').length !== 6}
                  className="w-full h-12 text-sm font-bold rounded-xl shadow-md bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white hover:from-[#5B21B6] hover:to-[#4C1D95] disabled:opacity-70 transition-all flex items-center justify-center gap-2 mb-6"
                >
                  {otpLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying & Creating Account...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-5 w-5" /> Verify & Create Account</>
                  )}
                </button>

                <p className="text-sm text-gray-500">
                  Didn't receive the code?{' '}
                  {otpCooldown > 0 ? (
                    <span className="font-medium opacity-60">Resend in {otpCooldown}s</span>
                  ) : (
                    <button onClick={handleResendOtp} disabled={isSubmitting} className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                      Resend OTP
                    </button>
                  )}
                </p>

                <button
                  onClick={() => { setStep('form'); setEmailOtp(['', '', '', '', '', '']); setOtpError(''); }}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  ← Go back
                </button>
              </div>
            )}

            {/* ── STEP 4: Welcome ── */}
            {step === 'welcome' && selectedRole && (
              <FreeTrialWelcome
                name={form.fullName || selectedRole}
                role={selectedRole}
                onContinue={handleGoToDashboard}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
