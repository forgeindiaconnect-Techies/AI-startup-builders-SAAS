import React, { useState, useEffect } from 'react';
import { Star, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addNotification } from '../../../utils/localStorageHelper';

const FounderMentors: React.FC = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const keys = Object.keys(localStorage);
    const locals: any[] = [];
    keys.forEach(key => {
      if (key.startsWith('startup_')) {
        try {
          locals.push(JSON.parse(localStorage.getItem(key) || ''));
        } catch (e) {}
      }
    });
    locals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setStartups(locals);
  }, []);

  const handleFeedbackAction = (startup: any, action: 'accept' | 'reject' | 'clarify') => {
    if (action === 'accept') {
      const updated = {
        ...startup,
        mentorReview: { ...startup.mentorReview, status: 'Accepted' }
      };
      localStorage.setItem(`startup_${updated.startupId}`, JSON.stringify(updated));
      setStartups(prev => prev.map(s => s.startupId === updated.startupId ? updated : s));

      addNotification({
        id: Date.now(),
        title: 'Feedback Accepted',
        message: `Founder accepted feedback for ${startup.startupName}.`,
        type: 'mentor_review',
        time: 'Just now',
        unread: true
      });
      window.alert('Feedback accepted! Mentor and Admin have been notified.');
    } else if (action === 'reject') {
      const updated = {
        ...startup,
        mentorReview: { ...startup.mentorReview, status: 'Rejected' }
      };
      localStorage.setItem(`startup_${updated.startupId}`, JSON.stringify(updated));
      setStartups(prev => prev.map(s => s.startupId === updated.startupId ? updated : s));

      addNotification({
        id: Date.now(),
        title: 'Feedback Rejected',
        message: `Founder rejected feedback for ${startup.startupName}.`,
        type: 'mentor_review',
        time: 'Just now',
        unread: true
      });
      window.alert('Feedback rejected. Mentor has been notified.');
    } else if (action === 'clarify') {
      const msg = window.prompt('Enter your clarification question for the mentor:');
      if (!msg) return;

      const updated = {
        ...startup,
        mentorReview: { 
          ...startup.mentorReview, 
          status: 'Clarification Requested',
          clarificationMessage: msg
        }
      };
      localStorage.setItem(`startup_${updated.startupId}`, JSON.stringify(updated));
      setStartups(prev => prev.map(s => s.startupId === updated.startupId ? updated : s));

      addNotification({
        id: Date.now(),
        title: 'Clarification Requested',
        message: `Founder asked for clarification on ${startup.startupName}: "${msg}"`,
        type: 'mentor_review',
        time: 'Just now',
        unread: true
      });
      window.alert('Clarification request sent to mentor session!');
    }
  };

  const reviewedStartups = startups.filter(s => s.mentorReview);
  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mentor Connections</h1>
        <p className="text-gray-500 mt-1">Get expert feedback, book calls, and review mentor comments.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Active Reviews */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Feedback</h2>
          
          <div className="space-y-6">
            {reviewedStartups.length === 0 ? (
              <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 text-center text-gray-500 text-sm">
                No mentor feedback received yet.
              </div>
            ) : (
              reviewedStartups.map(startup => (
                <div key={startup.startupId} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {startup.mentorReview.mentorName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{startup.mentorReview.mentorName}</p>
                        <p className="text-xs text-gray-500">Mentor Rating: <span className={`font-semibold ${startup.mentorReview.rating === 'Good' ? 'text-green-600' : startup.mentorReview.rating === 'Average' ? 'text-yellow-600' : 'text-red-600'}`}>{startup.mentorReview.rating}</span></p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      startup.mentorReview.status === 'Accepted' ? 'bg-green-100 text-green-700' : 
                      startup.mentorReview.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      startup.mentorReview.status === 'Clarification Requested' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {startup.mentorReview.status || 'Pending Review Action'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-800 mb-2">{startup.startupName}</h4>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2 italic border-l-4 border-[#5B21B6] pl-3 py-1 bg-gray-50">
                    "{startup.mentorReview.feedback}"
                  </p>

                  {startup.mentorReview.clarificationMessage && (
                    <div className="mt-4 mb-4 space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 mb-1">Your Clarification Request:</p>
                        <p className="text-sm text-gray-800">"{startup.mentorReview.clarificationMessage}"</p>
                      </div>
                      
                      {startup.mentorReview.mentorReply && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 shadow-sm ml-4 relative">
                          <div className="absolute top-4 -left-4 w-4 border-t-2 border-purple-200"></div>
                          <div className="absolute top-0 -left-4 h-4 border-l-2 border-purple-200"></div>
                          <p className="text-xs font-bold text-[#5B21B6] mb-1">Mentor's Reply:</p>
                          <p className="text-sm text-purple-900">"{startup.mentorReview.mentorReply}"</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => alert(`Full Review:\n\n${startup.mentorReview.feedback}`)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition-colors"
                    >
                      Read Full Review
                    </button>
                    {!startup.mentorReview.status && (
                      <>
                        <button 
                          onClick={() => handleFeedbackAction(startup, 'accept')}
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-md text-xs font-semibold transition-colors"
                        >
                          Accept Suggestion
                        </button>
                        <button 
                          onClick={() => handleFeedbackAction(startup, 'reject')}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleFeedbackAction(startup, 'clarify')}
                          className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-md text-xs font-semibold transition-colors"
                        >
                          Ask Clarification
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => { window.alert('Navigating to mentor chat...'); navigate('/dashboard/founder/inbox'); }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-semibold transition-colors"
                    >
                      Message Mentor
                    </button>
                    <button 
                      onClick={() => alert(`Booking 1:1 call with ${startup.mentorReview.mentorName}... Integration coming soon!`)}
                      className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-md text-xs font-semibold transition-colors ml-auto"
                    >
                      Book 1:1 Call
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suggested Mentors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">AI Suggested Mentors</h2>
            <button 
              onClick={() => alert("Loading Mentor Directory...")}
              className="text-sm font-medium text-[#5B21B6] hover:underline"
            >
              Browse Directory
            </button>
          </div>

          <div className="space-y-4">
            {/* Mentor Card */}
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <img src="https://ui-avatars.com/api/?name=Sarah+Chen&background=F3F4F6&color=1F2937" alt="Sarah Chen" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-bold text-gray-900">Sarah Chen</p>
                  <p className="text-xs text-gray-500 mb-1">SaaS Pricing Expert</p>
                  <div className="flex items-center text-xs text-yellow-500 font-medium">
                    <Star size={12} className="fill-yellow-500 mr-1" /> 4.9 (42 reviews)
                  </div>
                </div>
              </div>
              <button 
                onClick={() => alert("Viewing Sarah Chen's profile...")}
                className="p-2 text-[#5B21B6] bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            
            {/* Mentor Card */}
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <img src="https://ui-avatars.com/api/?name=David+Kim&background=F3F4F6&color=1F2937" alt="David Kim" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-bold text-gray-900">David Kim</p>
                  <p className="text-xs text-gray-500 mb-1">Supply Chain Specialist</p>
                  <div className="flex items-center text-xs text-yellow-500 font-medium">
                    <Star size={12} className="fill-yellow-500 mr-1" /> 4.8 (18 reviews)
                  </div>
                </div>
              </div>
              <button 
                onClick={() => alert("Viewing David Kim's profile...")}
                className="p-2 text-[#5B21B6] bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderMentors;
