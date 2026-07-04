import React from 'react';
import { CheckSquare, MessageSquare, Star, ArrowRight } from 'lucide-react';

const feedbackItems = [
  { id: 1, startup: 'EcoPackage Hub', date: 'Jul 2, 2026', type: 'Pitch Deck Review', excerpt: 'Your go-to-market strategy is solid, but the TAM needs more specific segmentation...', rating: 4 },
  { id: 2, startup: 'Fintech Micro-SaaS', date: 'Jun 28, 2026', type: 'Business Plan Review', excerpt: 'Great monetization model. I recommend adding a section on customer acquisition costs...', rating: 5 },
  { id: 3, startup: 'AI Legal Reviewer', date: 'Jun 15, 2026', type: 'Mentor Session', excerpt: 'Excellent call today. Focus on validating the core feature with 10 design partners before scaling...', rating: 4 },
];

const MentorFeedback: React.FC = () => (
  <div className="animate-fade-in-up">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Feedback Given</h1>
      <p className="text-gray-500 mt-1">History of all reviews, notes, and feedback you have provided to startups.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedbackItems.map(f => (
        <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5B21B6] bg-purple-50 px-2.5 py-1 rounded-full">{f.type}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-3">{f.startup}</h3>
              <p className="text-xs text-gray-400 mt-1">{f.date}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              {f.type.includes('Session') ? <MessageSquare size={18} className="text-blue-500" /> : <CheckSquare size={18} className="text-emerald-500" />}
            </div>
          </div>
          
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={14} className={star <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
            ))}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-200 pl-3 flex-1 mb-6">
            "{f.excerpt}"
          </p>

          <button className="flex items-center text-sm font-bold text-[#5B21B6] hover:text-[#7C3AED] transition-colors mt-auto">
            View Full Feedback <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default MentorFeedback;
