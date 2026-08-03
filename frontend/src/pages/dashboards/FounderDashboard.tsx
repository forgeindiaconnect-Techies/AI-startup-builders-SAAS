import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStartups } from '../../utils/localStorageHelper';
import { Lightbulb, TrendingUp, IndianRupee, Clock, Mail, Calendar, LogIn, ShieldCheck, Rocket, ArrowRight, Sparkles } from 'lucide-react';

const FounderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<any[]>([]);

  useEffect(() => {
    const localData = getStartups();
    setStartups(localData);
  }, []);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  };

  // Compute real stats
  const totalStartups = startups.length;
  const aiReportsGenerated = startups.filter(s => s.aiGenerated?.aiReport || s.status === 'generated').length;
  const activeStartups = startups.filter(s => s.status === 'generated' || s.status === 'pending_analysis' || s.isSavedToMyStartups);
  const recentStartups = startups.slice(0, 5); // already sorted by createdAt desc

  const stats = [
    { title: 'Total Startups', value: totalStartups.toString(), icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'AI Reports Generated', value: aiReportsGenerated.toString(), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100' },
    { title: 'Active Ideas', value: activeStartups.length.toString(), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-100' },
    { title: 'Pending Analysis', value: startups.filter(s => s.status === 'pending_analysis').length.toString(), icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
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
              {activeStartups.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center">
                  <Rocket size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm font-medium mb-3">No startups yet. Create your first idea!</p>
                  <button
                    onClick={() => navigate('/dashboard/founder/ai-builder')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5B21B6] text-white text-xs font-bold rounded-lg hover:bg-[#4c1d95] transition-colors"
                  >
                    <Sparkles size={14} /> Generate Your First Idea
                  </button>
                </div>
              ) : (
                activeStartups.slice(0, 4).map((s, idx) => {
                  const score = s.aiGenerated?.aiReport?.investmentReadinessScore || 0;
                  const statusLabel = s.status === 'generated' ? 'AI Generated' : s.status === 'pending_analysis' ? 'Draft' : s.status;
                  const statusColor = s.status === 'generated'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';
                  return (
                    <div
                      key={s.startupId || s.id || idx}
                      onClick={() => navigate(`/dashboard/founder/ai-builder/${s.startupId || s.id}`)}
                      className="p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 truncate">{s.startupName}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>{statusLabel}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{s.startupIdea}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          {score > 0 && (
                            <div className="text-center">
                              <p className="text-lg font-black text-purple-600">{score}</p>
                              <p className="text-[9px] text-gray-400 font-medium uppercase">Score</p>
                            </div>
                          )}
                          <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
            <div className="space-y-3">
              {recentStartups.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-4">
                  No recent activity
                </div>
              ) : (
                recentStartups.map((s, idx) => (
                  <div key={s.startupId || s.id || idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.status === 'generated' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{s.startupName}</p>
                      <p className="text-[11px] text-gray-400">
                        {s.status === 'generated' ? 'AI report generated' : 'Draft created'} · {formatRelativeTime(s.updatedAt || s.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderDashboard;
