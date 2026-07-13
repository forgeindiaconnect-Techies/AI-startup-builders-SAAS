import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

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
              
              <button
                onClick={() => setIsVideoOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#5B21B6] hover:bg-gray-50 rounded-xl font-bold text-lg transition-all flex items-center justify-center shadow-sm"
              >
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
          <div className="relative z-10 lg:ml-8 mt-10 lg:mt-0">
            <div className="relative rounded-3xl bg-gradient-to-tr from-[#5B21B6]/10 to-[#FBBF24]/10 shadow-2xl p-1">
              <div className="rounded-2xl overflow-hidden relative bg-white">
                <img 
                  src="/assets/ai_startup_illustration.png" 
                  alt="AI Startup Builder Idea Transformation" 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/800x600/111827/ffffff?text=AI+Startup+Transformation";
                  }}
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Video Demo Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsVideoOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-4xl bg-[#1F2937] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-bold text-lg">How to Pitch Your Startup in 3 Minutes</h3>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/XWRtG_PDRik?autoplay=1&rel=0&modestbranding=1"
                title="Startup Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Learn how to structure a compelling 3-minute pitch for your startup idea.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
