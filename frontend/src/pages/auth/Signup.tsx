import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  Rocket, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight,
  Loader2, ShieldCheck, Mail, User, Phone, Lock, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { API_URL } from '../../config/api';

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
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FounderFormData = z.infer<typeof founderSchema>;

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
const strengthColors = ['', 'bg-destructive', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'];

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
            'w-12 h-14 text-center text-xl font-bold border rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            digit
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-input bg-background text-foreground'
          )}
        />
      ))}
    </div>
  );
};

// ── Left Panel Illustration ────────────────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <div className="hidden lg:flex flex-col justify-between bg-primary rounded-3xl p-10 text-primary-foreground relative overflow-hidden shadow-2xl">
    {/* Background patterns */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
    <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2" />

    {/* Logo */}
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-sm">
          <Rocket size={22} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">AI Startup Builder</span>
      </div>

      <h1 className="text-4xl font-extrabold leading-tight mb-4 text-white">
        Build the next big<br />
        <span className="text-accent-light opacity-90">startup with AI.</span>
      </h1>
      <p className="text-primary-foreground/80 text-base leading-relaxed max-w-xs">
        Turn your startup idea into a successful business with AI-powered guidance, expert mentors, and investor connections.
      </p>
    </div>

    {/* Feature Cards */}
    <div className="relative z-10 space-y-3 mt-8">
      {[
        { icon: '🤖', title: 'AI Business Plan Generator', desc: 'Create investor-ready plans instantly' },
        { icon: '🎯', title: 'Expert Mentor Network', desc: 'Connect with 500+ startup mentors' },
        { icon: '💰', title: 'Investor Connections', desc: 'Access to curated investor pool' },
      ].map(({ icon, title, desc }) => (
        <div key={title} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors shadow-sm">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold text-sm text-white">{title}</p>
            <p className="text-primary-foreground/70 text-xs">{desc}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Stats row */}
    <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
      {[
        { val: '10K+', label: 'Founders' },
        { val: '500+', label: 'Mentors' },
        { val: '$2M+', label: 'Funded' },
      ].map(({ val, label }) => (
        <div key={label} className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-xl font-black text-white">{val}</p>
          <p className="text-primary-foreground/70 text-xs font-medium">{label}</p>
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

  const [savedFormData, setSavedFormData] = useState<FounderFormData | null>(null);

  const form = useForm<FounderFormData>({
    resolver: zodResolver(founderSchema),
    mode: 'onBlur',
  });

  const passwordValue = form.watch('password', '');
  const strength = getPasswordStrength(passwordValue || watchedPassword);

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

  const steps = [
    { num: 1, label: 'Account Details' },
    { num: 2, label: 'Verify Email' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans text-foreground">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_1.1fr] gap-6 items-stretch">
        <LeftPanel />

        <div className="flex flex-col">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">AI Startup Builder</span>
          </div>

          <div className="bg-card text-card-foreground rounded-3xl shadow-xl shadow-primary/5 border p-8 flex-1">
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                      step === 'form' && s.num === 1 ? 'bg-primary text-primary-foreground' :
                      step === 'otp' && s.num === 1 ? 'bg-emerald-500 text-white' :
                      step === 'otp' && s.num === 2 ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {step === 'otp' && s.num === 1 ? <Check size={13} /> : s.num}
                    </div>
                    <span className={cn(
                      'text-xs font-semibold hidden sm:block',
                      (step === 'form' && s.num === 1) || (step === 'otp' && s.num === 2)
                        ? 'text-primary'
                        : step === 'otp' && s.num === 1 ? 'text-emerald-600' : 'text-muted-foreground'
                    )}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={cn('flex-1 h-0.5 rounded-full transition-all duration-500', step === 'otp' ? 'bg-emerald-400' : 'bg-muted')} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {step === 'form' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold tracking-tight">Create Founder Account</h2>
                  <p className="text-muted-foreground text-sm mt-1">Join thousands of founders building the future.</p>
                </div>

                {apiError && (
                  <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2.5 text-destructive text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-primary rounded-full inline-block" />
                        Personal Information
                      </p>
                      <div className="space-y-4">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9 bg-muted/50" placeholder="John Doe" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input type="email" className="pl-9 bg-muted/50" placeholder="john@example.com" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="mobile" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input type="tel" className="pl-9 bg-muted/50" placeholder="+91 9876543210" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    className="pl-9 pr-9 bg-muted/50" 
                                    placeholder="Min. 8 characters" 
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      setWatchedPassword(e.target.value);
                                    }}
                                  />
                                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              {(passwordValue || watchedPassword) && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <div key={n} className={cn('h-1 flex-1 rounded-full transition-all duration-300', strength.score >= n ? strengthColors[strength.score] : 'bg-muted')} />
                                    ))}
                                  </div>
                                  <p className={cn('text-[10px] font-semibold', strength.score <= 2 ? 'text-destructive' : strength.score <= 3 ? 'text-yellow-600' : 'text-emerald-600')}>
                                    {strengthLabels[strength.score]}
                                  </p>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )} />
                          
                          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type={showConfirm ? "text" : "password"} 
                                    className="pl-9 pr-9 bg-muted/50" 
                                    placeholder="Repeat password" 
                                    {...field} 
                                  />
                                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-md" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</>
                      ) : (
                        <>Create Founder Account <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground font-medium">
                      Already have an account?{' '}
                      <Link to="/login" className="font-bold text-primary hover:underline transition-colors">
                        Sign in
                      </Link>
                    </p>
                  </form>
                </Form>

                {/* Demo Accounts Panel */}
                <div className="mt-8 p-4 rounded-2xl bg-muted/40 border border-muted flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground/80 tracking-wide uppercase">Demo Accounts for Testing</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">READY</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { role: 'Founder', email: 'founder@test.com' },
                      { role: 'Admin', email: 'admin@test.com' },
                      { role: 'Mentor', email: 'mentor@test.com' },
                      { role: 'Investor', email: 'investor@test.com' },
                    ].map(demo => (
                      <div key={demo.email} className="bg-card border border-muted/50 rounded-xl p-2 flex flex-col">
                        <span className="font-bold text-foreground">{demo.role}</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate">{demo.email}</span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5">PW: Test@123</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 'otp' && (
              <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 ring-4 ring-primary/5">
                  <ShieldCheck size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-extrabold mb-2">Verify your email</h2>
                <p className="text-muted-foreground text-sm mb-1">
                  We sent a 6-digit OTP to
                </p>
                <p className="font-bold text-foreground text-sm mb-8">{formEmail}</p>

                <div className="w-full mb-6">
                  <OTPInput value={otp} onChange={setOtp} />
                </div>

                {otpError && (
                  <div className="w-full mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{otpError}</span>
                  </div>
                )}

                <Button 
                  onClick={handleVerifyOTP} 
                  disabled={otpLoading || otp.join('').length !== 6}
                  className="w-full h-12 text-base font-bold rounded-xl shadow-md mb-6"
                >
                  {otpLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-5 w-5" /> Verify & Create Account</>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="font-medium opacity-60">Resend in {resendCooldown}s</span>
                  ) : (
                    <button onClick={handleResend} className="font-bold text-primary hover:underline transition-colors">
                      Resend OTP
                    </button>
                  )}
                </p>

                <button
                  onClick={() => { setStep('form'); setOtp(['','','','','','']); setOtpError(''); }}
                  className="mt-6 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
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
