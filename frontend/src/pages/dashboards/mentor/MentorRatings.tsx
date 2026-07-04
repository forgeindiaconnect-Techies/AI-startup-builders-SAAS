import React from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';

const ratings = [
  { id: 1, founder: 'Sarah Jenkins', startup: 'EcoPackage Hub', score: 5, review: 'Alex was incredible! Gave us completely new perspective on our GTM strategy. Highly recommended.', date: 'Jul 2, 2026' },
  { id: 2, founder: 'Tom Chen', startup: 'Fintech Micro-SaaS', score: 5, review: 'Very direct and actionable feedback on our business plan. Pointed out flaws we missed.', date: 'Jun 20, 2026' },
  { id: 3, founder: 'Priya Sharma', startup: 'EdTech Learn', score: 4, review: 'Good insights into the EdTech market. Wish we had a bit more time on the call.', date: 'Jun 5, 2026' },
];

const MentorRatings: React.FC = () => (
  <div className="animate-fade-in-up">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
      <p className="text-gray-500 mt-1">See what founders are saying about your mentoring sessions and reviews.</p>
    </div>

    {/* Summary */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center gap-8">
      <div className="text-center md:border-r md:border-gray-100 md:pr-8">
        <p className="text-5xl font-black text-gray-900 mb-2">4.8</p>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} className={s <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />)}
        </div>
        <p className="text-sm text-gray-500 font-medium">Based on 24 reviews</p>
      </div>
      
      <div className="flex-1 w-full space-y-3">
        {[
          { stars: 5, pct: 80, count: 19 },
          { stars: 4, pct: 15, count: 4 },
          { stars: 3, pct: 5, count: 1 },
          { stars: 2, pct: 0, count: 0 },
          { stars: 1, pct: 0, count: 0 },
        ].map(row => (
          <div key={row.stars} className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600 w-12">{row.stars} Stars</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${row.pct}%` }} />
            </div>
            <span className="text-sm text-gray-500 w-8 text-right">{row.count}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Reviews list */}
    <div className="space-y-4">
      {ratings.map(r => (
        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-bold shadow-md text-lg">
                {r.founder.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{r.founder}</p>
                <p className="text-xs text-gray-500 font-medium">Founder of {r.startup}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= r.score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />)}
              </div>
              <span className="text-xs text-gray-400 font-medium">{r.date}</span>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl">"{r.review}"</p>
        </div>
      ))}
    </div>
  </div>
);

export default MentorRatings;
