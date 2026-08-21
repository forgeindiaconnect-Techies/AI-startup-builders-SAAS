import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, Crown } from 'lucide-react';

const plans = [
  {
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

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Premium Startup Business Builder');
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleCardSelect = (planName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedPlan(planName);
  };

  const handleButtonClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate('/login');
  };

  return (
    <section id="pricing" className="py-24 bg-[#F8FAFC] relative overflow-hidden font-['Inter']">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#5B21B6]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#FBBF24]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-12 reveal">
          <h2 className="font-['Poppins'] text-[#5B21B6] font-bold tracking-wider uppercase text-sm mb-3">Subscription Plans</h2>
          <h3 className="font-['Poppins'] text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
            Simple, transparent <span className="text-[#7C3AED]">pricing</span>
          </h3>
          <p className="text-[#6B7280] text-lg">
            Start building for free, scale with premium tools.
          </p>
        </div>

        <div className="flex flex-col items-center mb-14 reveal delay-100">
          <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setIsAnnual(false); }}
              className={`px-6 py-2.5 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-200 focus:outline-none ${!isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setIsAnnual(true); }}
              className={`px-6 py-2.5 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-200 focus:outline-none ${isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              Annual
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-medium text-[#10B981] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Save up to 17% with Annual Billing (2 months free)
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.name;
            return (
              <div
                key={plan.name}
                onClick={(e) => handleCardSelect(plan.name, e)}
                className={`group relative bg-white rounded-[20px] flex flex-col transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? 'border-2 border-[#5B21B6] shadow-xl ring-2 ring-[#5B21B6]/20'
                    : 'border border-gray-200 shadow-sm hover:border-purple-300'
                }`}
              >
                <div className={`absolute top-5 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-[10px] font-['Poppins'] font-bold px-4 py-1.5 rounded-full tracking-wider whitespace-nowrap shadow-sm`}>
                  {plan.badge}
                </div>

                <div className="p-7 pt-16 flex flex-col flex-1 relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${plan.iconBg} ${plan.iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                    <plan.icon size={24} />
                  </div>

                  <h4 className="font-['Poppins'] text-xl font-bold text-[#1F2937] mb-1">{plan.name}</h4>
                  <p className="text-xs text-[#6B7280] mb-5">{plan.desc}</p>

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
                            ₹{plan.price.monthly.toLocaleString('en-IN')}/mo billed annually • Save {Math.round((1 - plan.price.annual / (plan.price.monthly * 12)) * 100)}%
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex text-sm text-[#4B5563]">
                        <Check size={16} className={`shrink-0 mt-1 mr-3 ${plan.popular ? 'text-[#FBBF24]' : 'text-[#10B981]'}`} />
                        <span className="leading-5">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={(e) => {
                      handleCardSelect(plan.name, e);
                      handleButtonClick(e);
                    }}
                    className={`w-full py-3.5 rounded-xl font-['Poppins'] font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none active:scale-[0.99] ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200 reveal delay-300">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#6B7280]">
            <span className="flex items-center gap-2"><Check size={16} className="text-[#10B981]" /> Secure Payments</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-[#10B981]" /> Cancel Anytime</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-[#10B981]" /> GST Invoice Available</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-[#10B981]" /> 24×7 Customer Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
