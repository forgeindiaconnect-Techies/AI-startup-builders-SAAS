import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare, CheckCircle, Star, Award, Calendar, User,
  ThumbsUp, ThumbsDown, Clock, Search, ChevronDown, FileText, Sparkles
} from 'lucide-react';
import { getStartups, updateStartup, addNotification } from '../../../utils/localStorageHelper';
import { getMentorBookings, getBookingFeedback } from '../../../utils/mentorApi';
import { useAuth } from '../../../context/AuthContext';

const MentorFeedback: React.FC = () => {
  const { user } = useAuth();
  const [startups, setStartups] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [all, bks] = await Promise.all([
          getStartups(),
          getMentorBookings().catch(() => []),
        ]);
        setStartups(all);
        setBookings(Array.isArray(bks) ? bks : []);

        // Load feedback for each booking with feedback
        const map: Record<string, any> = {};
        for (const bk of Array.isArray(bks) ? bks : []) {
          if (bk.status === 'completed') {
            try {
              const fb = await getBookingFeedback(bk._id || bk.id).catch(() => null);
              if (fb) map[bk._id || bk.id] = fb;
            } catch { /* skip */ }
          }
        }
        setFeedbackMap(map);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // All feedback the mentor has given (from startups with mentorReview)
  const feedbackGiven = useMemo(() => {
    const results: any[] = [];

    // From startups in localStorage
    startups.forEach(s => {
      if (s.mentorReview && s.mentorFeedback) {
        results.push({
          id: s.startupId || s._id || s.id,
          type: 'review',
          startupName: s.startupName || 'Unknown Startup',
          founderName: s.founderName || s.founderId?.fullName || 'Founder',
          rating: s.mentorReview?.rating || null,
          feedback: s.mentorFeedback || s.mentorReview?.feedback || '',
          date: s.mentorReview?.createdAt || s.updatedAt || new Date().toISOString(),
          status: s.mentorReview?.status || 'Reviewed',
          clarificationMessage: s.mentorReview?.clarificationMessage || null,
          mentorReply: s.mentorReview?.mentorReply || null,
          raw: s,
        });
      }
    });

    // From completed bookings
    bookings
      .filter(b => b.status === 'completed' && b.mentorNotes)
      .forEach(b => {
        const already = results.some(r => r.startupName === (b.startupName || b.startupId?.startupName));
        if (!already) {
          results.push({
            id: b._id || b.id,
            type: 'session_note',
            startupName: b.startupName || b.startupId?.startupName || 'Unknown Startup',
            founderName: b.founderName || b.userId?.fullName || 'Founder',
            rating: null,
            feedback: b.mentorNotes || '',
            date: b.sessionDate || b.createdAt || new Date().toISOString(),
            status: 'Session Completed',
            clarificationMessage: null,
            mentorReply: null,
            raw: b,
          });
        }
      });

    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [startups, bookings]);

  const pendingClarifications = useMemo(() =>
    startups.filter(s => s.mentorReview?.status === 'Clarification Requested'),
    [startups]
  );

  const filtered = useMemo(() => {
    return feedbackGiven.filter(f => {
      const matchSearch = !search.trim() || 
        f.startupName.toLowerCase().includes(search.toLowerCase()) ||
        f.founderName.toLowerCase().includes(search.toLowerCase());
      const matchRating = ratingFilter === 'all' || f.rating === ratingFilter;
      return matchSearch && matchRating;
    });
  }, [feedbackGiven, search, ratingFilter]);

  const handleReply = async (startup: any) => {
    const id = startup.startupId || startup._id;
    const reply = replyInputs[id] || '';
    if (!reply.trim()) return;

    const updated = {
      ...startup,
      mentorReview: {
        ...startup.mentorReview,
        status: 'Clarification Answered',
        mentorReply: reply,
      }
    };
    await updateStartup(id, updated);
    setStartups(prev => prev.map(s => (s.startupId || s._id) === id ? { ...s, mentorReview: updated.mentorReview } : s));
    setReplyInputs(prev => ({ ...prev, [id]: '' }));
    addNotification({
      id: `notif_reply_${Date.now()}`,
      userId: startup.founderId || 'all',
      title: 'Mentor replied to your clarification',
      message: `${user?.fullName || 'Mentor'} replied to your clarification for ${startup.startupName}: "${reply}"`,
      type: 'mentor_review',
      actionUrl: '/dashboard/founder/mentor-reviews',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  };

  const getRatingColor = (rating: string) => {
    if (rating === 'Good') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (rating === 'Average') return 'text-amber-700 bg-amber-50 border-amber-200';
    if (rating === 'Bad') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRatingIcon = (rating: string) => {
    if (rating === 'Good') return <ThumbsUp size={13} />;
    if (rating === 'Average') return <Star size={13} />;
    if (rating === 'Bad') return <ThumbsDown size={13} />;
    return <Star size={13} />;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return iso; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-[#5B21B6] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Header Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Feedback Given', value: feedbackGiven.length, icon: MessageSquare, color: 'bg-purple-50 text-[#5B21B6]' },
          { label: 'Good Ratings', value: feedbackGiven.filter(f => f.rating === 'Good').length, icon: ThumbsUp, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Pending Clarifications', value: pendingClarifications.length, icon: Clock, color: 'bg-amber-50 text-amber-700' },
          { label: 'Startups Reviewed', value: new Set(feedbackGiven.map(f => f.startupName)).size, icon: Award, color: 'bg-blue-50 text-blue-700' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-xs font-semibold text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Clarifications */}
      {pendingClarifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-amber-50/60 border-b border-amber-100 flex items-center gap-2">
            <Clock size={17} className="text-amber-600" />
            <h2 className="font-bold text-amber-900">Pending Clarifications ({pendingClarifications.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingClarifications.map(startup => {
              const id = startup.startupId || startup._id;
              return (
                <div key={id} className="px-6 py-5 bg-amber-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900 text-sm">{startup.startupName}</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                      Awaiting Your Response
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Founder's question:</p>
                  <div className="text-sm text-gray-800 italic border-l-4 border-amber-400 pl-3 bg-white py-2 pr-3 rounded-r-xl mb-4 shadow-xs">
                    "{startup.mentorReview.clarificationMessage}"
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      value={replyInputs[id] || ''}
                      onChange={e => setReplyInputs(prev => ({ ...prev, [id]: e.target.value }))}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50"
                    />
                    <button
                      onClick={() => handleReply(startup)}
                      disabled={!(replyInputs[id] || '').trim()}
                      className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      <MessageSquare size={14} /> Send Reply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-[#5B21B6]" />
            <h2 className="font-bold text-gray-900">Feedback History</h2>
            <span className="px-2 py-0.5 bg-purple-50 text-[#5B21B6] text-xs font-bold rounded-full border border-purple-100">
              {feedbackGiven.length} total
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search startup..."
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] w-44"
              />
            </div>

            {/* Rating filter */}
            <div className="relative">
              <select
                value={ratingFilter}
                onChange={e => setRatingFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
              >
                <option value="all">All Ratings</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Bad">Needs Work</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <Sparkles size={36} className="text-gray-200" />
            <p className="font-bold text-gray-700 text-sm">No feedback given yet</p>
            <p className="text-xs text-gray-400 text-center max-w-xs">
              As you review startups and provide feedback, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((f, idx) => (
              <div key={f.id || idx} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B21B6] to-[#FBBF24] flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow-md">
                    {(f.startupName || 'S').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-bold text-gray-900 text-[15px]">{f.startupName}</p>

                      {f.rating && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRatingColor(f.rating)}`}>
                          {getRatingIcon(f.rating)}
                          {f.rating}
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        f.type === 'session_note'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {f.type === 'session_note' ? 'Session Note' : 'Startup Review'}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {f.founderName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(f.date)}
                      </span>
                    </div>

                    {/* Feedback text */}
                    {f.feedback && (
                      <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-4">
                        {f.feedback}
                      </div>
                    )}

                    {/* Clarification answered */}
                    {f.clarificationMessage && f.status === 'Clarification Answered' && (
                      <div className="mt-3 space-y-2">
                        <div className="border-l-4 border-gray-300 pl-3 bg-gray-50 py-2 pr-3 rounded-r-xl text-sm italic text-gray-600">
                          <p className="text-[11px] font-bold text-gray-400 mb-1">FOUNDER'S QUESTION</p>
                          "{f.clarificationMessage}"
                        </div>
                        {f.mentorReply && (
                          <div className="border-l-4 border-[#5B21B6] pl-3 bg-purple-50 py-2 pr-3 rounded-r-xl text-sm">
                            <p className="text-[11px] font-bold text-[#5B21B6] mb-1">YOUR REPLY</p>
                            <p className="text-gray-800">{f.mentorReply}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorFeedback;
