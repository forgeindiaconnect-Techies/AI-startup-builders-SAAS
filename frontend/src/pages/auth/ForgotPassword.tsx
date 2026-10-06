import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

type Step = 'email' | 'otp' | 'password' | 'success';

const ForgotPassword: React.FC = () => {
  const { sendResetOTP, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [targetRole, setTargetRole] = useState('founder');
  const [resettingEmail, setResettingEmail] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const result = await sendResetOTP(email.trim());
    setIsLoading(false);

    if (result.success) {
      setResettingEmail(email.trim().toLowerCase());
      setStep('otp');
      setCooldown(60);
    } else {
      setError(result.error || 'Failed to send reset code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !resettingEmail) return;
    setError('');
    setIsLoading(true);
    const result = await sendResetOTP(resettingEmail);
    setIsLoading(false);
    if (result.success) {
      setCooldown(60);
    } else {
      setError(result.error || 'Failed to resend code.');
    }
  };

  const handleVerifyOTP = () => {
    setError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setStep('password');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(resettingEmail, code, password);
    setIsLoading(false);

    if (result.success) {
      setTargetRole(result.role || 'founder');
      setStep('success');
      setTimeout(() => {
        if (targetRole === 'admin') navigate('/dashboard/admin');
        else if (targetRole === 'mentor') navigate('/dashboard/mentor');
        else if (targetRole === 'investor') navigate('/dashboard/investor');
        else navigate('/dashboard/founder');
      }, 1800);
    } else {
      setError(result.error || 'Failed to reset password. Please try again.');
      if (result.error?.includes('OTP')) {
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
      }
    }
  };

  const goBack = () => {
    if (step === 'otp') setStep('email');
    else if (step === 'password') setStep('otp');
  };

  const backLink = step === 'email' ? (
    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#6C4CF1] transition-colors">
      <ArrowLeft size={16} /> Back to Login
    </Link>
  ) : (
    <button type="button" onClick={goBack} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#6C4CF1] transition-colors">
      <ArrowLeft size={16} /> Back
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#6C4CF1]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37]/10 blur-[100px] pointer-events-none"></div>

      {/* Back to Home Button */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-[#6C4CF1] hover:border-[#6C4CF1] hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 text-sm font-semibold group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
        Back to Home
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
          <div className="bg-[#6C4CF1] text-[#D4AF37] p-3.5 rounded-2xl shadow-xl shadow-[#6C4CF1]/20">
            <Rocket size={32} />
          </div>
        </div>

        {step === 'success' ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-500 text-sm font-medium">Logging you into your dashboard...</p>
          </div>
        ) : (
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
            <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[20px] sm:px-10 border border-gray-100/50">

              <div className="mb-6">
                {backLink}
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                  {step === 'email' ? 'Forgot password?' : step === 'otp' ? 'Enter reset code' : 'Create new password'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500 font-medium">
                  {step === 'email' && 'Enter your email and we\'ll send you a code to reset your password.'}
                  {step === 'otp' && `Enter the 6-digit code sent to ${resettingEmail}`}
                  {step === 'password' && 'Enter your new password below.'}
                </p>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-start shadow-sm animate-in fade-in">
                  <AlertCircle size={18} className="mr-2.5 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {step === 'email' && (
                <form className="space-y-5" onSubmit={handleSendCode}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        className="block w-full pl-11 px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                        placeholder="Enter your email" autoComplete="email"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg shadow-[#6C4CF1]/20 text-sm font-bold text-white bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] disabled:opacity-70 transition-all transform active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code...</>
                    ) : (
                      <>Send Reset Code <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <div className="space-y-5">
                  <OTPInput value={otp} onChange={(val) => { setOtp(val); setError(''); }} />

                  <button type="button" onClick={handleVerifyOTP} disabled={otp.join('').length !== 6}
                    className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg shadow-[#6C4CF1]/20 text-sm font-bold text-white bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] disabled:opacity-50 transition-all transform active:scale-[0.98]"
                  >
                    Verify Code <ArrowRight className="ml-2 h-5 w-5" />
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || isLoading}
                      className={`text-sm font-bold transition-colors ${cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#6C4CF1] hover:text-[#5B21B6]'}`}
                    >
                      {isLoading ? 'Resending...' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'password' && (
                <form className="space-y-5" onSubmit={handleReset}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">New password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="block w-full pl-11 pr-12 px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                        placeholder="Enter new password" autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#6C4CF1] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Confirm new password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        className="block w-full pl-11 pr-12 px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                        placeholder="Confirm new password" autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#6C4CF1] transition-colors"
                      >
                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords do not match</p>
                    )}
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg shadow-[#6C4CF1]/20 text-sm font-bold text-white bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] disabled:opacity-70 transition-all transform active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
                    ) : (
                      <>Reset Password <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
