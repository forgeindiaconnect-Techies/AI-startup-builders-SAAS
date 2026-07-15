import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  Rocket, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight,
  Loader2, ShieldCheck, Mail, User, Phone, Lock, Briefcase,
  Building2, TrendingUp, Globe, Check
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
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="h-4.5 w-4.5 text-gray-400" size={18} />
        </div>
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          className={cn(
            'block w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl transition-all duration-200',
            'bg-gray-50/50 placeholder:text-gray-400 text-gray-900',
            'focus:outline-none focus:ring-0 focus:bg-white',
            rightElement && 'pr-11',
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-gray-200 focus:border-[#6C4CF1] hover:border-gray-300'
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
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
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
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="h-4.5 w-4.5 text-gray-400" size={18} />
        </div>
        <select
          ref={ref}
          id={id}
          className={cn(
            'block w-full pl-10 pr-8 py-3 text-sm border-2 rounded-xl transition-all duration-200 appearance-none',
            'bg-gray-50/50 text-gray-900 cursor-pointer',
            'focus:outline-none focus:ring-0 focus:bg-white',
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-gray-200 focus:border-[#6C4CF1] hover:border-gray-300'
          )}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
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
const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'];

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
          className={cn(
            'w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-0',
            digit
              ? 'border-[#6C4CF1] bg-[#6C4CF1]/5 text-[#6C4CF1]'
              : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-[#6C4CF1]'
          )}
        />
      ))}
    </div>
  );
};

// ── Left Panel Illustration ────────────────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#6C4CF1] via-[#7C3AED] to-[#4C1D95] rounded-3xl p-10 text-white relative overflow-hidden">
    {/* Background patterns */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full translate-y-1/2 -translate-x-1/2" />
    <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2" />

    {/* Logo */}
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
          <Rocket size={22} className="text-[#D4AF37]" />
        </div>
        <span className="text-xl font-bold tracking-tight">AI Startup Builder</span>
      </div>

      <h1 className="text-4xl font-extrabold leading-tight mb-4">
        Build the next big<br />
        <span className="text-[#D4AF37]">startup with AI.</span>
      </h1>
      <p className="text-white/70 text-base leading-relaxed max-w-xs">
        Turn your startup idea into a successful business with AI-powered guidance, expert mentors, and investor connections.
      </p>
    </div>

    {/* Feature Cards */}
    <div className="relative z-10 space-y-3">
      {[
        { icon: '🤖', title: 'AI Business Plan Generator', desc: 'Create investor-ready plans instantly' },
        { icon: '🎯', title: 'Expert Mentor Network', desc: 'Connect with 500+ startup mentors' },
        { icon: '💰', title: 'Investor Connections', desc: 'Access to curated investor pool' },
      ].map(({ icon, title, desc }) => (
        <div key={title} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-white/60 text-xs">{desc}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Stats row */}
    <div className="relative z-10 grid grid-cols-3 gap-4 mt-6">
      {[
        { val: '10K+', label: 'Founders' },
        { val: '500+', label: 'Mentors' },
        { val: '$2M+', label: 'Funded' },
      ].map(({ val, label }) => (
        <div key={label} className="text-center">
          <p className="text-2xl font-black text-[#D4AF37]">{val}</p>
          <p className="text-white/60 text-xs">{label}</p>
        </div>
      ))}
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

  // Store form data for OTP step
  const [savedFormData, setSavedFormData] = useState<FounderFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FounderFormData>({
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
        setStep('otp');
        startResendCooldown();
      } else {
        setApiError(json.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setApiError('Network error. Please check your connection and try again.');
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
      await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formEmail }),
      });
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
        // Store JWT and refresh auth state
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

  // ── Step indicator ──
  const steps = [
    { num: 1, label: 'Account Details' },
    { num: 2, label: 'Verify Email' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FEF9EE] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_1.1fr] gap-6 items-stretch">

        {/* ── Left Panel ── */}
        <LeftPanel />

        {/* ── Right Panel ── */}
        <div className="flex flex-col">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-[#6C4CF1] rounded-xl flex items-center justify-center">
              <Rocket size={18} className="text-[#D4AF37]" />
            </div>
            <span className="text-lg font-bold text-gray-900">AI Startup Builder</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(108,76,241,0.08)] border border-gray-100 p-8 flex-1">

            {/* Step Progress */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                      step === 'form' && s.num === 1 ? 'bg-[#6C4CF1] text-white' :
                      step === 'otp' && s.num === 1 ? 'bg-emerald-500 text-white' :
                      step === 'otp' && s.num === 2 ? 'bg-[#6C4CF1] text-white' :
                      'bg-gray-100 text-gray-400'
                    )}>
                      {step === 'otp' && s.num === 1 ? <Check size={13} /> : s.num}
                    </div>
                    <span className={cn(
                      'text-xs font-semibold hidden sm:block',
                      (step === 'form' && s.num === 1) || (step === 'otp' && s.num === 2)
                        ? 'text-[#6C4CF1]'
                        : step === 'otp' && s.num === 1 ? 'text-emerald-600' : 'text-gray-400'
                    )}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={cn('flex-1 h-0.5 rounded-full transition-all duration-500', step === 'otp' ? 'bg-emerald-400' : 'bg-gray-100')} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── FORM STEP ── */}
            {step === 'form' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Founder Account</h2>
                  <p className="text-gray-500 text-sm mt-1">Join thousands of founders building the future.</p>
                </div>

                {apiError && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-600 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">

                  {/* Personal Information */}
                  <div>
                    <p className="text-xs font-bold text-[#6C4CF1] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-4 h-0.5 bg-[#6C4CF1] rounded-full inline-block" />
                      Personal Information
                    </p>
                    <div className="space-y-3">
                      <InputField
                        id="fullName"
                        label="Full Name *"
                        icon={User}
                        placeholder="John Doe"
                        error={errors.fullName?.message}
                        {...register('fullName')}
                      />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputField
                          id="email"
                          label="Email Address *"
                          icon={Mail}
                          type="email"
                          placeholder="john@example.com"
                          error={errors.email?.message}
                          {...register('email')}
                        />
                        <InputField
                          id="mobile"
                          label="Mobile Number *"
                          icon={Phone}
                          type="tel"
                          placeholder="+91 9876543210"
                          error={errors.mobile?.message}
                          {...register('mobile')}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <InputField
                            id="password"
                            label="Password *"
                            icon={Lock}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 8 characters"
                            error={errors.password?.message}
                            rightElement={
                              <button type="button" onClick={() => setShowPassword(p => !p)}
                                className="text-gray-400 hover:text-[#6C4CF1] transition-colors">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            }
                            {...register('password', {
                              onChange: e => setWatchedPassword(e.target.value)
                            })}
                          />
                          {/* Strength Meter */}
                          {(passwordValue || watchedPassword) && (
                            <div className="mt-2">
                              <div className="flex gap-1 mb-1">
                                {[1,2,3,4,5].map(n => (
                                  <div key={n} className={cn('h-1 flex-1 rounded-full transition-all duration-300', strength.score >= n ? strengthColors[strength.score] : 'bg-gray-100')} />
                                ))}
                              </div>
                              <p className={cn('text-xs font-semibold', strength.score <= 2 ? 'text-red-500' : strength.score <= 3 ? 'text-yellow-600' : 'text-emerald-600')}>
                                {strengthLabels[strength.score]}
                              </p>
                            </div>
                          )}
                        </div>
                        <InputField
                          id="confirmPassword"
                          label="Confirm Password *"
                          icon={Lock}
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Repeat password"
                          error={errors.confirmPassword?.message}
                          rightElement={
                            <button type="button" onClick={() => setShowConfirm(p => !p)}
                              className="text-gray-400 hover:text-[#6C4CF1] transition-colors">
                              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          }
                          {...register('confirmPassword')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <p className="text-xs font-bold text-[#6C4CF1] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-4 h-0.5 bg-[#6C4CF1] rounded-full inline-block" />
                      Professional Information
                    </p>
                    <SelectField
                      id="currentRole"
                      label="Current Role *"
                      icon={Briefcase}
                      options={CURRENT_ROLES}
                      placeholder="Select your role"
                      error={errors.currentRole?.message}
                      {...register('currentRole')}
                    />
                  </div>

                  {/* Startup Information */}
                  <div>
                    <p className="text-xs font-bold text-[#6C4CF1] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-4 h-0.5 bg-[#6C4CF1] rounded-full inline-block" />
                      Startup Information
                    </p>
                    <div className="space-y-3">
                      <InputField
                        id="startupName"
                        label="Startup Name (Optional)"
                        icon={Building2}
                        placeholder="e.g. TechNova AI"
                        {...register('startupName')}
                      />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <SelectField
                          id="startupStage"
                          label="Startup Stage *"
                          icon={TrendingUp}
                          options={STARTUP_STAGES}
                          placeholder="Select stage"
                          error={errors.startupStage?.message}
                          {...register('startupStage')}
                        />
                        <SelectField
                          id="industry"
                          label="Industry *"
                          icon={Globe}
                          options={INDUSTRIES}
                          placeholder="Select industry"
                          error={errors.industry?.message}
                          {...register('industry')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="space-y-2.5">
                    {([
                      { id: 'agreedToTerms',    name: 'agreedToTerms' as keyof FounderFormData,    label: 'Terms & Conditions', href: '/terms-of-service', error: errors.agreedToTerms },
                      { id: 'agreedToPrivacy', name: 'agreedToPrivacy' as keyof FounderFormData, label: 'Privacy Policy',       href: '/privacy-policy',  error: errors.agreedToPrivacy },
                    ] as const).map(({ id, name, label, href, error: fieldErr }) => (
                      <div key={id}>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            id={id}
                            type="checkbox"
                            className="mt-0.5 w-4 h-4 rounded border-2 border-gray-300 text-[#6C4CF1] focus:ring-[#6C4CF1] focus:ring-offset-0 cursor-pointer"
                            {...register(name)}
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            I agree to the{' '}
                            <Link to={href} target="_blank" className="text-[#6C4CF1] font-semibold hover:underline">
                              {label}
                            </Link>
                          </span>
                        </label>
                        {fieldErr?.message && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1 pl-7">
                            <AlertCircle size={12} /> {fieldErr.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#6C4CF1]/25 hover:shadow-[#6C4CF1]/40 hover:from-[#5B21B6] hover:to-[#4C1D95] disabled:opacity-70 transition-all duration-300 transform active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
                    ) : (
                      <><span>Create Founder Account</span><ArrowRight size={16} /></>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-100" />
                    <span className="mx-4 text-xs text-gray-400 font-medium">or</span>
                    <div className="flex-grow border-t border-gray-100" />
                  </div>

                  {/* Google Sign-in */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-sm rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Login Link */}
                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                      Sign in
                    </Link>
                  </p>
                </form>
              </>
            )}

            {/* ── OTP STEP ── */}
            {step === 'otp' && (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#6C4CF1]/10 rounded-2xl flex items-center justify-center mb-5">
                  <ShieldCheck size={32} className="text-[#6C4CF1]" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verify your email</h2>
                <p className="text-gray-500 text-sm mb-1">
                  We sent a 6-digit OTP to
                </p>
                <p className="font-bold text-gray-900 text-sm mb-8">{formEmail}</p>

                <div className="w-full mb-4">
                  <OTPInput value={otp} onChange={setOtp} />
                </div>

                {otpError && (
                  <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{otpError}</span>
                  </div>
                )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#6C4CF1]/25 hover:shadow-[#6C4CF1]/40 disabled:opacity-60 transition-all duration-300 mb-4"
                >
                  {otpLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                  ) : (
                    <><CheckCircle2 size={16} /> Verify & Create Account</>
                  )}
                </button>

                <p className="text-sm text-gray-500">
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-gray-400 font-medium">Resend in {resendCooldown}s</span>
                  ) : (
                    <button onClick={handleResend} className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                      Resend OTP
                    </button>
                  )}
                </p>

                <button
                  onClick={() => { setStep('form'); setOtp(['','','','','','']); setOtpError(''); }}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Change email address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderSignup;
