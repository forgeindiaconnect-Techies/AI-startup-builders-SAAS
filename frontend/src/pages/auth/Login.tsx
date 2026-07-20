import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Rocket, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname === '/admin-login';

  const [email, setEmail] = useState(isAdminLogin ? 'selva@gmail.com' : '');
  const [password, setPassword] = useState(isAdminLogin ? 'Selva@143' : '');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        const targetRole = result.role || 'founder';

        if (!isAdminLogin && targetRole === 'admin') {
          setError('Admin accounts use a separate login portal. Please use /admin-login.');
          return;
        }

        const isTrialExpired = targetRole === 'founder' && result.subscriptionStatus && result.subscriptionStatus !== 'active';

        if (isTrialExpired) {
          showToast('Your free trial is completed. Redirecting to subscription page...', 'warning');
        } else {
          setSuccess('Welcome back! Redirecting...');
        }
        
        setTimeout(() => {
          if (targetRole === 'admin') navigate('/dashboard/admin');
          else if (targetRole === 'mentor') navigate('/dashboard/mentor');
          else if (targetRole === 'investor') navigate('/dashboard/investor');
          else {
            if (isTrialExpired) {
              navigate('/dashboard/founder/billing');
            } else {
              navigate('/dashboard/founder');
            }
          }
        }, 1500);
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} 
          {toast.msg}
        </div>
      )}
      
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
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {isAdminLogin ? 'Admin Portal' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          {isAdminLogin ? 'Sign in to the admin dashboard' : 'Sign in to your AI Startup Builder account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[20px] sm:px-10 border border-gray-100/50">

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-start shadow-sm animate-in fade-in">
                <AlertCircle size={18} className="mr-2.5 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}
            {success && (
              <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16a34a] rounded-2xl text-sm flex items-start shadow-sm animate-in fade-in">
                <CheckCircle2 size={18} className="mr-2.5 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{success}</span>
              </div>
            )}

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

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="block w-full pl-11 pr-12 px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-[#6C4CF1] bg-gray-50/50 hover:bg-white transition-all text-sm font-medium"
                  placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#6C4CF1] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#6C4CF1] focus:ring-[#6C4CF1] border-2 border-gray-200 rounded transition-colors cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg shadow-[#6C4CF1]/20 text-sm font-bold text-white bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] disabled:opacity-70 transition-all transform active:scale-[0.98]"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-[#6C4CF1] hover:text-[#5B21B6] transition-colors">
                Sign up
              </Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Login;
