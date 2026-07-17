import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lightbulb, TrendingUp, IndianRupee, Clock, Mail, Calendar, LogIn, ShieldCheck } from 'lucide-react';

const FounderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const stats = [
    { title: 'Total Startups', value: '0', icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'AI Reports Generated', value: '0', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100' },
    { title: 'Pending Offers', value: '0', icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-100' },
    { title: 'Mentor Reviews', value: '0', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* User Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0">
            {(user?.fullName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{user?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-700 border border-yellow-200">
                {user?.role}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                user?.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                user?.status === 'suspended' ? 'bg-red-50 text-red-600 border border-red-100' :
                'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                {user?.status || 'active'}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
              <Mail size={14} className="text-gray-400" /> {user?.email}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" /> Signed up {formatDate(user?.signupDate)}
              </span>
              <span className="flex items-center gap-1">
                <LogIn size={13} className="text-gray-400" /> Last login {user?.lastLoginAt ? formatDate(user.lastLoginAt) : <span className="italic">Never</span>}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-gray-400" /> Login count {user?.loginCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Active Startups</h2>
              <button onClick={() => navigate('/dashboard/founder/startups')} className="text-sm font-medium text-[#5B21B6] hover:underline">View all</button>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 border border-gray-100 rounded-xl text-center text-gray-400 text-sm">
                No data yet
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <h2 className="text-lg font-bold mb-2 relative z-10">Generate New Idea</h2>
            <p className="text-sm text-indigo-100 mb-6 relative z-10">Got a new concept? Let our AI analyze it instantly.</p>
            <button onClick={() => navigate('/dashboard/founder/ai-builder')} className="w-full py-3 bg-white text-[#5B21B6] font-bold rounded-xl shadow-md relative z-10 hover:bg-indigo-50 transition-colors">
              New Startup Idea
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="text-center text-gray-400 text-sm py-4">
                No recent activity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderDashboard;
