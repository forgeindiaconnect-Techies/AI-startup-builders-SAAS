import React from 'react';
import { 
  Lightbulb, Target, TrendingUp, Presentation, Users, Activity 
} from 'lucide-react';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  themeColor: string;
}

const Features: React.FC = () => {
  const features: FeatureCard[] = [
    {
      icon: <Lightbulb size={28} className="text-[#FBBF24]" />,
      title: "AI Business Analysis",
      description: "Business analysis evaluates a startup idea by examining the problem it solves, the solution it offers, who the target customers are, and how big the market opportunity is — using frameworks like TAM, SAM, and SOM to size the addressable market.",
      themeColor: "#FBBF24"
    },
    {
      icon: <Target size={28} className="text-[#8B5CF6]" />,
      title: "SWOT Analysis",
      description: "SWOT stands for Strengths, Weaknesses, Opportunities, and Threats. It is a strategic planning framework that helps businesses evaluate internal capabilities and external market conditions to make informed decisions and build competitive strategies.",
      themeColor: "#8B5CF6"
    },
    {
      icon: <TrendingUp size={28} className="text-[#10B981]" />,
      title: "Financial Forecasting",
      description: "Financial forecasting is the process of estimating a startup's future revenue, costs, and profitability. It uses metrics like CAC (Customer Acquisition Cost), LTV (Lifetime Value), and profit margins to project growth over 1–3 years and determine business viability.",
      themeColor: "#10B981"
    },
    {
      icon: <Presentation size={28} className="text-[#3B82F6]" />,
      title: "Investor Pitch Deck",
      description: "A pitch deck is a concise 10-slide presentation that tells a startup's story to investors. It covers the vision, problem, solution, market size, business model, competition, traction, and the funding ask — designed to secure investment in a short meeting.",
      themeColor: "#3B82F6"
    },
    {
      icon: <Users size={28} className="text-[#EC4899]" />,
      title: "Mentor Matching",
      description: "Mentor matching is the process of pairing startup founders with experienced industry experts based on domain relevance, skill gaps, and business stage. A good mentor provides guidance, avoids common mistakes, and opens doors to networks and funding opportunities.",
      themeColor: "#EC4899"
    },
    {
      icon: <Activity size={28} className="text-[#F97316]" />,
      title: "Startup Readiness Score",
      description: "A startup readiness score is a weighted assessment that evaluates how prepared a business is for funding. It measures criteria like problem clarity, MVP status, unit economics, customer validation, and IP protection — scored out of 100 to indicate investor readiness.",
      themeColor: "#F97316"
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#F8FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[#5B21B6] font-bold tracking-wide uppercase text-sm mb-3">Core Features</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
            Everything you need to build from <span className="text-[#7C3AED]">idea to funding</span>
          </h3>
          <p className="text-[#6B7280] text-lg">
            Six powerful AI tools designed to help you build, evaluate, and scale your startup idea.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-left bg-white border-2 rounded-2xl p-8 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow duration-200"
              style={{ borderColor: `${feature.themeColor}30` }}
            >
              <div>
                <div 
                  className="w-14 h-14 rounded-xl border shadow-sm flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${feature.themeColor}15`, borderColor: `${feature.themeColor}30` }}
                >
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-[#1F2937] mb-3">{feature.title}</h4>
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
