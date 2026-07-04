import React, { useState } from 'react';
import { Check, Pencil, Plus, Zap, Shield, Building2, Star } from 'lucide-react';

const plans = [
  {
    id: 1, name: 'Starter', price: 0, billingCycle: 'Forever free', color: 'from-gray-600 to-gray-700', icon: Zap, active: true,
    features: ['1 Startup', '5 AI Reports/month', 'Basic Roadmap', 'Community Support'],
    subscribers: 420,
  },
  {
    id: 2, name: 'Growth', price: 49, billingCycle: '/month', color: 'from-[#5B21B6] to-[#7C3AED]', icon: Shield, active: true,
    features: ['5 Startups', 'Unlimited AI Reports', 'Pitch Deck Builder', 'Mentor Matching', 'Priority Support'],
    subscribers: 310,
  },
  {
    id: 3, name: 'Scale', price: 149, billingCycle: '/month', color: 'from-amber-500 to-orange-500', icon: Building2, active: true,
    features: ['Unlimited Startups', 'AI Chat Assistant', 'Investor Introductions', 'Custom Domain', 'Dedicated Manager'],
    subscribers: 120,
  },
  {
    id: 4, name: 'Enterprise', price: 499, billingCycle: '/month', color: 'from-rose-500 to-pink-600', icon: Star, active: false,
    features: ['Everything in Scale', 'White-label Option', 'SLA Support', 'Custom AI Training', 'On-premise Option'],
    subscribers: 8,
  },
];

const AdminSubscriptions: React.FC = () => {
  const [editing, setEditing] = useState<number | null>(null);

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 mt-1">Create, edit, and manage the platform's pricing tiers.</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
          <Plus size={16} className="mr-2" /> Add New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map(p => (
          <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col relative ${!p.active ? 'opacity-60' : 'border-gray-100'}`}>
            {!p.active && <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</div>}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-3 shadow`}>
              <p.icon size={18} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base mb-1">{p.name}</h3>
            <div className="mb-3">
              <span className="text-2xl font-black text-gray-900">{p.price === 0 ? 'Free' : `$${p.price}`}</span>
              {p.price > 0 && <span className="text-sm text-gray-500">{p.billingCycle}</span>}
            </div>

            <div className="mb-4 flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Features</p>
              <ul className="space-y-1.5">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <Check size={12} className="text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Subscribers</p>
                <p className="font-extrabold text-gray-900">{p.subscribers}</p>
              </div>
              <button onClick={() => setEditing(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs transition-colors">
                <Pencil size={12} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Plan: {plans.find(p => p.id === editing)?.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price ($/month)</label>
                <input type="number" defaultValue={plans.find(p => p.id === editing)?.price} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Plan Name</label>
                <input type="text" defaultValue={plans.find(p => p.id === editing)?.name} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
