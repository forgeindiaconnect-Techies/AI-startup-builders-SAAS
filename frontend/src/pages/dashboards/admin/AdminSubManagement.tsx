import React, { useState, useEffect } from 'react';
import { Search, CreditCard, XCircle, X, Shield, Calendar, Mail, User, Phone, Building2, CheckCircle2, Eye, Edit3, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold',
  Cancelled: 'bg-gray-100 text-gray-500 border border-gray-200 font-bold',
  'Past Due': 'bg-red-50 text-red-600 border border-red-200 font-bold',
  Trial: 'bg-amber-50 text-amber-600 border border-amber-200 font-bold',
};

const PLAN_FEATURES: Record<string, string[]> = {
  'Free Trial': ['Basic AI Founder Tools', 'Community Forum Access', '1 Startup Idea Generator/mo'],
  'Pro Plan': ['Full AI Startup Builder Access', 'Dynamic UPI Payment Gateway', 'Unlimited Pitch Decks', 'Investor Matchmaker (5/mo)'],
  'Premium Startup Builder': ['Custom White-Label Solutions', 'Unlimited Investor Entitlements', 'Dedicated Deal Flow Access', 'Custom AI Agent Tuning']
};

const PLAN_PRICES: Record<string, string> = {
  'Free Trial': '₹0',
  'Pro Plan': '₹2,499/mo',
  'Premium Startup Builder': '₹14,999/yr'
};

const PLAN_DB_TO_DISPLAY: Record<string, string> = {
  free_trial: 'Free Trial',
  none: 'Free Trial',
  pro: 'Pro Plan',
  premium_startup_builder: 'Premium Startup Builder',
};

const PLAN_DISPLAY_TO_DB: Record<string, string> = {
  'Free Trial': 'free_trial',
  'Pro Plan': 'pro',
  'Premium Startup Builder': 'premium_startup_builder',
};

const STATUS_DB_TO_DISPLAY: Record<string, string> = {
  active: 'Active',
  expired: 'Past Due',
  cancelled: 'Cancelled',
  pending_verification: 'Past Due',
  none: 'Trial',
};

const STATUS_DISPLAY_TO_DB: Record<string, string> = {
  Active: 'active',
  Trial: 'active',
  'Past Due': 'expired',
  Cancelled: 'cancelled',
};

interface SubRow {
  id: string;
  userId: string;
  userName: string;
  email: string;
  plan: string;
  amount: string;
  started: string;
  nextBilling: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  mobile?: string;
  company?: string;
}

const formatDate = (val?: string | null) => {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AdminSubManagement: React.FC = () => {
  const { getAllUsers, refreshUsers, updateUserSubscription, getTokenRole } = useAuth();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [detailsModal, setDetailsModal] = useState<SubRow | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingPlan, setEditingPlan] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshUsers();
    if (getTokenRole() !== 'admin') return;
    const interval = setInterval(() => refreshUsers(), 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const subscriptions: SubRow[] = getAllUsers().map(u => {
    const plan = PLAN_DB_TO_DISPLAY[u.plan] || 'Free Trial';
    const status = STATUS_DB_TO_DISPLAY[u.subscriptionStatus] || 'Trial';
    return {
      id: `SUB-${String(u.id).slice(-6).toUpperCase()}`,
      userId: u.id,
      userName: u.fullName || u.name || 'Unknown',
      email: u.email || '',
      plan,
      amount: PLAN_PRICES[plan] || '₹0',
      started: formatDate(u.subscriptionStartDate || u.signupDate),
      nextBilling: formatDate(u.subscriptionEndDate),
      status,
      paymentMethod: u.paymentStatus === 'approved' ? 'UPI / Card' : undefined,
      transactionId: u.transactionId || undefined,
      mobile: u.mobile || '',
      company: u.startupName || '',
    };
  });

  const filtered = subscriptions.filter(s => {
    const matchesSearch = (s.userName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.id || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.company && s.company.toLowerCase().includes(search.toLowerCase()));
    const matchesPlan = planFilter === 'All Plans' || s.plan.toLowerCase().includes(planFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || s.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const activeCount = subscriptions.filter(s => s.status === 'Active' || s.status === 'Trial').length;
  const pastDueCount = subscriptions.filter(s => s.status === 'Past Due').length;
  const totalSubscribers = subscriptions.length;

  const handleOpenModal = (sub: SubRow) => {
    setDetailsModal(sub);
    setEditingStatus(sub.status);
    setEditingPlan(sub.plan);
  };

  const handleSaveSubDetails = async () => {
    if (!detailsModal) return;
    await updateUserSubscription(detailsModal.userId, {
      status: STATUS_DISPLAY_TO_DB[editingStatus] || 'active',
      plan: PLAN_DISPLAY_TO_DB[editingPlan] || 'none',
    });
    refreshUsers();
    showToast(`Updated subscription details for ${detailsModal.userName}`);
    setDetailsModal(null);
  };

  const handleCancelClick = async (sub: SubRow, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to cancel subscription ${sub.id} for ${sub.userName}?`)) {
      await updateUserSubscription(sub.userId, { status: 'cancelled' });
      refreshUsers();
      showToast(`Subscription ${sub.id} has been cancelled.`);
      if (detailsModal?.id === sub.id) setDetailsModal(null);
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-500 mt-1">View subscriber details, payment information, and manage status across the platform.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl">{totalSubscribers} Total Subscribers</span>
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl">{activeCount} Active / Trial</span>
          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-xl">{pastDueCount} Past Due</span>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder="Search by subscriber, email, company or Sub ID..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm bg-white"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
            >
              <option>All Plans</option>
              <option>Free Trial</option>
              <option>Pro Plan</option>
              <option>Premium Startup Builder</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>Trial</option>
              <option>Past Due</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100/70 border-b border-gray-200">
                {['Sub ID', 'Subscriber / Customer', 'Plan', 'Amount', 'Started', 'Next Billing', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-[11px] font-black text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => (
                <tr
                  key={s.id}
                  onClick={() => handleOpenModal(s)}
                  className="hover:bg-purple-50/40 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-xs font-mono font-extrabold text-purple-700 group-hover:underline flex items-center gap-1.5">
                    <CreditCard size={14} className="text-purple-500" />
                    {s.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-extrabold">
                        {s.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{s.userName}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                        {s.company && <p className="text-[10px] text-purple-600 font-semibold">{s.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg text-xs font-black border border-purple-100">
                      <Sparkles size={12} className="text-purple-500" />
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900 text-sm">{s.amount}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">{s.started}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">{s.nextBilling}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusStyle[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenModal(s)}
                        title="View Full Subscriber Details"
                        className="px-2.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye size={14} /> View Details
                      </button>
                      <button
                        onClick={(e) => handleCancelClick(s, e)}
                        title="Cancel Subscription"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    <p className="text-lg font-bold text-gray-700 mb-1">No subscribers found</p>
                    <p className="text-xs text-gray-400">Try adjusting your search query or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Subscriber Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-lg">
                  {detailsModal.userName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">{detailsModal.userName}</h3>
                  <p className="text-xs text-purple-200 font-mono">Subscriber ID: {detailsModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModal(null)}
                className="text-purple-200 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Plan Banner */}
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">Active Subscription</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xl font-black text-gray-900">{detailsModal.plan} Plan</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusStyle[detailsModal.status]}`}>
                      {detailsModal.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-purple-700">{detailsModal.amount}</p>
                  <p className="text-xs text-purple-500 font-semibold">Recurring Charge</p>
                </div>
              </div>

              {/* Admin Quick Editor */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Edit3 size={14} className="text-purple-600" /> Admin Controls (Edit Subscription)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
                    <select
                      value={editingStatus}
                      onChange={e => setEditingStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Trial">Trial</option>
                      <option value="Past Due">Past Due</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Plan Tier</label>
                    <select
                      value={editingPlan}
                      onChange={e => setEditingPlan(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="Free Trial">Free Trial Plan (₹0)</option>
                      <option value="Pro Plan">Pro Plan (₹2,499/mo)</option>
                      <option value="Premium Startup Builder">Premium Startup Builder (₹14,999/yr)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Detailed Specs Grid */}
              <div>
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <User size={18} className="text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold">Full Name</p>
                      <p className="text-xs font-bold text-gray-900">{detailsModal.userName}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Mail size={18} className="text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold">Email Address</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{detailsModal.email}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Phone size={18} className="text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold">Contact Phone</p>
                      <p className="text-xs font-bold text-gray-900">{detailsModal.mobile || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Building2 size={18} className="text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold">Company / Startup</p>
                      <p className="text-xs font-bold text-gray-900">{detailsModal.company || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing & Payment Meta */}
              <div>
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Billing & Payment Specs</h4>
                <div className="space-y-2 border border-gray-200 rounded-2xl p-4 bg-white">
                  <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Calendar size={14} /> Subscription Start Date</span>
                    <span className="font-bold text-gray-900">{detailsModal.started}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Calendar size={14} /> Next Billing Date</span>
                    <span className="font-bold text-gray-900">{detailsModal.nextBilling}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><CreditCard size={14} /> Payment Method</span>
                    <span className="font-bold text-gray-900">{detailsModal.paymentMethod || 'UPI Payment'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Shield size={14} /> UTR / Transaction Ref</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{detailsModal.transactionId || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Included Plan Features */}
              <div>
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Features Unlocked in {detailsModal.plan} Plan</h4>
                <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4">
                  <ul className="space-y-2">
                    {(PLAN_FEATURES[detailsModal.plan] || PLAN_FEATURES['Pro Plan']).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-800">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-wrap justify-between items-center gap-3 shrink-0">
              <button
                onClick={() => handleCancelClick(detailsModal)}
                className="px-4 py-2 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              >
                Cancel Subscription
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailsModal(null)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveSubDetails}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-purple-700 hover:bg-purple-800 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubManagement;
