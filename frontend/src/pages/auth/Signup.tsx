import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Rocket, GraduationCap, Briefcase, ArrowRight, CheckCircle2, 
  AlertCircle, Mail, User, Lock, Eye, EyeOff, ShieldCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const roleCards = [
  {
    id: 'founder',
    title: 'Founder',
    desc: 'Build and launch your startup with AI tools',
    icon: Rocket,
    primaryColor: '#6C4CF1',
    accentColor: '#D4AF37'
  },
  {
    id: 'mentor',
    title: 'Mentor',
    desc: 'Guide founders and earn from expertise',
    icon: GraduationCap,
    primaryColor: '#6C4CF1',
    accentColor: '#22C55E'
  },
  {
    id: 'investor',
    title: 'Investor',
    desc: 'Discover and invest in startups',
    icon: Briefcase,
    primaryColor: '#6C4CF1',
    accentColor: '#3B82F6'
  },
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helpers
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handlePlanSelect = (selectedPlan: string) => {
    setPlan(selectedPlan);
    setStep(3);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      return showError('Full Name and Email are required.');
    }
    
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('OTP sent successfully to your email.');
        setTimeout(() => setSuccess(''), 3000);
        setStep(4);
      } else {
        showError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOtpFormat = () => {
    const code = otp.join('');
    if (code.length !== 6) {
      showError('Please enter a valid 6-digit OTP.');
      return;
    }
    setStep(5);
  };

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length > 5) score++;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0 to 5
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return showError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return showError('Passwords do not match.');

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otp.join(''),
          password,
          role,
          fullName
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Account Created Successfully.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        showError(data.error || 'Failed to create account.');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#6C4CF1]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37]/10 blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
          <div className="bg-[#6C4CF1] text-[#D4AF37] p-3.5 rounded-2xl shadow-xl shadow-[#6C4CF1]/20">
            <Rocket size={32} />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {step === 1 && "Choose your path"}
          {step === 2 && "Select a plan"}
          {step === 3 && "Create your account"}
          {step === 4 && "Verify your email"}
          {step === 5 && "Secure your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Step {step} of 5
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[20px] sm:px-10 border border-gray-100/50">
          
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-start shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="mr-2.5 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16a34a] rounded-2xl text-sm flex items-start shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="mr-2.5 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{success}</span>
            </div>
          )}

          {/* STEP 1: ROLE */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {roleCards.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className="w-full group flex items-center p-5 rounded-2xl border-2 border-gray-100 bg-white hover:border-[#6C4CF1] hover:shadow-[0_4px_20px_rgba(108,76,241,0.1)] transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-[#6C4CF1]/10 flex items-center justify-center shrink-0 transition-colors">
                      <Icon size={26} className="text-gray-400 group-hover:text-[#6C4CF1] transition-colors" />
                    </div>
                    <div className="ml-5 text-left flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#6C4CF1] transition-colors">{r.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 leading-snug">{r.desc}</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-300 group-hover:text-[#6C4CF1] group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: PLAN */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {role === 'founder' && (
                <div 
                  onClick={() => handlePlanSelect('free_trial')}
                  className="relative overflow-hidden cursor-pointer w-full p-6 rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-br from-white to-[#D4AF37]/5 hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] transition-all"
                >
                  <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ONE-TIME</div>
                  <div className="flex items-center gap-3 mb-4">
                    <Rocket className="text-[#D4AF37]" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">1-Day Free Trial</h3>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600"><CheckCircle2 size={16} className="text-[#22C55E] mr-2" /> Full AI Features enabled</li>
                    <li className="flex items-center text-sm text-gray-600"><CheckCircle2 size={16} className="text-[#22C55E] mr-2" /> Valid for exactly 24 hours</li>
                    <li className="flex items-center text-sm text-gray-600"><CheckCircle2 size={16} className="text-[#22C55E] mr-2" /> No credit card required</li>
                  </ul>
                  <button className="w-full py-3 bg-[#111827] text-white rounded-xl font-semibold text-sm hover:bg-[#1F2937] transition-colors">
                    Start Free Trial
                  </button>
                </div>
              )}
              
              <div 
                onClick={() => handlePlanSelect('monthly')}
                className="cursor-pointer w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-[#6C4CF1] hover:shadow-[0_8px_30px_rgba(108,76,241,0.1)] transition-all bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Monthly Plan</h3>
                  <span className="text-2xl font-black text-gray-900">$49<span className="text-sm font-medium text-gray-500">/mo</span></span>
                </div>
                {role === 'mentor' && <p className="text-sm text-gray-500 mb-4">Includes notifications, session & earnings management.</p>}
                {role === 'investor' && <p className="text-sm text-gray-500 mb-4">Includes startup discovery & portfolio tracking.</p>}
                <button className="w-full py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-semibold text-sm hover:border-[#6C4CF1] hover:text-[#6C4CF1] transition-colors">
                  Select Monthly
                </button>
              </div>
              
              <button onClick={() => setStep(1)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                ← Back to Roles
              </button>
            </div>
          )}

          {/* STEP 3: ACCOUNT DETAILS */}
          {step === 3 && (
            <form onSubmit={handleSendOTP} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-11 px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-[#6C4CF1]/20 text-sm font-bold text-white bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] hover:shadow-[#6C4CF1]/40 disabled:opacity-70 transition-all transform active:scale-[0.98]"
              >
                {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
              
              <button type="button" onClick={() => setStep(2)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                ← Back
              </button>
            </form>
          )}

          {/* STEP 4: OTP */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#6C4CF1]/10 text-[#6C4CF1] rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck size={32} />
                </div>
                <p className="text-sm text-gray-600 mb-6">Enter the 6-digit code sent to<br/><strong className="text-gray-900">{email}</strong></p>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index} id={`otp-${index}`}
                    type="text" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-black text-gray-900 border-2 border-gray-200 rounded-xl focus:border-[#6C4CF1] focus:ring-0 bg-white transition-colors"
                  />
                ))}
              </div>

              <button onClick={verifyOtpFormat}
                className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg shadow-[#6C4CF1]/20 text-sm font-bold text-white bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all transform active:scale-[0.98]"
              >
                Verify Code
              </button>
              
              <div className="text-center">
                <button onClick={handleSendOTP} disabled={isLoading} className="text-sm font-semibold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                  Resend Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PASSWORD */}
          {step === 5 && (
            <form onSubmit={handleCreateAccount} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Create Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                    placeholder="Min. 6 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#6C4CF1] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Strength Meter */}
                {password.length > 0 && (
                  <div className="mt-2.5 flex gap-1 items-center">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full ${getPasswordStrength() >= level ? (getPasswordStrength() > 3 ? 'bg-[#22C55E]' : 'bg-[#D4AF37]') : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg shadow-[#6C4CF1]/20 text-sm font-bold text-white bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] disabled:opacity-70 transition-all transform active:scale-[0.98] mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}

        </div>
        
        {step === 1 && (
          <div className="mt-6 text-center animate-in fade-in">
            <p className="text-sm text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
