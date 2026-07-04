import React from 'react';

const Stats: React.FC = () => {
  return (
    <section className="py-20 bg-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
          
          <div className="reveal">
            <div className="text-4xl md:text-5xl font-black text-[#FBBF24] mb-2">10K+</div>
            <div className="text-gray-400 font-medium">Startups Analyzed</div>
          </div>
          
          <div className="reveal delay-100">
            <div className="text-4xl md:text-5xl font-black text-[#FBBF24] mb-2">500+</div>
            <div className="text-gray-400 font-medium">Expert Mentors</div>
          </div>
          
          <div className="reveal delay-200">
            <div className="text-4xl md:text-5xl font-black text-[#FBBF24] mb-2">$50M+</div>
            <div className="text-gray-400 font-medium">Funding Secured</div>
          </div>
          
          <div className="reveal delay-300">
            <div className="text-4xl md:text-5xl font-black text-[#FBBF24] mb-2">95%</div>
            <div className="text-gray-400 font-medium">AI Accuracy Rate</div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Stats;
