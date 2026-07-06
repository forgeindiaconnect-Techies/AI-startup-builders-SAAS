import React, { useState, useEffect } from 'react';
import { Search, Clock, X, Cpu, CheckCircle2, AlertTriangle, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { addNotification } from '../../../utils/localStorageHelper';
import SharedStartupDetailsTabs from '../../../components/shared/SharedStartupDetailsTabs';

const MentorReviews: React.FC = () => {
  const [search, setSearch] = useState('');
  const [startups, setStartups] = useState<any[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'review' | 'report' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<'Good' | 'Average' | 'Bad' | null>(null);

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

  const handleReviewSubmit = () => {
    if (!selectedStartup || !rating) return;
    if (rating !== 'Good' && !feedback) return;

    const review = {
      id: `review_${Date.now()}`,
      startupId: selectedStartup.startupId,
      mentorId: "mentor_demo_user",
      mentorName: "Elena Rodriguez",
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
    
    localStorage.setItem(`startup_${updated.startupId}`, JSON.stringify(updated));
    setStartups(prev => prev.map(s => s.startupId === updated.startupId ? updated : s));
    
    addNotification({
      id: Date.now(),
      title: 'New Mentor Review',
      message: `Elena Rodriguez provided a review for "${updated.startupName}": "${feedback}"`,
      type: 'mentor_review',
      time: 'Just now',
      unread: true
    });

    setSelectedStartup(null);
    setModalMode(null);
    setFeedback('');
    setRating(null);
    window.alert('Feedback submitted successfully!');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Startups to Review</h1>
        <p className="text-gray-500 mt-1">Evaluate AI-generated reports and provide expert feedback to founders.</p>
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
              placeholder="Search startups..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Startups List */}
      <div className="space-y-4">
        {startups.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl border border-gray-200 text-gray-500">
            No startups available for review.
          </div>
        ) : (
          startups.filter(s => {
            if (search && !s.startupName.toLowerCase().includes(search.toLowerCase()) && !s.startupIdea.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
          }).map((startup, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{startup.startupName}</h3>
                    {startup.status !== 'reviewed' && <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Action Required</span>}
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
                </div>
                
                <div className="w-full md:w-auto flex flex-col gap-2 shrink-0 md:pl-4">
                  <button 
                    onClick={() => { setSelectedStartup(startup); setModalMode('review'); }}
                    className="w-full md:w-40 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                  >
                    Review Startup
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
          ))
        )}
      </div>
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
