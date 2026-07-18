import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Search, Download, Trash2, X, Eye, Scale,
  CheckCircle2, Clock, ChevronDown, ChevronRight, UploadCloud, RefreshCw,
  Building2, Utensils, Monitor, ShoppingCart, GraduationCap, Factory, Store,
  Truck, Banknote, Wrench, HelpCircle, ExternalLink, AlertTriangle, Filter,
  XCircle, FileWarning,
} from 'lucide-react';
import {
  getDocuments, saveDocument, deleteDocument,
  getStartups, getStartupById, detectStartupCategory, generateCategoryDocuments,
} from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  'Food / Restaurant / Cafe': { icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Food / Restaurant / Cafe' },
  'SaaS / Software / AI': { icon: Monitor, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'SaaS / Software / AI' },
  'Healthcare / Clinic / Hospital': { icon: Building2, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Healthcare / Clinic / Hospital' },
  'E-commerce': { icon: ShoppingCart, color: 'text-green-600', bgColor: 'bg-green-100', label: 'E-commerce' },
  'Education / Training': { icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Education / Training' },
  'Manufacturing': { icon: Factory, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Manufacturing' },
  'Retail / Local Shop': { icon: Store, color: 'text-pink-600', bgColor: 'bg-pink-100', label: 'Retail / Local Shop' },
  'Transport / Delivery': { icon: Truck, color: 'text-cyan-600', bgColor: 'bg-cyan-100', label: 'Transport / Delivery' },
  'Finance / FinTech': { icon: Banknote, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Finance / FinTech' },
  'Service Business': { icon: Wrench, color: 'text-teal-600', bgColor: 'bg-teal-100', label: 'Service Business' },
  'Other': { icon: HelpCircle, color: 'text-gray-500', bgColor: 'bg-gray-50', label: 'Other' },
};

const DOCUMENT_CATEGORY_OPTIONS = [
  'All',
  'Founder Documents',
  'Business Registration',
  'Licenses',
  'Tax & GST',
  'Business Address',
  'Investor Documents',
  'Optional Documents',
  'AI Generated',
];

const STATUS_OPTIONS = ['All', 'Pending', 'Uploaded', 'Pending Verification', 'Verified', 'Rejected'];

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'verified': return 'bg-green-50 text-green-700 border-green-200';
    case 'uploaded': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'pending verification': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
    case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'verified': return <CheckCircle2 size={14} className="text-green-500" />;
    case 'uploaded': return <UploadCloud size={14} className="text-blue-500" />;
    case 'pending verification': return <Clock size={14} className="text-orange-500" />;
    case 'rejected': return <XCircle size={14} className="text-red-500" />;
    case 'pending': return <Clock size={14} className="text-yellow-500" />;
    default: return <FileWarning size={14} className="text-gray-400" />;
  }
};

const FounderDocuments: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const startupId = searchParams.get('id') || searchParams.get('startupId');

  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDocCategory, setFilterDocCategory] = useState('All');
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<'essential' | 'optional' | null>('essential');
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshDocs = useCallback(() => {
    const allStartupsList = getStartups() || [];
    setAllStartups(allStartupsList);
    const allDocs = getDocuments() || [];
    if (startupId) {
      setDocuments(allDocs.filter((d: any) => d.startupId === startupId));
      const info = getStartupById(startupId);
      setSelectedStartup(info);
      if (info) setCategory(detectStartupCategory(info));
    } else {
      setDocuments(allDocs);
      setSelectedStartup(null);
      setCategory('');
    }
  }, [startupId]);

  useEffect(() => { refreshDocs(); }, [refreshDocs]);

  useEffect(() => {
    const onFocus = () => refreshDocs();
    const onStorage = (e: StorageEvent) => { if (e.key === 'ai_startup_builder_documents') refreshDocs(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshDocs(); });
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshDocs]);

  const handleGenerateCategoryDocs = () => {
    if (!startupId || !selectedStartup) return;
    const existingCatDocs = documents.filter(d => d.documentType && d.documentType !== '__checklist__');
    if (existingCatDocs.length > 0) {
      if (!window.confirm('This will replace existing category documents. Continue?')) return;
      existingCatDocs.forEach(d => deleteDocument(d.id));
    }
    const newDocs = generateCategoryDocuments(startupId, selectedStartup.founderId || 'current_user', selectedStartup.startupName, category);
    newDocs.forEach(doc => saveDocument(doc));
    refreshDocs();
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleLegalFileChange = (e: React.ChangeEvent<HTMLInputElement>, pendingDoc: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const updatedDoc = {
        ...pendingDoc,
        fileType: (file.name.split('.').pop() || 'file').toUpperCase(),
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileData: URL.createObjectURL(file),
        fileName: `${pendingDoc.documentLabel.replace(/\s+/g, '_')}.${file.name.split('.').pop()}`,
        status: 'Pending Verification',
        verificationStatus: 'pending_verification',
        updatedAt: new Date().toISOString(),
      };
      saveDocument(updatedDoc);
      refreshDocs();
      e.target.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const targetStartupId = startupId || (getStartups().length > 0 ? getStartups()[0].startupId : 'startup_default');
      const newDoc = {
        id: `doc_${Date.now()}`,
        startupId: targetStartupId,
        founderId: 'current_user',
        fileName: file.name,
        fileType: (file.name.split('.').pop() || 'file').toUpperCase(),
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileData: URL.createObjectURL(file),
        category: 'AI Generated',
        status: 'Pending Verification',
        verificationStatus: 'pending_verification',
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveDocument(newDoc);
      refreshDocs();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
      refreshDocs();
    }
  };

  const handleDownload = async (name: string, format?: string) => {
    const finalFormat = format ? format.toLowerCase() : name.split('.').pop()?.toLowerCase() || 'txt';
    const baseName = name.replace(/\.[^/.]+$/, '');
    const finalName = `${baseName}.${finalFormat}`;
    try {
      if (finalFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(`Startup Document: ${baseName.replace(/_/g, ' ')}`, 20, 20);
        doc.setFontSize(12);
        doc.text('This is an automatically generated document by AI Startup Builder.', 20, 30);
        doc.text('Contains full strategic planning, market analysis, and AI roadmap.', 20, 40);
        doc.save(finalName);
      } else if (finalFormat === 'word' || finalFormat === 'docx' || finalFormat === 'doc') {
        const docx = new DocxDocument({
          sections: [{
            properties: {},
            children: [
              new Paragraph({ children: [new TextRun({ text: `Startup Document: ${baseName.replace(/_/g, ' ')}`, bold: true, size: 28 })] }),
              new Paragraph({ children: [new TextRun({ text: 'This is an automatically generated document by AI Startup Builder.', size: 24 })] }),
            ],
          }],
        });
        const blob = await Packer.toBlob(docx);
        saveAs(blob, `${baseName}.docx`);
      } else if (finalFormat === 'zip') {
        const zip = new JSZip();
        zip.file('readme.txt', 'This ZIP contains the startup package documents.');
        zip.file(`${baseName}.txt`, `Startup Document: ${baseName.replace(/_/g, ' ')}\nThis is an automatically generated document.`);
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, finalName);
      } else {
        const content = `Mock content for ${finalName}`;
        const blob = new Blob([content], { type: 'text/plain' });
        saveAs(blob, finalName);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      window.alert(`Failed to generate ${finalFormat.toUpperCase()} file.`);
    }
  };

  const categoryConfig = category ? CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'] : null;
  const CategoryIcon = categoryConfig?.icon || HelpCircle;

  const essentialDocs = documents.filter(d => d.documentType && d.documentType !== '__checklist__' && d.documentSection === 'Essential');
  const optionalDocs = documents.filter(d => d.documentType && d.documentType !== '__checklist__' && d.documentSection === 'Optional');
  const hasCategoryDocs = essentialDocs.length > 0 || optionalDocs.length > 0;

  const filteredDocs = documents.filter(d => {
    const matchesSearch = !search ||
      d.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      d.category?.toLowerCase().includes(search.toLowerCase()) ||
      d.documentLabel?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' ||
      d.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesDocCat = filterDocCategory === 'All' ||
      d.category?.toLowerCase().includes(filterDocCategory.toLowerCase()) ||
      (filterDocCategory === 'AI Generated' && !d.documentType);
    return matchesSearch && matchesStatus && matchesDocCat;
  });

  const pendingCount = essentialDocs.filter(d => d.status === 'Pending').length;
  const uploadedCount = essentialDocs.filter(d => d.status !== 'Pending').length;
  const verifiedCount = documents.filter(d => d.verificationStatus === 'verified').length;
  const rejectedCount = documents.filter(d => d.verificationStatus === 'rejected').length;
  const pendingVerifyCount = documents.filter(d => d.verificationStatus === 'pending_verification' || d.status === 'Pending Verification').length;

  return (
    <>
      <div className="animate-fade-in-up">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-500 mt-1">
              {selectedStartup
                ? `Documents for ${selectedStartup.startupName}`
                : 'Upload and manage all your startup documents securely.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refreshDocs} className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* Startup Selector + Category Badge */}
        {allStartups.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-[#5B21B6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Startup</p>
                  <select
                    value={startupId || ''}
                    onChange={(e) => {
                      if (e.target.value) setSearchParams({ startupId: e.target.value });
                      else setSearchParams({});
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="">All Startups (No Filter)</option>
                    {allStartups.map((s: any) => (
                      <option key={s.startupId} value={s.startupId}>
                        {s.startupName} - {detectStartupCategory(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {category && categoryConfig && (
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${categoryConfig.bgColor} ${categoryConfig.color} border-current/20`}>
                  <CategoryIcon size={18} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Category</p>
                    <p className="text-sm font-bold">{categoryConfig.label}</p>
                  </div>
                </div>
              )}
              {startupId && (
                <button
                  onClick={() => navigate(`/dashboard/founder/ai-builder?startupId=${startupId}`)}
                  className="px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Building2 size={16} />
                  View in AI Builder
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allStartups.length === 0 && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={24} className="text-[#5B21B6]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Startups Found</h3>
            <p className="text-sm text-gray-500 mb-4">Create a startup idea first to see category-specific documents.</p>
            <button onClick={() => navigate('/dashboard/founder/startups')} className="px-5 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl transition-colors">
              Create Startup
            </button>
          </div>
        )}

        {/* AI-Generated Document Checklist */}
        {startupId && !hasCategoryDocs && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#5B21B6] rounded-xl flex items-center justify-center shrink-0">
                <Scale size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1">Generate Document Checklist</h3>
                <p className="text-sm text-gray-600 mb-3">
                  AI will detect your business category (<strong>{categoryConfig?.label || 'Unknown'}</strong>) and generate only the essential documents required for your specific business type.
                </p>
                <button onClick={handleGenerateCategoryDocs} className="px-5 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
                  <Scale size={16} /> Generate Document Checklist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {startupId && hasCategoryDocs && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Disclaimer:</strong> This is an AI-generated checklist. Please verify with a CA, lawyer, or local authority before registration.
            </p>
          </div>
        )}

        {/* Essential Documents Section */}
        {essentialDocs.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'essential' ? null : 'essential')}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Scale size={20} className="text-[#5B21B6]" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900">Essential Documents</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{essentialDocs.length} documents - {pendingCount} pending, {uploadedCount} uploaded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {pendingCount > 0 && (
                  <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">{pendingCount} pending</span>
                )}
                {expandedSection === 'essential' ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
              </div>
            </button>
            {expandedSection === 'essential' && (
              <div className="px-5 pb-5 border-t border-gray-100 space-y-3">
                {essentialDocs.map((doc: any) => (
                  <div key={doc.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    doc.status === 'Verified' ? 'bg-green-50/50 border-green-200' :
                    doc.status === 'Uploaded' || doc.status === 'Pending Verification' ? 'bg-blue-50/50 border-blue-200' :
                    doc.status === 'Rejected' ? 'bg-red-50/50 border-red-200' :
                    'bg-yellow-50/50 border-yellow-200 hover:bg-yellow-50'
                  }`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(doc.status)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{doc.documentLabel}</p>
                          {doc.required && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">Required</span>
                          )}
                        </div>
                        {doc.documentDescription && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{doc.documentDescription}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(doc.status)}`}>
                        {doc.status}
                      </span>
                      {doc.applyLink && (
                        <a href={doc.applyLink} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors" title="Apply Online">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {(doc.status === 'Uploaded' || doc.status === 'Verified') && doc.fileData && (
                        <button onClick={() => handleDownload(doc.fileName)} className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors" title="Download">
                          <Download size={14} />
                        </button>
                      )}
                      {(doc.status === 'Pending' || doc.status === 'Rejected') && (
                        <label className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1">
                          <UploadCloud size={12} /> Upload
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleLegalFileChange(e, doc)} />
                        </label>
                      )}
                      <button onClick={() => handleDelete(doc.id)} title="Remove" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Optional Documents Section */}
        {optionalDocs.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowOptional(!showOptional)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-gray-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900">Optional Documents</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{optionalDocs.length} documents - recommended but not mandatory</p>
                </div>
              </div>
              {showOptional ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
            </button>
            {showOptional && (
              <div className="px-5 pb-5 border-t border-gray-100 space-y-3">
                {optionalDocs.map((doc: any) => (
                  <div key={doc.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    doc.status === 'Verified' ? 'bg-green-50/50 border-green-200' :
                    doc.status === 'Uploaded' || doc.status === 'Pending Verification' ? 'bg-blue-50/50 border-blue-200' :
                    doc.status === 'Rejected' ? 'bg-red-50/50 border-red-200' :
                    'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(doc.status)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{doc.documentLabel}</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">Optional</span>
                        </div>
                        {doc.documentDescription && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{doc.documentDescription}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(doc.status)}`}>
                        {doc.status}
                      </span>
                      {doc.applyLink && (
                        <a href={doc.applyLink} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors" title="Apply Online">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {(doc.status === 'Uploaded' || doc.status === 'Verified') && doc.fileData && (
                        <button onClick={() => handleDownload(doc.fileName)} className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors" title="Download">
                          <Download size={14} />
                        </button>
                      )}
                      {(doc.status === 'Pending' || doc.status === 'Rejected') && (
                        <label className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1">
                          <UploadCloud size={12} /> Upload
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleLegalFileChange(e, doc)} />
                        </label>
                      )}
                      <button onClick={() => handleDelete(doc.id)} title="Remove" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Drop Zone */}
        {startupId && (
          <div className="mb-8 border-2 border-dashed border-gray-200 hover:border-[#5B21B6]/50 rounded-2xl p-10 text-center bg-white transition-colors cursor-pointer group">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-colors">
              <Upload size={28} className="text-[#5B21B6]" />
            </div>
            <p className="text-base font-bold text-gray-700 mb-1">Drop files here to upload</p>
            <p className="text-sm text-gray-400">PDF, PPTX, DOCX, XLSX, ZIP up to 50MB</p>
            <button onClick={handleUploadClick} className="mt-4 px-5 py-2 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] text-sm font-bold rounded-xl transition-colors">
              Browse Files
            </button>
          </div>
        )}

        {/* Filter Bar */}
        {startupId && documents.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <select value={filterDocCategory} onChange={(e) => setFilterDocCategory(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white appearance-none cursor-pointer">
                  {DOCUMENT_CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Categories' : opt}</option>)}
                </select>
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white appearance-none cursor-pointer">
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Statuses' : opt}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {startupId && documents.length > 0 && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-gray-900">{documents.length}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">Total</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-yellow-600">{pendingCount}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">Pending</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-orange-600">{pendingVerifyCount}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">Under Review</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-green-600">{verifiedCount}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">Verified</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-red-600">{rejectedCount}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">Rejected</p>
            </div>
          </div>
        )}

        {/* All Documents Table */}
        {startupId && filteredDocs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">All Documents</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-500">
                            {getStatusIcon(doc.status)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{doc.documentLabel || doc.fileName}</p>
                            {doc.documentDescription && <p className="text-xs text-gray-400 truncate">{doc.documentDescription}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-purple-50 text-purple-600 border-purple-100">
                          {doc.documentSection || doc.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(doc.status)}`}>
                          {doc.status || 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPreviewDoc(doc)} title="Preview" className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"><Eye size={16} /></button>
                          {doc.applyLink && (
                            <a href={doc.applyLink} target="_blank" rel="noopener noreferrer" title="Apply Online" className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"><ExternalLink size={16} /></a>
                          )}
                          {(doc.status === 'Uploaded' || doc.status === 'Verified') && doc.fileData && (
                            <button onClick={() => handleDownload(doc.fileName)} title="Download" className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"><Download size={16} /></button>
                          )}
                          <button onClick={() => handleDelete(doc.id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No documents state */}
        {startupId && documents.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <FileText size={24} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No documents yet</h3>
            <p className="text-gray-500 text-sm">Generate your document checklist above or upload files directly.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden animate-fade-in-up flex flex-col h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                  {getStatusIcon(previewDoc.status)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{previewDoc.documentLabel || previewDoc.fileName}</h3>
                  <p className="text-xs text-gray-500">{previewDoc.documentSection || previewDoc.category} - {previewDoc.status}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-8 bg-gray-100 overflow-y-auto">
              <div className="bg-white mx-auto max-w-2xl shadow-sm border border-gray-200 rounded-lg p-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">{previewDoc.documentLabel}</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-gray-700">{previewDoc.documentDescription || 'No description available.'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(previewDoc.status)}`}>{previewDoc.status}</span>
                  </div>
                  {previewDoc.applyLink && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Apply Online</p>
                      <a href={previewDoc.applyLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#5B21B6] font-bold hover:underline flex items-center gap-1">
                        <ExternalLink size={14} /> Official Website
                      </a>
                    </div>
                  )}
                  {previewDoc.verificationNote && (
                    <div className={`p-3 rounded-lg ${previewDoc.verificationStatus === 'rejected' ? 'bg-red-50' : 'bg-green-50'}`}>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Admin Note</p>
                      <p className={`text-sm ${previewDoc.verificationStatus === 'rejected' ? 'text-red-700' : 'text-green-700'}`}>{previewDoc.verificationNote}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setPreviewDoc(null)} className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors">Close</button>
              {previewDoc.applyLink && (
                <a href={previewDoc.applyLink} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center gap-2">
                  <ExternalLink size={16} /> Apply Online
                </a>
              )}
              {(previewDoc.status === 'Uploaded' || previewDoc.status === 'Verified') && previewDoc.fileData && (
                <button onClick={() => { handleDownload(previewDoc.fileName); setPreviewDoc(null); }}
                  className="px-4 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-colors flex items-center gap-2">
                  <Download size={16} /> Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FounderDocuments;
