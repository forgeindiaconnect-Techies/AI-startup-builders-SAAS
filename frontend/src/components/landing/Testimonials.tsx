import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "SaaS Founder",
      image: "https://i.pravatar.cc/150?img=47",
      quote: "The AI analysis saved me literally weeks of research. It pointed out competitors I didn't even know existed and refined my revenue model instantly.",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Angel Investor",
      image: "https://i.pravatar.cc/150?img=11",
      quote: "I love browsing the platform. The standardized AI reports and mentor feedback make it incredibly easy to evaluate deal flow and make investment decisions.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Tech Mentor",
      image: "https://i.pravatar.cc/150?img=32",
      quote: "Being a mentor here is highly rewarding. The AI does the heavy lifting on the basics, so I can focus on providing strategic, high-level guidance to founders.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-[#3B82F6] font-bold tracking-wide uppercase text-sm mb-3">Success Stories</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
            Trusted by founders and investors
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <div key={index} className={`reveal delay-${(index + 1) * 100} bg-[#F8FAFC] p-8 rounded-2xl border border-gray-200 relative`}>
              <div className="flex text-[#FBBF24] mb-6">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="text-[#4B5563] text-lg mb-8 italic">"{test.quote}"</p>
              <div className="flex items-center">
                <img src={test.image} alt={test.name} className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-sm" />
                <div>
                  <h4 className="font-bold text-[#1F2937]">{test.name}</h4>
                  <p className="text-sm text-[#6B7280]">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
