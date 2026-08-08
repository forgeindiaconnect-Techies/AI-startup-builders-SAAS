import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, X, MessageSquare, Send, ArrowLeft, CheckCircle, ChevronRight, Users, UserRound, Star } from 'lucide-react';
import SharedStartupDetailsTabs from '../../../components/shared/SharedStartupDetailsTabs';
import { getDocuments, addNotification, getStartups, updateStartup } from '../../../utils/localStorageHelper';
import { getMentorBookings } from '../../../utils/mentorApi';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';

const MentorReviews: React.FC = () => {
  const { user, getAllUsers } = useAuth();
  const { getOrCreateConversation, sendMessage } = useChat();
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedFounder, setSelectedFounder] = useState<any>(null);
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'review' | 'report' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<'Good' | 'Average' | 'Bad' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [bks, starts, docs] = await Promise.all([
        getMentorBookings().catch(() => []),
        getStartups(),
        getDocuments(),
      ]);
      setBookings(Array.isArray(bks) ? bks : []);
      setAllStartups(starts);
      setDocuments(docs);
    };
    fetchData();
  }, []);

  const allUsers = getAllUsers();

  // Only founders who selected/booked this mentor appear here.
  const founders = useMemo(() => {
    const map = new Map<string, any>();
    (bookings || []).forEach((b) => {
      if (b.status === 'cancelled') return;
      const f = b.userId;
      const sp = b.startupId;
      if (!f || !f._id || !sp) return;
      const fid = f._id.toString();
      const sid = (sp._id || sp).toString();
      if (!map.has(fid)) {
        const userRec = allUsers.find((u: any) => u.id === fid || u._id === fid);
        map.set(fid, {
          id: fid,
          fullName: f.fullName || userRec?.fullName || 'Founder',
          email: userRec?.email || f.email || '',
          startupsById: new Map(),
        });
      }
      const entry = map.get(fid);
      if (entry.startupsById.has(sid)) return;
      const full = allStartups.find((s: any) => String(s.startupId || s._id) === sid);
      entry.startupsById.set(sid, full || { ...sp, startupId: sid, id: sid });
    });
    return Array.from(map.values()).map((entry) => ({
      ...entry,
      startups: Array.from(entry.startupsById.values()),
    }));
  }, [bookings, allStartups, allUsers]);

  const filteredFounders = founders.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.fullName?.toLowerCase().includes(q) || (f.email || '').toLowerCase().includes(q);
  });

  const visibleStartups = selectedFounder ? selectedFounder.startups.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (s.startupName || '').toLowerCase().includes(q) || (s.startupIdea || '').toLowerCase().includes(q);
  }) : [];

  const handleReviewSubmit = () => {
    if (!selectedStartup || !rating) return;
    if (rating !== 'Good' && !feedback) return;

    const review = {
      id: `review_${Date.now()}`,
      startupId: selectedStartup.startupId,
      mentorId: user?.id || '',
      mentorName: user?.fullName || '',
      rating,
      feedback,
      createdAt: new Date().toISOString()
    };

    const updated = { 
      ...selectedStartup, 
      status: 'reviewed', 
      mentorFeedback: feedback,
      mentorReview: review
    };
    
    // Call async update via API wrapper
    updateStartup(updated.startupId || updated._id, updated).then(() => {
      setAllStartups(prev => prev.map(s => (s.startupId || s._id) === (updated.startupId || updated._id) ? updated : s));
    });

    // Send the feedback to the founder as a chat message so it shows up
    // in the founder's Mentors page chat widget.
    const founderId = typeof selectedStartup.founderId === 'string'
      ? selectedStartup.founderId
      : selectedStartup.founderId?._id;
    const founderName = selectedStartup.founderName || 'Founder';
    if (founderId && user) {
      const conv = getOrCreateConversation([
        { id: user.id, name: user.fullName || 'Mentor', role: 'mentor', avatar: (user.fullName || 'M').charAt(0).toUpperCase() },
        { id: founderId, name: founderName, role: 'founder', avatar: (founderName || 'F').charAt(0).toUpperCase() },
      ]);
      const reviewText = feedback.trim()
        ? feedback.trim()
        : `Rating: ${rating}`;
      sendMessage(
        conv.id,
        user.id,
        user.fullName || 'Mentor',
        'Mentor',
        founderId,
        founderName,
        'Founder',
        `[Review for ${selectedStartup.startupName}] ${reviewText}`
      );
    }
    
    addNotification({
      id: `notif_review_${Date.now()}`,
      userId: founderId || 'all',
      title: 'New Mentor Review',
      message: `${user?.fullName || ''} provided a review for "${updated.startupName}": "${feedback || `Rating: ${rating}`}"`,
      type: 'mentor_review',
      actionUrl: '/dashboard/founder/mentor-reviews',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setSelectedStartup(null);
    setModalMode(null);
    setFeedback('');
    setRating(null);
    window.alert('Feedback submitted successfully!');
  };

  const renderStartupCard = (startup: any, idx: number) => (
    <div key={`${startup.startupId || startup._id || idx}`} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{startup.startupName}</h3>
            {startup.status !== 'reviewed' && <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Action Required</span>}
            {startup.mentorReview?.rating && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                startup.mentorReview.rating === 'Good' ? 'bg-green-100 text-green-700 border-green-200' :
                startup.mentorReview.rating === 'Average' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-red-100 text-red-700 border-red-200'
              }`}>{startup.mentorReview.rating}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">{startup.startupIdea}</p>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              <span className="font-medium">{startup.aiGenerated?.ideaAnalysis?.businessModel || 'Startup'}</span>
            </div>
            {startup.status === 'generated' && (
              <div className="flex items-center text-gray-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                <span className="font-bold mr-1 text-purple-700">AI Score:</span> 
                <span className="font-bold">{startup.aiGenerated?.aiReport?.investmentReadinessScore || '85'}/100</span>
              </div>
            )}
            <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 font-medium">
              <Clock size={14} className="mr-1.5" />
              Due in 2 days
            </div>
          </div>

          {/* Show Founder Reply if exists */}
          {startup.mentorReview?.founderReply && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Founder's Reply</span>
              </div>
              <p className="text-sm text-green-800 leading-relaxed">{startup.mentorReview.founderReply}</p>
              {startup.mentorReview.founderReplyAt && (
                <p className="text-xs text-green-600 mt-1">
                  {new Date(startup.mentorReview.founderReplyAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-auto flex flex-col gap-2 shrink-0 md:pl-4">
          <button 
            onClick={() => { setSelectedStartup(startup); setModalMode('review'); }}
            className="w-full md:w-40 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            {startup.mentorReview?.feedback ? 'Update Review' : 'Review Startup'}
          </button>
          <button 
            onClick={() => { setSelectedStartup(startup); setModalMode('report'); }}
            className="w-full md:w-40 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            View AI Report
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Startups to Review</h1>
        <p className="text-gray-500 mt-1">Only founders who selected you as their mentor appear here. Select a founder to review their startup output.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={selectedFounder ? "Search startups..." : "Search founders..."} 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Founders List (selected mentor's founders) */}
      {!selectedFounder ? (
        founders.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            <Users size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-700 mb-1">No founders selected you yet</p>
            <p className="text-sm">When a founder books you as their mentor, their startup will appear here for review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFounders.map((f) => (
              <button
                key={f.id}
                onClick={() => { setSelectedFounder(f); setSearch(''); }}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-[#5B21B6]/30 transition-all text-left group flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                    {(f.fullName || 'F').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{f.fullName}</h3>
                    <p className="text-xs text-gray-500 truncate">{f.email || 'Founder'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star size={14} className="text-[#5B21B6]" />
                    <span className="font-bold text-gray-900">{f.startups.length}</span>
                    <span>{f.startups.length === 1 ? 'startup' : 'startups'} to review</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold text-[#5B21B6] group-hover:gap-2 transition-all">
                    View <ChevronRight size={16} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        <>
          {/* Selected Founder Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setSelectedFounder(null); setSearch(''); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                  title="Back to founders"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                  {(selectedFounder.fullName || 'F').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <UserRound size={18} className="text-[#5B21B6]" /> {selectedFounder.fullName}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedFounder.email || 'Founder'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">{selectedFounder.startups.length}</span>
                {selectedFounder.startups.length === 1 ? 'startup' : 'startups'} to review
              </div>
            </div>
          </div>

          {/* Selected Founder's Startups */}
          {visibleStartups.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-gray-200 text-gray-500">
              No startups match your search.
            </div>
          ) : (
            <div className="space-y-4">
              {visibleStartups.map((startup, idx) => renderStartupCard(startup, idx))}
            </div>
          )}
        </>
      )}

      {/* Modal Overlay */}
      {modalMode && selectedStartup && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-[95%] lg:w-full max-w-[1200px] max-h-[90vh] flex flex-col rounded-[24px] shadow-xl animate-fade-in-up overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex items-center gap-4 shrink-0 z-10">
              <button 
                onClick={() => { setModalMode(null); setSelectedStartup(null); setFeedback(''); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex-1">
                <h2 className="text-[22px] font-bold text-gray-900">
                  {modalMode === 'review' ? 'Provide Expert Review' : 'AI Analysis Report'}
                </h2>
                <p className="text-[15px] text-gray-500 mt-1">{selectedStartup.startupName}</p>
              </div>
              <button 
                onClick={() => { setModalMode(null); setSelectedStartup(null); setFeedback(''); }}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              {modalMode === 'report' ? (
                <div className="space-y-8">
                  {/* Shared Documents Section */}
                  {documents.filter(d => d.startupId === selectedStartup.startupId && d.sharedWith?.includes('mentor')).length > 0 && (
                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Shared Documents</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {documents.filter(d => d.startupId === selectedStartup.startupId && d.sharedWith?.includes('mentor')).map((doc: any) => (
                          <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                              <p className="font-bold text-sm text-gray-800 line-clamp-1">{doc.fileName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{doc.category} • {doc.fileSize}</p>
                            </div>
                            <button onClick={() => window.alert(`Downloading ${doc.fileName}...`)} className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg transition-colors">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <SharedStartupDetailsTabs startupData={selectedStartup} />
                  
                  <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between gap-3">
                    <button 
                      onClick={() => { setModalMode(null); setSelectedStartup(null); setFeedback(''); }}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors flex items-center"
                    >
                      <ArrowLeft size={16} className="mr-2" /> Back
                    </button>
                    <button 
                      onClick={() => setModalMode('review')}
                      className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center"
                    >
                      <MessageSquare size={16} className="mr-2" /> Provide Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700 italic border-l-2 border-[#5B21B6] pl-3">"{selectedStartup.startupIdea}"</p>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mentor Rating</label>
                    <div className="flex gap-3">
                      {['Good', 'Average', 'Bad'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRating(r as any)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                            rating === r 
                              ? r === 'Good' ? 'bg-green-500 text-white border-green-500 shadow-md' :
                                r === 'Average' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md' :
                                'bg-red-500 text-white border-red-500 shadow-md'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#5B21B6]" /> 
                      Your Feedback & Recommendations 
                      {rating === 'Good' ? <span className="text-gray-400 font-normal text-xs">(Optional)</span> : <span className="text-red-500 font-normal text-xs">* Required</span>}
                    </label>
                    <textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write your expert advice, actionable steps, and general feedback for the founder..."
                      className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent text-sm resize-none transition-shadow"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => { setModalMode(null); setSelectedStartup(null); setFeedback(''); setRating(null); }}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReviewSubmit}
                      disabled={!rating || (rating !== 'Good' && !feedback)}
                      className="flex items-center px-6 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                    >
                      <Send size={16} className="mr-2" /> Submit Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorReviews;
