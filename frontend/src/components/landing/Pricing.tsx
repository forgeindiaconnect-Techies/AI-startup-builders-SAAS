import React, { useState } from 'react';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-[#F8FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 reveal">
          <h2 className="text-[#5B21B6] font-bold tracking-wide uppercase text-sm mb-3">Pricing</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
            Simple, transparent pricing
          </h3>
          <p className="text-[#6B7280] text-lg">
            Start building for free, upgrade when you need investor visibility and unlimited AI power.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-16 reveal delay-100">
          <div className="bg-white p-1 rounded-xl inline-flex border border-gray-200 shadow-sm relative">
            <button 
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${!isAnnual ? 'bg-[#5B21B6] text-white shadow' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${isAnnual ? 'bg-[#5B21B6] text-white shadow' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
              onClick={() => setIsAnnual(true)}
            >
              Annually <span className="text-[#FBBF24] ml-1 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-10">
          
          {/* Decorative image behind pricing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-auto -z-10 opacity-40 pointer-events-none hidden lg:block">
            <img src="/assets/pricing-decoration.png" alt="" />
          </div>

          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-shadow reveal delay-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl font-black text-[#5B21B6]">0</span>
            </div>
            <h4 className="text-2xl font-bold text-[#1F2937] mb-2">Free Plan</h4>
            <p className="text-[#6B7280] mb-6">Perfect for early stage ideation.</p>
            <div className="mb-8">
              <span className="text-5xl font-black text-[#1F2937]">$0</span>
              <span className="text-[#6B7280] ml-2">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              {['3 Startup Ideas', 'Basic AI Reports', 'Limited AI Credits', '1 Mentor Review', 'Community Support'].map((feature, i) => (
                <li key={i} className="flex items-center text-[#4B5563]">
                  <Check size={18} className="text-[#10B981] mr-3 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <button className="w-full py-4 rounded-xl font-bold text-[#5B21B6] bg-[#5B21B6]/10 hover:bg-[#5B21B6]/20 transition-colors">
              Get Started Free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-[#111827] rounded-2xl border border-[#FBBF24]/30 p-8 shadow-2xl reveal delay-300 relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-[#FBBF24] text-[#111827] text-xs font-bold px-3 py-1 rounded-bl-lg">
              MOST POPULAR
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Premium Plan</h4>
            <p className="text-gray-400 mb-6">For serious founders ready for funding.</p>
            <div className="mb-8">
              <span className="text-5xl font-black text-white">${isAnnual ? '39' : '49'}</span>
              <span className="text-gray-400 ml-2">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              {[
                'Unlimited Startup Ideas', 
                'Advanced AI Reports & PDF Export', 
                'Unlimited AI Credits', 
                'Unlimited Mentor Reviews', 
                'Pitch Deck Generator', 
                'Investor Visibility Network',
                'Priority Support'
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-gray-300">
                  <Check size={18} className="text-[#FBBF24] mr-3 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <button className="w-full py-4 rounded-xl font-bold text-[#111827] bg-[#FBBF24] hover:bg-[#FDE68A] transition-colors shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              Upgrade to Premium
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Pricing;
