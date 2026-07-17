import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, FileText, File, Image, Search, Download, Trash2, X, Eye, Scale, CheckCircle2, Clock, ChevronDown, ChevronRight, UploadCloud, RefreshCw } from 'lucide-react';
import { getDocuments, saveDocument, deleteDocument, getStartups, getStartupById } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf': return <FileText size={18} />;
    case 'zip': return <Image size={18} />;
    case 'ppt': case 'pptx': return <File size={18} />;
    case 'xls': case 'xlsx': return <File size={18} />;
    case 'word': case 'doc': case 'docx': return <File size={18} />;
    default: return <File size={18} />;
  }
};

const getFileColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf': return 'bg-red-100 text-red-600';
    case 'zip': return 'bg-blue-100 text-blue-600';
    case 'ppt': case 'pptx': return 'bg-orange-100 text-orange-600';
    case 'xls': case 'xlsx': return 'bg-green-100 text-green-600';
    case 'word': case 'doc': case 'docx': return 'bg-blue-100 text-blue-600';
    case 'pending': return 'bg-yellow-100 text-yellow-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const FounderDocuments: React.FC = () => {
  const [searchParams] = useSearchParams();
  const startupId = searchParams.get('id') || searchParams.get('startupId');

  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [downloadDropdown, setDownloadDropdown] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'legal' | null>('legal');
  const [selectedStartup, setSelectedStartup] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshDocs = useCallback(() => {
    const allDocs = getDocuments() || [];
    if (startupId) {
      setDocuments(allDocs.filter((d: any) => d.startupId === startupId));
      const info = getStartupById(startupId);
      setSelectedStartup(info);
    } else {
      setDocuments(allDocs);
      setSelectedStartup(null);
    }
  }, [startupId]);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  // Re-read documents when window gains focus (user navigates back from AI Builder)
  // or when localStorage changes (another component saved docs)
  useEffect(() => {
    const onFocus = () => refreshDocs();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ai_startup_builder_documents') refreshDocs();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshDocs();
    });
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshDocs]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLegalFileChange = (e: React.ChangeEvent<HTMLInputElement>, pendingDoc: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const updatedDoc = {
        ...pendingDoc,
        fileType: (file.name.split('.').pop() || 'file').toUpperCase(),
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileData: URL.createObjectURL(file),
        fileName: pendingDoc.documentType !== '__checklist__'
          ? `${pendingDoc.documentLabel.replace(/\s+/g, '_')}.${file.name.split('.').pop()}`
          : pendingDoc.fileName,
        status: 'Uploaded',
        updatedAt: new Date().toISOString()
      };
      saveDocument(updatedDoc);
      refreshDocs();
      e.target.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const targetStartupId = startupId || (getStartups().length > 0 ? getStartups()[0].startupId : "startup_default");

      const newDoc = {
        id: `doc_${Date.now()}`,
        startupId: targetStartupId,
        founderId: "founder_demo_user",
        fileName: file.name,
        fileType: (file.name.split('.').pop() || 'file').toUpperCase(),
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileData: URL.createObjectURL(file),
        category: 'Uploaded File',
        status: "private",
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveDocument(newDoc);
      refreshDocs();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteDocument(id);
      refreshDocs();
    }
  };

  const handleDownload = async (name: string, format?: string) => {
    const finalFormat = format ? format.toLowerCase() : name.split('.').pop()?.toLowerCase() || 'txt';
    const baseName = name.replace(/\.[^/.]+$/, "");
    const finalName = `${baseName}.${finalFormat}`;

    try {
      if (finalFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(`Startup Document: ${baseName.replace(/_/g, ' ')}`, 20, 20);
        doc.setFontSize(12);
        doc.text("This is an automatically generated document by AI Startup Builder.", 20, 30);
        doc.text("Contains full strategic planning, market analysis, and AI roadmap.", 20, 40);
        doc.save(finalName);
      } else if (finalFormat === 'word' || finalFormat === 'docx' || finalFormat === 'doc') {
        const docx = new DocxDocument({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Startup Document: ${baseName.replace(/_/g, ' ')}`, bold: true, size: 28 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "This is an automatically generated document by AI Startup Builder.", size: 24 }),
                ],
              }),
            ],
          }],
        });
        const blob = await Packer.toBlob(docx);
        saveAs(blob, `${baseName}.docx`);
      } else if (finalFormat === 'zip') {
        const zip = new JSZip();
        zip.file("readme.txt", "This ZIP contains the startup package documents.");
        zip.file(`${baseName}.txt`, `Startup Document: ${baseName.replace(/_/g, ' ')}\nThis is an automatically generated document.`);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, finalName);
      } else {
        const content = `Mock content for ${finalName}`;
        const blob = new Blob([content], { type: 'text/plain' });
        saveAs(blob, finalName);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      window.alert(`Failed to generate ${finalFormat.toUpperCase()} file.`);
    }
  };

  const handlePreview = (doc: any) => {
    setPreviewDoc(doc);
  };

  const filteredDocs = documents.filter(d =>
    d.fileName.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase()) ||
    d.documentLabel?.toLowerCase().includes(search.toLowerCase())
  );

  const legalPendingDocs = filteredDocs.filter(d => d.documentType && d.documentType !== '__checklist__');
  const legalChecklistDocs = filteredDocs.filter(d => d.documentType === '__checklist__');
  const regularDocs = filteredDocs.filter(d => !d.category || d.category !== 'Legal Document');
  const legalSections: Record<string, any[]> = {};
  legalPendingDocs.forEach(d => {
    const section = d.documentSection || 'Other';
    if (!legalSections[section]) legalSections[section] = [];
    legalSections[section].push(d);
  });

  const pendingCount = legalPendingDocs.filter(d => d.status === 'Pending').length;
  const uploadedCount = legalPendingDocs.filter(d => d.status !== 'Pending').length;

  return (
    <>
      <div className="animate-fade-in-up">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-500 mt-1">
              {selectedStartup
                ? `Documents for ${selectedStartup.startupName}`
                : 'Upload and manage all your startup documents securely.'}
            </p>
          </div>
          {legalPendingDocs.length > 0 && (
            <button
              onClick={refreshDocs}
              className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          )}
        </div>

        {/* Legal Pending Documents Section */}
        {legalPendingDocs.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'legal' ? null : 'legal')}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Scale size={20} className="text-[#5B21B6]" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900">Legal & Compliance Documents</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pendingCount} pending · {uploadedCount} uploaded
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {pendingCount > 0 && (
                  <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">
                    {pendingCount} pending
                  </span>
                )}
                {expandedSection === 'legal'
                  ? <ChevronDown size={18} className="text-gray-400" />
                  : <ChevronRight size={18} className="text-gray-400" />}
              </div>
            </button>

            {expandedSection === 'legal' && (
              <div className="px-5 pb-5 border-t border-gray-100">
                {Object.entries(legalSections).map(([section, docs]) => (
                  <div key={section} className="mt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{section}</p>
                    <div className="space-y-2">
                      {docs.map((doc: any) => {
                        const isUploaded = doc.status === 'Uploaded';
                        return (
                          <div
                            key={doc.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                              isUploaded
                                ? 'bg-green-50/50 border-green-200'
                                : 'bg-yellow-50/50 border-yellow-200 hover:bg-yellow-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {isUploaded
                                ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                : <Clock size={16} className="text-yellow-500 shrink-0" />}
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{doc.documentLabel}</p>
                                {doc.documentDescription && (
                                  <p className="text-xs text-gray-500 truncate">{doc.documentDescription}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isUploaded
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>
                                {doc.status}
                              </span>
                              {isUploaded && doc.fileData && (
                                <button
                                  onClick={() => handleDownload(doc.fileName)}
                                  className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Download"
                                >
                                  <Download size={14} />
                                </button>
                              )}
                              {!isUploaded && (
                                <label
                                  className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                                >
                                  <UploadCloud size={12} />
                                  Upload
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => handleLegalFileChange(e, doc)}
                                  />
                                </label>
                              )}
                              <button
                                onClick={() => handleDelete(doc.id)}
                                title="Remove"
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Drop Zone */}
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm"
          />
        </div>

        {/* Documents table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {regularDocs.length === 0 && legalChecklistDocs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">
                      {legalPendingDocs.length > 0
                        ? 'No regular uploaded documents yet. Upload legal documents above or drop files here.'
                        : 'No documents found. Upload files or generate legal documents in the AI Builder.'}
                    </td>
                  </tr>
                ) : (
                  [...legalChecklistDocs, ...regularDocs].map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileColor(doc.fileType)}`}>
                            {doc.documentType === '__checklist__' ? <Scale size={18} /> : getFileIcon(doc.fileType)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {doc.documentLabel || doc.fileName}
                            </span>
                            <span className="text-xs text-gray-400">{doc.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{doc.fileSize}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          doc.status === 'shared' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          doc.status === 'Uploaded' ? 'bg-green-50 text-green-600 border-green-100' :
                          doc.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {doc.status === 'shared' ? 'Shared' : doc.status || 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handlePreview(doc)} title="Preview" className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"><Eye size={16} /></button>

                          <div className="relative">
                            <button
                              onClick={() => setDownloadDropdown(downloadDropdown === doc.id ? null : doc.id)}
                              title="Download Options"
                              className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Download size={16} />
                            </button>
                            {downloadDropdown === doc.id && (
                              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 shadow-xl rounded-xl z-10 overflow-hidden animate-fade-in-up">
                                <button onClick={() => { handleDownload(doc.fileName, 'PDF'); setDownloadDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors">Download PDF</button>
                                <button onClick={() => { handleDownload(doc.fileName, 'WORD'); setDownloadDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">Download Word</button>
                                <button onClick={() => { handleDownload(doc.fileName, 'ZIP'); setDownloadDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors border-t border-gray-100">Download ZIP</button>
                              </div>
                            )}
                          </div>

                          <button onClick={() => handleDelete(doc.id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden animate-fade-in-up flex flex-col h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileColor(previewDoc.fileType)}`}>
                  {previewDoc.documentType === '__checklist__' ? <Scale size={20} /> : getFileIcon(previewDoc.fileType)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{previewDoc.documentLabel || previewDoc.fileName}</h3>
                  <p className="text-xs text-gray-500">{previewDoc.fileSize} · {previewDoc.category}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-8 bg-gray-100 overflow-y-auto">
              {previewDoc.documentType === '__checklist__' && previewDoc.aiLegalData ? (
                <div className="bg-white mx-auto max-w-2xl shadow-sm border border-gray-200 rounded-lg p-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">Legal Compliance Checklist</h2>
                  <div className="space-y-3">
                    {previewDoc.aiLegalData.essentialDocuments?.map((item: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded-lg">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          item.status === 'Verified' ? 'bg-green-500' :
                          item.status === 'Uploaded' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white mx-auto max-w-2xl min-h-[400px] shadow-sm border border-gray-200 rounded-lg p-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">{previewDoc.documentLabel || previewDoc.fileName}</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>This is a simulated preview of the document. In a production environment, this would render the actual {previewDoc.fileType} file content.</p>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { handleDownload(previewDoc.fileName); setPreviewDoc(null); }}
                className="px-4 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FounderDocuments;
