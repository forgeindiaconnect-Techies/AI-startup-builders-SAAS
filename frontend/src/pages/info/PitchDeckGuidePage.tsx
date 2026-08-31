import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, CheckCircle2, Lightbulb, TrendingUp, Target, Users, IndianRupee, BarChart3, FileText, Shield, Star } from 'lucide-react';

const slides = [
  { icon: Lightbulb, title: 'Problem', desc: 'Clearly define the problem you are solving. Use real data and customer pain points.' },
  { icon: Target, title: 'Solution', desc: 'Explain your product and how it solves the problem better than existing alternatives.' },
  { icon: TrendingUp, title: 'Market Size', desc: 'Show TAM, SAM, and SOM with credible sources. Investors want to see a large addressable market.' },
  { icon: Users, title: 'Target Audience', desc: 'Define your ideal customer profile and early adopter segments.' },
  { icon: BarChart3, title: 'Business Model', desc: 'How do you make money? Pricing tiers, revenue streams, and unit economics.' },
  { icon: Star, title: 'Traction', desc: 'Show revenue, users, partnerships, or any meaningful validation.' },
  { icon: FileText, title: 'Marketing Strategy', desc: 'How will you acquire customers? CAC, LTV, and growth channels.' },
  { icon: Shield, title: 'Competition', desc: 'Competitive landscape and your unique advantage (moat).' },
  { icon: Users, title: 'Team', desc: 'Introduce your founders and key team members with relevant experience.' },
  { icon: IndianRupee, title: 'Financial Projections', desc: '3-5 year forecast: revenue, expenses, and key metrics.' },
];

const PitchDeckGuidePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#5B21B6] font-medium text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-2 rounded-lg">
            <Rocket size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1F2937]">Pitch Deck Guide</h1>
        </div>
        <p className="text-[#6B7280] mb-10 ml-12">Master the art of pitching to investors with this comprehensive 10-slide framework.</p>

        <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-2xl p-6 text-white mb-10">
          <h2 className="text-xl font-bold mb-2">The Perfect Pitch Deck</h2>
          <p className="text-sm text-indigo-200 mb-4">A winning pitch deck tells a compelling story in 10 slides. Each slide should be clear, visual, and focused on one key message.</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">10 Slides</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">10-15 Minutes</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">High Impact</span>
          </div>
        </div>

        <div className="space-y-4">
          {slides.map((slide, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5B21B6] text-white text-xs font-bold shrink-0 mt-1">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <slide.icon size={16} className="text-[#5B21B6]" />
                  <h3 className="font-bold text-[#1F2937]">{slide.title}</h3>
                </div>
                <p className="text-sm text-[#6B7280]">{slide.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-bold text-[#1F2937] mb-3 flex items-center gap-2"><Lightbulb size={18} className="text-amber-500" /> Pro Tips</h3>
          <ul className="space-y-2 text-sm text-[#6B7280]">
            {[
              'Keep each slide under 30 words — let visuals tell the story.',
              'Use consistent branding and high-quality visuals.',
              'Practice your delivery — confidence matters as much as content.',
              'Tailor your deck to the investor\'s focus area and check size.',
              'Always include a clear ask: how much and what for.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PitchDeckGuidePage;
