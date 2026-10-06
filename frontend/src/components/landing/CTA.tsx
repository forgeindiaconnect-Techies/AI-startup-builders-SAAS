import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dynamic background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#4C1D95] z-0"></div>
      
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBBF24] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-glow z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-glow delay-1000 z-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight reveal">
          Ready to build your <span className="text-[#FBBF24]">startup?</span>
        </h2>
        <p className="text-xl text-[#FDE68A] mb-10 max-w-2xl mx-auto reveal delay-100">
          Join thousands of founders who are building, validating, and funding their ideas faster than ever before.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal delay-200">
          <div className="w-full sm:w-auto relative">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="w-full sm:w-80 px-6 py-4 rounded-xl text-[#1F2937] border-0 focus:ring-4 focus:ring-[#FBBF24] outline-none shadow-lg text-lg"
            />
          </div>
          <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-4 bg-[#FBBF24] hover:bg-[#FDE68A] text-[#111827] rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center group">
            Sign up
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
        <p className="text-sm text-white/70 mt-6 reveal delay-300">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
};

export default CTA;
