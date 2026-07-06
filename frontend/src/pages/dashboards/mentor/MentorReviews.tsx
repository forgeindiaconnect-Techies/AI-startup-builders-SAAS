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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-gray-100">
            
            {/* Left Side: Image */}
            <div className="hidden md:block md:w-2/5 relative shrink-0">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Data Analytics" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#5B21B6] via-[#5B21B6]/50 to-transparent flex items-end p-8">
                <div className="text-white relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                    <Cpu size={24} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 leading-tight">AI-Powered Insights</h3>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">Our advanced models have analyzed thousands of data points to generate this comprehensive investment readiness report.</p>
                </div>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-3/5 overflow-y-auto bg-gray-50/50">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-6 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-900">AI Report: <span className="text-[#5B21B6]">{reportModal.startupName}</span></h2>
                <button onClick={() => setReportModal(null)} className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center shrink-0 shadow-inner ${reportModal.aiGenerated?.aiReport?.investmentReadinessScore >= 80 ? 'border-green-500 bg-green-50 text-green-700' : 'border-yellow-500 bg-yellow-50 text-yellow-700'}`}>
                    <span className="text-4xl font-black">{reportModal.aiGenerated?.aiReport?.investmentReadinessScore || 85}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Investment Readiness</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Overall viability score based on market size, competition, and execution risk.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center text-green-600"><CheckCircle2 size={22} className="mr-2" /> Key Strengths</h3>
                    <ul className="space-y-3">
                      {reportModal.aiGenerated?.aiReport?.keyStrengths?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start text-sm text-gray-600"><span className="font-bold mr-3 text-green-600 bg-green-50 w-6 h-6 flex items-center justify-center rounded-full shrink-0">{i + 1}</span><span className="pt-0.5 leading-relaxed">{s}</span></li>
                      )) || <p className="text-sm text-gray-500 italic">No strengths listed.</p>}
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center text-orange-600"><AlertTriangle size={22} className="mr-2" /> Risk Factors</h3>
                    <ul className="space-y-3">
                      {reportModal.aiGenerated?.aiReport?.riskFactors?.map((r: string, i: number) => (
                        <li key={i} className="flex items-start text-sm text-gray-600"><span className="font-bold mr-3 text-orange-600 bg-orange-50 w-6 h-6 flex items-center justify-center rounded-full shrink-0">{i + 1}</span><span className="pt-0.5 leading-relaxed">{r}</span></li>
                      )) || <p className="text-sm text-gray-500 italic">No risk factors listed.</p>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-gray-100">
            
            {/* Left Side: Image */}
            <div className="hidden md:block md:w-1/2 relative shrink-0">
              <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80" alt="Business Review" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex items-end p-10">
                <div className="text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                    <CheckCircle2 size={24} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 leading-tight">Expert Evaluation</h3>
                  <p className="text-sm text-gray-200 leading-relaxed font-medium">Your industry expertise shapes the future. Provide constructive feedback to help this founder pivot or persevere.</p>
                </div>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-1/2 flex flex-col max-h-[90vh]">
              <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-white">
                <div>
                  <p className="text-xs font-bold text-[#5B21B6] uppercase tracking-wider mb-1">Mentor Review</p>
                  <h2 className="text-xl font-bold text-gray-900">{reviewModal.startupName}</h2>
                </div>
                <button onClick={() => setReviewModal(null)} className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto bg-gray-50/50 flex-1">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Constructive Feedback</label>
                  <p className="text-xs text-gray-500 mb-3">What are they missing? What should they focus on next?</p>
                  <textarea 
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Provide actionable feedback, identify blind spots, and suggest improvements..."
                    className="w-full h-40 p-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent transition-shadow outline-none resize-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Overall Potential Rating</label>
                  <p className="text-xs text-gray-500 mb-3">Rate this startup's potential on a scale of 1-10.</p>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="1" max="10" 
                      value={reviewScore}
                      onChange={e => setReviewScore(Number(e.target.value))}
                      className="flex-1 accent-[#5B21B6]"
                    />
                    <div className="w-12 h-12 bg-purple-50 text-[#5B21B6] font-black text-xl rounded-xl flex items-center justify-center shrink-0 border border-purple-100 shadow-inner">
                      {reviewScore}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white mt-auto">
                <button onClick={() => setReviewModal(null)} className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm transition-colors">Cancel</button>
                <button onClick={submitReview} disabled={!reviewText} className="px-6 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">Submit Review</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MentorReviews;
