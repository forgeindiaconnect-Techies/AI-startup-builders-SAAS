import React, { useState } from 'react';
import { Check, Zap, Shield, Building2, CreditCard, Download } from 'lucide-react';

const plans = [
  {
    name: 'Starter', price: '$0', period: 'Forever free', icon: Zap, color: 'from-gray-600 to-gray-700',
    features: ['1 Startup', '5 AI Reports/month', 'Basic roadmap', 'Community support'],
    current: false,
  },
  {
    name: 'Growth', price: '$49', period: '/month', icon: Shield, color: 'from-[#5B21B6] to-[#7C3AED]',
    features: ['5 Startups', 'Unlimited AI Reports', 'Pitch Deck Builder', 'Mentor matching', 'Priority support'],
    current: true,
  },
  {
    name: 'Scale', price: '$149', period: '/month', icon: Building2, color: 'from-amber-500 to-orange-500',
    features: ['Unlimited Startups', 'AI Chat Assistant', 'Investor introductions', 'Custom domain', 'Dedicated success manager'],
    current: false,
  },
];

const invoices = [
  { date: 'Jun 1, 2026', desc: 'Growth Plan – Monthly', amount: '$49.00', status: 'Paid' },
  { date: 'May 1, 2026', desc: 'Growth Plan – Monthly', amount: '$49.00', status: 'Paid' },
  { date: 'Apr 1, 2026', desc: 'Growth Plan – Monthly', amount: '$49.00', status: 'Paid' },
];

const FounderBilling: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription / Billing</h1>
        <p className="text-gray-500 mt-1">Manage your plan, payment method, and billing history.</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] rounded-2xl p-6 text-white mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1">Current Plan</p>
          <p className="text-2xl font-extrabold">Growth — $49/month</p>
          <p className="text-sm text-white/70 mt-1">Next billing date: July 1, 2026</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.confirm("Are you sure you want to cancel your plan?")}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-sm transition-colors border border-white/20"
          >
            Cancel Plan
          </button>
          <button 
            onClick={() => window.alert("Redirecting to Upgrade Flow...")}
            className="px-4 py-2.5 bg-[#FBBF24] hover:bg-yellow-300 text-gray-900 font-bold rounded-xl text-sm transition-colors shadow"
          >
            Upgrade to Scale ↗
          </button>
        </div>
      </div>

      {/* Plan toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm font-bold ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
        <button onClick={() => setAnnual(a => !a)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-[#5B21B6]' : 'bg-gray-200'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${annual ? 'translate-x-6' : ''}`} />
        </button>
        <span className={`text-sm font-bold ${annual ? 'text-gray-900' : 'text-gray-400'}`}>Annual <span className="text-emerald-600">(Save 20%)</span></span>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {plans.map(p => (
          <div key={p.name} className={`bg-white rounded-2xl border shadow-sm p-6 relative flex flex-col ${p.current ? 'border-[#5B21B6] shadow-lg shadow-purple-100' : 'border-gray-100 hover:border-gray-200'}`}>
            {p.current && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#5B21B6] text-white text-xs font-extrabold rounded-full shadow">CURRENT PLAN</div>}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 shadow-md`}>
              <p.icon size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">{p.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-black text-gray-900">{annual ? (p.price === '$0' ? '$0' : `$${parseInt(p.price.slice(1)) * 0.8 * 12 / 12 | 0}`) : p.price}</span>
              <span className="text-sm text-gray-500">{p.period}</span>
            </div>
            <ul className="space-y-2 flex-1 mb-6">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={15} className="text-emerald-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => {
                if (!p.current && window.confirm(`Are you sure you want to switch to the ${p.name} plan?`)) {
                  window.alert("Plan updated successfully!");
                }
              }}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${p.current ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-[#5B21B6] hover:bg-[#7C3AED] text-white shadow'}`}
            >
              {p.current ? 'Current Plan' : `Switch to ${p.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard size={18} className="text-gray-400" /> Billing History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {invoices.map((inv, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">{inv.desc}</p>
                <p className="text-xs text-gray-400">{inv.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-900">{inv.amount}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{inv.status}</span>
                <button 
                  onClick={() => window.alert(`Downloading invoice for ${inv.date}...`)}
                  className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FounderBilling;
