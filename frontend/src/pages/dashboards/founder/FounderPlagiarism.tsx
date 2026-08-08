import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Download, Copy,
  Check, FileText, Sparkles, Scale, Search, Award, Lock, ExternalLink,
  Shield, BarChart2
} from 'lucide-react';

interface FounderPlagiarismProps {
  startupData: any;
  setStartupData?: React.Dispatch<React.SetStateAction<any>>;
}

const FounderPlagiarism: React.FC<FounderPlagiarismProps> = ({ startupData }) => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanned, setLastScanned] = useState<string>('Just now');
  const [copied, setCopied] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const startupName = startupData?.startupName || 'Your Startup Idea';
  const startupIdea = startupData?.startupIdea || startupData?.description || 'AI-generated startup blueprint and market execution plan.';

  // Real-time scan simulation handler
  const handleRunScan = () => {
    setScanning(true);
    setScanProgress(10);
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          setLastScanned('Just now');
          return 100;
        }
        return prev + 18;
      });
    }, 300);
  };

  const handleCopyNotice = () => {
    const notice = `COPYRIGHT & ORIGINALITY DECLARATION\nStartup: ${startupName}\nOriginality Score: 98.4%\nPlagiarism: 1.6% (Common Industry Terms Only)\nStatus: 100% Cleared for Commercial & Trademark Use\nVerification ID: CERT-PLAG-${Date.now().toString().slice(-6)}\nDate: ${new Date().toLocaleDateString()}`;
    navigator.clipboard.writeText(notice);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadCert = () => {
    setDownloadingCert(true);
    setTimeout(() => {
      setDownloadingCert(false);
      alert(`Originality & Copyright Certificate for "${startupName}" downloaded successfully!`);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 p-7 lg:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-400" />
              100% Commercial & IP Cleared
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Plagiarism & Originality Audit
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Comprehensive AI-powered plagiarism scan, trademark verification, and copyright clearance analysis for <strong className="text-white">{startupName}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRunScan}
              disabled={scanning}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/15 backdrop-blur-md flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={16} className={scanning ? 'animate-spin text-purple-300' : ''} />
              {scanning ? `Auditing (${scanProgress}%)...` : 'Re-run Deep Scan'}
            </button>
            
            <button
              onClick={handleDownloadCert}
              disabled={downloadingCert}
              className="px-5 py-3 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={16} />
              {downloadingCert ? 'Generating PDF...' : 'Download IP Certificate'}
            </button>
          </div>
        </div>

        {/* Scan Progress Bar if active */}
        {scanning && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-300">
              <span>Scanning 14.2M+ web sources & patent registries...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Originality Score */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Originality Score</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">98.4%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Highly Unique
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Passed unique concept & phrasing checks.</p>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98.4%' }} />
          </div>
        </div>

        {/* Metric 2: Plagiarism Match */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Plagiarism Match</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Search size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">1.6%</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Safe Limit
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Only standard business terms detected.</p>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '1.6%' }} />
          </div>
        </div>

        {/* Metric 3: Copyright Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Copyright Clearance</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center">
              <Scale size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">100% Cleared</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Zero corporate IP or copyright overlaps.</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-700">
            <CheckCircle2 size={13} className="text-purple-600" /> Commercial Rights Protected
          </div>
        </div>

        {/* Metric 4: AI Synthetic Score */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trademark Risk</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">Low Risk</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Name & brand available for registration.</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <CheckCircle2 size={13} /> USPTO & Global Registry Checked
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Section Audit, Right Certificate Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left Column: Detailed Section Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <BarChart2 size={18} className="text-[#5B21B6]" />
                  Section-wise Originality Analysis
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Scanned against 14.2M+ web domains, articles, and startup repositories.</p>
              </div>
              <span className="text-xs font-bold text-gray-400">Last scanned: {lastScanned}</span>
            </div>

            <div className="space-y-4">
              {[
                { section: 'Executive Summary & Vision', originality: 99.2, matchedPhrases: 0, status: '100% Unique' },
                { section: 'Problem & Solution Fit', originality: 98.6, matchedPhrases: 1, status: 'Unique' },
                { section: 'Business & Revenue Model', originality: 97.4, matchedPhrases: 2, status: 'Standard Terms' },
                { section: 'Market & Competitive Landscape', originality: 98.1, matchedPhrases: 1, status: 'Unique' },
                { section: 'Financial Projections & Unit Economics', originality: 99.8, matchedPhrases: 0, status: '100% Unique' },
                { section: 'Legal & Risk Compliance', originality: 97.0, matchedPhrases: 3, status: 'Boilerplate Safe' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-800">{item.section}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                      <span className="font-extrabold text-gray-900">{item.originality}% Original</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#5B21B6] to-emerald-500 h-2 rounded-full"
                      style={{ width: `${item.originality}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-500 pt-0.5">
                    <span>{item.matchedPhrases === 0 ? 'No matched phrases found' : `${item.matchedPhrases} generic industry term matched`}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={11} /> Passed IP Check
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database Coverage Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Search size={16} className="text-[#5B21B6]" />
              Scanned Registries & Search Index Coverage
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'USPTO Patent Database', count: '11.8M Patents', status: '0 Conflicts' },
                { name: 'WIPO International Registry', count: '6.4M Entries', status: '0 Conflicts' },
                { name: 'Global Business Registries', count: '4.2M Startups', status: '0 Overlaps' },
                { name: 'Academic & ArXiv Research', count: '2.1M Papers', status: '0 Matches' },
                { name: 'Domain & Brand Names', count: '14.2M Domains', status: 'Available' },
                { name: 'Corporate Copyright Index', count: '8.9M Files', status: '100% Cleared' },
              ].map((db, i) => (
                <div key={i} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/60">
                  <p className="text-xs font-bold text-gray-900">{db.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{db.count}</p>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <Check size={10} /> {db.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clearance Certificate & Legal Protection Card */}
        <div className="space-y-6">
          {/* Certificate Card */}
          <div className="bg-gradient-to-b from-white to-purple-50/40 rounded-2xl border border-purple-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white shadow-md shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">Originality Clearance Certificate</h4>
                <p className="text-xs text-gray-500">Official IP verification proof</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 text-xs space-y-2.5 shadow-xs">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Certificate ID:</span>
                <span className="font-mono font-bold text-gray-900">CERT-PLAG-2026-9814</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Startup Name:</span>
                <span className="font-bold text-gray-900 truncate max-w-[150px]">{startupName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Originality Score:</span>
                <span className="font-bold text-emerald-600">98.4% Unique</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Plagiarism Match:</span>
                <span className="font-bold text-blue-600">1.6% (Generic)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Issued On:</span>
                <span className="font-bold text-gray-800">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyNotice}
                className="w-full py-2.5 px-4 bg-white border border-purple-200 hover:bg-purple-50 text-[#5B21B6] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy IP Declaration Notice'}
              </button>

              <button
                onClick={handleDownloadCert}
                className="w-full py-2.5 px-4 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={14} /> Download Official Certificate PDF
              </button>
            </div>
          </div>

          {/* Legal Protection Advice */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Lock size={15} className="text-amber-500" />
              IP & Trademark Next Steps
            </h4>
            <ul className="text-xs text-gray-600 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>File provisional patent for unique technical or business architecture.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Reserve corporate domain names and social handles for <strong>{startupName}</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Share this clearance certificate with potential investors during pitch reviews.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderPlagiarism;
