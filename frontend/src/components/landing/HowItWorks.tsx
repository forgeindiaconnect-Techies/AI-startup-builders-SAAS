import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    { num: '01', title: 'Submit Idea', desc: 'Describe your startup idea in a few sentences.' },
    { num: '02', title: 'AI Analysis', desc: 'Get a comprehensive business report generated instantly.' },
    { num: '03', title: 'Review & Edit', desc: 'Refine the AI suggestions to match your vision.' },
    { num: '04', title: 'Mentor Feedback', desc: 'Get human validation from industry experts.' },
    { num: '05', title: 'Publish', desc: 'Make your startup visible to our investor network.' },
    { num: '06', title: 'Get Funded', desc: 'Receive offers, negotiate equity, and secure funding.' }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-[#5B21B6] font-bold tracking-wide uppercase text-sm mb-3">Workflow</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
            From napkin sketch to <span className="text-[#7C3AED]">Series A</span>
          </h3>
          <p className="text-[#6B7280] text-lg">
            We've streamlined the entire startup journey into a simple, automated workflow that guides you every step of the way.
          </p>
        </div>

        {/* Visual Workflow Image */}
        <div className="mb-20 reveal delay-200 flex justify-center">
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <img 
              src="/assets/workflow.png" 
              alt="Platform Workflow" 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/1200x600/F3F4F6/1F2937?text=Workflow+Diagram";
              }}
            />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {steps.map((step, index) => (
            <div key={index} className={`reveal delay-${(index + 1) * 100} relative`}>
              <div className="bg-white rounded-xl p-6 h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative z-10">
                <div className="text-[#E5E7EB] font-black text-5xl mb-4 -mt-2 -ml-2">{step.num}</div>
                <h4 className="text-lg font-bold text-[#1F2937] mb-2">{step.title}</h4>
                <p className="text-sm text-[#6B7280] leading-relaxed">{step.desc}</p>
              </div>
              
              {/* Connector line (hidden on mobile, handled via flex/grid gaps conceptually) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-200 z-0"></div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
