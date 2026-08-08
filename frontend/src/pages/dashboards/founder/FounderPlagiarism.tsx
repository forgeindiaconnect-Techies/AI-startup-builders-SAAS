import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Download, Copy,
  Check, FileText, Sparkles, Scale, Search, Award, Lock, ExternalLink,
  Shield, BarChart2, ArrowLeft, Info, FileCode
} from 'lucide-react';
import { API_URL } from '../../../config/api';

interface FounderPlagiarismProps {
  startupData: any;
  setStartupData?: React.Dispatch<React.SetStateAction<any>>;
  onBackToBuilder?: () => void;
}

const ALL_CONTENT_OPTIONS = [
  { id: 'full_startup', label: 'Full Startup Overview' },
  { id: 'startup_idea', label: 'Startup Idea & Concept' },
  { id: 'problem_solution', label: 'Problem & Solution Fit' },
  { id: 'business_plan', label: 'Business Plan' },
  { id: 'market_research', label: 'Market Research & Industry Trends' },
  { id: 'competitor_analysis', label: 'Competitor Analysis' },
  { id: 'swot_analysis', label: 'SWOT Analysis' },
  { id: 'marketing_strategy', label: 'Marketing Strategy' },
  { id: 'pitch_deck', label: 'Pitch Deck Slides' },
  { id: 'ai_reports', label: 'AI Readiness & Risk Reports' },
];

const formatHumanReadableText = (obj: any): string => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) {
    return obj
      .map((item, i) => {
        if (typeof item === 'string') return `• ${item}`;
        if (item && typeof item === 'object') {
          const slideTitle = item.title || item.slide || item.name || `Item ${i + 1}`;
          const slideContent = item.content || item.description || (Array.isArray(item.bullets) ? item.bullets.join('\n') : '') || JSON.stringify(item, null, 2);
          return `--- ${slideTitle} ---\n${slideContent}`;
        }
        return String(item);
      })
      .join('\n\n');
  }
  if (typeof obj === 'object') {
    return Object.entries(obj)
      .map(([k, v]) => {
        const keyLabel = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        if (typeof v === 'object' && v !== null) {
          return `[ ${keyLabel} ]\n${formatHumanReadableText(v)}`;
        }
        return `${keyLabel}:\n${v}`;
      })
      .join('\n\n');
  }
  return String(obj);
};

const FounderPlagiarism: React.FC<FounderPlagiarismProps> = ({ startupData, onBackToBuilder }) => {
  const [selectedContentType, setSelectedContentType] = useState('full_startup');
  const [previewContent, setPreviewContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);
  const [pastReports, setPastReports] = useState<any[]>([]);

  const startupId = startupData?.startupId || startupData?.id || startupData?._id;
  const startupName = startupData?.startupName || 'Your Startup';

  // Compute available options based on generated content
  const availableOptions = React.useMemo(() => {
    if (!startupData) return ALL_CONTENT_OPTIONS;
    const ai = startupData.aiGenerated || {};
    const list = [
      { id: 'full_startup', label: 'Full Startup Overview', hasContent: Boolean(startupData.startupIdea || ai.businessPlan || ai.ideaAnalysis) },
      { id: 'startup_idea', label: 'Startup Idea & Concept', hasContent: Boolean(startupData.startupIdea || startupData.description) },
      { id: 'problem_solution', label: 'Problem & Solution Fit', hasContent: Boolean(ai.ideaAnalysis?.problem || ai.businessPlan?.problemStatement || ai.ideaAnalysis?.solution) },
      { id: 'business_plan', label: 'Business Plan', hasContent: Boolean(ai.businessPlan) },
      { id: 'market_research', label: 'Market Research & Industry Trends', hasContent: Boolean(ai.marketResearch) },
      { id: 'competitor_analysis', label: 'Competitor Analysis', hasContent: Boolean(ai.marketResearch?.competitors || ai.ideaAnalysis?.competitors) },
      { id: 'swot_analysis', label: 'SWOT Analysis', hasContent: Boolean(ai.ideaAnalysis?.swot || ai.marketResearch?.swot) },
      { id: 'marketing_strategy', label: 'Marketing Strategy', hasContent: Boolean(ai.businessPlan?.marketingStrategy || ai.marketResearch?.marketingChannels) },
      { id: 'pitch_deck', label: 'Pitch Deck Slides', hasContent: Boolean(ai.pitchDeck && ai.pitchDeck.length > 0) },
      { id: 'ai_reports', label: 'AI Readiness & Risk Reports', hasContent: Boolean(ai.aiReport || ai.ideaAnalysis) },
    ];
    const filtered = list.filter((item) => item.hasContent);
    return filtered.length > 0 ? filtered : ALL_CONTENT_OPTIONS;
  }, [startupData]);

  // Extract content based on selected type
  const extractContentForType = (type: string, data: any): string => {
    if (!data) return '';
    const ai = data.aiGenerated || {};

    switch (type) {
      case 'startup_idea':
        return data.startupIdea || data.description || '';
      case 'problem_solution':
        const problem = ai.ideaAnalysis?.problem || ai.businessPlan?.problemStatement || '';
        const solution = ai.ideaAnalysis?.solution || ai.businessPlan?.solutionOverview || '';
        return `[ PROBLEM STATEMENT ]\n${formatHumanReadableText(problem)}\n\n[ SOLUTION OVERVIEW ]\n${formatHumanReadableText(solution)}`.trim();
      case 'business_plan':
        return formatHumanReadableText(ai.businessPlan);
      case 'market_research':
        return formatHumanReadableText(ai.marketResearch);
      case 'competitor_analysis':
        const comp = ai.marketResearch?.competitors || ai.ideaAnalysis?.competitors;
        return formatHumanReadableText(comp);
      case 'swot_analysis':
        const swot = ai.ideaAnalysis?.swot || ai.marketResearch?.swot;
        return formatHumanReadableText(swot);
      case 'marketing_strategy':
        const mkt = ai.businessPlan?.marketingStrategy || ai.marketResearch?.marketingChannels;
        return formatHumanReadableText(mkt);
      case 'pitch_deck':
        return formatHumanReadableText(ai.pitchDeck);
      case 'ai_reports':
        return formatHumanReadableText(ai.aiReport || ai.ideaAnalysis);
      case 'full_startup':
      default:
        const parts = [
          `STARTUP NAME:\n${data.startupName || ''}`,
          `STARTUP IDEA:\n${data.startupIdea || ''}`,
          ai.businessPlan ? `BUSINESS PLAN:\n${formatHumanReadableText(ai.businessPlan)}` : '',
          ai.marketResearch ? `MARKET RESEARCH:\n${formatHumanReadableText(ai.marketResearch)}` : '',
        ].filter(Boolean);
        return parts.join('\n\n========================================\n\n');
    }
  };

  // Update preview content when selection changes
  useEffect(() => {
    const text = extractContentForType(selectedContentType, startupData);
    setPreviewContent(text);
  }, [selectedContentType, startupData]);

  // Load existing reports for startup on mount
  useEffect(() => {
    if (!startupId) return;
    fetch(`${API_URL}/plagiarism/reports/${startupId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.reports) && json.reports.length > 0) {
          setPastReports(json.reports);
          setReport(json.reports[0]);
        }
      })
      .catch(() => {});
  }, [startupId]);

  // Execute actual plagiarism check API
  const handleCheckPlagiarism = async () => {
    if (!previewContent.trim()) {
      setError('No content available to check.');
      return;
    }

    setError('');
    setLoading(true);
    setLoadingStep('Analyzing your content...');

    const stepTimer1 = setTimeout(() => setLoadingStep('Checking for matching content...'), 700);
    const stepTimer2 = setTimeout(() => setLoadingStep('Comparing with available sources...'), 1400);
    const stepTimer3 = setTimeout(() => setLoadingStep('Generating originality report...'), 2100);

    try {
      const res = await fetch(`${API_URL}/plagiarism/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: String(startupId),
          contentType: selectedContentType,
          content: previewContent,
        }),
      });

      const json = await res.json();
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (json.success) {
        setReport(json);
        setPastReports((prev) => [json, ...prev]);
      } else {
        setError(json.error || 'Unable to perform plagiarism analysis right now. Please try again.');
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setError('Plagiarism detection service is currently unavailable.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const certText = `
PLAGIARISM & ORIGINALITY REPORT
==================================================
Startup: ${startupName}
Content Checked: ${ALL_CONTENT_OPTIONS.find((c) => c.id === (report.contentType || selectedContentType))?.label || selectedContentType}
Checked At: ${new Date(report.checkedAt || Date.now()).toLocaleString()}

SUMMARY METRICS:
--------------------------------------------------
Originality Score: ${report.originalityScore}%
Similarity Score:  ${report.similarityScore}%
Copyright Risk:    ${report.copyrightRisk}
Content Status:    ${report.contentStatus}
AI Indication:     ${report.aiContentIndication?.status} (Confidence: ${Math.round((report.aiContentIndication?.confidence || 0.9) * 100)}%)

SIMILARITY BREAKDOWN:
--------------------------------------------------
Web Content Similarity:      ${report.similarityBreakdown?.webContent || 0}%
Startup Idea Similarity:     ${report.similarityBreakdown?.startupIdea || 0}%
Internal Platform Similarity: ${report.similarityBreakdown?.internalPlatform || 0}%
Exact Text Match:            ${report.similarityBreakdown?.exactMatch || 0}%
Paraphrased Similarity:       ${report.similarityBreakdown?.paraphrased || 0}%

STARTUP IDEA SIMILARITY:
--------------------------------------------------
Problem Similarity:        ${report.startupIdeaSimilarity?.problem || 'Low'}
Solution Similarity:       ${report.startupIdeaSimilarity?.solution || 'Low'}
Target Market Similarity:  ${report.startupIdeaSimilarity?.targetMarket || 'Low'}
Business Model Similarity: ${report.startupIdeaSimilarity?.businessModel || 'Low'}

MATCHED SOURCES:
--------------------------------------------------
${
  report.matches && report.matches.length > 0
    ? report.matches.map((m: any, i: number) => `${i + 1}. ${m.sourceTitle} [${m.domain}] (${m.similarity}% similarity)\n   Snippet: "${m.matchedText}"`).join('\n')
    : 'No significant matching sources found.'
}

IMPORTANT DISCLAIMER:
--------------------------------------------------
Important: This report identifies textual and conceptual similarity based on the sources available to the detection system. It is not a legal determination of copyright ownership, copyright infringement, or originality.
==================================================
`;

    const element = document.createElement('a');
    const file = new Blob([certText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Plagiarism_Report_${startupName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getOriginalityRatingLabel = (score: number) => {
    if (score >= 81) return { label: 'High Originality', badge: '0–30% Similarity · High Originality', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (score >= 61) return { label: 'Good Originality', badge: '31–60% Similarity · Good', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 31) return { label: 'Moderate Originality', badge: '61–80% Similarity · Moderate', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Very Low Originality', badge: '81–100% Similarity · Very Low', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const getContentStatusInfo = (status: string) => {
    switch (status) {
      case 'HIGHLY_ORIGINAL':
      case 'MOSTLY_ORIGINAL':
        return {
          title: '✓ Highly Original',
          desc: 'No significant matching text was detected in the available sources.',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'POTENTIALLY_SIMILAR':
        return {
          title: '⚠ Potentially Similar',
          desc: 'Some sections of this content appear similar to available sources.',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'HIGH_SIMILARITY_DETECTED':
      default:
        return {
          title: '⚠ High Similarity Detected',
          desc: 'Substantial textual or structural overlaps were detected with existing sources.',
          color: 'bg-red-50 text-red-800 border-red-200',
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 rounded-3xl p-7 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-purple-400" />
              Plagiarism & Originality Checker
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Plagiarism & Originality Check
            </h1>
            <p className="text-gray-300 text-sm max-w-xl">
              Analyze AI-generated startup content for text similarity, web overlap, copyright risk, and platform conceptual uniqueness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onBackToBuilder && (
              <button
                onClick={onBackToBuilder}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 border border-white/15"
              >
                <ArrowLeft size={14} /> Back to AI Builder
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Selector & Preview Box */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Select Content to Check</h2>
            <p className="text-xs text-gray-500 mt-0.5">Startup: <strong className="text-gray-800">{startupName}</strong></p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content to Check:</label>
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-[#5B21B6] transition-colors"
            >
              {availableOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview Container */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content Preview</label>
            <span className="text-xs font-semibold text-gray-400">
              {previewContent.length} characters
            </span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
            {previewContent || <span className="text-gray-400 italic">No content available for this selection. Generate startup output first.</span>}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="ml-auto">
            <button
              onClick={handleCheckPlagiarism}
              disabled={loading || !previewContent.trim()}
              className="px-7 py-3.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-purple-900/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw size={16} className="animate-spin text-white" /> : <ShieldCheck size={16} />}
              {loading ? loadingStep : 'Check Plagiarism'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm space-y-4 animate-pulse">
          <RefreshCw size={40} className="animate-spin text-[#5B21B6] mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">{loadingStep || 'Analyzing content...'}</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Comparing tokens against web content, patent indices, and internal platform database...
          </p>
        </div>
      )}

      {/* Results Dashboard */}
      {!loading && report && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Service Configuration Notice if external search not set */}
          {report.isExternalServiceConfigured === false && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold flex items-center gap-3">
              <Info size={18} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Plagiarism detection service is not configured yet for external web search.</p>
                <p className="text-[11px] opacity-90 mt-0.5">Results below reflect exact algorithm analysis against internal platform startup database and indexed structural patterns.</p>
              </div>
            </div>
          )}

          {/* Top Summary Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 uppercase tracking-wider">
                  Plagiarism & Originality Report
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-2">{startupName}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Content Checked: <strong className="text-gray-800">{ALL_CONTENT_OPTIONS.find((c) => c.id === report.contentType)?.label || report.contentType}</strong> · Checked At: {new Date(report.checkedAt || Date.now()).toLocaleString()}
                </p>
              </div>

              {/* Status Banner */}
              {(() => {
                const info = getContentStatusInfo(report.contentStatus);
                return (
                  <div className={`px-4 py-3 rounded-xl border text-xs font-bold ${info.color} shadow-xs max-w-xs`}>
                    <p className="text-sm font-extrabold">{info.title}</p>
                    <p className="text-[11px] font-medium opacity-90 mt-0.5">{info.desc}</p>
                  </div>
                );
              })()}
            </div>

            {/* 4 Visual Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Originality Score */}
              <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-5 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Originality Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">{report.originalityScore}%</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getOriginalityRatingLabel(report.originalityScore).color}`}>
                    {getOriginalityRatingLabel(report.originalityScore).label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${report.originalityScore}%` }} />
                </div>
              </div>

              {/* Card 2: Text Similarity */}
              <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-5 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Text Similarity</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">{report.similarityScore}%</span>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Platform Index
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${report.similarityScore}%` }} />
                </div>
              </div>

              {/* Card 3: Copyright Risk */}
              <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-5 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Copyright Risk</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${
                    report.copyrightRisk === 'HIGH' ? 'text-red-600' : report.copyrightRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {report.copyrightRisk}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">Risk Indicator</span>
                </div>
                <p className="text-[11px] text-gray-500">Informational indicator only.</p>
              </div>

              {/* Card 4: AI Content Indication */}
              <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-5 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Content Indication</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-purple-900">
                    {report.aiContentIndication?.status === 'DETECTED' ? 'Detected' : report.aiContentIndication?.status === 'NOT_DETECTED' ? 'Not Detected' : 'Unable to Determine'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">Confidence: {Math.round((report.aiContentIndication?.confidence || 0.9) * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Similarity Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <BarChart2 size={18} className="text-[#5B21B6]" />
              Similarity Breakdown
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Web Content Similarity', val: report.similarityBreakdown?.webContent || 0, color: 'bg-blue-500' },
                { label: 'Startup Idea Similarity', val: report.similarityBreakdown?.startupIdea || 0, color: 'bg-purple-500' },
                { label: 'Internal Platform Similarity', val: report.similarityBreakdown?.internalPlatform || 0, color: 'bg-indigo-500' },
                { label: 'Exact Text Match', val: report.similarityBreakdown?.exactMatch || 0, color: 'bg-amber-500' },
                { label: 'Paraphrased Similarity', val: report.similarityBreakdown?.paraphrased || 0, color: 'bg-teal-500' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                  <span className="text-xs font-bold text-gray-500 block">{item.label}</span>
                  <span className="text-2xl font-black text-gray-900">{item.val}%</span>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Startup Idea Similarity Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" />
              Startup Idea Similarity
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-gray-500">Problem Similarity</span>
                <p className="text-lg font-black text-purple-900">{report.startupIdeaSimilarity?.problem || 'Low'}</p>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-gray-500">Solution Similarity</span>
                <p className="text-lg font-black text-purple-900">{report.startupIdeaSimilarity?.solution || 'Low'}</p>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-gray-500">Target Market Similarity</span>
                <p className="text-lg font-black text-purple-900">{report.startupIdeaSimilarity?.targetMarket || 'Low'}</p>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-gray-500">Business Model Similarity</span>
                <p className="text-lg font-black text-purple-900">{report.startupIdeaSimilarity?.businessModel || 'Low'}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 italic leading-relaxed">
              "Startup idea similarity does not necessarily mean plagiarism or copyright infringement. Many businesses can independently develop similar ideas."
            </p>
          </div>

          {/* Matched Sources Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Search size={18} className="text-[#5B21B6]" /> Matched Sources
              </span>
              <span className="text-xs font-bold text-gray-400">
                {report.matches && report.matches.length > 0 ? `${report.matches.length} sources found` : '0 sources found'}
              </span>
            </h3>

            {report.matches && report.matches.length > 0 ? (
              <div className="space-y-3">
                {report.matches.map((m: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{m.sourceTitle}</span>
                        <span className="ml-2 text-xs font-semibold text-gray-500">({m.domain})</span>
                      </div>
                      <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        {m.similarity}% Similarity · {m.matchType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200 font-mono">
                      "{m.matchedText}"
                    </p>
                    <div className="flex justify-end">
                      <a
                        href={m.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#5B21B6] hover:underline inline-flex items-center gap-1"
                      >
                        View Source <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center text-sm text-gray-500">
                No significant matching sources found.
              </div>
            )}
          </div>

          {/* Matched Text Highlighting Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <FileCode size={18} className="text-[#5B21B6]" />
              Matched Text Highlighting
            </h3>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
              {report.content || previewContent}
            </div>
          </div>

          {/* AI Content Indication Note */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-purple-600" />
              AI Content Indication Disclaimer
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              "AI detection results are probabilistic and should not be treated as definitive proof of authorship."
            </p>
          </div>

          {/* Copyright Disclaimer */}
          <div className="bg-purple-50/60 rounded-2xl border border-purple-100 p-5 text-xs text-purple-900 leading-relaxed">
            <strong>Important Disclaimer:</strong> "This report identifies textual and conceptual similarity based on the sources available to the detection system. It is not a legal determination of copyright ownership, copyright infringement, or originality."
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              onClick={handleCheckPlagiarism}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} /> Check Again
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadReport}
                className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-2"
              >
                <Download size={14} /> Download Report
              </button>

              {onBackToBuilder && (
                <button
                  onClick={onBackToBuilder}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={14} /> Back to AI Builder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderPlagiarism;
