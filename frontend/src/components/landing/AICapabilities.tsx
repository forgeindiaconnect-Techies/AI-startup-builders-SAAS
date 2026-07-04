import React from 'react';
import { Check, Sparkles } from 'lucide-react';

const AICapabilities: React.FC = () => {
  const capabilities = [
    "Comprehensive Business Summary",
    "Detailed Market Research",
    "Competitor Analysis & Differentiation",
    "Revenue Model Suggestions",
    "Go-To-Market & Marketing Strategy",
    "Branding & Naming Ideas",
    "Risk Prediction Analysis",
    "Minimum Viable Product (MVP) Roadmap",
    "30-Second Elevator Pitch",
  ];

  return (
    <section id="ai-capabilities" className="py-24 bg-[#111827] text-white overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#5B21B6]/20 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left - Image/Demo */}
          <div className="order-2 lg:order-1 reveal">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent z-10"></div>
              <img 
                src="/assets/ai-analysis.png" 
                alt="AI Analysis Report" 
                className="w-full h-auto object-cover opacity-90"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/800x800/1F2937/7C3AED?text=AI+Analysis+Report";
                }}
              />
              
              {/* Animated scanning line overlay */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FBBF24] shadow-[0_0_15px_#FBBF24] z-20 animate-[slideDown_3s_ease-in-out_infinite_alternate]"></div>
            </div>
          </div>
          
          {/* Right - Content */}
          <div className="order-1 lg:order-2 reveal delay-200">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FDE68A] font-semibold text-sm mb-6">
              <Sparkles size={16} className="mr-2" />
              Powered by OpenAI & Gemini
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              An entire <span className="gradient-text-gold">consulting team</span> inside your browser.
            </h2>
            
            <p className="text-gray-400 text-lg mb-8">
              Don't spend weeks researching. Our advanced AI models analyze your single-sentence idea and generate a comprehensive, 50-page equivalent business report in seconds.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {capabilities.map((cap, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-[#5B21B6] rounded-full p-1 mt-0.5 mr-3 shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="text-gray-300 font-medium">{cap}</span>
                </div>
              ))}
            </div>
            
            <button className="px-8 py-4 bg-[#FBBF24] hover:bg-[#FDE68A] text-[#111827] rounded-xl font-bold text-lg transition-colors shadow-lg">
              Try the AI Generator
            </button>
          </div>
          
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default AICapabilities;
