import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, CheckCircle, Clock, ChevronDown, ChevronUp, Star, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { getStartups, updateStartup, addNotification } from '../../../utils/localStorageHelper';
import { getMyBookings, getMySubmittedReviews, submitSessionReview } from '../../../utils/mentorApi';
import { useAuth } from '../../../context/AuthContext';

const RATING_COLORS: Record<string, string> = {
  Good: 'bg-green-100 text-green-700 border border-green-200',
  Average: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Bad: 'bg-red-100 text-red-700 border border-red-200',
};

const FounderMentorReviews: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'session_reviews' | 'output_reviews'>('session_reviews');
  const [startups, setStartups] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Review Form state per booking
  const [selectedStars, setSelectedStars] = useState<Record<string, number>>({});
  const [reviewInputText, setReviewInputText] = useState<Record<string, string>>({});
  const [submittingReview, setSubmittingReview] = useState<Record<string, boolean>>({});

  // Reply state
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const chatEndRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [allStartups, myBookings] = await Promise.all([
        getStartups(),
        getMyBookings().catch(() => []),
      ]);

      // Reviewed startups
      const reviewed = allStartups.filter((s: any) => s.mentorReview && (s.mentorReview.feedback || s.mentorFeedback));
      setStartups(reviewed);

      // Completed bookings for rating
      const completed = (Array.isArray(myBookings) ? myBookings : []).filter((b: any) => b.status === 'completed');
      setCompletedBookings(completed);

      // Load saved user reviews from the server so they sync across devices
      try {
        const submitted = await getMySubmittedReviews().catch(() => []);
        const map: Record<string, any> = {};
        (Array.isArray(submitted) ? submitted : []).forEach((r: any) => {
          if (r.bookingId) map[r.bookingId] = r;
        });
        setUserReviews(map);
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewSubmit = async (booking: any) => {
    const bId = booking._id || booking.id;
    const stars = selectedStars[bId] || 5;
    const text = (reviewInputText[bId] || '').trim();
    if (!user) return;

    setSubmittingReview(prev => ({ ...prev, [bId]: true }));

    const mentorId = typeof booking.mentorId === 'object' ? booking.mentorId?._id : booking.mentorId;
    const mentorName = typeof booking.mentorId === 'object' ? booking.mentorId?.fullName : (booking.mentorName || 'Mentor');
    const startupName = typeof booking.startupId === 'object' ? booking.startupId?.startupName : (booking.startupName || 'Startup');

    // Save to the server so it shows up on the mentor's dashboard
    let savedReview: any = null;
    try {
      savedReview = await submitSessionReview(bId, { rating: stars, reviewText: text });
    } catch (e: any) {
      console.error(e);
      setSubmittingReview(prev => ({ ...prev, [bId]: false }));
      window.alert('❌ Failed to submit review. Please try again.');
      return;
    }

    const reviewObj = {
      id: savedReview?._id || `rev_${Date.now()}`,
      bookingId: savedReview?.bookingId || bId,
      mentorId: savedReview?.mentorId || mentorId || 'mentor',
      mentorName,
      founderId: savedReview?.founderId || user.id,
      founderName: user.fullName || 'Founder',
      startupName: savedReview?.startupName || startupName,
      topic: savedReview?.topic || booking.topic || 'Mentoring Session',
      rating: savedReview?.rating || stars,
      reviewText: savedReview?.reviewText || text,
      date: savedReview?.date || booking.date || new Date().toISOString().split('T')[0],
      createdAt: savedReview?.createdAt || new Date().toISOString(),
    };

    setUserReviews(prev => ({ ...prev, [bId]: reviewObj }));

    // 1. Dispatch Notification to Mentor
    await addNotification({
      id: `notif_mentor_rev_${Date.now()}`,
      userId: mentorId || 'mentor',
      title: 'New Session Review & Rating Received',
      message: `${user.fullName || 'Founder'} left a ${stars}-Star review for session on "${startupName}": "${text || 'Great session!'}"`,
      type: 'mentor_review',
      actionUrl: '/dashboard/mentor/reviews',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // 2. Dispatch Notification to Admin
    await addNotification({
      id: `notif_admin_rev_${Date.now()}`,
      userId: 'admin',
      title: 'Founder Submitted Session Review',
      message: `Founder ${user.fullName || 'Founder'} rated Mentor ${mentorName} ${stars}/5 Stars for startup "${startupName}".`,
      type: 'admin_review',
      actionUrl: '/dashboard/admin/notifications',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setSubmittingReview(prev => ({ ...prev, [bId]: false }));
    window.alert('✅ Thank you! Your review and rating have been submitted successfully.');
  };

  const getStartupMessages = (startup: any) => {
    const list = [...(startup.mentorReview?.messages || [])];
    if (list.length === 0 && (startup.mentorReview?.feedback || startup.mentorFeedback)) {
      list.push({
        id: 'msg_initial',
        senderId: startup.mentorReview?.mentorId || 'mentor',
        senderName: startup.mentorReview?.mentorName || 'Mentor',
        senderRole: 'Mentor',
        message: startup.mentorReview?.feedback || startup.mentorFeedback,
        createdAt: startup.mentorReview?.createdAt || startup.createdAt || new Date().toISOString()
      });
    }
    if (startup.mentorReview?.founderReply && !list.some(m => m.senderRole === 'Founder')) {
      list.push({
        id: 'msg_founder_reply',
        senderId: startup.founderId || startup.userId || 'founder',
        senderName: startup.founderName || 'Founder',
        senderRole: 'Founder',
        message: startup.mentorReview.founderReply,
        createdAt: startup.mentorReview.founderReplyAt || startup.updatedAt || new Date().toISOString()
      });
    }
    return list;
  };

  const handleSendReply = async (startup: any) => {
    const id = startup.startupId || startup._id;
    const reply = (replyText[id] || '').trim();
    if (!reply || !user) return;

    setSubmitting(prev => ({ ...prev, [id]: true }));

    const currentMessages = getStartupMessages(startup);

    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.fullName || 'Founder',
      senderRole: 'Founder',
      message: reply,
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...currentMessages, newMessage];
    const mentorId = startup.mentorReview?.mentorId;

    const updatedReview = {
      ...startup.mentorReview,
      founderReply: startup.mentorReview?.founderReply || reply,
      founderReplyAt: startup.mentorReview?.founderReplyAt || new Date().toISOString(),
      messages: updatedMessages
    };

    const updated = await updateStartup(id, { ...startup, mentorReview: updatedReview });
    if (updated) {
      setStartups(prev =>
        prev.map(s => (s.startupId || s._id) === id ? { ...s, mentorReview: updatedReview } : s)
      );
    }

    addNotification({
      id: `notif_reply_${Date.now()}`,
      userId: mentorId || 'mentor',
      title: 'Founder Replied to Your Review',
      message: `${user.fullName || 'The founder'} replied on "${startup.startupName}": "${reply}"`,
      type: 'mentor_reply',
      isRead: false,
      actionUrl: '/dashboard/mentor/reviews',
      createdAt: new Date().toISOString(),
    });

    setReplyText(prev => ({ ...prev, [id]: '' }));
    setSubmitting(prev => ({ ...prev, [id]: false }));

    setTimeout(() => {
      chatEndRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return iso; }
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
        <h1 className="text-2xl font-bold text-gray-900">Mentor Reviews & Feedback</h1>
        <p className="text-gray-500 mt-1">Rate completed mentoring sessions and review feedback from your mentors.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('session_reviews')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'session_reviews'
              ? 'border-[#5B21B6] text-[#5B21B6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star size={16} /> Rate Completed Sessions ({completedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('output_reviews')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'output_reviews'
              ? 'border-[#5B21B6] text-[#5B21B6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={16} /> Startup Output Reviews ({startups.length})
        </button>
      </div>

      {/* TAB 1: Rate & Review Completed Sessions */}
      {activeTab === 'session_reviews' && (
        <div className="space-y-6">
          {completedBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Award size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Completed Sessions Yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Once a mentor completes a 1:1 session with you, you can rate the session and write your review here.
              </p>
            </div>
          ) : (
            completedBookings.map((booking) => {
              const bId = booking._id || booking.id;
              const mentorName = typeof booking.mentorId === 'object' ? booking.mentorId?.fullName : (booking.mentorName || 'Mentor');
              const startupName = typeof booking.startupId === 'object' ? booking.startupId?.startupName : (booking.startupName || 'Startup');
              const existingReview = userReviews[bId];
              const currentStars = selectedStars[bId] || (existingReview?.rating || 5);

              return (
                <div key={bId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg text-gray-900">{mentorName}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Session Completed
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        <span className="font-semibold text-gray-700">Startup:</span> {startupName} • <span className="font-semibold text-gray-700">Topic:</span> {booking.topic}
                      </p>
                    </div>

                    {existingReview ? (
                      <span className="px-3 py-1 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-500" /> Review Submitted
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Clock size={14} /> Pending Your Review
                      </span>
                    )}
                  </div>

                  {existingReview ? (
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/60 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600">Your Rating:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={16} className={s <= existingReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-900">({existingReview.rating}/5 Stars)</span>
                      </div>
                      {existingReview.reviewText && (
                        <p className="text-sm text-gray-700 leading-relaxed italic bg-white p-3 rounded-lg border border-purple-100">
                          "{existingReview.reviewText}"
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400">Submitted on {formatDate(existingReview.createdAt)}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Give Rating & Feedback for Mentor</p>

                      {/* Interactive Star Rating */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Rating:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSelectedStars(prev => ({ ...prev, [bId]: star }))}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                size={22}
                                className={star <= currentStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-extrabold text-[#5B21B6] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          {currentStars} Stars
                        </span>
                      </div>

                      <textarea
                        value={reviewInputText[bId] || ''}
                        onChange={(e) => setReviewInputText(prev => ({ ...prev, [bId]: e.target.value }))}
                        placeholder="Write feedback about your meeting with mentor (guidance, clarity, support)..."
                        rows={3}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] transition-all resize-none"
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleReviewSubmit(booking)}
                          disabled={submittingReview[bId]}
                          className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {submittingReview[bId] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send size={15} />
                          )}
                          Submit Rating & Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Startup Output Reviews */}
      {activeTab === 'output_reviews' && (
        <div className="space-y-5">
          {startups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-[#5B21B6]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Startup Reviews Yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Once a mentor reviews your startup plan output, their feedback and recommendations will appear here.
              </p>
            </div>
          ) : (
            startups.map((startup) => {
              const id = startup.startupId || startup._id;
              const review = startup.mentorReview;
              const isExpanded = expandedId === id;
              const mentorName = review?.mentorName || 'Mentor';
              const convMessages = getStartupMessages(startup);

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
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
                        </div>
                        <p className="text-sm text-gray-500">
                          Reviewed by <span className="font-semibold text-gray-700">{mentorName}</span>
                          {review.createdAt && ` · ${formatDate(review.createdAt)}`}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-700 shrink-0 mt-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-6 pb-6 pt-5 space-y-5">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mentor Feedback</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {review.feedback || startup.mentorFeedback || 'No detailed feedback provided.'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MessageSquare size={13} className="text-[#5B21B6]" />
                          Conversation with {mentorName}
                        </p>

                        <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl overflow-hidden">
                          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                            {convMessages.map((m, idx) => {
                              const isFounder = m.senderRole === 'Founder';
                              return (
                                <div key={m.id || idx} className={`flex items-start gap-3 ${isFounder ? 'justify-end' : ''}`}>
                                  {!isFounder && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                      {(m.senderName || 'M').charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className={`flex-1 flex flex-col ${isFounder ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 mb-1 ${isFounder ? 'flex-row-reverse' : ''}`}>
                                      <span className="text-xs font-bold text-gray-700">{isFounder ? 'You' : m.senderName}</span>
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isFounder ? 'text-amber-500' : 'text-purple-500'}`}>
                                        {isFounder ? 'Founder' : 'Mentor'}
                                      </span>
                                      <span className="text-[10px] text-gray-400">{formatTime(m.createdAt)}</span>
                                    </div>
                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                      isFounder
                                        ? 'bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-tr-sm'
                                        : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
                                    }`}>
                                      {m.message.replace(/^\[Re: [^\]]+\] /, '').replace(/^\[Review for [^\]]+\] /, '')}
                                    </div>
                                  </div>
                                  {isFounder && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#FBBF24] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                      {(user?.fullName || 'Y').charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <div ref={el => { chatEndRefs.current[id] = el; }} />
                          </div>

                          <div className="border-t border-gray-200 p-4 bg-white flex gap-3 items-end">
                            <div className="flex-1">
                              <textarea
                                value={replyText[id] || ''}
                                onChange={e => setReplyText(prev => ({ ...prev, [id]: e.target.value }))}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendReply(startup);
                                  }
                                }}
                                rows={2}
                                placeholder={`Reply to ${mentorName}... (Enter to send)`}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-all"
                              />
                            </div>
                            <button
                              onClick={() => handleSendReply(startup)}
                              disabled={submitting[id] || !(replyText[id] || '').trim()}
                              className="flex items-center gap-2 px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-sm flex-shrink-0"
                            >
                              {submitting[id] ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Send size={15} />
                              )}
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default FounderMentorReviews;
