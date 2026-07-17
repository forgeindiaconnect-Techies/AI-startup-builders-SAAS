import React, { useState, useEffect } from 'react';
import {
  Scale, Building2, FileCheck, Shield, ChevronDown, ChevronRight,
  CheckCircle2, Clock, Loader2, RefreshCw, AlertTriangle, XCircle
} from 'lucide-react';
import { API_URL } from '../../../config/api';
import { saveDocument, getDocuments } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';

interface Props {
  startupData: any;
}

const FounderLegalDocs: React.FC<Props> = ({ startupData }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [legalData, setLegalData] = useState<any>(null);
  const [error, setError] = useState('');
  const [savedToDocs, setSavedToDocs] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true, essential: true, optional: false, investor: false
  });

  const toggle = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const docs = getDocuments() || [];
    const existing = docs.find((d: any) =>
      d.startupId === startupData.startupId && d.category === 'Legal Document' && d.documentType === '__checklist__'
    );
    if (existing?.aiLegalData) {
      setLegalData(existing.aiLegalData);
      setSavedToDocs(true);
    }
  }, [startupData.startupId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/ai-builder/generate-legal-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupName: startupData.startupName, startupIdea: startupData.startupIdea, location: 'India' })
      });
      const json = await res.json();
      if (json.success) {
        setLegalData(json.data);
        saveLegalDocsToDocuments(json.data);
      } else {
        setError(json.message || 'Failed to generate legal documents.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveLegalDocsToDocuments = (data: any) => {
    // First remove any existing legal docs for this startup to avoid duplicates
    const existingDocs = getDocuments() || [];
    const cleanedDocs = existingDocs.filter((d: any) =>
      !(d.startupId === startupData.startupId && d.category === 'Legal Document')
    );
    localStorage.setItem('ai_startup_builder_documents', JSON.stringify(cleanedDocs));

    const allDocs: any[] = [];

    // Save the full checklist reference
    allDocs.push({
      id: `doc_legal_checklist_${Date.now()}`,
      startupId: startupData.startupId,
      founderId: user?.id || startupData.founderId || 'founder_demo',
      fileName: `${startupData.startupName.replace(/\s+/g, '_')}_Legal_Checklist.json`,
      fileType: 'JSON', fileSize: '0.1 MB',
      fileData: JSON.stringify(data),
      category: 'Legal Document',
      documentType: '__checklist__',
      documentLabel: `Legal Checklist — ${data.detectedCategory || 'AI Generated'}`,
      status: 'Pending',
      aiLegalData: data,
      sharedWith: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const addPendingDoc = (name: string, reason: string, required: boolean, uploadRequired: boolean, section: string) => {
      allDocs.push({
        id: `doc_legal_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        startupId: startupData.startupId,
        founderId: user?.id || startupData.founderId || 'founder_demo',
        fileName: `${startupData.startupName.replace(/\s+/g, '_')}_${name.replace(/\s+/g, '_')}`,
        fileType: 'PENDING', fileSize: '—', fileData: '',
        category: 'Legal Document',
        documentType: name,
        documentLabel: name,
        documentDescription: reason,
        documentSection: section,
        required: required,
        uploadRequired: uploadRequired,
        status: 'Pending',
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    };

    data.essentialDocuments?.forEach((doc: any) => addPendingDoc(doc.name, doc.reason, true, doc.uploadRequired === 'Yes', 'Essential'));
    data.optionalDocuments?.forEach((doc: any) => addPendingDoc(doc.name, doc.reason, false, doc.uploadRequired === 'Yes', 'Optional'));
    data.investorDocuments?.forEach((doc: any) => addPendingDoc(doc.name, doc.reason, false, false, 'Investor'));

    allDocs.forEach(doc => saveDocument(doc));
    setSavedToDocs(true);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Uploaded': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Verified': return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const Section = ({ id, title, icon: Icon, count, children }: { id: string; title: string; icon: any; count?: number; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
            <Icon size={18} className="text-[#5B21B6]" />
          </div>
          <span className="font-bold text-gray-900 text-sm">{title}</span>
          {count !== undefined && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{count}</span>}
        </div>
        {expandedSections[id] ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {expandedSections[id] && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );

  const DocList = ({ docs }: { docs: any[] }) => (
    <div className="space-y-2 pt-3">
      {docs?.map((doc: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {doc.status === 'Verified' ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
            : doc.status === 'Rejected' ? <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            : doc.status === 'Uploaded' ? <Clock size={16} className="text-blue-500 mt-0.5 shrink-0" />
            : <Clock size={16} className="text-yellow-500 mt-0.5 shrink-0" />}
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">{doc.name}</p>
              <p className="text-xs text-gray-500">{doc.reason}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {doc.uploadRequired === 'Yes' && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                Upload Required
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(doc.status)}`}>
              {doc.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <Loader2 size={40} className="animate-spin text-[#5B21B6] mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Generating Legal Documents...</h3>
        <p className="text-gray-500 text-sm">AI is analyzing your business and generating category-specific documents.</p>
      </div>
    );
  }

  // Error state
  if (error && !legalData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h3>
        <p className="text-red-600 text-sm mb-6">{error}</p>
        <button onClick={handleGenerate} className="inline-flex items-center px-6 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-md active:scale-95">
          <RefreshCw size={18} className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (!legalData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Scale size={28} className="text-[#5B21B6]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Legal & Documents Generator</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
          AI will analyze your business idea and generate category-specific essential documents, optional docs, and investor-ready documents.
        </p>
        <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-100 text-left max-w-md mx-auto">
          <p className="text-xs font-bold text-purple-900 mb-1">For: {startupData.startupName}</p>
          <p className="text-xs text-purple-700 line-clamp-2">{startupData.startupIdea}</p>
        </div>
        <button
          onClick={handleGenerate}
          className="inline-flex items-center px-6 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
        >
          <Scale size={18} className="mr-2" />
          Generate Legal Documents
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Legal & Compliance Report</h3>
          <p className="text-gray-500 text-sm">Generated for {startupData.startupName}</p>
        </div>
        <div className="flex items-center gap-3">
          {savedToDocs && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Saved to Documents
            </span>
          )}
          <button onClick={handleGenerate} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center transition-colors">
            <RefreshCw size={14} className="mr-1.5" /> Regenerate
          </button>
        </div>
      </div>

      {/* Detected Category */}
      <Section id="category" title="Detected Business Category" icon={Building2}>
        <div className="pt-4">
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm font-bold text-purple-900">{legalData.detectedCategory}</p>
            <p className="text-xs text-purple-700 mt-1">{legalData.categoryReason}</p>
          </div>
        </div>
      </Section>

      {/* Essential Documents */}
      <Section id="essential" title="Essential Documents" icon={Shield} count={legalData.essentialDocuments?.length}>
        <DocList docs={legalData.essentialDocuments} />
      </Section>

      {/* Optional Documents */}
      <Section id="optional" title="Optional Documents" icon={FileCheck} count={legalData.optionalDocuments?.length}>
        <DocList docs={legalData.optionalDocuments} />
      </Section>

      {/* Investor Documents */}
      <Section id="investor" title="Investor Documents" icon={FileCheck} count={legalData.investorDocuments?.length}>
        <DocList docs={legalData.investorDocuments} />
      </Section>

      {/* Saved notice */}
      {savedToDocs && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-800">Documents saved to your Documents page</p>
            <p className="text-xs text-green-700 mt-1">
              All essential and optional documents have been added as pending entries.
              Go to <strong>Documents</strong> in the sidebar to upload each document.
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">Disclaimer</p>
          <p className="text-xs text-amber-700 mt-1">{legalData.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

export default FounderLegalDocs;
