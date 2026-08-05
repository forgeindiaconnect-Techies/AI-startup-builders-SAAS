import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { getStartups, updateStartup, addNotification } from '../../../utils/localStorageHelper';

const MentorFeedback: React.FC = () => {
  const [startups, setStartups] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const all = await getStartups();
      setStartups(all);
    };
    fetchData();
  }, []);

  const pendingClarifications = startups.filter(s => s.mentorReview?.status === 'Clarification Requested');
  const answeredClarifications = startups.filter(s => s.mentorReview?.status === 'Clarification Answered');

  const handleClarificationAction = async (startup: any, action: 'accept' | 'reply') => {
    const id = startup.startupId || startup._id;
    let replyText = '';
    
    if (action === 'reply') {
      const reply = window.prompt('Enter your reply to the founder:');
      if (!reply) return;
      replyText = reply;
    }

    const updated = {
      ...startup,
      mentorReview: { 
        ...startup.mentorReview, 
        status: 'Clarification Answered',
        ...(replyText ? { mentorReply: replyText } : {})
      }
    };
    const saved = await updateStartup(id, updated);
    if (saved) {
      setStartups(prev => prev.map(s => (s.startupId || s._id) === id ? { ...s, mentorReview: updated.mentorReview } : s));
    }

    addNotification({
      id: Date.now(),
      title: 'Clarification Answered',
      message: action === 'reply' 
        ? `Mentor replied to your clarification for ${startup.startupName}: "${replyText}"`
        : `Mentor accepted your clarification for ${startup.startupName}.`,
      type: 'mentor_review',
      time: 'Just now',
      unread: true
    });
    window.alert(action === 'reply' ? 'Reply sent! Founder has been notified.' : 'Clarification accepted! Founder has been notified.');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Given</h1>
        <p className="text-gray-500 mt-1">History of all reviews, notes, and feedback you have provided to startups.</p>
      </div>

      {(pendingClarifications.length > 0 || answeredClarifications.length > 0) && (
        <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-[#5B21B6]" /> Founder Clarifications
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingClarifications.map(startup => (
              <div key={startup.startupId || startup._id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 gap-4 bg-yellow-50/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{startup.startupName}</p>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">Action Required</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Question from founder</p>
                  <p className="text-sm text-gray-800 italic border-l-2 border-yellow-400 pl-3 bg-white p-2 rounded border border-yellow-100">
                    "{startup.mentorReview.clarificationMessage}"
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleClarificationAction(startup, 'accept')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white font-bold rounded-lg text-sm hover:bg-green-600 transition-colors shadow-sm"
                  >
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button 
                    onClick={() => handleClarificationAction(startup, 'reply')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-white font-bold rounded-lg text-sm hover:bg-yellow-600 transition-colors shadow-sm"
                  >
                    <MessageSquare size={16} /> Reply
                  </button>
                </div>
              </div>
            ))}
            {answeredClarifications.map(startup => (
              <div key={startup.startupId || startup._id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{startup.startupName}</p>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">Answered</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Question from founder</p>
                  <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 mb-3">
                    "{startup.mentorReview.clarificationMessage}"
                  </p>
                  {startup.mentorReview.mentorReply && (
                    <div className="ml-4">
                      <p className="text-xs text-[#5B21B6] font-bold mb-1">Your Reply</p>
                      <p className="text-sm text-gray-800 bg-purple-50 p-2 rounded border border-purple-100">
                        "{startup.mentorReview.mentorReply}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorFeedback;
