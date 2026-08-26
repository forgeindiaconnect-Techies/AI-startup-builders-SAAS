import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getStartups } from '../../../utils/localStorageHelper';
import { getMentorSessionReviews } from '../../../utils/mentorApi';

const defaultRatings: any[] = [
  {
    id: 'demo_rev_1',
    founder: 'Renu (Founder)',
    startup: 'Tourists Platform',
    score: 5,
    review: 'Extremely insightful session! Clear advice on early customer acquisition, partner outreach, and pricing tiers.',
    date: 'Aug 8, 2026'
  },
  {
    id: 'demo_rev_2',
    founder: 'Alex (Founder)',
    startup: 'AI Logistics SaaS',
    score: 5,
    review: 'Mano gave incredible actionable feedback on our GTM roadmap and unit economics.',
    date: 'Aug 5, 2026'
  },
  {
    id: 'demo_rev_3',
    founder: 'Sarah (Founder)',
    startup: 'HealthTech Connect',
    score: 4,
    review: 'Great mentoring session. Helped us refine our pitch deck and compliance roadmap.',
    date: 'Aug 1, 2026'
  }
];

const MentorRatings: React.FC = () => {
  const [ratings, setRatings] = useState<any[]>(defaultRatings);

  useEffect(() => {
    const fetchData = async () => {
      let serverReviews: any[] = [];
      try {
        serverReviews = await getMentorSessionReviews();
      } catch (e) {}

      const serverMapped = (Array.isArray(serverReviews) ? serverReviews : []).map((r: any) => ({
        id: r._id || r.id,
        founder: r.founderName || 'Founder',
        startup: r.startupName || 'Startup',
        score: Number(r.rating) || 5,
        review: r.reviewText || 'Great mentoring session!',
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : (r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent')
      }));

      // Read from localStorage key ai_startup_builder_user_mentor_reviews
      let localUserReviews: any[] = [];
      try {
        const stored = localStorage.getItem('ai_startup_builder_user_mentor_reviews');
        if (stored) {
          localUserReviews = JSON.parse(stored).map((r: any) => ({
            id: r.id || r.bookingId,
            founder: r.founderName || 'Founder',
            startup: r.startupName || 'Startup',
            score: Number(r.rating) || 5,
            review: r.reviewText || 'Great mentoring session!',
            date: r.createdAt
              ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : (r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent')
          }));
        }
      } catch (e) {}

      const locals = await getStartups();
      const startupRatings = locals
        .filter((s: any) => s.mentorReview?.founderRating)
        .map((s: any) => ({
          id: s.startupId || s.id || s._id,
          founder: s.founderName || 'Founder',
          startup: s.startupName || s.name,
          score: Number(s.mentorReview.founderRating) || 5,
          review: s.mentorReview.founderReview || 'No text review provided.',
          date: s.mentorReview.founderReviewDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));

      const combined = [...serverMapped, ...localUserReviews, ...startupRatings, ...defaultRatings];
      const map = new Map();
      combined.forEach(item => map.set(item.id, item));
      setRatings(Array.from(map.values()));
    };
    fetchData();
  }, []);

  const totalReviews = ratings.length;
  const avgScore = totalReviews > 0 ? (ratings.reduce((acc, r) => acc + r.score, 0) / totalReviews).toFixed(1) : '5.0';

  const starCounts = [5, 4, 3, 2, 1].map(stars => {
    const count = ratings.filter(r => r.score === stars).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, pct, count };
  });

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
        <p className="text-gray-500 mt-1">See what founders are saying about your mentoring sessions and reviews.</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="text-center md:border-r md:border-gray-100 md:pr-8">
          <p className="text-5xl font-black text-gray-900 mb-2">{avgScore}</p>
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} className={s <= Math.round(Number(avgScore)) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />)}
          </div>
          <p className="text-sm text-gray-500 font-medium">Based on {totalReviews} reviews</p>
        </div>

        <div className="flex-1 w-full space-y-3">
          {starCounts.map(row => (
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
};

export default MentorRatings;
