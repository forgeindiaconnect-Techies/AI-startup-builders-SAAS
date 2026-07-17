import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle2, ShieldAlert, Eye, RefreshCw, Trash2, X, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { addNotification } from '../../../utils/localStorageHelper';

export interface KYCDocument {
  id: string;
  investorId: string;
  investorName?: string;
  documentType: string;
  fileName: string;
  fileData: string;
  status: 'pending' | 'Approved' | 'Rejected';
  rejectionReason: string;
  uploadedAt: string;
}
export const KYCDocument = {};

const dropdownOptions = [
  "Aadhaar Card",
  "PAN Card",
  "Passport",
  "Driving License",
  "Voter ID",
  "Company Registration Certificate",
  "Bank Statement",
  "Address Proof",
  "Accreditation Certificate",
  "Other"
];

const InvestorKYC: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reuploadRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>("PAN Card");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reuploadTargetId, setReuploadTargetId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<KYCDocument | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = () => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_kyc_documents');
      if (stored === null) {
        // Seed initial sample doc so list has demo data right on start
        setDocuments([]);
      } else {
        const parsed: KYCDocument[] = JSON.parse(stored);
        const myId = user?.id || '';
        const filtered = parsed.filter(d => d.investorId === myId || d.investorId === user?.id || d.investorName === user?.fullName);
        setDocuments(filtered);
      }
    } catch (e) {
      setDocuments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      window.alert("Please select a document file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string || "file_content_placeholder";
      const newDoc: KYCDocument = {
        id: `kyc_doc_${Date.now()}`,
        investorId: user?.id || '',
        investorName: user?.fullName || '',
        documentType: selectedDocType,
        fileName: selectedFile.name,
        fileData: base64Data,
        status: 'pending',
        rejectionReason: '',
        uploadedAt: new Date().toISOString()
      };

      try {
        const stored = localStorage.getItem('ai_startup_builder_kyc_documents');
        const allDocs: KYCDocument[] = stored ? JSON.parse(stored) : [];
        allDocs.push(newDoc);
        localStorage.setItem('ai_startup_builder_kyc_documents', JSON.stringify(allDocs));

        // Sync verificationStatus to pending in investor profile
        try {
          const storedProfiles = localStorage.getItem('ai_startup_builder_investor_profiles');
          if (storedProfiles) {
            const profiles = JSON.parse(storedProfiles);
            const myId = user?.id || '';
            const updatedProfiles = profiles.map((p: any) => 
              (p.id === myId || p.id === user?.id) ? { ...p, verificationStatus: 'pending' } : p
            );
            localStorage.setItem('ai_startup_builder_investor_profiles', JSON.stringify(updatedProfiles));
          }
        } catch (e) {}

        // Send notification to Admin
        addNotification({
          id: Date.now(),
          userId: "admin",
          title: "New KYC Document Uploaded",
          desc: `${user?.fullName || ''} uploaded ${selectedDocType} (${selectedFile.name}) for KYC & Accreditation verification.`,
          time: "Just now",
          read: false,
          link: "/dashboard/admin/approvals"
        });

        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadDocuments();
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('investor_kyc_updated'));
        window.alert(`✅ ${selectedDocType} uploaded successfully! Admin can now review it inside Investor Approvals.`);
      } catch (e) {
        window.alert("Error saving document to localStorage.");
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleReuploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !reuploadTargetId) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      try {
        const stored = localStorage.getItem('ai_startup_builder_kyc_documents');
        let allDocs: KYCDocument[] = stored ? JSON.parse(stored) : [];
        allDocs = allDocs.map(doc => {
          if (doc.id === reuploadTargetId) {
            return {
              ...doc,
              fileName: file.name,
              fileData: base64Data,
              status: 'pending',
              rejectionReason: '',
              uploadedAt: new Date().toISOString()
            };
          }
          return doc;
        });
        localStorage.setItem('ai_startup_builder_kyc_documents', JSON.stringify(allDocs));

        // Notify Admin
        addNotification({
          id: Date.now(),
          userId: "admin",
          title: "KYC Document Re-uploaded",
          desc: `${user?.fullName || ''} re-uploaded their KYC document (${file.name}).`,
          time: "Just now",
          read: false,
          link: "/dashboard/admin/approvals"
        });

        setReuploadTargetId(null);
        if (reuploadRef.current) reuploadRef.current.value = "";
        loadDocuments();
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('investor_kyc_updated'));
        window.alert("✅ Document re-uploaded successfully! Status is now Pending review.");
      } catch (err) {
        window.alert("Error re-uploading document.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${docName}?`)) return;
    try {
      const stored = localStorage.getItem('ai_startup_builder_kyc_documents');
      if (stored) {
        const allDocs: KYCDocument[] = JSON.parse(stored);
        const updated = allDocs.filter(d => d.id !== docId);
        localStorage.setItem('ai_startup_builder_kyc_documents', JSON.stringify(updated));
        loadDocuments();
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('investor_kyc_updated'));
      }
    } catch (e) {
      window.alert("Error deleting document.");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1"><CheckCircle2 size={13} /> Approved</span>;
    } else if (status === 'Rejected') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1"><AlertCircle size={13} /> Rejected</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1"><ShieldAlert size={13} /> Pending</span>;
    }
  };

  return (
    <div className="animate-fade-in-up pb-10 space-y-8">
      {/* Hidden input for Re-upload */}
      <input 
        type="file" 
        ref={reuploadRef} 
        className="hidden" 
        onChange={handleReuploadChange} 
      />

      {/* Upload KYC Document Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Upload size={20} className="text-[#5B21B6]" /> Upload KYC & Accreditation Document
          </h2>
          <p className="text-sm text-gray-500 mt-1">Select the document type and upload your verification file. Admin will review and approve.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select Document Type</label>
            <select
              value={selectedDocType}
              onChange={e => setSelectedDocType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white font-medium text-gray-900"
            >
              {dropdownOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select File</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition-colors border border-gray-200 shrink-0"
              >
                Choose File
              </button>
              <span className="text-xs text-gray-500 truncate max-w-[180px]">
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <button
              onClick={handleUpload}
              className="w-full py-2.5 px-6 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow-sm text-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Upload size={16} /> Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* KYC Document List Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-[#5B21B6]" /> Uploaded KYC Documents
            </h2>
            <p className="text-sm text-gray-500 mt-1">Review status and manage uploaded identity or accreditation files.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-purple-50 text-[#5B21B6] px-3 py-1.5 rounded-full border border-purple-100">
              {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
            </span>
            <button
              onClick={() => window.dispatchEvent(new Event('save_investor_profile'))}
              className="flex items-center justify-center px-4 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow-sm text-xs transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              <Save size={14} className="mr-1.5" /> Save Changes
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
            <FileText size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="font-bold text-gray-700">No KYC documents uploaded yet.</p>
            <p className="text-xs text-gray-400 mt-1">Use the upload box above to submit your first verification document.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map(doc => (
              <div key={doc.id} className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center shrink-0 font-bold mt-0.5">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-base">{doc.documentType}</h4>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">File Name: <span className="text-gray-700 font-semibold">{doc.fileName}</span></p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Uploaded on: {new Date(doc.uploadedAt).toLocaleString()}</p>

                    {doc.status === 'Rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                        <p className="font-bold flex items-center gap-1 text-red-900 mb-0.5"><AlertCircle size={14} /> Rejection Reason:</p>
                        <p>{doc.rejectionReason || "Admin marked this document as invalid or expired. Please re-upload."}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    title="Preview Document"
                  >
                    <Eye size={14} /> Preview
                  </button>

                  <button
                    onClick={() => {
                      setReuploadTargetId(doc.id);
                      if (reuploadRef.current) reuploadRef.current.click();
                    }}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-purple-200"
                    title="Re-upload replacement document"
                  >
                    <RefreshCw size={14} /> Re-upload
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id, doc.fileName)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    title="Delete Document"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <FileText size={18} className="text-[#5B21B6]" /> Document Preview: {previewDoc.documentType}
              </h3>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs border border-gray-100">
                <div>
                  <span className="text-gray-400 font-bold uppercase">File Name</span>
                  <p className="font-bold text-gray-800 mt-0.5">{previewDoc.fileName}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase">Status</span>
                  <div className="mt-1">{getStatusBadge(previewDoc.status)}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase">Uploaded At</span>
                  <p className="text-gray-700 mt-0.5">{new Date(previewDoc.uploadedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase">Document Type</span>
                  <p className="text-gray-800 font-bold mt-0.5">{previewDoc.documentType}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6 text-center bg-gray-50/50 min-h-[220px] flex flex-col items-center justify-center">
                {previewDoc.fileData.startsWith('data:image/') ? (
                  <img src={previewDoc.fileData} alt={previewDoc.fileName} className="max-h-[300px] rounded shadow-sm object-contain" />
                ) : (
                  <div className="py-6 space-y-3">
                    <FileText size={48} className="mx-auto text-[#5B21B6]" />
                    <p className="font-bold text-gray-800 text-sm">{previewDoc.fileName}</p>
                    <p className="text-xs text-gray-500">Preview simulated for non-image / sample PDF binary data.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorKYC;
