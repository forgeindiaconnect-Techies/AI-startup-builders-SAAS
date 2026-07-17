import React, { useState } from 'react';
import {
  Scale, Building2, UserCheck, MapPin, FileCheck, Shield,
  TrendingUp, Calendar, ClipboardCheck, AlertTriangle,
  Loader2, RefreshCw, ChevronDown, ChevronRight, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { API_URL } from '../../../config/api';

interface Props {
  startupData: any;
  setStartupData?: (data: any) => void;
}

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Uploaded: 'bg-blue-50 text-blue-700 border-blue-200',
  Verified: 'bg-green-50 text-green-700 border-green-200',
  'Not Applicable': 'bg-gray-50 text-gray-500 border-gray-200',
};

const requiredColors: Record<string, string> = {
  Required: 'bg-red-50 text-red-700 border-red-200',
  Optional: 'bg-blue-50 text-blue-700 border-blue-200',
  'Not Applicable': 'bg-gray-50 text-gray-500 border-gray-200',
};

const FounderLegalDocs: React.FC<Props> = ({ startupData }) => {
  const [loading, setLoading] = useState(false);
  const [legalData, setLegalData] = useState<any>(null);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true, structure: true, founder: false, address: false,
    registrations: false, licenses: false, investor: false,
    timeline: false, checklist: false
  });

  const toggle = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/ai-builder/generate-legal-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName: startupData.startupName,
          startupIdea: startupData.startupIdea,
          location: 'India'
        })
      });
      const json = await res.json();
      if (json.success) {
        setLegalData(json.data);
      } else {
        setError(json.message || 'Failed to generate legal documents.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!legalData && !loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Scale size={28} className="text-[#5B21B6]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Legal & Documents Generator</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
          Generate startup-specific legal documents, registrations, licenses, and compliance checklist based on your business category.
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <Loader2 size={40} className="animate-spin text-[#5B21B6] mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Generating Legal Documents...</h3>
        <p className="text-gray-500 text-sm">AI is analyzing your business category and generating compliance checklist.</p>
      </div>
    );
  }

  if (error && !legalData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h3>
        <p className="text-red-600 text-sm mb-6">{error}</p>
        <button
          onClick={handleGenerate}
          className="inline-flex items-center px-6 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
        >
          <RefreshCw size={18} className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  const Section = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
            <Icon size={18} className="text-[#5B21B6]" />
          </div>
          <span className="font-bold text-gray-900 text-sm">{title}</span>
        </div>
        {expandedSections[id] ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {expandedSections[id] && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Legal & Compliance Report</h3>
          <p className="text-gray-500 text-sm">Generated for {startupData.startupName}</p>
        </div>
        <button onClick={handleGenerate} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center transition-colors">
          <RefreshCw size={14} className="mr-1.5" /> Regenerate
        </button>
      </div>

      {/* 1. Detected Category */}
      <Section id="category" title="Detected Business Category" icon={Building2}>
        <div className="pt-4">
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm font-bold text-purple-900">{legalData.detectedCategory}</p>
            <p className="text-xs text-purple-700 mt-1">{legalData.categoryReason}</p>
          </div>
        </div>
      </Section>

      {/* 2. Recommended Structure */}
      <Section id="structure" title="Recommended Business Structure" icon={Scale}>
        <div className="pt-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm font-bold text-blue-900">{legalData.recommendedStructure?.type}</p>
            <p className="text-xs text-blue-700 mt-1">{legalData.recommendedStructure?.reason}</p>
          </div>
        </div>
      </Section>

      {/* 3. Founder Documents */}
      <Section id="founder" title="Founder Documents" icon={UserCheck}>
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {legalData.founderDocuments?.map((doc: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Business Address Documents */}
      <Section id="address" title="Business Address Documents" icon={MapPin}>
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {legalData.businessAddressDocuments?.map((doc: any, i: number) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${doc.applicable ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
              {doc.applicable ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> : <XCircle size={16} className="text-gray-400 mt-0.5 shrink-0" />}
              <div>
                <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Registrations Needed */}
      <Section id="registrations" title="Registrations Needed" icon={FileCheck}>
        <div className="pt-4 space-y-2">
          {legalData.registrationsNeeded?.map((reg: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${reg.mandatory ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {reg.mandatory ? 'MANDATORY' : 'OPTIONAL'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{reg.name}</p>
                <p className="text-xs text-gray-500">{reg.description}</p>
                {reg.portal && <p className="text-[10px] text-purple-600 mt-0.5 font-mono">{reg.portal}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Industry-Specific Licenses */}
      <Section id="licenses" title="Industry-Specific Licenses" icon={Shield}>
        <div className="pt-4 space-y-2">
          {legalData.industryLicenses?.map((lic: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${lic.mandatory ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {lic.mandatory ? 'MANDATORY' : 'OPTIONAL'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{lic.name}</p>
                <p className="text-xs text-gray-500">{lic.description}</p>
                {lic.authority && <p className="text-[10px] text-gray-400 mt-0.5">Authority: {lic.authority}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Investor-Ready Documents */}
      <Section id="investor" title="Investor-Ready Documents" icon={TrendingUp}>
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {legalData.investorReadyDocs?.map((doc: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Clock size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 8. Compliance Timeline */}
      <Section id="timeline" title="Compliance Timeline" icon={Calendar}>
        <div className="pt-4 space-y-4">
          {Object.entries(legalData.complianceTimeline || {}).map(([phase, items]: [string, any]) => (
            <div key={phase}>
              <p className="text-xs font-bold text-[#5B21B6] uppercase tracking-wider mb-2">
                {phase.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <div className="space-y-1">
                {items?.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-[#5B21B6] rounded-full mt-1.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 9. Missing Documents Checklist */}
      <Section id="checklist" title="Documents Checklist" icon={ClipboardCheck}>
        <div className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-2 font-bold">Document</th>
                <th className="pb-2 font-bold">Priority</th>
                <th className="pb-2 font-bold hidden sm:table-cell">Why Needed</th>
                <th className="pb-2 font-bold hidden sm:table-cell">Issued By</th>
                <th className="pb-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {legalData.missingDocumentsChecklist?.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-bold text-gray-900">{item.documentName}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${requiredColors[item.required] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {item.required}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-gray-500 hidden sm:table-cell">{item.whyNeeded}</td>
                  <td className="py-3 text-xs text-gray-500 hidden sm:table-cell">{item.issuedBy}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[item.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

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
