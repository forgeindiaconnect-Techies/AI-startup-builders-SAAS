import React, { useState, useEffect } from 'react';
import { Search, Clock, X, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

const MentorReviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [startups, setStartups] = useState<any[]>([]);
  const [reportModal, setReportModal] = useState<any>(null);
  const [reviewModal, setReviewModal] = useState<any>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewScore, setReviewScore] = useState(5);

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = () => {
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
  };

  const submitReview = () => {
    if (!reviewModal || !reviewText) return;
    const updated = {
      ...reviewModal,
      status: 'reviewed',
      mentorReview: { text: reviewText, score: reviewScore, date: new Date().toISOString() }
    };
    localStorage.setItem(`startup_${updated.startupId}`, JSON.stringify(updated));
    loadStartups();
    setReviewModal(null);
    setReviewText('');
    setReviewScore(5);
    window.alert('Review submitted successfully!');
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
          <button 
            onClick={() => setActiveTab('Pending')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'Pending' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Pending (3)
          </button>
          <button 
            onClick={() => setActiveTab('Completed')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'Completed' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Completed (12)
          </button>
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
            if (activeTab === 'Completed' && s.status !== 'reviewed') return false;
            if (activeTab === 'Pending' && s.status === 'reviewed') return false;
            if (search && !s.startupName.toLowerCase().includes(search.toLowerCase()) && !s.startupIdea.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
          }).map((startup, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{startup.startupName}</h3>
                    {startup.status !== 'reviewed' && <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Action Required</span>}
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{startup.startupIdea}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                      {startup.aiGenerated?.ideaAnalysis?.businessModel || 'Startup'}
                    </div>
                    {startup.status === 'generated' && (
                      <div className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <span className="font-semibold mr-1 text-gray-900">AI Score:</span> {startup.aiGenerated?.aiReport?.investmentReadinessScore || '85'}/100
                      </div>
                    )}
                    <div className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                      <Clock size={14} className="mr-1" />
                      Due in 2 days
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
                  {startup.status !== 'reviewed' && (
                    <button 
                      onClick={() => setReviewModal(startup)}
                      className="w-full md:w-48 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                    >
                      Review Startup
                    </button>
                  )}
                  {startup.status === 'reviewed' && (
                    <button 
                      className="w-full md:w-48 py-2.5 bg-green-50 text-green-700 rounded-lg font-bold text-sm transition-colors shadow-sm cursor-default border border-green-200"
                    >
                      Reviewed
                    </button>
                  )}
                  <button 
                    onClick={() => setReportModal(startup)}
                    className="w-full md:w-48 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-sm transition-colors shadow-sm"
                  >
                    View AI Report
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {reportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">AI Report: {reportModal.startupName}</h2>
              <button onClick={() => setReportModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center bg-white shadow-sm shrink-0 ${reportModal.aiGenerated?.aiReport?.investmentReadinessScore >= 80 ? 'border-green-500 text-green-600' : 'border-yellow-500 text-yellow-600'}`}>
                  <span className="text-3xl font-bold text-gray-900">{reportModal.aiGenerated?.aiReport?.investmentReadinessScore || 85}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Investment Readiness Score</h3>
                  <p className="text-sm text-gray-600">Overall viability based on AI analysis.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center text-green-700"><CheckCircle2 size={20} className="mr-2" /> Key Strengths</h3>
                  <ul className="space-y-3">
                    {reportModal.aiGenerated?.aiReport?.keyStrengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100"><span className="font-bold mr-2 text-green-700">{i + 1}.</span>{s}</li>
                    )) || <p className="text-sm text-gray-500">No strengths listed.</p>}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center text-orange-600"><AlertTriangle size={20} className="mr-2" /> Risk Factors</h3>
                  <ul className="space-y-3">
                    {reportModal.aiGenerated?.aiReport?.riskFactors?.map((r: string, i: number) => (
                      <li key={i} className="flex items-start text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100"><span className="font-bold mr-2 text-orange-700">{i + 1}.</span>{r}</li>
                    )) || <p className="text-sm text-gray-500">No risk factors listed.</p>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Review: {reviewModal.startupName}</h2>
              <button onClick={() => setReviewModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mentor Feedback</label>
                <textarea 
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Provide actionable feedback, identify blind spots, and suggest improvements..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5B21B6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mentor Rating (1-10)</label>
                <input 
                  type="number" min="1" max="10" 
                  value={reviewScore}
                  onChange={e => setReviewScore(Number(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5B21B6] focus:outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setReviewModal(null)} className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={submitReview} disabled={!reviewText} className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50">Submit Review</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MentorReviews;
