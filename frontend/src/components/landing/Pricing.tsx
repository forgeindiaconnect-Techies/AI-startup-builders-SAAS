import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, Star, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    badge: 'Free Forever',
    badgeColor: 'bg-gray-100 text-gray-600',
    icon: Zap,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    desc: 'Perfect for exploring the platform.',
    buttonText: 'Get Started',
    buttonStyle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    popular: false,
    features: [
      '1 Startup Idea',
      '5 AI Reports per Month',
      'Basic Business Plan',
      'Basic SWOT Analysis',
      'Basic Startup Roadmap',
      'Community Support'
    ]
  },
  {
    name: 'Silver',
    price: { monthly: 799, annual: 7999 },
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
      '5 Startup Ideas',
      'Unlimited AI Reports',
      'Business Plan Generator',
      'SWOT Analysis',
      'Market Research',
      'Competitor Analysis',
      'AI Logo Suggestions',
      'Email Support'
    ]
  },
  {
    name: 'Gold',
    price: { monthly: 1999, annual: 19999 },
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
      'Everything in Silver',
      'Unlimited Startup Ideas',
      'AI Pitch Deck Generator',
      'Financial Forecasting',
      'Revenue Model Suggestions',
      'Marketing Strategy Generator',
      'Mentor Reviews',
      'Investor Visibility',
      'Priority Support'
    ]
  },
  {
    name: 'Platinum',
    price: { monthly: 4999, annual: 49999 },
    badge: 'Premium',
    badgeColor: 'bg-gradient-to-r from-[#111827] to-gray-800 text-white',
    icon: Star,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-700',
    desc: 'For power teams and enterprises.',
    buttonText: 'Contact Sales',
    buttonStyle: 'bg-[#111827] text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20',
    popular: false,
    features: [
      'Everything in Gold',
      'Unlimited AI Credits',
      'Unlimited Mentor Reviews',
      'Direct Investor Access',
      'Team Collaboration',
      'White-label Branding',
      'API Access',
      'Dedicated Account Manager',
      'Advanced Analytics',
      'Premium Support'
    ]
  }
];

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleButtonClick = (planName: string) => {
    if (planName === 'Platinum') {
      window.alert('Please contact our sales team for Platinum plan details');
      return;
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
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2.5 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-300 ${!isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2.5 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-300 relative ${isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              Annual
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-medium text-[#10B981] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Save up to 20% with Annual Billing
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative bg-white rounded-[20px] flex flex-col transition-all duration-500 ${
                plan.popular
                  ? 'border-2 border-[#5B21B6] shadow-2xl shadow-purple-500/15 z-10'
                  : 'border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
              }`}
              style={plan.popular ? { boxShadow: '0 0 30px rgba(91,33,182,0.12), 0 0 60px rgba(251,191,36,0.08)' } : {}}
            >
              {plan.popular && (
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-[#5B21B6]/5 via-transparent to-[#FBBF24]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              )}

              <div className={`absolute top-5 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-[10px] font-['Poppins'] font-bold px-4 py-1.5 rounded-full tracking-wider whitespace-nowrap shadow-sm`}>
                {plan.badge}
              </div>

              <div className="p-7 pt-16 flex flex-col flex-1 relative z-10">
                <div className={`w-12 h-12 rounded-xl ${plan.iconBg} ${plan.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
                          ₹{plan.price.monthly.toLocaleString('en-IN')}/mo billed annually
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
                  onClick={() => handleButtonClick(plan.name)}
                  className={`w-full py-3.5 rounded-xl font-['Poppins'] font-semibold text-sm transition-all duration-300 cursor-pointer ${plan.buttonStyle} ${
                    plan.popular ? 'group-hover:shadow-xl group-hover:shadow-amber-500/40' : ''
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
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
