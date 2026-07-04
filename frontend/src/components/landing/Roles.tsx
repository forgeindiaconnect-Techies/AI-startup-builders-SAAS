import React from 'react';
import { UserPlus, Briefcase, TrendingUp, ShieldCheck } from 'lucide-react';

const Roles: React.FC = () => {
  return (
    <section id="roles" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-[#5B21B6] font-bold tracking-wide uppercase text-sm mb-3">Ecosystem</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
            A thriving community for <span className="text-[#7C3AED]">everyone</span>
          </h3>
          <p className="text-[#6B7280] text-lg">
            Our platform connects the four essential pillars of the startup ecosystem into one seamless experience.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 lg:order-1 reveal">
            <img 
              src="/assets/roles-ecosystem.png" 
              alt="Ecosystem Roles" 
              className="w-full h-auto rounded-2xl shadow-xl"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/800x600/F8FAFC/1F2937?text=Roles+Ecosystem";
              }}
            />
          </div>
          
          <div className="order-1 lg:order-2 grid sm:grid-cols-2 gap-6 reveal delay-200">
            {/* Founder */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#5B21B6]/30 transition-colors">
              <div className="w-12 h-12 bg-[#5B21B6]/10 rounded-xl flex items-center justify-center mb-4">
                <UserPlus size={24} className="text-[#5B21B6]" />
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-2">Startup Founder</h4>
              <p className="text-[#6B7280] text-sm">Submit ideas, get AI analysis, connect with mentors, and secure funding from investors.</p>
            </div>
            
            {/* Mentor */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#FBBF24]/50 transition-colors">
              <div className="w-12 h-12 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center mb-4">
                <Briefcase size={24} className="text-[#F59E0B]" />
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-2">Mentor</h4>
              <p className="text-[#6B7280] text-sm">Review AI reports, guide founders, provide expert ratings, and earn revenue per review.</p>
            </div>
            
            {/* Investor */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#10B981]/30 transition-colors">
              <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-[#10B981]" />
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-2">Investor</h4>
              <p className="text-[#6B7280] text-sm">Discover pre-vetted startups, read detailed AI analysis, and make direct funding offers.</p>
            </div>
            
            {/* Admin */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#EF4444]/30 transition-colors">
              <div className="w-12 h-12 bg-[#EF4444]/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-[#EF4444]" />
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-2">Admin</h4>
              <p className="text-[#6B7280] text-sm">Manage the platform, approve mentors, monitor AI usage, and handle payments.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Roles;
