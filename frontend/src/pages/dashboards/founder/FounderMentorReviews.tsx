import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { getStartups, updateStartup, addNotification } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';

const RATING_COLORS: Record<string, string> = {
  Good: 'bg-green-100 text-green-700 border border-green-200',
  Average: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Bad: 'bg-red-100 text-red-700 border border-red-200',
};

const FounderMentorReviews: React.FC = () => {
  const { user } = useAuth();
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const all = await getStartups();
      // Only show startups that have a mentor review
      const reviewed = all.filter((s: any) => s.mentorReview && s.mentorReview.feedback);
      setStartups(reviewed);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleReply = async (startup: any) => {
    const id = startup.startupId || startup._id;
    const reply = (replyText[id] || '').trim();
    if (!reply) return;

    setSubmitting(prev => ({ ...prev, [id]: true }));

    const updatedReview = {
      ...startup.mentorReview,
      founderReply: reply,
      founderReplyAt: new Date().toISOString(),
    };

    const updated = await updateStartup(id, {
      ...startup,
      mentorReview: updatedReview,
    });

    if (updated) {
      setStartups(prev =>
        prev.map(s => (s.startupId || s._id) === id ? { ...s, mentorReview: updatedReview } : s)
      );
      setSubmitted(prev => ({ ...prev, [id]: true }));
      setReplyText(prev => ({ ...prev, [id]: '' }));

      addNotification({
        id: `notif_reply_${Date.now()}`,
        userId: startup.mentorReview.mentorId || 'mentor',
        title: 'Founder Replied to Your Review',
        message: `${user?.fullName || 'The founder'} replied to your review on "${startup.startupName}": "${reply}"`,
        type: 'mentor_reply',
        isRead: false,
        actionUrl: '/dashboard/mentor/reviews',
        createdAt: new Date().toISOString(),
      });
    }

    setSubmitting(prev => ({ ...prev, [id]: false }));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (loading) {
    return (
      <div className="animate-fade-in-up flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#5B21B6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mentor Reviews</h1>
        <p className="text-gray-500 mt-1">View feedback from mentors on your startups and reply to their reviews.</p>
      </div>

      {startups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-[#5B21B6]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Mentor Reviews Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Once a mentor reviews one of your startups, you'll see their feedback here and can reply directly.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {startups.map((startup) => {
            const id = startup.startupId || startup._id;
            const review = startup.mentorReview;
            const isExpanded = expandedId === id;
            const hasReplied = !!review.founderReply;

            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div
                  className="p-6 cursor-pointer flex items-start justify-between gap-4"
                  onClick={() => toggleExpand(id)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white font-black text-lg shrink-0">
                      {(startup.startupName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{startup.startupName}</h3>
                        {review.rating && (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${RATING_COLORS[review.rating] || 'bg-gray-100 text-gray-600'}`}>
                            {review.rating}
                          </span>
                        )}
                        {hasReplied ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <CheckCircle size={11} /> Replied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                            <Clock size={11} /> Reply Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Reviewed by <span className="font-semibold text-gray-700">{review.mentorName || 'Mentor'}</span>
                        {review.createdAt && ` · ${new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-700 shrink-0 mt-1">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 pb-6 pt-5 space-y-5">
                    {/* Mentor Feedback */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mentor Feedback</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{review.feedback || 'No detailed feedback provided.'}</p>
                      </div>
                    </div>

                    {/* Startup Idea Snippet */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Startup Idea</p>
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                        <p className="text-sm text-gray-700 italic border-l-2 border-[#5B21B6] pl-3">"{startup.startupIdea}"</p>
                      </div>
                    </div>

                    {/* Founder's Existing Reply */}
                    {hasReplied && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Reply</p>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-sm text-green-800 leading-relaxed">{review.founderReply}</p>
                          {review.founderReplyAt && (
                            <p className="text-xs text-green-600 mt-2 font-medium">
                              Replied on {new Date(review.founderReplyAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        {/* Allow editing reply */}
                        <button
                          onClick={() => setSubmitted(prev => ({ ...prev, [id]: false }))}
                          className="mt-2 text-xs font-medium text-[#5B21B6] hover:underline"
                        >
                          Edit Reply
                        </button>
                      </div>
                    )}

                    {/* Reply Box */}
                    {(!hasReplied || submitted[id] === false) && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <MessageSquare size={13} className="text-[#5B21B6]" />
                          {hasReplied ? 'Update Your Reply' : 'Reply to Mentor'}
                        </label>
                        <textarea
                          value={replyText[id] || (hasReplied ? review.founderReply : '')}
                          onChange={e => setReplyText(prev => ({ ...prev, [id]: e.target.value }))}
                          rows={4}
                          placeholder="Write your response to the mentor's feedback..."
                          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent text-sm resize-none transition-shadow"
                        />
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => handleReply(startup)}
                            disabled={submitting[id] || !(replyText[id] || '').trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                          >
                            {submitting[id] ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send size={15} />
                            )}
                            {hasReplied ? 'Update Reply' : 'Send Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FounderMentorReviews;
