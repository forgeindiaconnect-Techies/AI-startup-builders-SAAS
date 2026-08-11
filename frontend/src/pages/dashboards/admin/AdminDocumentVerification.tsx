import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, CheckCircle2, XCircle, Clock, Eye, RefreshCw,
  AlertTriangle, X, ExternalLink, FileText, UserCheck, ShieldCheck, Filter,
} from 'lucide-react';
import {
  getDocuments, updateDocument,
} from '../../../utils/localStorageHelper';

const STATUS_COLORS: Record<string, string> = {
  'verified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'uploaded': 'bg-blue-50 text-blue-700 border-blue-200',
  'pending verification': 'bg-amber-50 text-amber-700 border-amber-200',
  'pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'rejected': 'bg-red-50 text-red-700 border-red-200',
};

const AdminDocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [rejectModal, setRejectModal] = useState<{ doc: any; reason: string }>({ doc: null, reason: '' });
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const isMentorDocument = (d: any) => d.ownerRole === 'Mentor' || d.documentType?.startsWith('mentor_');

  const refreshDocs = useCallback(async () => {
    const allDocs = (await getDocuments()) || [];
    // Strictly filter ONLY mentor proof documents (Aadhaar, PAN, certificates, resumes, profile proofs)
    const mentorDocs = allDocs.filter((d: any) => isMentorDocument(d));
    setDocuments(mentorDocs);
  }, []);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  const handleVerify = async (docId: string) => {
    await updateDocument(docId, {
      status: 'Verified',
      verificationStatus: 'verified',
      verificationNote: 'Mentor document verified by admin',
      verifiedAt: new Date().toISOString(),
    });
    await refreshDocs();
  };

  const handleReject = async () => {
    if (!rejectModal.doc) return;
    await updateDocument(rejectModal.doc.id, {
      status: 'Rejected',
      verificationStatus: 'rejected',
      verificationNote: rejectModal.reason || 'Document rejected by admin. Please re-upload valid proof.',
      verifiedAt: new Date().toISOString(),
    });
    setRejectModal({ doc: null, reason: '' });
    await refreshDocs();
  };

  const filteredDocs = documents.filter((d) => {
    const searchLower = search.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      d.fileName?.toLowerCase().includes(searchLower) ||
      d.documentLabel?.toLowerCase().includes(searchLower) ||
      d.documentDescription?.toLowerCase().includes(searchLower) ||
      d.ownerName?.toLowerCase().includes(searchLower) ||
      d.ownerEmail?.toLowerCase().includes(searchLower);

    const docStatusLower = (d.status || d.verificationStatus || '').toLowerCase();
    const matchesStatus =
      filterStatus === 'All' ||
      docStatusLower === filterStatus.toLowerCase() ||
      (filterStatus === 'Pending Verification' && (docStatusLower.includes('pending') || docStatusLower.includes('uploaded')));

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aPending = (a.status || a.verificationStatus || '').toLowerCase().includes('pending') ? 1 : 0;
    const bPending = (b.status || b.verificationStatus || '').toLowerCase().includes('pending') ? 1 : 0;
    return bPending - aPending;
  });

  const pendingCount = documents.filter(
    (d) =>
      d.status === 'Pending Verification' ||
      d.status === 'pending' ||
      d.verificationStatus === 'pending_verification' ||
      d.verificationStatus === 'pending'
  ).length;

  const verifiedCount = documents.filter(
    (d) => d.verificationStatus === 'verified' || d.status === 'Verified'
  ).length;

  const rejectedCount = documents.filter(
    (d) => d.verificationStatus === 'rejected' || d.status === 'Rejected'
  ).length;

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <UserCheck className="text-[#5B21B6]" size={26} />
            Mentor Document Verification
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Review and verify official identification proofs, Aadhaar cards, PAN cards, degree/experience certificates, and resumes uploaded by mentors during signup.
          </p>
        </div>

        <button
          onClick={refreshDocs}
          className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw size={14} className="text-[#5B21B6]" /> Refresh Documents
        </button>
      </div>

      {/* Metrics Stats Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Clock size={20} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Pending Mentor Review</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{verifiedCount}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Verified Mentor Documents</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <XCircle size={20} className="text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600">{rejectedCount}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Rejected</p>
        </div>
      </div>

      {/* Admin Disclaimer Note */}
      <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck size={20} className="text-[#5B21B6] shrink-0 mt-0.5" />
        <p className="text-xs text-purple-950 font-medium">
          <strong>Note:</strong> Admin verification confirms identity and qualification completeness for mentor signup proof documents (Aadhaar Card, PAN Card, Degree/Experience Certificate, Resume, Photo ID).
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentor name, email, document type, or Aadhaar/PAN ref..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
          <Filter size={13} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Mentor Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mentor Name & Email</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Proof Document & Details</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded Date</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                    No mentor signup proof documents found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const docStatus = doc.status || (doc.verificationStatus === 'verified' ? 'Verified' : doc.verificationStatus === 'rejected' ? 'Rejected' : 'Pending Verification');
                  const statusClass = STATUS_COLORS[docStatus.toLowerCase()] || STATUS_COLORS['pending'];

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Mentor Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-purple-100 text-[#5B21B6] flex items-center justify-center font-black text-xs shrink-0">
                            {(doc.ownerName || 'M').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {doc.ownerName || 'Mentor'}
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-purple-50 text-[#5B21B6] border-purple-200">
                                Mentor
                              </span>
                            </div>
                            {doc.ownerEmail && <p className="text-[10px] text-gray-400 truncate mt-0.5 font-mono">{doc.ownerEmail}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Document Label & Description */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <FileText size={13} className="text-[#5B21B6]" />
                            {doc.documentLabel || doc.fileName}
                          </p>
                          {doc.documentDescription && (
                            <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate max-w-xs">{doc.documentDescription}</p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#5B21B6] border border-purple-100">
                          {doc.category || doc.documentSection || 'Mentor Verification'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${statusClass}`}>
                          {docStatus}
                        </span>
                      </td>

                      {/* Uploaded Date */}
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {doc.updatedAt || doc.createdAt ? new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview / Inspection Button */}
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            title="Inspect Proof Document"
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] border border-purple-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Eye size={13} /> View Proof
                          </button>

                          {(docStatus === 'Pending Verification' || doc.verificationStatus === 'pending_verification' || docStatus === 'pending') && (
                            <>
                              <button
                                onClick={() => handleVerify(doc.id)}
                                title="Approve & Verify Document"
                                className="p-1 text-[#5B21B6] hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => setRejectModal({ doc, reason: '' })}
                                title="Reject Document"
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectModal.doc && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Reject Proof Document</h3>
            <p className="text-xs text-gray-500 mb-4">Provide a reason for rejection. The mentor will be notified to upload a valid proof.</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="e.g. Document is blurry, Aadhaar/PAN number unreadable, missing signature..."
              rows={4}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 resize-none font-medium text-gray-900"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejectModal({ doc: null, reason: '' })}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-xs shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Proof Inspection & Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#5B21B6] via-[#6C4CF1] to-[#7C3AED] px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <FileText size={20} className="text-purple-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">{previewDoc.documentLabel}</h3>
                  <p className="text-xs text-purple-200 font-mono">
                    Mentor: {previewDoc.ownerName || 'Mentor'} • {previewDoc.ownerEmail || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-purple-100 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Owner Info Card */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Mentor Uploader</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{previewDoc.ownerName || 'Mentor'}</p>
                  {previewDoc.ownerEmail && <p className="text-xs text-gray-500 font-mono">{previewDoc.ownerEmail}</p>}
                </div>
                <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] font-extrabold text-xs rounded-full border border-purple-200">
                  Mentor
                </span>
              </div>

              {/* Document Reference & Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Proof Document Details</p>
                <p className="text-xs text-gray-800 font-semibold">{previewDoc.documentDescription || 'No description provided.'}</p>
                <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-gray-500">
                  <span>Category: <strong className="text-gray-900">{previewDoc.category || 'General'}</strong></span>
                  <span>File Name: <strong className="text-gray-900">{previewDoc.fileName}</strong></span>
                </div>
              </div>

              {/* Status & Notes */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">Verification Status</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1 ${STATUS_COLORS[(previewDoc.status || '').toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {previewDoc.status}
                </span>
              </div>

              {previewDoc.verificationNote && (
                <div className={`p-3.5 rounded-xl border ${previewDoc.verificationStatus === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1">Admin Verification Note</p>
                  <p className="text-xs font-semibold">{previewDoc.verificationNote}</p>
                </div>
              )}

              {/* File Proof View Link / Download */}
              <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5B21B6] flex items-center justify-center font-black">
                    PDF
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{previewDoc.fileName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Mentor Proof Document File</p>
                  </div>
                </div>

                {previewDoc.fileUrl ? (
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} /> Open Document File
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-3 py-1.5 rounded-xl">
                    Proof Recorded via Form
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold rounded-xl transition-colors text-xs"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                {(previewDoc.status === 'Pending Verification' || previewDoc.verificationStatus === 'pending_verification' || previewDoc.status === 'pending') && (
                  <>
                    <button
                      onClick={() => {
                        handleVerify(previewDoc.id);
                        setPreviewDoc(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 size={15} /> Verify Document
                    </button>
                    <button
                      onClick={() => {
                        setRejectModal({ doc: previewDoc, reason: '' });
                        setPreviewDoc(null);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentVerification;
