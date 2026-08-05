import React, { useState, useEffect } from 'react';
import { Star, Clock, ArrowRight, Video, Calendar, MoreVertical, X } from 'lucide-react';
import { getStartups, updateStartup, addNotification } from '../../../utils/localStorageHelper';
import VideoCallModal from '../../../components/shared/VideoCallModal';

const initialSampleMentors: any[] = [];

const FounderMentors: React.FC = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [videoSessions, setVideoSessions] = useState<any[]>([]);
  const [mentorsList, setMentorsList] = useState<any[]>(initialSampleMentors);
  const [selectedMentorModal, setSelectedMentorModal] = useState<any | null>(null);
  const [activeCallRoom, setActiveCallRoom] = useState<string | null>(null);
  const [ratingModalStartup, setRatingModalStartup] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    const fetchStartups = async () => {
      const all = await getStartups();
      setStartups(all);
    };
    fetchStartups();

    const storedSessions = localStorage.getItem('video_sessions');
    if (storedSessions) {
      setVideoSessions(JSON.parse(storedSessions));
    }

    const loadMentors = () => {
      try {
        const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
        if (stored) {
          const parsed = JSON.parse(stored);
          initialSampleMentors.forEach(sample => {
            if (!parsed.some((m: any) => m.id === sample.id || m.name === sample.name)) {
              parsed.push(sample);
            }
          });
          setMentorsList(parsed);
          localStorage.setItem('ai_startup_builder_mentor_profiles', JSON.stringify(parsed));
        } else {
          localStorage.setItem('ai_startup_builder_mentor_profiles', JSON.stringify(initialSampleMentors));
          setMentorsList(initialSampleMentors);
        }
      } catch (e) {
        setMentorsList(initialSampleMentors);
      }
    };

    loadMentors();
    window.addEventListener('storage', loadMentors);
    window.addEventListener('mentor_profile_updated', loadMentors);
    return () => {
      window.removeEventListener('storage', loadMentors);
      window.removeEventListener('mentor_profile_updated', loadMentors);
    };
  }, []);

  const handleBookCall = (mentorName: string, startupName: string) => {
    const newSession = {
      id: Date.now(),
      startup: startupName,
      founder: '',
      time: 'Tomorrow, 11:00 AM',
      duration: '30 min',
      status: 'upcoming',
      roomName: `AIStartupBuilder-${startupName.replace(/\s+/g, '')}`
    };
    
    const updatedSessions = [newSession, ...videoSessions];
    setVideoSessions(updatedSessions);
    localStorage.setItem('video_sessions', JSON.stringify(updatedSessions));
    window.alert(`Successfully booked a call with ${mentorName} for tomorrow at 11:00 AM!`);
  };

  const handleFeedbackAction = async (startup: any, action: 'accept' | 'reject' | 'clarify') => {
    const id = startup.startupId || startup._id;
    if (action === 'accept') {
      const updated = {
        ...startup,
        mentorReview: { ...startup.mentorReview, status: 'Accepted' }
      };
      await updateStartup(id, updated);
      setStartups(prev => prev.map(s => (s.startupId || s._id) === id ? { ...s, mentorReview: updated.mentorReview } : s));

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
      await updateStartup(id, updated);
      setStartups(prev => prev.map(s => (s.startupId || s._id) === id ? { ...s, mentorReview: updated.mentorReview } : s));

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
      await updateStartup(id, updated);
      setStartups(prev => prev.map(s => (s.startupId || s._id) === id ? { ...s, mentorReview: updated.mentorReview } : s));

      addNotification({
        id: Date.now(),
        title: 'Clarification Requested',
        message: `You requested clarification from mentor on ${startup.startupName}.`,
        type: 'mentor_review',
        time: 'Just now',
        unread: true
      });
      window.alert('Clarification request sent to mentor!');
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingModalStartup || rating === 0) return;
    const id = ratingModalStartup.startupId || ratingModalStartup._id;
    
    const updated = {
      ...ratingModalStartup,
      mentorReview: {
        ...ratingModalStartup.mentorReview,
        founderRating: rating,
        founderReview: reviewText,
        founderReviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    };
    
    await updateStartup(id, updated);
    setStartups(prev => prev.map(s => (s.startupId || s._id) === id ? { ...s, mentorReview: updated.mentorReview } : s));
    
    addNotification({
      id: Date.now(),
      title: 'Review Submitted',
      message: `Your rating and review for ${ratingModalStartup.mentorReview.mentorName} has been submitted.`,
      type: 'mentor_review',
      time: 'Just now',
      unread: true
    });
    
    setRatingModalStartup(null);
    setRating(0);
    setReviewText('');
    window.alert('Thank you for submitting your review!');
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
                <div key={startup.startupId || startup._id} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
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
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 justify-between items-center">
                    <div className="flex flex-wrap gap-2">
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
                      {!startup.mentorReview.founderRating ? (
                        <button 
                          onClick={() => setRatingModalStartup(startup)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] border border-purple-200 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Star size={12} className="fill-[#5B21B6]" /> Rate & Review
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-500">
                           <Star size={12} className="fill-yellow-400 text-yellow-400" /> Rated {startup.mentorReview.founderRating}/5
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleBookCall(startup.mentorReview.mentorName, startup.startupName)}
                      className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-md text-xs font-bold transition-colors ml-auto flex items-center gap-2"
                    >
                      <Calendar size={14} /> Book 1:1 Call
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
            {mentorsList.map((m: any, idx: number) => (
              <div key={m.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                      {m.name ? m.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{m.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#5B21B6] border border-purple-100">
                        {m.category || 'SaaS'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.availability === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                        m.availability === 'Busy' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {m.availability || 'Available'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{m.expertise || 'SaaS, Go-to-Market, Fundraising'}</p>
                    <div className="flex items-center gap-3 text-xs text-yellow-500 font-medium mt-1">
                      <span className="flex items-center">
                        <Star size={12} className="fill-yellow-500 mr-1" /> {m.rating || 4.9} ({m.reviewsCount || 48} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMentorModal(m)}
                  className="px-3.5 py-2 text-[#5B21B6] bg-indigo-50 hover:bg-indigo-100 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                >
                  <span>View Public Profile</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming & Past Sessions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 mt-8">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-[#5B21B6]" /> Upcoming & Past Sessions</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {videoSessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No scheduled sessions yet. Book a call with a mentor!</div>
          ) : (
            videoSessions.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.status === 'upcoming' ? 'bg-purple-100 text-[#5B21B6]' : 'bg-gray-100 text-gray-400'}`}>
                    <Video size={20} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{s.startup}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                      <span className="flex items-center gap-1 text-gray-600"><Calendar size={14} /> {s.time}</span>
                      <span className="flex items-center gap-1 text-gray-600"><Clock size={14} /> {s.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.status === 'upcoming' ? (
                    <button 
                      onClick={() => setActiveCallRoom(s.roomName)}
                      className="px-4 py-2 bg-[#5B21B6] text-white font-bold rounded-lg text-sm hover:bg-[#7C3AED] transition-colors shadow flex items-center gap-2"
                    >
                      <Video size={16} /> Join Call
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold rounded-lg text-xs">Completed</span>
                  )}
                  <button 
                    onClick={() => window.alert('Opening session options...')}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Video Call Modal */}
      {activeCallRoom && (
        <VideoCallModal 
          roomName={activeCallRoom} 
          onClose={() => setActiveCallRoom(null)} 
        />
      )}

      {/* Rating Modal */}
      {ratingModalStartup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Rate Mentor</h2>
              <button onClick={() => { setRatingModalStartup(null); setRating(0); setReviewText(''); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">How was your experience with <strong>{ratingModalStartup.mentorReview.mentorName}</strong>?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                    <Star size={32} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'} />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Write a review (Optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none resize-none h-24 text-sm"
                  placeholder="Share your thoughts about the feedback..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setRatingModalStartup(null); setRating(0); setReviewText(''); }}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={rating === 0}
                  className="px-5 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Public Mentor Profile Modal (No Email / Phone visible to Founder) */}
      {selectedMentorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                {selectedMentorModal.photoUrl ? (
                  <img src={selectedMentorModal.photoUrl} alt={selectedMentorModal.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                    {selectedMentorModal.name ? selectedMentorModal.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{selectedMentorModal.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#5B21B6] border border-purple-100">
                      {selectedMentorModal.category || 'SaaS'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedMentorModal.availability === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                      selectedMentorModal.availability === 'Busy' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {selectedMentorModal.availability || 'Available'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedMentorModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Bio & Investment Thesis</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedMentorModal.bio || "Serial entrepreneur and specialist advisor helping founders find product-market fit and scale."}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Areas of Expertise</h4>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedMentorModal.expertise || "SaaS, Go-to-Market, Fundraising"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div>
                  <span className="text-gray-500">LinkedIn: </span>
                  <a href={`https://${selectedMentorModal.linkedin || 'linkedin.com'}`} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline">
                    {selectedMentorModal.linkedin || 'linkedin.com/in/mentor'}
                  </a>
                </div>
                <div className="flex items-center text-yellow-500 font-bold">
                  <Star size={14} className="fill-yellow-500 mr-1" /> {selectedMentorModal.rating || 4.9} ({selectedMentorModal.reviewsCount || 48} reviews)
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedMentorModal(null)}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const name = selectedMentorModal.name;
                    setSelectedMentorModal(null);
                    handleBookCall(name, "My AI Startup");
                  }}
                  className="px-5 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95] transition-colors text-sm shadow flex items-center gap-2"
                >
                  <span>Book 1:1 Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderMentors;
