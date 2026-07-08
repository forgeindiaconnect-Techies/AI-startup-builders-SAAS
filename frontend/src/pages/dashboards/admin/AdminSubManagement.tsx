import React, { useState } from 'react';
import { Search, CreditCard, XCircle, X, Shield, Calendar, Mail, User, Activity } from 'lucide-react';
import { useBilling } from '../../../context/BillingContext';
import type { Subscription } from '../../../context/BillingContext';

const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  Cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
  'Past Due': 'bg-red-50 text-red-600 border border-red-100',
  Trial: 'bg-amber-50 text-amber-600 border border-amber-100',
};

const AdminSubManagement: React.FC = () => {
  const { subscriptions, cancelSubscription } = useBilling();
  
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [detailsModal, setDetailsModal] = useState<Subscription | null>(null);
  
  const filtered = subscriptions.filter(s => {
    const matchesSearch = s.userName.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          s.id.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'All Plans' || s.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const activeCount = subscriptions.filter(s => s.status === 'Active' || s.status === 'Trial').length;
  const pastDueCount = subscriptions.filter(s => s.status === 'Past Due').length;

  const handleCancelClick = (sub: Subscription) => {
    if (window.confirm(`Are you sure you want to cancel the subscription for ${sub.userName} (${sub.id})? This will remove their plan access.`)) {
      cancelSubscription(sub.id);
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-500 mt-1">View and manage active subscriptions across the platform.</p>
        </div>
        <div className="flex gap-2 text-sm font-bold">
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">{activeCount} Active/Trial</span>
          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">{pastDueCount} Past Due</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search subscriptions..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
          </div>
          <select 
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
          >
            <option>All Plans</option>
            <option>Starter</option>
            <option>Growth</option>
            <option>Scale</option>
          </select>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Sub ID', 'Customer', 'Plan', 'Amount', 'Started', 'Next Billing', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{s.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">{s.userName}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-bold">{s.plan}</td>
                  <td className="px-6 py-4 font-black text-gray-900">{s.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.started}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.nextBilling}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusStyle[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleCancelClick(s)}
                        title="Cancel Subscription" 
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle size={16} />
                      </button>
                      <button 
                        onClick={() => setDetailsModal(s)}
                        title="View Details" 
                        className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <CreditCard size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <CreditCard size={18} className="text-[#5B21B6]" /> Subscription Details
              </h3>
              <button onClick={() => setDetailsModal(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex justify-between items-start bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Current Plan</p>
                  <p className="text-lg font-black text-gray-900">{detailsModal.plan} Plan</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusStyle[detailsModal.status]}`}>
                    {detailsModal.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User size={15} />
                    <span className="text-sm font-bold">Subscriber</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{detailsModal.userName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail size={15} />
                    <span className="text-sm font-bold">Email</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{detailsModal.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Activity size={15} />
                    <span className="text-sm font-bold">Subscription ID</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-gray-900">{detailsModal.id}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={15} />
                    <span className="text-sm font-bold">Started On</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{detailsModal.started}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={15} />
                    <span className="text-sm font-bold">Next Billing</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{detailsModal.nextBilling}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield size={15} />
                    <span className="text-sm font-bold">Amount Due</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600">{detailsModal.amount}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <button 
                onClick={() => {
                  handleCancelClick(detailsModal);
                  setDetailsModal(null);
                }}
                className="px-4 py-2 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Cancel Subscription
              </button>
              <button 
                onClick={() => setDetailsModal(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubManagement;
