import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../context/AuthContext';

const MOCK_USERS: Record<string, User> = {
  'founder@startupbuilder.ai': { id: '1', name: 'Sarah Jenkins', email: 'founder@startupbuilder.ai', role: 'founder' },
  'mentor@startupbuilder.ai': { id: '2', name: 'Elena Rodriguez', email: 'mentor@startupbuilder.ai', role: 'mentor' },
  'investor@startupbuilder.ai': { id: '3', name: 'David Chen', email: 'investor@startupbuilder.ai', role: 'investor' },
  'admin@startupbuilder.ai': { id: '4', name: 'Super Admin', email: 'admin@startupbuilder.ai', role: 'admin' },
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      const user = MOCK_USERS[email.toLowerCase()];
      
      if (user && password === 'password123') {
        login(user);
        navigate(`/dashboard/${user.role}`);
      } else {
        setError('Invalid email or password. Hint: password is password123');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#7C3AED]/10 blur-[100px]"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FBBF24]/10 blur-[100px]"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-[#5B21B6] text-[#FBBF24] p-3 rounded-xl shadow-lg">
            <Rocket size={32} />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-[#1F2937]">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-[#6B7280]">
          Sign in to your AI Startup Builder account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Demo Info Box */}
          <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
            <CheckCircle2 className="text-indigo-500 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-indigo-900">
              <span className="font-bold block mb-1">Demo Credentials:</span>
              <span>[role]@startupbuilder.ai</span><br/>
              <span>Pass: password123</span><br/>
              <span className="text-xs text-indigo-700 mt-1 block">Roles: founder, mentor, investor, admin</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#5B21B6] focus:border-[#5B21B6] sm:text-sm outline-none transition-colors"
                  placeholder="founder@startupbuilder.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#5B21B6] focus:border-[#5B21B6] sm:text-sm outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-[#5B21B6] focus:ring-[#5B21B6] border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#6B7280]">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#5B21B6] hover:text-[#7C3AED]">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#5B21B6] hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B21B6] disabled:opacity-70 transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
