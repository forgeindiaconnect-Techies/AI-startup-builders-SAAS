import React from 'react';
import { Lightbulb, Target, TrendingUp, Presentation, Users, Activity } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Lightbulb size={28} className="text-[#FBBF24]" />,
      title: "AI Business Analysis",
      description: "Get comprehensive insights on your startup idea including problem statements, solutions, and unique value propositions."
    },
    {
      icon: <Target size={28} className="text-[#5B21B6]" />,
      title: "SWOT Analysis",
      description: "Automatically identify your strengths, weaknesses, opportunities, and threats in seconds to build a robust strategy."
    },
    {
      icon: <TrendingUp size={28} className="text-[#10B981]" />,
      title: "Financial Forecasting",
      description: "Generate 3-year financial projections including startup costs, revenue estimates, and break-even analysis."
    },
    {
      icon: <Presentation size={28} className="text-[#3B82F6]" />,
      title: "Investor Pitch Deck",
      description: "Auto-generate a complete, 10-slide investor pitch deck based on your AI-validated business model."
    },
    {
      icon: <Users size={28} className="text-[#EC4899]" />,
      title: "Mentor Matching",
      description: "Connect with vetted industry experts who review your AI reports and provide actionable, human feedback."
    },
    {
      icon: <Activity size={28} className="text-[#F59E0B]" />,
      title: "Startup Readiness Score",
      description: "Get scored out of 100 based on innovation, market demand, scalability, and technical feasibility."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-[#5B21B6] font-bold tracking-wide uppercase text-sm mb-3">Core Features</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
            Everything you need to build from <span className="text-[#7C3AED]">idea to funding</span>
          </h3>
          <p className="text-[#6B7280] text-lg">
            Our platform provides a complete ecosystem of tools designed specifically for modern founders who want to move fast and secure investment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`reveal delay-${(index % 3 + 1) * 100} bg-[#F8FAFC] border border-[#E5E7EB] hover:border-[#7C3AED]/30 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-3">{feature.title}</h4>
              <p className="text-[#6B7280] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
