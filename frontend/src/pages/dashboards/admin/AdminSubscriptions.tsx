import React, { useState } from 'react';
import { Check, Pencil, Plus, Zap, Shield, Crown, TrendingUp, Users, DollarSign } from 'lucide-react';

const plans = [
  {
    id: 1,
    name: 'Free Trial',
    price: { monthly: 0, annual: 0 },
    badge: 'Free 1 Day',
    badgeColor: 'bg-gray-100 text-gray-600',
    icon: Zap,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    desc: '1 day to explore the platform fully.',
    buttonText: 'Get Started',
    buttonStyle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    popular: false,
    subscribers: 420,
    revenue: 0,
    active: true,
    features: [
      'Basic AI Startup Idea Generator',
      'Basic Business Plan',
      'Basic Pitch Deck',
      'Basic Market Research',
      'Limited AI Reports',
      'Limited Document Export',
      'Community Support'
    ]
  },
  {
    id: 2,
    name: 'Pro Plan',
    price: { monthly: 999, annual: 9990 },
    badge: 'Best Value',
    badgeColor: 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white',
    icon: Shield,
    iconBg: 'bg-purple-100',
    iconColor: 'text-[#5B21B6]',
    desc: 'For serious founders scaling up.',
    buttonText: 'Upgrade',
    buttonStyle: 'bg-[#5B21B6] text-white hover:bg-[#7C3AED] shadow-lg shadow-purple-500/20',
    popular: false,
    subscribers: 310,
    revenue: 247690,
    active: true,
    features: [
      'Full AI Startup Idea Generator',
      'Detailed Business Plan Generator',
      'Detailed Pitch Deck Generator',
      'Full Market Research',
      'AI Reports',
      'Roadmap & Tasks',
      'Logo & Branding Suggestions',
      'PDF & Word Export',
      'Mentor Request Access',
      'AI Chat Assistant',
      'Save Multiple Startup Ideas'
    ]
  },
  {
    id: 3,
    name: 'Premium Startup Business Builder',
    price: { monthly: 2999, annual: 29990 },
    badge: 'Most Popular',
    badgeColor: 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#111827]',
    icon: Crown,
    iconBg: 'bg-amber-100',
    iconColor: 'text-[#F59E0B]',
    desc: 'The complete funding accelerator.',
    buttonText: 'Upgrade Now',
    buttonStyle: 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#111827] hover:from-[#FDE68A] hover:to-[#FBBF24] shadow-lg shadow-amber-500/30',
    popular: true,
    subscribers: 120,
    revenue: 2398800,
    active: true,
    features: [
      'Everything in Pro Plan',
      'Investor Marketplace Access',
      'AI Investor Matching',
      'Funding Readiness Score',
      'AI Due Diligence Report',
      'Advanced Pitch Deck',
      'ZIP Document Export',
      'Mentor Session Booking',
      'Investor Meeting Requests',
      'Funding Progress Tracking',
      'Priority Support',
      'Advanced Startup Growth Dashboard'
    ]
  }
];

const AdminSubscriptions: React.FC = () => {
  const [editing, setEditing] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatRevenue = (amount: number) => {
    if (amount === 0) return '₹0';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribers, 0);
  const totalRevenue = plans.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-['Poppins'] text-2xl font-bold text-[#1F2937]">Subscription Plans</h1>
            <p className="text-[#6B7280] mt-1">Manage pricing tiers for the platform.</p>
          </div>
          <button
            onClick={() => window.alert('Opening New Plan creation modal...')}
            className="flex items-center px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-['Poppins'] font-semibold rounded-xl shadow-lg shadow-purple-500/20 text-sm transition-all duration-300"
          >
            <Plus size={16} className="mr-2" /> Add New Plan
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5B21B6] flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Total Subscribers</p>
              <p className="font-['Poppins'] text-xl font-bold text-[#1F2937]">{totalSubscribers}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#F59E0B] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Monthly Revenue</p>
              <p className="font-['Poppins'] text-xl font-bold text-[#1F2937]">{formatRevenue(totalRevenue)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#10B981] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Active Plans</p>
              <p className="font-['Poppins'] text-xl font-bold text-[#1F2937]">{plans.filter(p => p.active).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-300 ${!isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-300 ${isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            Annual
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`group relative bg-white rounded-[20px] flex flex-col transition-all duration-500 ${
              plan.popular
                ? 'border-2 border-[#5B21B6] shadow-2xl shadow-purple-500/15 z-10'
                : 'border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
            } ${!plan.active ? 'opacity-60' : ''}`}
            style={plan.popular ? { boxShadow: '0 0 30px rgba(91,33,182,0.12), 0 0 60px rgba(251,191,36,0.08)' } : {}}
          >
            {/* Glow for popular plan */}
            {plan.popular && (
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-[#5B21B6]/5 via-transparent to-[#FBBF24]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            )}

            {!plan.active && (
              <div className="absolute top-3 right-3 z-20 text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</div>
            )}

            {/* Badge */}
            <div className={`absolute top-5 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-[10px] font-['Poppins'] font-bold px-4 py-1.5 rounded-full tracking-wider whitespace-nowrap shadow-sm z-10`}>
              {plan.badge}
            </div>

            {/* Card content */}
            <div className="p-7 pt-16 flex flex-col flex-1 relative z-10">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${plan.iconBg} ${plan.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <plan.icon size={24} />
              </div>

              {/* Plan Name */}
              <h4 className="font-['Poppins'] text-xl font-bold text-[#1F2937] mb-1">{plan.name}</h4>
              <p className="text-xs text-[#6B7280] mb-5">{plan.desc}</p>

              {/* Price */}
              <div className="mb-6">
                {plan.price.monthly === 0 ? (
                  <div className="text-4xl font-['Poppins'] font-black text-[#1F2937]">₹0</div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-['Poppins'] font-black text-[#1F2937]">
                        {formatPrice(isAnnual ? plan.price.annual : plan.price.monthly)}
                      </span>
                      <span className="text-sm text-[#6B7280] font-medium">
                        {isAnnual ? '/year' : '/month'}
                      </span>
                    </div>
                    {isAnnual && (
                      <div className="text-xs text-[#10B981] font-medium mt-1">
                        ₹{plan.price.monthly.toLocaleString('en-IN')}/mo billed annually
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex text-sm text-[#4B5563]">
                      <Check size={16} className={`shrink-0 mt-1 mr-3 ${plan.popular ? 'text-[#FBBF24]' : 'text-[#10B981]'}`} />
                      <span className="leading-5">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Admin Stats */}
              <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wider">Subscribers</p>
                  <p className="font-['Poppins'] text-sm font-bold text-[#1F2937]">{plan.subscribers}</p>
                </div>
                {plan.revenue > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wider">Revenue</p>
                    <p className="font-['Poppins'] text-sm font-bold text-[#10B981]">{formatRevenue(plan.revenue)}</p>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditing(plan.id)}
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-[#6B7280] hover:text-[#1F2937] font-['Poppins'] font-semibold rounded-xl text-sm transition-all duration-300 border border-gray-200 flex items-center justify-center gap-2"
              >
                <Pencil size={14} /> Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] shadow-2xl p-6 w-full max-w-md border border-gray-200">
            <h2 className="font-['Poppins'] text-lg font-bold text-[#1F2937] mb-4">Edit Plan: {plans.find(p => p.id === editing)?.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Plan Name</label>
                <input type="text" defaultValue={plans.find(p => p.id === editing)?.name} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Monthly Price (₹)</label>
                <input type="number" defaultValue={plans.find(p => p.id === editing)?.price.monthly} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Annual Price (₹)</label>
                <input type="number" defaultValue={plans.find(p => p.id === editing)?.price.annual} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#4B5563] font-['Poppins'] font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  window.alert('Plan saved successfully!');
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white font-['Poppins'] font-semibold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
