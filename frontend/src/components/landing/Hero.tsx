import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import startupVideo from '../../assets/startup videos/I_want_to_real_humans_image_an.mp4';

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

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* Left Column - Content */}
          <div className="lg:col-span-5 text-center lg:text-left z-10 animate-slide-in-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#5B21B6] font-semibold text-sm mb-6 border border-[#7C3AED]/20">
              <span className="flex h-2 w-2 rounded-full bg-[#5B21B6] mr-2 animate-ping"></span>
              AI-Powered Startup Ecosystem
            </div>
            
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-[#1F2937] leading-tight mb-6 tracking-tight">
              Transform Your Idea Into an <br className="hidden xl:block" />
              <span className="gradient-text">Investment-Ready</span> Business
            </h1>
            
            <p className="text-lg xl:text-xl text-[#6B7280] mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Stop guessing. Let our AI analyze your startup idea, generate detailed business insights, match you with expert mentors, and connect you directly with eager investors.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-10">
              <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-4 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl font-bold text-lg transition-all shadow-[0_4px_14px_0_rgba(91,33,182,0.39)] hover:shadow-[0_6px_20px_rgba(91,33,182,0.23)] hover:-translate-y-1 flex items-center justify-center cursor-pointer">
                Sign up
                <ArrowRight className="ml-2" size={20} />
              </button>
              
              <button
                onClick={() => setIsVideoOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#5B21B6] hover:bg-gray-50 rounded-xl font-bold text-lg transition-all flex items-center justify-center shadow-sm cursor-pointer"
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
          
          {/* Right Column - Enriched Prominent Video Player */}
          <div className="lg:col-span-7 relative z-10 mt-8 lg:mt-0 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-full lg:max-w-[660px] xl:max-w-[720px] group">
              {/* Background ambient purple glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#7C3AED]/40 via-[#5B21B6]/30 to-[#FBBF24]/30 rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 transition duration-500 -z-10" />

              {/* Main Outer Video Container */}
              <div className="relative rounded-[2rem] bg-gradient-to-tr from-[#5B21B6]/30 via-[#7C3AED]/20 to-[#FBBF24]/20 p-2 sm:p-3 border border-[#7C3AED]/30 shadow-[0_15px_40px_-10px_rgba(91,33,182,0.3)] transition-all duration-300 hover:border-[#7C3AED]/60">
                <div className="rounded-2xl overflow-hidden relative bg-black shadow-2xl border border-white/10">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    controls 
                    className="w-full h-[260px] sm:h-[360px] md:h-[400px] lg:h-[420px] xl:h-[450px] object-cover rounded-2xl"
                  >
                    <source src={startupVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
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
              <h3 className="text-white font-bold text-lg">AI Startup Builder — Real Founders & Teams Showcase</h3>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative w-full bg-black p-2 flex items-center justify-center">
              <video 
                autoPlay 
                controls 
                className="w-full max-h-[70vh] rounded-xl object-contain"
              >
                <source src={startupVideo} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Watch how real founders, mentors, and investors collaborate using AI Startup Builder.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
