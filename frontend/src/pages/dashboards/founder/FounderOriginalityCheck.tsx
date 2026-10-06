import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle, Info, Sparkles, HelpCircle,
  FileText, ArrowRight, Trash2, Clock, Eye, RefreshCw, Layers, ShieldAlert, BookOpen, ExternalLink, Globe
} from 'lucide-react';
import {
  analyzeOriginalityContent,
  fetchOriginalityHistory,
  fetchOriginalityReportById,
  deleteOriginalityReportById,
} from '../../../utils/originalityApi';
import type { IOriginalityReport } from '../../../utils/originalityApi';
import { getStartups } from '../../../utils/localStorageHelper';

const FounderOriginalityCheck: React.FC = () => {
  const [content, setContent] = useState('');
  const [userStartups, setUserStartups] = useState<any[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<IOriginalityReport | null>(null);
  const [history, setHistory] = useState<IOriginalityReport[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<IOriginalityReport | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await fetchOriginalityHistory();
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load originality history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
    const loadStartups = async () => {
      try {
        const locals = await getStartups();
        if (Array.isArray(locals)) {
          setUserStartups(locals);
        }
      } catch (err) {
        console.error('Failed to load founder startups:', err);
      }
    };
    loadStartups();
  }, []);

  const handleSelectStartup = (startupId: string) => {
    setSelectedStartupId(startupId);
    if (!startupId) return;
    const target = userStartups.find(s => (s.id || s._id || s.startupId) === startupId);
    if (target) {
      const textToFill = target.startupIdea || target.description || target.businessPlan?.executiveSummary || target.startupName || '';
      setContent(textToFill);
    }
  };

  const handleAnalyze = async () => {
    setErrorMsg(null);

    if (!content.trim()) {
      setErrorMsg('Please enter your startup idea or content to analyze.');
      return;
    }

    if (content.trim().length < 20) {
      setErrorMsg('Content is too short for a meaningful analysis. Please enter at least 20 characters.');
      return;
    }

    if (content.trim().length > 15000) {
      setErrorMsg('Content exceeds maximum allowed limit of 15,000 characters. Please shorten your text.');
      return;
    }

    setIsAnalyzing(true);
    setCurrentReport(null);

    try {
      const report = await analyzeOriginalityContent({
        content: content.trim(),
        startupId: selectedStartupId || undefined,
      });

      setCurrentReport(report);
      showToast('Analysis completed successfully!');
      loadHistory();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewReport = async (item: IOriginalityReport, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      const fullReport = await fetchOriginalityReportById(item._id);
      setSelectedHistoryItem(fullReport);
      if (fullReport.content) {
        setContent(fullReport.content);
      }
    } catch {
      setSelectedHistoryItem(item);
      if (item.content) {
        setContent(item.content);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Report loaded above.');
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Instantly remove from UI list
    setHistory((prev) => prev.filter((h) => h._id !== id));
    if (currentReport?._id === id) {
      setCurrentReport(null);
    }
    if (selectedHistoryItem?._id === id) {
      setSelectedHistoryItem(null);
    }

    try {
      await deleteOriginalityReportById(id);
      showToast('Report deleted successfully.');
    } catch (err: any) {
      console.warn('Delete report background warning:', err);
      showToast('Report removed from list.');
    }
  };

  const activeReport = selectedHistoryItem || currentReport;

  const getRiskBadgeColor = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRiskIcon = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'High':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-[#5B21B6] border border-purple-200 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6 text-[#5B21B6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Originality & Plagiarism Check</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Analyze your startup idea for originality, content similarity, AI-generated characteristics, and potential copyright risks.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Enter your startup idea or content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            placeholder="Enter your startup idea, business description, AI-generated content, or select an idea from your saved startups dropdown below..."
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl p-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5B21B6]/15 focus:border-[#5B21B6] transition-all font-medium"
          />
          <div className="flex justify-between items-center mt-2 text-xs font-semibold text-gray-400">
            <span>Minimum 20 characters required</span>
            <span>{content.length} / 15,000 characters</span>
          </div>
        </div>

        {/* Startup Selection Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              Select your Startup Idea <span className="text-gray-400 font-normal">(Auto-fills content box)</span>
            </label>
            <select
              value={selectedStartupId}
              onChange={(e) => handleSelectStartup(e.target.value)}
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5B21B6]/15 focus:border-[#5B21B6] cursor-pointer"
            >
              <option value="" className="text-gray-400">
                Select from your saved startup ideas...
              </option>
              {userStartups.map((s) => {
                const sId = s.id || s._id || s.startupId;
                const sName = s.startupName || s.name || 'Untitled Startup';
                const snippet = (s.startupIdea || s.description || '').slice(0, 45);
                return (
                  <option key={sId} value={sId} className="text-gray-900">
                    {sName} {snippet ? `— ${snippet}...` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full h-11 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-purple-200" />
                  <span>Analyzing Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Analyze Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isAnalyzing && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl border border-gray-100"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-100 rounded-xl"></div>
        </div>
      )}

      {/* Detailed Analysis Report View */}
      {activeReport && !isAnalyzing && (
        <div className="space-y-6 animate-fade-in-up">
          {selectedHistoryItem && (
            <div className="flex justify-between items-center bg-purple-50 border border-purple-200 px-4 py-3 rounded-xl text-xs text-purple-900 font-semibold">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#5B21B6]" />
                <span>Viewing historical report from {new Date(selectedHistoryItem.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="text-[#5B21B6] hover:underline font-extrabold"
              >
                Back to latest result
              </button>
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#5B21B6]" />
                  Analysis Summary Report
                </h2>
                <p className="text-xs text-gray-500">Comprehensive score breakdown and overall classification</p>
              </div>
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getRiskBadgeColor(
                  activeReport.overallRisk
                )}`}
              >
                {getRiskIcon(activeReport.overallRisk)}
                {activeReport.overallClassification}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-gray-500 block mb-1">Originality</span>
                <span className="text-2xl font-black text-emerald-600">{activeReport.originalityScore}%</span>
                <span className="text-[10px] font-semibold text-gray-500 block mt-1">{activeReport.originalityLevel}</span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-gray-500 block mb-1">Similarity</span>
                <span className="text-2xl font-black text-amber-600">{activeReport.similarityScore}%</span>
                <span className="text-[10px] font-semibold text-gray-500 block mt-1">{activeReport.similarityRisk} Risk</span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-gray-500 block mb-1">AI-Generated Likelihood</span>
                <span className="text-2xl font-black text-[#5B21B6]">{activeReport.aiProbability}%</span>
                <span className="text-[10px] font-semibold text-gray-500 block mt-1">{activeReport.aiClassification}</span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-gray-500 block mb-1">Potential Copyright Risk</span>
                <span
                  className={`text-2xl font-black ${
                    activeReport.copyrightRisk === 'High'
                      ? 'text-red-600'
                      : activeReport.copyrightRisk === 'Medium'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {activeReport.copyrightRisk}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 block mt-1">Assessment</span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-gray-500 block mb-1">Overall Risk</span>
                <span
                  className={`text-2xl font-black ${
                    activeReport.overallRisk === 'High'
                      ? 'text-red-600'
                      : activeReport.overallRisk === 'Medium'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {activeReport.overallRisk}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 block mt-1">Combined Status</span>
              </div>
            </div>
          </div>

          {/* Section 0: Content Origin / Source Attribution */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-[#5B21B6]" />
                Content Origin & Source Attribution
              </h3>
              <span
                className={`text-xs font-extrabold px-3.5 py-1.2 rounded-full border ${
                  activeReport.contentOrigin?.includes('ChatGPT')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : activeReport.contentOrigin?.includes('Gemini')
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : activeReport.contentOrigin?.includes('Claude')
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : activeReport.contentOrigin?.includes('Copyright') || activeReport.contentOrigin?.includes('Existing')
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-purple-50 text-[#5B21B6] border-purple-200'
                }`}
              >
                {activeReport.contentOrigin || 'Original Founder Idea'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <span>Detected Origin:</span>
                <span className="text-[#5B21B6] font-extrabold">{activeReport.contentOrigin || 'Original Founder Idea'}</span>
              </div>
              <p className="text-gray-600 leading-relaxed font-medium">
                {activeReport.contentOriginExplanation || 'Analysis indicates an authentic, human-written founder pitch with high semantic uniqueness.'}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Originality Analysis */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-[#5B21B6]" />
                  1. Originality Analysis
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Originality Score: {activeReport.originalityScore}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${activeReport.originalityScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{activeReport.originalityExplanation}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs text-gray-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Exemption rule:</strong> Common business concepts such as <em>office building, meeting rooms, employee cabins, snacks, website</em> are excluded and not treated as plagiarism.
                </span>
              </div>
            </div>

            {/* Section 2: Similarity Check */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-amber-600" />
                  2. Content & Concept Similarity Check
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Similarity Score: {activeReport.similarityScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-500 font-semibold block mb-1">Text Similarity</span>
                  <span className="text-base font-bold text-gray-900">{activeReport.textSimilarityScore}%</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-500 font-semibold block mb-1">Idea / Concept Similarity</span>
                  <span className="text-base font-bold text-gray-900">{activeReport.conceptSimilarityScore}%</span>
                </div>
              </div>              {activeReport.matchingSources && activeReport.matchingSources.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700 block">Matched Concepts & Plagiarism Sources:</span>
                  {activeReport.matchingSources.map((match, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                      <div className="flex flex-wrap justify-between items-center gap-2 font-bold text-gray-900">
                        <span className="flex items-center gap-1.5 font-bold text-gray-900">
                          <Layers size={14} className="text-[#5B21B6]" />
                          {match.title}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] border ${
                            match.similarityPercentage >= 45
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : match.similarityPercentage >= 20
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {match.similarityPercentage}% Match
                        </span>
                      </div>

                      {/* Source Website & Domain Link */}
                      {(match.sourceUrl || match.domain) && (
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-gray-500 font-semibold text-[11px]">Matched Website / Source:</span>
                          <a
                            href={match.sourceUrl || `https://www.google.com/search?q=${encodeURIComponent(match.title)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#6C4CF1] hover:underline bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 transition-colors"
                          >
                            <Globe size={12} /> {match.domain || 'View Source Website'} <ExternalLink size={11} />
                          </a>
                        </div>
                      )}

                      <p className="text-gray-700 font-medium text-xs bg-white p-2.5 rounded-lg border border-gray-100 italic">
                        "{match.matchingSnippet}"
                      </p>
                      <p className="text-gray-500 text-[11px] font-medium">{match.explanation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>No matching source or copyright conflict was found against standard startup corpora. Your idea is unique!</span>
                </div>
              )}
            </div>

            {/* Section 3: AI Content Detection */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-[#5B21B6]" />
                  3. AI Content Detection
                </h3>
                <span className="text-xs font-bold text-[#5B21B6] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  {activeReport.aiClassification}
                </span>
              </div>

              <div className="space-y-3 text-xs font-medium">
                <div>
                  <div className="flex justify-between mb-1 text-gray-700">
                    <span>Human-like Probability</span>
                    <span className="font-bold text-emerald-600">{activeReport.humanProbability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${activeReport.humanProbability}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-gray-700">
                    <span>AI-generated Probability</span>
                    <span className="font-bold text-[#5B21B6]">{activeReport.aiProbability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#5B21B6] h-2 rounded-full" style={{ width: `${activeReport.aiProbability}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2 font-medium">
                <Info className="w-4 h-4 text-[#5B21B6] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Disclaimer:</strong> AI-content detection is probabilistic and cannot reliably prove which AI model generated the content.
                </span>
              </div>
            </div>

            {/* Section 4: Possible AI Source Analysis */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  4. Possible AI Source Analysis
                </h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-medium">{activeReport.aiSourceExplanation}</p>

              {activeReport.possibleAISources && activeReport.possibleAISources.chatgptLikelihood ? (
                <div className="space-y-2 text-xs">
                  <span className="text-gray-700 font-bold block">Possible AI source characteristics:</span>
                  <div className="grid grid-cols-3 gap-2 font-medium">
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">ChatGPT</span>
                      <span className="font-extrabold text-[#5B21B6]">{activeReport.possibleAISources.chatgptLikelihood}%</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Gemini</span>
                      <span className="font-extrabold text-blue-600">{activeReport.possibleAISources.geminiLikelihood}%</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Claude</span>
                      <span className="font-extrabold text-amber-600">{activeReport.possibleAISources.claudeLikelihood}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500 font-medium">
                  AI source cannot be reliably determined. Source attribution is not conclusive from text alone.
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Copyright Risk & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Copyright Risk */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  5. Potential Copyright Risk & Source Websites
                </h3>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${getRiskBadgeColor(
                    activeReport.copyrightRisk
                  )}`}
                >
                  Risk: {activeReport.copyrightRisk}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-gray-700 leading-relaxed font-medium">
                  <strong>Reason:</strong> {activeReport.copyrightRiskReason}
                </p>

                {/* Top Matched Website Sources for Copyright */}
                {activeReport.matchingSources && activeReport.matchingSources.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <span className="text-gray-900 font-extrabold text-xs block">Matched Copyright Sources & Websites:</span>
                    <div className="space-y-2">
                      {activeReport.matchingSources.map((match, i) => (
                        <div key={i} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-gray-900 block truncate text-xs">{match.title}</span>
                            <span className="text-gray-500 text-[11px] block">{match.similarityPercentage}% Copyright Match</span>
                          </div>
                          {match.sourceUrl && (
                            <a
                              href={match.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-purple-50 text-[#6C4CF1] hover:bg-purple-100 font-bold text-[11px] rounded-lg border border-purple-200 flex items-center gap-1 shrink-0"
                            >
                              <Globe size={11} /> Open Website <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                  <em>Note:</em> Similarity scores reflect concept or phrasing overlap and do not constitute a legal determination of copyright infringement.
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  6. Strategic Recommendations
                </h3>
              </div>

              <ul className="space-y-2 text-xs text-gray-700 font-medium">
                {activeReport.recommendations && activeReport.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <ArrowRight className="w-4 h-4 text-[#5B21B6] flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Transparency Disclaimer Footer Banner */}
          <div className="p-4 rounded-xl bg-gray-100/80 border border-gray-200 text-xs text-gray-600 text-center font-medium">
            🛡 <strong>Transparency Disclaimer:</strong> AI detection and source attribution are probabilistic. This report does not legally determine copyright ownership or prove which AI system generated the content.
          </div>
        </div>
      )}

      {/* Analysis History Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#5B21B6]" />
            Analysis History
          </h2>
          <button
            onClick={loadHistory}
            className="text-xs text-[#5B21B6] hover:text-[#7C3AED] font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} /> Refresh History
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="py-8 text-center text-gray-400 text-sm font-medium animate-pulse">Loading analysis history...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm font-medium">
            No previous analysis reports found. Select a startup idea or type text above to run your first check!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Idea Snippet</th>
                  <th className="py-3 px-4">Origin</th>
                  <th className="py-3 px-4">Originality</th>
                  <th className="py-3 px-4">Similarity</th>
                  <th className="py-3 px-4">AI Prob.</th>
                  <th className="py-3 px-4">Copyright Risk</th>
                  <th className="py-3 px-4">Overall Risk</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {history.map((item) => (
                  <tr
                    key={item._id}
                    onClick={(e) => handleViewReport(item, e)}
                    className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                      selectedHistoryItem?._id === item._id ? 'bg-purple-50/60' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-gray-900 font-bold max-w-[180px] truncate">
                      {item.content}
                    </td>
                    <td className="py-3.5 px-4 text-[#5B21B6] font-semibold max-w-[160px] truncate">
                      {item.contentOrigin || 'Original Founder Idea'}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-extrabold">{item.originalityScore}%</td>
                    <td className="py-3.5 px-4 text-amber-600 font-extrabold">{item.similarityScore}%</td>
                    <td className="py-3.5 px-4 text-[#5B21B6] font-extrabold">{item.aiProbability}%</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(
                          item.copyrightRisk
                        )}`}
                      >
                        {item.copyrightRisk}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(
                          item.overallRisk
                        )}`}
                      >
                        {item.overallRisk}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={(e) => handleViewReport(item, e)}
                        className="p-1.5 text-[#5B21B6] hover:text-[#7C3AED] rounded-lg hover:bg-purple-50 transition-all cursor-pointer inline-flex items-center justify-center"
                        title="View Full Report"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistory(item._id, e)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Delete Report"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FounderOriginalityCheck;
