import React from 'react';
import { Download, FileText, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

interface Props {
  startupData: any;
  setStartupData: (data: any) => void;
}

const FounderReports: React.FC<Props> = ({ startupData }) => {
  const ai = startupData?.aiGenerated?.aiReport;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Analysis Reports</h1>
        <p className="text-gray-500 mt-1">Review the AI-generated business insights for your startups.</p>
      </div>

      {!startupData ? (
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center">
          <p className="text-[#5B21B6] font-bold">Please generate a startup in the AI Idea Generator first.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Report View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{startupData.startupName}</h2>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center">
                      <Cpu size={14} className="mr-1"/> AI Generated
                    </span>
                  </div>
                  <p className="text-gray-500">Comprehensive Business Analysis • Generated Recently</p>
                </div>
                <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors">
                  <Download size={18} className="mr-2" />
                  Export PDF
                </button>
              </div>

              <div className="space-y-8">
                {/* Score Section */}
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center bg-white shadow-sm shrink-0 ${ai?.investmentReadinessScore >= 80 ? 'border-green-500 text-green-600' : 'border-yellow-500 text-yellow-600'}`}>
                    <span className="text-3xl font-bold text-gray-900">{ai?.investmentReadinessScore || 0}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Investment Readiness Score</h3>
                    <p className="text-sm text-gray-600">This score reflects the overall viability, market size, and structural robustness of your startup model based on AI analysis.</p>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center text-green-700">
                      <CheckCircle2 size={20} className="mr-2" /> Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {ai?.keyStrengths?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100">
                          <span className="font-bold mr-2 text-green-700">{i + 1}.</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center text-orange-600">
                      <AlertTriangle size={20} className="mr-2" /> Risk Factors
                    </h3>
                    <ul className="space-y-3">
                      {ai?.riskFactors?.map((r: string, i: number) => (
                        <li key={i} className="flex items-start text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                          <span className="font-bold mr-2 text-orange-700">{i + 1}.</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {startupData.mentorReview && (
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mt-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <MessageSquare size={18} className="mr-2 text-[#5B21B6]" /> Mentor Review
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-bold text-gray-700">Rating:</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm ${
                      startupData.mentorReview.rating === 'Good' ? 'bg-green-500' :
                      startupData.mentorReview.rating === 'Average' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {startupData.mentorReview.rating}
                    </span>
                    <span className="text-sm text-gray-500">by {startupData.mentorReview.mentorName}</span>
                  </div>
                  {startupData.mentorReview.feedback && (
                    <div className="bg-white p-4 rounded-xl border border-purple-100/50 text-sm text-gray-700 leading-relaxed shadow-sm">
                      <p className="font-bold text-gray-900 mb-2">Feedback & Suggestions</p>
                      {startupData.mentorReview.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Your Reports</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-left transition-colors">
                  <FileText className="text-[#5B21B6] mr-3" size={20} />
                  <div>
                    <p className="text-sm font-bold text-indigo-900">{startupData.startupName}</p>
                    <p className="text-xs text-indigo-700">Score: {ai?.investmentReadinessScore}/100</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderReports;
