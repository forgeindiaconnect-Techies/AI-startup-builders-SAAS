import React, { useState } from 'react';
import { Check, Pencil, Plus, Zap, Shield, Crown, TrendingUp, X } from 'lucide-react';

const defaultPlans = [
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
  const [plansList, setPlansList] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_pricing_plans');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return defaultPlans;
  });

  const [isAnnual, setIsAnnual] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    monthlyPrice: 0,
    annualPrice: 0,
    badge: '',
    desc: '',
    featuresText: '',
    popular: false,
    active: true,
  });

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleOpenAddModal = () => {
    setEditingPlanId(null);
    setFormData({
      name: '',
      monthlyPrice: 1499,
      annualPrice: 14990,
      badge: 'New Plan',
      desc: 'Explore new capabilities for your startup.',
      featuresText: 'AI Startup Builder Tools\nFull Market Research\nPDF & Word Export\nPriority Support',
      popular: false,
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (plan: any) => {
    setEditingPlanId(plan.id);
    setFormData({
      name: plan.name,
      monthlyPrice: plan.price?.monthly ?? 0,
      annualPrice: plan.price?.annual ?? 0,
      badge: plan.badge || '',
      desc: plan.desc || '',
      featuresText: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      popular: Boolean(plan.popular),
      active: Boolean(plan.active ?? true),
    });
    setShowModal(true);
  };

  const handleSavePlan = () => {
    if (!formData.name.trim()) {
      window.alert('Please enter a valid plan name.');
      return;
    }

    const featureList = formData.featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    if (editingPlanId) {
      setPlansList(prev => {
        const next = prev.map(p => {
          if (p.id === editingPlanId) {
            return {
              ...p,
              name: formData.name,
              price: { monthly: Number(formData.monthlyPrice), annual: Number(formData.annualPrice) },
              badge: formData.badge,
              badgeColor: formData.popular
                ? 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#111827]'
                : 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white',
              desc: formData.desc,
              popular: formData.popular,
              active: formData.active,
              features: featureList.length > 0 ? featureList : p.features,
            };
          }
          return p;
        });
        try { localStorage.setItem('ai_startup_builder_pricing_plans', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    } else {
      const newPlan = {
        id: Date.now(),
        name: formData.name,
        price: { monthly: Number(formData.monthlyPrice), annual: Number(formData.annualPrice) },
        badge: formData.badge || 'Pro Tier',
        badgeColor: formData.popular
          ? 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#111827]'
          : 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white',
        icon: Zap,
        iconBg: 'bg-purple-100',
        iconColor: 'text-[#5B21B6]',
        desc: formData.desc,
        buttonText: 'Subscribe Now',
        buttonStyle: 'bg-[#5B21B6] text-white hover:bg-[#7C3AED]',
        popular: formData.popular,
        active: formData.active,
        features: featureList.length > 0 ? featureList : ['Access to AI Builder Tools', 'Dashboard Access', 'Standard Support'],
      };

      setPlansList(prev => {
        const next = [...prev, newPlan];
        try { localStorage.setItem('ai_startup_builder_pricing_plans', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }

    setShowModal(false);
  };

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
            onClick={handleOpenAddModal}
            className="flex items-center px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-['Poppins'] font-bold rounded-xl shadow-lg shadow-purple-500/20 text-sm transition-all duration-300 cursor-pointer"
          >
            <Plus size={16} className="mr-2" /> Add New Plan
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#10B981] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Active Plans</p>
              <p className="font-['Poppins'] text-xl font-bold text-[#1F2937]">{plansList.filter(p => p.active !== false).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-300 cursor-pointer ${!isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-300 cursor-pointer ${isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            Annual
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {plansList.map((plan) => {
          const PlanIcon = plan.icon || Zap;
          return (
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
              <div className={`absolute top-5 left-1/2 -translate-x-1/2 ${plan.badgeColor || 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white'} text-[10px] font-['Poppins'] font-bold px-4 py-1.5 rounded-full tracking-wider whitespace-nowrap shadow-sm z-10`}>
                {plan.badge}
              </div>

              {/* Card content */}
              <div className="p-7 pt-16 flex flex-col flex-1 relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${plan.iconBg || 'bg-purple-100'} ${plan.iconColor || 'text-[#5B21B6]'} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <PlanIcon size={24} />
                </div>

                {/* Plan Name */}
                <h4 className="font-['Poppins'] text-xl font-bold text-[#1F2937] mb-1">{plan.name}</h4>
                <p className="text-xs text-[#6B7280] mb-5">{plan.desc}</p>

                {/* Price */}
                <div className="mb-6">
                  {plan.price?.monthly === 0 ? (
                    <div className="text-4xl font-['Poppins'] font-black text-[#1F2937]">₹0</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-['Poppins'] font-black text-[#1F2937]">
                          {formatPrice(isAnnual ? (plan.price?.annual ?? 0) : (plan.price?.monthly ?? 0))}
                        </span>
                        <span className="text-sm text-[#6B7280] font-medium">
                          {isAnnual ? '/year' : '/month'}
                        </span>
                      </div>
                      {isAnnual && plan.price?.monthly > 0 && (
                        <div className="text-xs text-[#10B981] font-medium mt-1">
                          ₹{plan.price.monthly.toLocaleString('en-IN')}/mo billed annually
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features?.map((feature: string, i: number) => (
                    <li key={i} className="flex text-sm text-[#4B5563]">
                      <Check size={16} className={`shrink-0 mt-1 mr-3 ${plan.popular ? 'text-[#FBBF24]' : 'text-[#10B981]'}`} />
                      <span className="leading-5">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Edit Button with Vibrant Purple Palette */}
                <button
                  onClick={() => handleOpenEditModal(plan)}
                  className="w-full py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-['Poppins'] font-bold rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-[#5B21B6] cursor-pointer"
                >
                  <Pencil size={14} /> Edit Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl p-6 w-full max-w-lg border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <h2 className="font-['Poppins'] text-lg font-bold text-gray-900">
                {editingPlanId ? 'Edit Subscription Plan' : 'Create New Pricing Plan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-gray-700">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Scale Plan, Pro Tier, Enterprise Accelerator"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={e => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Annual Price (₹)</label>
                  <input
                    type="number"
                    value={formData.annualPrice}
                    onChange={e => setFormData({ ...formData, annualPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={e => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Best Value, Popular, Recommended"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Plan Description</label>
                <input
                  type="text"
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Brief summary of who this plan is tailored for..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Feature Highlights (One feature per line)</label>
                <textarea
                  rows={5}
                  value={formData.featuresText}
                  onChange={e => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Full AI Startup Idea Generator&#10;Detailed Business Plan&#10;Mentor Request Access&#10;PDF Export"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5B21B6] resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={e => setFormData({ ...formData, popular: e.target.checked })}
                    className="w-4 h-4 text-[#5B21B6] rounded border-gray-300 focus:ring-[#5B21B6]"
                  />
                  Mark as Highlighted / Popular
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-[#5B21B6] rounded border-gray-300 focus:ring-[#5B21B6]"
                  />
                  Active Plan
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                className="flex-1 px-4 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                {editingPlanId ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
