import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle, Info, Sparkles, HelpCircle,
  FileText, ArrowRight, Trash2, Clock, Eye, RefreshCw, Layers, ShieldAlert, BookOpen
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskIcon = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'High':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-2xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
              : 'bg-red-950/90 text-red-200 border-red-500/40'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center shadow-lg shadow-purple-900/30">
              <ShieldCheck className="w-6 h-6 text-[#FBBF24]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Originality & Plagiarism Check</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Analyze your startup idea for originality, content similarity, AI-generated characteristics, and potential copyright risks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Enter your startup idea or content <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            placeholder="Enter your startup idea, business description, AI-generated content, or select an idea from your saved startups dropdown below..."
            className="w-full bg-[#0B0D14] border border-white/10 rounded-xl p-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
          />
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>Minimum 20 characters required</span>
            <span>{content.length} / 15,000 characters</span>
          </div>
        </div>

        {/* Startup Selection Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              Select your Startup Idea <span className="text-gray-500 font-normal">(Auto-fills content box)</span>
            </label>
            <select
              value={selectedStartupId}
              onChange={(e) => handleSelectStartup(e.target.value)}
              className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            >
              <option value="" className="bg-[#131620] text-gray-400">
                Select from your saved startup ideas...
              </option>
              {userStartups.map((s) => {
                const sId = s.id || s._id || s.startupId;
                const sName = s.startupName || s.name || 'Untitled Startup';
                const snippet = (s.startupIdea || s.description || '').slice(0, 45);
                return (
                  <option key={sId} value={sId} className="bg-[#131620] text-white">
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
              className="w-full h-11 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#FBBF24]" />
                  <span>Analyzing Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#FBBF24]" />
                  <span>Analyze Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isAnalyzing && (
        <div className="bg-[#131620] border border-white/10 rounded-2xl p-8 shadow-xl space-y-6 animate-pulse">
          <div className="h-6 bg-white/10 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
            ))}
          </div>
          <div className="h-40 bg-white/5 rounded-xl"></div>
        </div>
      )}

      {/* Detailed Analysis Report View */}
      {activeReport && !isAnalyzing && (
        <div className="space-y-6 animate-fade-in-up">
          {selectedHistoryItem && (
            <div className="flex justify-between items-center bg-[#1a1f2e] border border-purple-500/30 px-4 py-3 rounded-xl text-xs text-purple-300">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Viewing historical report from {new Date(selectedHistoryItem.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="text-[#FBBF24] hover:underline font-bold"
              >
                Back to latest result
              </button>
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FBBF24]" />
                  Analysis Summary Report
                </h2>
                <p className="text-xs text-gray-400">Comprehensive score breakdown and overall classification</p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getRiskBadgeColor(
                  activeReport.overallRisk
                )}`}
              >
                {getRiskIcon(activeReport.overallRisk)}
                {activeReport.overallClassification}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Originality</span>
                <span className="text-2xl font-black text-emerald-400">{activeReport.originalityScore}%</span>
                <span className="text-[10px] text-gray-400 block mt-1">{activeReport.originalityLevel}</span>
              </div>

              <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Similarity</span>
                <span className="text-2xl font-black text-amber-400">{activeReport.similarityScore}%</span>
                <span className="text-[10px] text-gray-400 block mt-1">{activeReport.similarityRisk} Risk</span>
              </div>

              <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-gray-400 block mb-1">AI-Generated Likelihood</span>
                <span className="text-2xl font-black text-purple-400">{activeReport.aiProbability}%</span>
                <span className="text-[10px] text-gray-400 block mt-1">{activeReport.aiClassification}</span>
              </div>

              <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Potential Copyright Risk</span>
                <span
                  className={`text-2xl font-black ${
                    activeReport.copyrightRisk === 'High'
                      ? 'text-red-400'
                      : activeReport.copyrightRisk === 'Medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {activeReport.copyrightRisk}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Assessment</span>
              </div>

              <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Overall Risk</span>
                <span
                  className={`text-2xl font-black ${
                    activeReport.overallRisk === 'High'
                      ? 'text-red-400'
                      : activeReport.overallRisk === 'Medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {activeReport.overallRisk}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Combined Status</span>
              </div>
            </div>
          </div>

          {/* Section 0: Content Origin / Source Attribution */}
          <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-[#FBBF24]" />
                Content Origin & Source Attribution
              </h3>
              <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                {activeReport.contentOrigin || 'Original Founder Idea'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0D14] border border-white/5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-semibold">
                <span>Detected Origin:</span>
                <span className="text-[#FBBF24] font-bold">{activeReport.contentOrigin || 'Original Founder Idea'}</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {activeReport.contentOriginExplanation || 'Analysis indicates an authentic, human-written founder pitch with high semantic uniqueness.'}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Originality Analysis */}
            <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  1. Originality Analysis
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Originality Score: {activeReport.originalityScore}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${activeReport.originalityScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{activeReport.originalityExplanation}</p>
              </div>

              <div className="bg-[#0B0D14] border border-white/5 p-3 rounded-xl text-xs text-gray-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Exemption rule:</strong> Common business concepts such as <em>office building, meeting rooms, employee cabins, snacks, website</em> are excluded and not treated as plagiarism.
                </span>
              </div>
            </div>

            {/* Section 2: Similarity Check */}
            <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-amber-400" />
                  2. Content & Concept Similarity Check
                </h3>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Similarity Score: {activeReport.similarityScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0B0D14] p-3 rounded-xl border border-white/5">
                  <span className="text-gray-400 block mb-1">Text Similarity</span>
                  <span className="text-base font-bold text-white">{activeReport.textSimilarityScore}%</span>
                </div>
                <div className="bg-[#0B0D14] p-3 rounded-xl border border-white/5">
                  <span className="text-gray-400 block mb-1">Idea / Concept Similarity</span>
                  <span className="text-base font-bold text-white">{activeReport.conceptSimilarityScore}%</span>
                </div>
              </div>

              {activeReport.matchingSources && activeReport.matchingSources.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-300 block">Matched References:</span>
                  {activeReport.matchingSources.map((match, idx) => (
                    <div key={idx} className="bg-[#0B0D14] p-3 rounded-xl border border-white/5 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-gray-200">
                        <span>{match.title}</span>
                        <span className="text-amber-400">{match.similarityPercentage}% Match</span>
                      </div>
                      <p className="text-gray-400 text-[11px]">{match.explanation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>No matching source was verified against standard startup corpora.</span>
                </div>
              )}
            </div>

            {/* Section 3: AI Content Detection */}
            <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-purple-400" />
                  3. AI Content Detection
                </h3>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                  {activeReport.aiClassification}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-gray-300">
                    <span>Human-like Probability</span>
                    <span className="font-bold text-emerald-400">{activeReport.humanProbability}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${activeReport.humanProbability}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-gray-300">
                    <span>AI-generated Probability</span>
                    <span className="font-bold text-purple-400">{activeReport.aiProbability}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${activeReport.aiProbability}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Disclaimer:</strong> AI-content detection is probabilistic and cannot reliably prove which AI model generated the content.
                </span>
              </div>
            </div>

            {/* Section 4: Possible AI Source Analysis */}
            <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  4. Possible AI Source Analysis
                </h3>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">{activeReport.aiSourceExplanation}</p>

              {activeReport.possibleAISources && activeReport.possibleAISources.chatgptLikelihood ? (
                <div className="space-y-2 text-xs">
                  <span className="text-gray-400 font-semibold block">Possible AI source characteristics:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#0B0D14] p-2.5 rounded-lg border border-white/5 flex justify-between">
                      <span className="text-gray-300">ChatGPT</span>
                      <span className="font-bold text-purple-400">{activeReport.possibleAISources.chatgptLikelihood}%</span>
                    </div>
                    <div className="bg-[#0B0D14] p-2.5 rounded-lg border border-white/5 flex justify-between">
                      <span className="text-gray-300">Gemini</span>
                      <span className="font-bold text-blue-400">{activeReport.possibleAISources.geminiLikelihood}%</span>
                    </div>
                    <div className="bg-[#0B0D14] p-2.5 rounded-lg border border-white/5 flex justify-between">
                      <span className="text-gray-300">Claude</span>
                      <span className="font-bold text-amber-400">{activeReport.possibleAISources.claudeLikelihood}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-gray-800/50 border border-white/5 text-xs text-gray-400">
                  AI source cannot be reliably determined. Source attribution is not conclusive from text alone.
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Copyright Risk & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Copyright Risk */}
            <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  5. Potential Copyright Risk
                </h3>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${getRiskBadgeColor(
                    activeReport.copyrightRisk
                  )}`}
                >
                  Potential Copyright Risk: {activeReport.copyrightRisk}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-gray-300 leading-relaxed">
                  <strong>Reason:</strong> {activeReport.copyrightRiskReason}
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                  <em>Note:</em> Similarity scores reflect concept or phrasing overlap and do not constitute a legal determination of copyright infringement.
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  6. Strategic Recommendations
                </h3>
              </div>

              <ul className="space-y-2 text-xs text-gray-300">
                {activeReport.recommendations && activeReport.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#0B0D14] p-3 rounded-xl border border-white/5">
                    <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Transparency Disclaimer Footer Banner */}
          <div className="p-4 rounded-xl bg-[#0B0D14] border border-white/10 text-xs text-gray-400 text-center">
            🛡 <strong>Transparency Disclaimer:</strong> AI detection and source attribution are probabilistic. This report does not legally determine copyright ownership or prove which AI system generated the content.
          </div>
        </div>
      )}

      {/* Analysis History Section */}
      <div className="bg-[#131620] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Analysis History
          </h2>
          <button
            onClick={loadHistory}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} /> Refresh History
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Loading analysis history...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            No previous analysis reports found. Select a startup idea or type text above to run your first check!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-semibold">
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
              <tbody className="divide-y divide-white/5">
                {history.map((item) => (
                  <tr
                    key={item._id}
                    onClick={(e) => handleViewReport(item, e)}
                    className={`hover:bg-white/5 transition-colors cursor-pointer ${
                      selectedHistoryItem?._id === item._id ? 'bg-purple-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-white font-medium max-w-[180px] truncate">
                      {item.content}
                    </td>
                    <td className="py-3 px-4 text-purple-300 font-medium max-w-[160px] truncate">
                      {item.contentOrigin || 'Original Founder Idea'}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{item.originalityScore}%</td>
                    <td className="py-3 px-4 text-amber-400 font-bold">{item.similarityScore}%</td>
                    <td className="py-3 px-4 text-purple-400 font-bold">{item.aiProbability}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(
                          item.copyrightRisk
                        )}`}
                      >
                        {item.copyrightRisk}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(
                          item.overallRisk
                        )}`}
                      >
                        {item.overallRisk}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={(e) => handleViewReport(item, e)}
                        className="p-1.5 text-purple-400 hover:text-purple-200 rounded-lg hover:bg-purple-500/20 transition-all cursor-pointer inline-flex items-center justify-center"
                        title="View Full Report"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistory(item._id, e)}
                        className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer inline-flex items-center justify-center"
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
