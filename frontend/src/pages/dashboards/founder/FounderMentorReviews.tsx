import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MessageSquare, Send, CheckCircle, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';
import { getStartups, updateStartup, addNotification } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';

const RATING_COLORS: Record<string, string> = {
  Good: 'bg-green-100 text-green-700 border border-green-200',
  Average: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Bad: 'bg-red-100 text-red-700 border border-red-200',
};

const FounderMentorReviews: React.FC = () => {
  const { user } = useAuth();
  const { conversations, messages, getOrCreateConversation, sendMessage } = useChat();
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const chatEndRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const all = await getStartups();
      // Show startups that have a mentor review
      const reviewed = all.filter((s: any) => s.mentorReview && (s.mentorReview.feedback || s.mentorFeedback));
      setStartups(reviewed);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Resolve startup conversation messages from the database-backed mentorReview field
  const getStartupMessages = (startup: any) => {
    const list = [...(startup.mentorReview?.messages || [])];
    
    // Seed initial feedback if not present in messages list
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

    // Seed founder's initial reply if not present in messages list
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
    const mentorName = startup.mentorReview?.mentorName || 'Mentor';

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

    // Notify mentor
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

    // Scroll to bottom of chat
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
        <h1 className="text-2xl font-bold text-gray-900">Mentor Reviews</h1>
        <p className="text-gray-500 mt-1">View feedback from mentors and continue the conversation directly here.</p>
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
            const mentorName = review?.mentorName || 'Mentor';
            const convMessages = getStartupMessages(startup);

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
                        {hasReplied || convMessages.some(m => m.senderId === user?.id) ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <CheckCircle size={11} /> Replied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                            <Clock size={11} /> Awaiting Reply
                          </span>
                        )}
                        {convMessages.length > 0 && (
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                            {convMessages.length} message{convMessages.length > 1 ? 's' : ''}
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

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 pb-6 pt-5 space-y-5">
                    {/* Mentor Initial Feedback */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mentor Feedback</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.feedback || startup.mentorFeedback || 'No detailed feedback provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Startup Idea */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Startup Idea</p>
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                        <p className="text-sm text-gray-700 italic border-l-2 border-[#5B21B6] pl-3">"{startup.startupIdea}"</p>
                      </div>
                    </div>

                    {/* ── Conversation Thread ── */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MessageSquare size={13} className="text-[#5B21B6]" />
                        Conversation with {mentorName}
                      </p>

                      {/* Message thread */}
                      <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl overflow-hidden">
                        {/* Messages area */}
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

                        {/* Reply Input */}
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
          })}
        </div>
      )}
    </div>
  );
};

export default FounderMentorReviews;
