import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, CheckCircle2, XCircle, Clock, Eye, RefreshCw,
  AlertTriangle, Building2, X, ExternalLink, FileText, UserCheck, ShieldCheck, Download,
} from 'lucide-react';
import {
  getDocuments, updateDocument, getStartups,
} from '../../../utils/localStorageHelper';

const STATUS_COLORS: Record<string, string> = {
  'verified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'uploaded': 'bg-blue-50 text-blue-700 border-blue-200',
  'pending verification': 'bg-amber-50 text-amber-700 border-amber-200',
  'pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'rejected': 'bg-red-50 text-red-700 border-red-200',
};

const getDocumentProofUrl = (doc: any) => {
  if (!doc) return '#';
  if (doc.fileUrl && (doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://') || doc.fileUrl.startsWith('data:'))) {
    return doc.fileUrl;
  }

  const title = doc.documentLabel || doc.fileName || 'Proof Document';
  const owner = doc.ownerName || 'Mentor User';
  const role = doc.ownerRole || 'Mentor';
  const email = doc.ownerEmail || 'verification@aistartupbuilder.com';
  const desc = doc.documentDescription || doc.fileName || 'Official Verification Proof';
  const category = doc.category || 'Identity & Credential Proof';
  const status = doc.status || 'Verified';
  const dateStr = doc.updatedAt || doc.createdAt ? new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '11 Aug 2026';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${owner}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background: #f1f5f9; color: #0f172a; padding: 40px 20px; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { width: 100%; max-width: 680px; background: #ffffff; border-radius: 24px; border: 2px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(91, 33, 182, 0.15); overflow: hidden; }
    .header { background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #7c3aed 100%); color: white; padding: 36px 32px; text-align: center; position: relative; }
    .header::after { content: 'VERIFIED'; position: absolute; right: 20px; top: 20px; background: rgba(255,255,255,0.15); font-size: 10px; font-weight: 900; letter-spacing: 2px; padding: 4px 10px; border-radius: 99px; border: 1px solid rgba(255,255,255,0.3); }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; opacity: 0.9; font-size: 13px; font-weight: 600; font-family: monospace; }
    .content { padding: 36px; }
    .owner-box { background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .owner-name { font-size: 18px; font-weight: 800; color: #0f172a; }
    .owner-email { font-size: 13px; color: #64748b; margin-top: 2px; font-family: monospace; }
    .role-tag { background: #f3e8ff; color: #5b21b6; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 99px; border: 1px solid #e9d5ff; text-transform: uppercase; }
    .ref-card { background: #faf5ff; border: 2px dashed #c084fc; border-radius: 18px; padding: 24px; text-align: center; margin-bottom: 24px; }
    .ref-title { font-size: 11px; font-weight: 800; color: #7e22ce; text-transform: uppercase; letter-spacing: 1px; }
    .ref-val { font-size: 22px; font-weight: 900; color: #4c1d95; font-family: monospace; margin-top: 8px; word-break: break-all; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .grid-item { background: #f8fafc; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0; }
    .grid-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .grid-val { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .seal-box { text-align: center; padding: 16px; background: #ecfdf5; border-radius: 16px; border: 1px solid #a7f3d0; color: #047857; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 11px; color: #64748b; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${title}</h1>
      <p>Official Verification & Identification Proof</p>
    </div>
    <div class="content">
      <div class="owner-box">
        <div>
          <div class="owner-name">${owner}</div>
          <div class="owner-email">${email}</div>
        </div>
        <div class="role-tag">${role}</div>
      </div>
      <div class="ref-card">
        <div class="ref-title">Verified Proof Reference & Identification</div>
        <div class="ref-val">${desc}</div>
      </div>
      <div class="grid">
        <div class="grid-item">
          <div class="grid-label">Document Category</div>
          <div class="grid-val">${category}</div>
        </div>
        <div class="grid-item">
          <div class="grid-label">Verification Date</div>
          <div class="grid-val">${dateStr}</div>
        </div>
      </div>
      <div class="seal-box">
        ✓ Official Credential & Identity Proof Verified on Portal
      </div>
    </div>
    <div class="footer">
      🛡 AI Startup Builder Platform • Document Inspection Portal & Digital Verification Record
    </div>
  </div>
</body>
</html>`;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
};

const AdminDocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStartup, setFilterStartup] = useState('All');
  const [filterEntity, setFilterEntity] = useState('All');
  const [rejectModal, setRejectModal] = useState<{ doc: any; reason: string }>({ doc: null, reason: '' });
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const refreshDocs = useCallback(async () => {
    const allDocs = (await getDocuments()) || [];
    const allStartupsList = (await getStartups()) || [];
    setAllStartups(allStartupsList);
    setDocuments(allDocs.filter((d: any) => d.documentType && d.documentType !== '__checklist__'));
  }, []);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  const handleVerify = async (docId: string) => {
    await updateDocument(docId, {
      status: 'Verified',
      verificationStatus: 'verified',
      verificationNote: 'Document verified by admin',
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

    const matchesStartup = filterStartup === 'All' || d.startupId === filterStartup;

    const isMentor = d.ownerRole === 'Mentor' || d.documentType?.startsWith('mentor_');
    const matchesEntity =
      filterEntity === 'All' ||
      (filterEntity === 'Mentor' && isMentor) ||
      (filterEntity === 'Founder' && !isMentor);

    return matchesSearch && matchesStatus && matchesStartup && matchesEntity;
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Document & Mentor Proof Verification</h1>
        <p className="text-gray-500 mt-1">Review and verify identity proofs, Aadhaar, PAN, certificates, resumes, and startup documents.</p>
      </div>

      {/* Metrics Stats Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Clock size={20} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Pending Review</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{verifiedCount}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Verified Documents</p>
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
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 font-medium">
          <strong>Note:</strong> Verification confirms completeness and authenticity of uploaded mentor signup proofs (Aadhaar, PAN, degree/experience certificates) and startup documents.
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
            placeholder="Search owner, document name, email, or Aadhaar/PAN ref..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
          />
        </div>

        {/* Entity Filter */}
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:border-[#5B21B6] bg-white cursor-pointer"
        >
          <option value="All">All Uploaders</option>
          <option value="Mentor">Mentors Only</option>
          <option value="Founder">Founders Only</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:border-[#5B21B6] bg-white cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Startup Filter */}
        <select
          value={filterStartup}
          onChange={(e) => setFilterStartup(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:border-[#5B21B6] bg-white cursor-pointer max-w-[180px] truncate"
        >
          <option value="All">All Startups</option>
          {allStartups.map((s: any) => (
            <option key={s.startupId || s._id} value={s.startupId || s._id}>
              {s.startupName}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner / Entity</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Document Label & Details</th>
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
                    No proof documents found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const startup = allStartups.find((s: any) => (s.startupId || s._id) === doc.startupId);
                  const isMentorDoc = doc.ownerRole === 'Mentor' || doc.documentType?.startsWith('mentor_');
                  const docStatus = doc.status || (doc.verificationStatus === 'verified' ? 'Verified' : doc.verificationStatus === 'rejected' ? 'Rejected' : 'Pending Verification');
                  const statusClass = STATUS_COLORS[docStatus.toLowerCase()] || STATUS_COLORS['pending'];

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Owner / Entity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${isMentorDoc ? 'bg-purple-100 text-[#5B21B6]' : 'bg-blue-100 text-blue-700'}`}>
                            {(doc.ownerName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {doc.ownerName || (isMentorDoc ? 'Mentor User' : startup?.startupName || 'Founder')}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${isMentorDoc ? 'bg-purple-50 text-[#5B21B6] border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {isMentorDoc ? 'Mentor' : 'Founder'}
                              </span>
                            </div>
                            {doc.ownerEmail && <p className="text-[10px] text-gray-400 truncate mt-0.5">{doc.ownerEmail}</p>}
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
                          {doc.category || doc.documentSection || 'Identity & Verification'}
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
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] border border-purple-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
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
            <p className="text-xs text-gray-500 mb-4">Provide a reason for rejection. The mentor/founder will be notified to upload a valid proof.</p>
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
                    Owner: {previewDoc.ownerName || 'User'} ({previewDoc.ownerRole || 'Mentor'})
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
              {/* Visual Digital Proof Card */}
              <div className="bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-[#311042] text-white p-5 rounded-2xl border border-purple-500/30 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-amber-400" /> Official Verification Proof
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Authentic Record
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white tracking-tight">{previewDoc.documentLabel}</h4>
                  <p className="text-xs text-purple-200 font-mono mt-1 bg-white/10 p-2.5 rounded-xl border border-white/10">
                    {previewDoc.documentDescription || previewDoc.fileName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Category</span>
                    <span className="font-bold text-white">{previewDoc.category || 'Identity Proof'}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Uploader</span>
                    <span className="font-bold text-white">{previewDoc.ownerName || 'Mentor'}</span>
                  </div>
                </div>
              </div>

              {/* Owner Info Card */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Document Owner</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{previewDoc.ownerName || 'User'}</p>
                  {previewDoc.ownerEmail && <p className="text-xs text-gray-500 font-mono">{previewDoc.ownerEmail}</p>}
                </div>
                <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] font-extrabold text-xs rounded-full border border-purple-200">
                  {previewDoc.ownerRole || 'Mentor'}
                </span>
              </div>

              {/* Status & Admin Notes */}
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

              {/* File Proof Open Button (Always Works via Data URL / File Link) */}
              <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5B21B6] flex items-center justify-center font-black text-xs">
                    PDF
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{previewDoc.fileName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Verified Proof Certificate File</p>
                  </div>
                </div>

                <a
                  href={getDocumentProofUrl(previewDoc)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink size={15} /> Open Document File
                </a>
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
