import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  Rocket, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight,
  Loader2, ShieldCheck, Mail, User, Phone, Lock, Briefcase,
  Building2, TrendingUp, Globe, Check, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Zod Schema ─────────────────────────────────────────────────────────────────
const founderSchema = z.object({
  fullName:        z.string().min(2, 'Full name must be at least 2 characters'),
  email:           z.string().email('Please enter a valid email address'),
  mobile:          z.string().regex(/^\+?[0-9]{7,15}$/, 'Please enter a valid mobile number'),
  password:        z.string().min(8, 'Password must be at least 8 characters')
                   .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
                   .regex(/[0-9]/, 'Must contain at least one number')
                   .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
  currentRole:     z.string().min(1, 'Please select your current role'),
  startupName:     z.string().optional(),
  startupStage:    z.string().min(1, 'Please select your startup stage'),
  industry:        z.string().min(1, 'Please select your industry'),
  agreedToTerms:   z.boolean().refine(val => val === true, 'You must agree to the Terms & Conditions'),
  agreedToPrivacy: z.boolean().refine(val => val === true, 'You must agree to the Privacy Policy'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FounderFormData = z.infer<typeof founderSchema>;

// ── Constants ──────────────────────────────────────────────────────────────────
const CURRENT_ROLES = ['Student', 'Entrepreneur', 'Founder', 'Business Owner', 'Employee', 'Freelancer', 'Other'];
const STARTUP_STAGES = ['Idea Stage', 'Validation', 'MVP', 'Early Revenue', 'Scaling'];
const INDUSTRIES = ['AI', 'SaaS', 'FinTech', 'EdTech', 'Healthcare', 'Agriculture', 'E-commerce', 'Cybersecurity', 'Manufacturing', 'Other'];

// ── Helper Components ──────────────────────────────────────────────────────────
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: React.ElementType;
  error?: string;
  rightElement?: React.ReactNode;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ id, label, icon: Icon, error, type = 'text', placeholder, rightElement, className: _cls, ...rest }, ref) => (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className={cn("h-4.5 w-4.5 transition-colors", error ? "text-red-400" : "text-gray-400 dark:text-gray-500 group-focus-within:text-[#6C4CF1]")} size={18} />
        </div>
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          className={cn(
            'block w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl transition-all duration-300 outline-none',
            'bg-gray-50/50 dark:bg-[#1A1A2E]/50 text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-600',
            rightElement && 'pr-11',
            error
              ? 'border-red-300 dark:border-red-500/50 focus:border-red-400 focus:bg-white dark:focus:bg-[#1A1A2E]'
              : 'border-gray-200 dark:border-gray-800 focus:border-[#6C4CF1] hover:border-gray-300 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-[#1A1A2E] focus:shadow-[0_0_0_4px_rgba(108,76,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(108,76,241,0.2)]'
          )}
          {...rest}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-fade-in-up">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
);
InputField.displayName = 'InputField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  icon: React.ElementType;
  options: string[];
  placeholder?: string;
  error?: string;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ id, label, icon: Icon, options, placeholder = 'Select...', error, className: _cls, ...rest }, ref) => (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className={cn("h-4.5 w-4.5 transition-colors", error ? "text-red-400" : "text-gray-400 dark:text-gray-500 group-focus-within:text-[#6C4CF1]")} size={18} />
        </div>
        <select
          ref={ref}
          id={id}
          className={cn(
            'block w-full pl-10 pr-8 py-3 text-sm border-2 rounded-xl transition-all duration-300 appearance-none outline-none',
            'bg-gray-50/50 dark:bg-[#1A1A2E]/50 text-gray-900 dark:text-white cursor-pointer',
            error
              ? 'border-red-300 dark:border-red-500/50 focus:border-red-400 focus:bg-white dark:focus:bg-[#1A1A2E]'
              : 'border-gray-200 dark:border-gray-800 focus:border-[#6C4CF1] hover:border-gray-300 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-[#1A1A2E] focus:shadow-[0_0_0_4px_rgba(108,76,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(108,76,241,0.2)]'
          )}
          {...rest}
        >
          <option value="" disabled className="text-gray-400 dark:text-gray-600">{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-white dark:bg-[#1A1A2E] text-gray-900 dark:text-white">{opt}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-fade-in-up">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
);
SelectField.displayName = 'SelectField';

// ── Password Strength ──────────────────────────────────────────────────────────
const getPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length:   password.length >= 8,
    upper:    /[A-Z]/.test(password),
    number:   /[0-9]/.test(password),
    special:  /[^A-Za-z0-9]/.test(password),
    long:     password.length >= 12,
  };
  score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
};

const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-400', 'bg-emerald-500'];

// ── OTP Input Component ────────────────────────────────────────────────────────
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
    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
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
          className={cn(
            'w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-0',
            digit
              ? 'border-[#6C4CF1] bg-[#6C4CF1]/5 dark:bg-[#6C4CF1]/10 text-[#6C4CF1] dark:text-[#8b72f5]'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1A2E]/50 text-gray-900 dark:text-white focus:border-[#6C4CF1] dark:focus:border-[#6C4CF1]'
          )}
        />
      ))}
    </div>
  );
};

// ── Left Panel Illustration ────────────────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <div className="hidden lg:flex flex-col justify-between bg-[#0B061A] rounded-3xl p-10 text-white relative overflow-hidden h-full shadow-2xl shadow-[#6C4CF1]/10 border border-white/5">
    {/* Abstract Background Elements */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#6C4CF1]/30 via-[#7C3AED]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-60" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#D4AF37]/20 via-[#FBBF24]/5 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl opacity-50" />
    
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-30" />

    {/* Header */}
    <div className="relative z-10">
      <Link to="/" className="inline-flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity">
        <div className="w-12 h-12 bg-gradient-to-br from-[#6C4CF1] to-[#4C1D95] rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(108,76,241,0.3)]">
          <Rocket size={24} className="text-[#FBBF24]" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">AI Startup Builder</span>
      </Link>

      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
          Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b72f5] to-[#FBBF24]">startup idea</span> into a successful business.
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Get AI-powered guidance, expert mentors, and investor connections all in one unified platform.
        </p>
      </div>
    </div>

    {/* Stats & Features */}
    <div className="relative z-10 mt-12 space-y-8">
      {/* Feature List */}
      <div className="space-y-4">
        {[
          { icon: '🤖', title: 'AI Business Plan Generator', desc: 'Create investor-ready plans instantly' },
          { icon: '🎯', title: 'Expert Mentor Network', desc: 'Connect with 500+ startup mentors' },
          { icon: '💰', title: 'Investor Connections', desc: 'Access to a curated investor pool' },
        ].map(({ icon, title, desc }, i) => (
          <div key={title} className="flex items-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors animate-fade-in-left" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/5 shrink-0">
              {icon}
            </div>
            <div>
              <p className="font-semibold text-white">{title}</p>
              <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Stats */}
      <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
        {[
          { val: '10K+', label: 'Founders' },
          { val: '500+', label: 'Mentors' },
          { val: '$2M+', label: 'Funded' },
        ].map(({ val, label }) => (
          <div key={label} className="text-center">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-[#FDE68A]">{val}</p>
            <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const FounderSignup: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [watchedPassword, setWatchedPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [demoOtp, setDemoOtp] = useState('');
  const [savedFormData, setSavedFormData] = useState<FounderFormData | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FounderFormData>({
    resolver: zodResolver(founderSchema),
    mode: 'onBlur',
  });

  const passwordValue = watch('password', '');
  const strength = getPasswordStrength(passwordValue || watchedPassword);

  // ── Step 1: Submit form → Send OTP ──
  const onFormSubmit = async (data: FounderFormData) => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedFormData(data);
        setFormEmail(data.email);
        if (json.demoOtp) setDemoOtp(json.demoOtp);
        setStep('otp');
        startResendCooldown();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setApiError(json.error || 'Failed to send OTP. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setApiError('Network error. Please check your connection and try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── OTP Resend Cooldown ──
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !formEmail) return;
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formEmail }),
      });
      const json = await res.json();
      if (json.demoOtp) setDemoOtp(json.demoOtp);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      startResendCooldown();
    } catch { /* silent */ }
  };

  // ── Step 2: Verify OTP → Create Account → Auto-login ──
  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP.');
      return;
    }
    if (!savedFormData) return;

    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:           savedFormData.email,
          otp:             code,
          password:        savedFormData.password,
          role:            'founder',
          fullName:        savedFormData.fullName,
          mobile:          savedFormData.mobile,
          currentRole:     savedFormData.currentRole,
          startupName:     savedFormData.startupName,
          startupStage:    savedFormData.startupStage,
          industry:        savedFormData.industry,
          agreedToTerms:   savedFormData.agreedToTerms,
        }),
      });
      const json = await res.json();
      if (json.success && json.token) {
        localStorage.setItem('ai_startup_builder_jwt', json.token);
        await checkAuth();
        navigate('/dashboard/founder', { replace: true });
      } else {
        setOtpError(json.error || 'Invalid OTP. Please try again.');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F0A1E] transition-colors duration-300 p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1400px] bg-white dark:bg-[#150F28] rounded-[2rem] shadow-2xl shadow-gray-200/50 dark:shadow-[#000000] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col lg:flex-row min-h-[850px] relative">
        
        {/* ── Left Panel ── */}
        <div className="hidden lg:block w-[45%] xl:w-[40%] p-4">
          <LeftPanel />
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 p-6 sm:p-10 lg:p-16 flex flex-col relative overflow-hidden">
          
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6C4CF1] to-[#4C1D95] rounded-xl flex items-center justify-center shadow-lg">
              <Rocket size={18} className="text-[#FBBF24]" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">AI Startup Builder</span>
          </div>

          {/* Form Container */}
          <div className={cn("max-w-2xl w-full mx-auto flex-1 transition-all duration-500 transform", step === 'form' ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0 pointer-events-none absolute')}>
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Create Founder Account</h2>
              <p className="text-gray-500 dark:text-gray-400">Join thousands of founders building the future.</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-fade-in-up">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10 pb-8">
              
              {/* Personal Info Section */}
              <section className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Personal Info</span>
                  <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                </div>
                
                <InputField id="fullName" label="Full Name *" icon={User} placeholder="e.g. John Doe" error={errors.fullName?.message} {...register('fullName')} />
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField id="email" label="Email Address *" icon={Mail} type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
                  <InputField id="mobile" label="Mobile Number *" icon={Phone} type="tel" placeholder="+1 (555) 000-0000" error={errors.mobile?.message} {...register('mobile')} />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <InputField
                      id="password" label="Password *" icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" error={errors.password?.message}
                      rightElement={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-2 text-gray-400 hover:text-[#6C4CF1] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                      {...register('password', { onChange: e => setWatchedPassword(e.target.value) })}
                    />
                    {(passwordValue || watchedPassword) && (
                      <div className="mt-3 animate-fade-in-up">
                        <div className="flex gap-1.5 mb-1.5">
                          {[1,2,3,4,5].map(n => (
                            <div key={n} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500', strength.score >= n ? strengthColors[strength.score] : 'bg-gray-200 dark:bg-gray-800')} />
                          ))}
                        </div>
                        <p className={cn('text-xs font-medium', strength.score <= 2 ? 'text-red-500' : strength.score <= 3 ? 'text-yellow-500' : 'text-emerald-500')}>
                          {strengthLabels[strength.score]}
                        </p>
                      </div>
                    )}
                  </div>
                  <InputField
                    id="confirmPassword" label="Confirm Password *" icon={Lock} type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" error={errors.confirmPassword?.message}
                    rightElement={
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="p-2 text-gray-400 hover:text-[#6C4CF1] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                    {...register('confirmPassword')}
                  />
                </div>
              </section>

              {/* Professional & Startup Info */}
              <section className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Professional Info</span>
                  <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <SelectField id="currentRole" label="Current Role *" icon={Briefcase} options={CURRENT_ROLES} placeholder="Select your role" error={errors.currentRole?.message} {...register('currentRole')} />
                  <InputField id="startupName" label="Startup Name (Optional)" icon={Building2} placeholder="e.g. TechNova AI" {...register('startupName')} />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <SelectField id="startupStage" label="Startup Stage *" icon={TrendingUp} options={STARTUP_STAGES} placeholder="Select stage" error={errors.startupStage?.message} {...register('startupStage')} />
                  <SelectField id="industry" label="Industry *" icon={Globe} options={INDUSTRIES} placeholder="Select industry" error={errors.industry?.message} {...register('industry')} />
                </div>
              </section>

              {/* Agreements */}
              <section className="space-y-4 bg-gray-50/50 dark:bg-[#1A1A2E]/50 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                {[
                  { id: 'agreedToTerms', name: 'agreedToTerms' as keyof FounderFormData, label: 'Terms & Conditions', href: '/terms-of-service', error: errors.agreedToTerms },
                  { id: 'agreedToPrivacy', name: 'agreedToPrivacy' as keyof FounderFormData, label: 'Privacy Policy', href: '/privacy-policy', error: errors.agreedToPrivacy },
                ].map(({ id, name, label, href, error: fieldErr }) => (
                  <div key={id}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          id={id} type="checkbox"
                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md checked:bg-[#6C4CF1] checked:border-[#6C4CF1] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C4CF1]/20 focus:ring-offset-2 dark:focus:ring-offset-[#150F28]"
                          {...register(name)}
                        />
                        <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                        I agree to the <Link to={href} target="_blank" className="text-[#6C4CF1] font-semibold hover:underline">{label}</Link>
                      </span>
                    </label>
                    {fieldErr?.message && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 pl-8"><AlertCircle size={12} /> {fieldErr.message}</p>}
                  </div>
                ))}
              </section>

              {/* Submit & Auth Actions */}
              <div className="space-y-6 pt-4">
                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-[15px] rounded-2xl shadow-xl shadow-[#6C4CF1]/20 hover:shadow-[#6C4CF1]/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none transition-all duration-300"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : <><span>Continue to Verification</span><ArrowRight size={18} /></>}
                </button>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-800" />
                  <span className="mx-4 text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">or continue with</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-800" />
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white dark:bg-[#1A1A2E] border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white font-bold text-[15px] rounded-2xl hover:bg-gray-50 dark:hover:bg-[#232338] hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  Google
                </button>

                <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] dark:hover:text-[#8b72f5] transition-colors">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* ── OTP Verification Overlay ── */}
          <div className={cn(
            "absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/95 dark:bg-[#150F28]/95 backdrop-blur-md transition-all duration-500 transform",
            step === 'otp' ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
          )}>
            <div className="max-w-md w-full bg-white dark:bg-[#1A1A2E] rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-gray-200/50 dark:shadow-[#000000] border border-gray-100 dark:border-white/10 relative">
              
              <button 
                onClick={() => { setStep('form'); setOtp(['','','','','','']); setOtpError(''); }}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Go back"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#6C4CF1]/10 dark:bg-[#6C4CF1]/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <ShieldCheck size={32} className="text-[#6C4CF1]" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Verify your email</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  We've sent a 6-digit verification code to
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-[15px] mb-8">{formEmail}</p>

                <div className="w-full mb-6">
                  <OTPInput value={otp} onChange={setOtp} />
                </div>

                {/* Demo OTP Banner */}
                {demoOtp && (
                  <div className="w-full mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-left animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-600 dark:text-amber-400 text-lg">⚠️</span>
                      <p className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Demo Mode Active</p>
                    </div>
                    <p className="text-[13px] text-amber-700 dark:text-amber-300/80 mb-3 leading-relaxed">
                      Email delivery is bypassed for testing. Your OTP code is:
                    </p>
                    <div className="flex items-center justify-between bg-white dark:bg-[#1A1A2E] border border-amber-300 dark:border-amber-500/30 rounded-xl px-4 py-3 shadow-sm">
                      <span className="text-2xl font-black tracking-[0.25em] text-amber-800 dark:text-amber-400">{demoOtp}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = demoOtp.split('');
                          setOtp([...digits, ...Array(6 - digits.length).fill('')].slice(0, 6));
                        }}
                        className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 px-3.5 py-1.5 rounded-lg transition-colors"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>
                )}

                {otpError && (
                  <div className="w-full mb-6 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-600 dark:text-red-400 text-sm text-left animate-fade-in-up">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{otpError}</span>
                  </div>
                )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-[15px] rounded-2xl shadow-xl shadow-[#6C4CF1]/20 hover:shadow-[#6C4CF1]/40 disabled:opacity-60 disabled:hover:shadow-none transition-all duration-300 transform active:scale-[0.98]"
                >
                  {otpLoading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : <><CheckCircle2 size={18} /> Verify & Create Account</>}
                </button>

                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-6">
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-gray-400 dark:text-gray-500">Resend in <span className="font-bold text-gray-700 dark:text-gray-300">{resendCooldown}s</span></span>
                  ) : (
                    <button onClick={handleResend} className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] dark:hover:text-[#8b72f5] transition-colors focus:outline-none">
                      Resend Code
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FounderSignup;
