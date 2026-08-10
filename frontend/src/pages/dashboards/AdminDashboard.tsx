import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Rocket, IndianRupee, Check, X, Users, Cpu, ShoppingBag, ShieldCheck, Building2, Trash2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, getAllUsers } = useAuth();
  const navigate = useNavigate();
  const [pendingMentors, setPendingMentors] = useState<any[]>([]);
  const [pendingStartups, setPendingStartups] = useState<any[]>([]);
  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);

  const loadMentors = () => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
      let loaded: any[] = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        loaded = parsed
          .filter((p: any) => p.verificationStatus !== 'Verified' && p.verificationStatus !== 'Rejected')
          .map((p: any, idx: number) => ({
            id: p.id || `dyn_${idx}`,
            name: p.name || 'Anonymous Mentor',
            expertise: p.expertise || `${p.category || 'SaaS'} Specialist`,
            bio: p.bio || ''
          }));
      }
      setPendingMentors(loaded);
    } catch (e) {
      setPendingMentors([]);
    }
  };

  const loadStartups = () => {
    try {
      const keys = Object.keys(localStorage);
      const pending: any[] = [];
      keys.forEach(key => {
        if (key.startsWith('startup_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            if (data.approvalStatus === 'pending') {
              pending.push(data);
            }
          } catch (e) {}
        }
      });
      pending.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingStartups(pending);
    } catch (e) {
      setPendingStartups([]);
    }
  };

  const loadDashboardData = async () => {
    loadMentors();
    loadStartups();

    // 1. Users list
    try {
      const uList = getAllUsers() || [];
      setUsersList(uList);
    } catch (e) {
      setUsersList([]);
    }

    // 2. Startups list
    try {
      const fetchedStartups = await getStartups();
      const localKeys = Object.keys(localStorage);
      const localStartups: any[] = [];
      localKeys.forEach(k => {
        if (k.startsWith('startup_')) {
          try {
            const parsed = JSON.parse(localStorage.getItem(k) || '');
            if (parsed && (parsed.startupId || parsed.id || parsed._id)) {
              localStartups.push(parsed);
            }
          } catch (e) {}
        }
      });
      const combined = [...fetchedStartups];
      localStartups.forEach(ls => {
        const id = ls.startupId || ls.id || ls._id;
        if (!combined.some(s => (s.startupId || s.id || s._id) === id)) {
          combined.push(ls);
        }
      });
      setAllStartups(combined);
    } catch (e) {
      setAllStartups([]);
    }

    // 3. Payments list
    try {
      const storedPayments = localStorage.getItem('ai_startup_builder_payments');
      const storedSubs = localStorage.getItem('ai_startup_builder_subs_v2');
      const storedTrans = localStorage.getItem('ai_startup_builder_trans_v2');
      const parsedPayments = storedPayments ? JSON.parse(storedPayments) : [];
      const parsedSubs = storedSubs ? JSON.parse(storedSubs) : [];
      const parsedTrans = storedTrans ? JSON.parse(storedTrans) : [];
      setPaymentsList([...parsedPayments, ...parsedSubs, ...parsedTrans]);
    } catch (e) {
      setPaymentsList([]);
    }
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('storage', loadDashboardData);
    window.addEventListener('mentor_profile_updated', loadDashboardData);
    return () => {
      window.removeEventListener('storage', loadDashboardData);
      window.removeEventListener('mentor_profile_updated', loadDashboardData);
    };
  }, []);

  const handleQuickApprove = (id: any, name: string) => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((p: any) => (p.id === id || p.name === name) ? { ...p, verificationStatus: 'Verified' } : p);
        localStorage.setItem('ai_startup_builder_mentor_profiles', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('mentor_profile_updated'));
      }
    } catch (e) {}
    setPendingMentors(prev => prev.filter(m => m.id !== id && m.name !== name));
    window.alert(`✅ ${name} has been approved as a Mentor!`);
  };

  const handleApproveStartup = (id: string, name: string) => {
    try {
      const data = JSON.parse(localStorage.getItem(id) || '{}');
      data.approvalStatus = 'approved';
      data.status = 'generating';
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(id, JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
    setPendingStartups(prev => prev.filter(s => (s.startupId || s.id) !== id));
    window.alert(`✅ Startup "${name}" has been approved!`);
  };

  const handleRejectStartup = (id: string, name: string) => {
    try {
      const data = JSON.parse(localStorage.getItem(id) || '{}');
      data.approvalStatus = 'rejected';
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(id, JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
    setPendingStartups(prev => prev.filter(s => (s.startupId || s.id) !== id));
    window.alert(`❌ Startup "${name}" has been rejected.`);
  };

  const handleQuickReject = (id: any, name: string) => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((p: any) => (p.id === id || p.name === name) ? { ...p, verificationStatus: 'Rejected' } : p);
        localStorage.setItem('ai_startup_builder_mentor_profiles', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('mentor_profile_updated'));
      }
    } catch (e) {}
    setPendingMentors(prev => prev.filter(m => m.id !== id && m.name !== name));
    window.alert(`❌ ${name}'s application has been rejected.`);
  };

  const handleClearAllData = () => {
    if (window.confirm('⚠️ Are you sure you want to clear ALL platform data?\n\nThis will remove:\n• All login logs\n• All notifications\n• All mentor profiles\n• All startup data\n• All funding offers\n• All subscriptions & payments\n• All portfolio data\n\nThis action CANNOT be undone.')) {
      const keysToRemove = [
        'ai_startup_builder_login_logs',
        'ai_startup_builder_notifications',
        'ai_startup_builder_mentor_profiles',
        'ai_startup_builder_startups',
        'ai_startup_builder_funding_offers',
        'ai_startup_builder_subs_v2',
        'ai_startup_builder_trans_v2',
        'ai_startup_builder_payments',
        'ai_startup_builder_portfolio',
        'ai_startup_builder_documents',
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));

      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('startup_')) {
          localStorage.removeItem(key);
        }
      });

      setPendingMentors([]);
      setPendingStartups([]);
      setAllStartups([]);
      setUsersList([]);
      setPaymentsList([]);
      window.dispatchEvent(new Event('storage'));
      window.alert('All platform data has been cleared successfully.');
    }
  };

  // ── Calculated Real Platform Analytics ──────────────────────────────────────
  const totalUsersCount = usersList.length;
  const foundersCount = usersList.filter(u => u.role === 'founder').length;
  const customersCount = usersList.filter(u => u.role === 'customer' || u.role === 'mentor' || u.role === 'investor').length;
  const adminsCount = usersList.filter(u => u.role === 'admin').length;

  const calculateTotalAiOutputs = () => {
    let count = 0;
    allStartups.forEach(s => {
      const ai = s.aiGenerated || {};
      if (ai.ideaAnalysis || s.startupIdea) count++;
      if (ai.branding || s.branding) count++;
      if (ai.businessPlan || s.businessPlan) count++;
      if (ai.pitchDeck || s.pitchDeck) count++;
      if (ai.marketResearch || s.marketResearch) count++;
      if (ai.legal || s.legal) count++;
      if (ai.aiReport || s.aiReport) count++;
      if (ai.ideaValidation) count++;
      if (ai.competitorAnalysis) count++;
      if (ai.mvpPlan) count++;
      if (ai.financialPlan) count++;
      if (ai.gtmStrategy) count++;
    });
    return count;
  };
  const totalAiOutputsCount = calculateTotalAiOutputs();

  const businessPlanOutputs = allStartups.filter(s => s.aiGenerated?.businessPlan || s.businessPlan).length;
  const pitchDeckOutputs = allStartups.filter(s => s.aiGenerated?.pitchDeck || s.pitchDeck).length;
  const financialOutputs = allStartups.filter(s => s.aiGenerated?.financialPlan || s.aiGenerated?.financialProjection).length;
  const marketResearchOutputs = allStartups.filter(s => s.aiGenerated?.marketResearch || s.aiGenerated?.competitorAnalysis).length;

  const totalRevenue = paymentsList.reduce((sum, p) => sum + (Number(p.amount) || Number(p.price) || 0), 0);
  const approvedStartupsCount = allStartups.filter(s => s.approvalStatus === 'approved' || s.status === 'generated').length;

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.fullName || 'Admin'}</h1>
            <p className="text-gray-500 mt-1">Manage users, monitor AI usage, and view real-time platform analytics.</p>
          </div>
          <button
            onClick={handleClearAllData}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors shadow-sm shrink-0"
          >
            <Trash2 size={15} /> Clear All Data
          </button>
        </div>
      </div>

      {/* ── Real Top 5 Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          {
            label: 'Total Users',
            value: totalUsersCount.toLocaleString(),
            change: 'Real-time Users',
            icon: Users,
            iconBg: 'bg-violet-50',
            iconColor: 'text-[#5B21B6]',
            badgeColor: 'text-emerald-600 bg-emerald-50',
            path: '/dashboard/admin/users',
          },
          {
            label: 'Total AI Outputs',
            value: totalAiOutputsCount.toLocaleString(),
            change: 'Live System',
            icon: Cpu,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            badgeColor: 'text-purple-700 bg-purple-50',
            path: '/dashboard/admin/analytics',
          },
          {
            label: 'Founders',
            value: foundersCount.toLocaleString(),
            change: 'Active Founders',
            icon: Rocket,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            badgeColor: 'text-emerald-600 bg-emerald-50',
            path: '/dashboard/admin/users',
          },
          {
            label: 'Customers',
            value: customersCount.toLocaleString(),
            change: 'Mentors & Investors',
            icon: ShoppingBag,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            badgeColor: 'text-emerald-600 bg-emerald-50',
            path: '/dashboard/admin/users',
          },
          {
            label: 'Admins',
            value: adminsCount.toLocaleString(),
            change: 'System Admins',
            icon: ShieldCheck,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            badgeColor: 'text-gray-500 bg-gray-50',
            path: '/dashboard/admin/users',
          },
        ].map((stat, idx) => (
          <button
            key={idx}
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon size={19} className={stat.iconColor} />
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${stat.badgeColor}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
            </div>
          </button>
        ))}
      </div>

      {/* Top Performing AI Output & Monthly Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Performing AI Output */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Rocket size={20} className="text-[#5B21B6]" /> Top Performing AI Outputs
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Highest rated AI generator models based on founder completion rate & satisfaction.</p>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-full text-xs font-extrabold">
              ⚡ Live Metrics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'AI Business Plan Generator', score: 'High Usage', usage: `${businessPlanOutputs} outputs generated`, rating: '4.9 ★', badge: 'Top Performer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { title: 'AI Pitch Deck Builder', score: 'Active', usage: `${pitchDeckOutputs} outputs generated`, rating: '4.9 ★', badge: 'Most Active', color: 'bg-purple-50 text-purple-700 border-purple-200' },
              { title: 'Financial Projections & Valuation', score: 'High Value', usage: `${financialOutputs} outputs generated`, rating: '4.8 ★', badge: 'High Value', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { title: 'Market Research & Competitor AI', score: 'Fast Growth', usage: `${marketResearchOutputs} outputs generated`, rating: '4.8 ★', badge: 'Fastest Growth', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${item.color}`}>{item.badge}</span>
                  <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md">{item.rating}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mt-3 pt-2 border-t border-gray-200/50">
                  <span className="text-emerald-600 font-extrabold">{item.score}</span>
                  <span className="text-gray-400">{item.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Reports Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <IndianRupee size={18} className="text-emerald-600" /> Monthly Reports
              </h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Live Status</span>
            </div>
            <p className="text-xs text-gray-500 mb-5">Comprehensive platform performance summary calculated from live database.</p>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-xs text-emerald-800 font-bold block">Monthly Recurring Revenue</span>
                  <span className="text-lg font-black text-emerald-950">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-white px-2 py-1 rounded-lg shadow-sm">Live Payments</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <div>
                  <span className="text-xs text-purple-800 font-bold block">AI Generations Executed</span>
                  <span className="text-lg font-black text-purple-950">{totalAiOutputsCount.toLocaleString()} Tasks</span>
                </div>
                <span className="text-xs font-black text-[#5B21B6] bg-white px-2 py-1 rounded-lg shadow-sm">Real-time</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div>
                  <span className="text-xs text-blue-800 font-bold block">Startups Funded / Approved</span>
                  <span className="text-lg font-black text-blue-950">{approvedStartupsCount} Active Deals</span>
                </div>
                <span className="text-xs font-black text-blue-700 bg-white px-2 py-1 rounded-lg shadow-sm">Approved</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard/admin/reports')}
            className="w-full mt-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow hover:shadow-lg flex items-center justify-center gap-2"
          >
            Export Monthly Report (PDF / CSV)
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mentor Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Pending Mentor Approvals</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingMentors.length} Pending
            </span>
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {pendingMentors.length > 0 ? (
              pendingMentors.map((m, idx) => (
                <div key={m.id || idx} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.expertise}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleQuickApprove(m.id, m.name)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleQuickReject(m.id, m.name)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm italic border border-dashed border-gray-200 rounded-xl">
                No pending mentor applications at the moment.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Subscription Upgrades</h2>
            <button 
              onClick={() => navigate('/dashboard/admin/sub-payments')}
              className="text-sm font-medium text-[#5B21B6] hover:underline"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {paymentsList.length > 0 ? (
              paymentsList.slice(0, 5).map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{p.userName || p.userEmail || p.planName || 'Subscription Upgrade'}</p>
                    <p className="text-xs text-gray-500">{p.plan || p.planType || 'Pro Plan'} • {p.date || new Date().toLocaleDateString()}</p>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-sm">₹{(Number(p.amount) || Number(p.price) || 999).toLocaleString('en-IN')}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm italic border border-dashed border-gray-200 rounded-xl">
                No upgrades yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Startup Approvals */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={20} className="text-[#5B21B6]" /> Pending Startup Approvals
          </h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {pendingStartups.length} Pending
          </span>
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {pendingStartups.length > 0 ? (
            pendingStartups.map((s, idx) => (
              <div key={s.startupId || s.id || idx} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-black text-sm shadow-md">
                    {(s.startupName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{s.startupName}</p>
                    <p className="text-xs text-gray-500">ID: {(s.startupId || s.id || '').replace('startup_', '').slice(0, 8)}... | Created {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveStartup(s.startupId || s.id, s.startupName)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectStartup(s.startupId || s.id, s.startupName)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm italic border border-dashed border-gray-200 rounded-xl">
              No pending startup approvals at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
