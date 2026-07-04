import React from 'react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#7C3AED]/10 blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FBBF24]/10 blur-[100px] animate-pulse-glow delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column - Content */}
          <div className="text-center lg:text-left z-10 animate-slide-in-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#5B21B6] font-semibold text-sm mb-6 border border-[#7C3AED]/20">
              <span className="flex h-2 w-2 rounded-full bg-[#5B21B6] mr-2 animate-ping"></span>
              AI-Powered Startup Ecosystem
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#1F2937] leading-tight mb-6 tracking-tight">
              Transform Your Idea Into an <br className="hidden lg:block" />
              <span className="gradient-text">Investment-Ready</span> Business
            </h1>
            
            <p className="text-xl text-[#6B7280] mb-8 max-w-2xl mx-auto lg:mx-0">
              Stop guessing. Let our AI analyze your startup idea, generate detailed business insights, match you with expert mentors, and connect you directly with eager investors.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-10">
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl font-bold text-lg transition-all shadow-[0_4px_14px_0_rgba(91,33,182,0.39)] hover:shadow-[0_6px_20px_rgba(91,33,182,0.23)] hover:-translate-y-1 flex items-center justify-center">
                Sign up
                <ArrowRight className="ml-2" size={20} />
              </button>
              
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#5B21B6] hover:bg-gray-50 rounded-xl font-bold text-lg transition-all flex items-center justify-center shadow-sm">
                <Play className="mr-2 text-[#5B21B6] fill-[#5B21B6]" size={20} />
                Watch Demo
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-medium text-[#6B7280]">
              <div className="flex items-center">
                <CheckCircle2 className="text-[#10B981] mr-1.5" size={18} />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="text-[#10B981] mr-1.5" size={18} />
                Full AI analysis in seconds
              </div>
            </div>
          </div>
          
          {/* Right Column - Image Mockup */}
          <div className="relative z-10 animate-fade-in-scale delay-200 lg:ml-8 mt-10 lg:mt-0">
            <div className="relative rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl p-2 animate-float">
              {/* Window Controls */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#F3F4F6] bg-gray-50/80 rounded-t-xl mb-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              
              <img 
                src="/assets/hero-dashboard.png" 
                alt="AI Startup Builder Dashboard" 
                className="w-full rounded-b-xl"
                onError={(e) => {
                  // Fallback if image doesn't exist yet
                  e.currentTarget.src = "https://placehold.co/800x600/111827/ffffff?text=Dashboard+Preview";
                }}
              />
              
              {/* Floating element 1 */}
              <div className="absolute -left-8 top-1/4 glass px-4 py-3 rounded-xl shadow-lg animate-float-delayed flex items-center gap-3">
                <div className="bg-[#10B981]/20 p-2 rounded-full text-[#10B981]">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] font-medium">Startup Score</div>
                  <div className="text-lg font-bold text-[#1F2937]">92/100</div>
                </div>
              </div>
              
              {/* Floating element 2 */}
              <div className="absolute -right-6 bottom-1/4 glass px-4 py-3 rounded-xl shadow-lg animate-float delay-500 flex items-center gap-3">
                <div className="bg-[#5B21B6]/20 p-2 rounded-full text-[#5B21B6]">
                  <ArrowRight size={24} />
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] font-medium">New Offer</div>
                  <div className="text-sm font-bold text-[#1F2937]">$250k for 10%</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
