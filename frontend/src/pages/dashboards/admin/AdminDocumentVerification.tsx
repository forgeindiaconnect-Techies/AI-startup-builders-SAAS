import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, CheckCircle2, XCircle, Clock, Eye, Filter, RefreshCw,
  FileText, AlertTriangle, MessageSquare, Building2,
} from 'lucide-react';
import {
  getDocuments, updateDocument, getStartups, getStartupById, detectStartupCategory,
} from '../../../utils/localStorageHelper';

const STATUS_COLORS: Record<string, string> = {
  'verified': 'bg-green-50 text-green-700 border-green-200',
  'uploaded': 'bg-blue-50 text-blue-700 border-blue-200',
  'pending verification': 'bg-orange-50 text-orange-700 border-orange-200',
  'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'rejected': 'bg-red-50 text-red-700 border-red-200',
};

const AdminDocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending Verification');
  const [filterStartup, setFilterStartup] = useState('All');
  const [rejectModal, setRejectModal] = useState<{ doc: any; reason: string }>({ doc: null, reason: '' });
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const refreshDocs = useCallback(() => {
    const allDocs = getDocuments() || [];
    const allStartupsList = getStartups() || [];
    setAllStartups(allStartupsList);
    setDocuments(allDocs.filter(d => d.documentType && d.documentType !== '__checklist__'));
  }, []);

  useEffect(() => { refreshDocs(); }, [refreshDocs]);

  const handleVerify = (docId: string) => {
    updateDocument(docId, {
      status: 'Verified',
      verificationStatus: 'verified',
      verificationNote: 'Document verified by admin',
      verifiedAt: new Date().toISOString(),
    });
    refreshDocs();
  };

  const handleReject = () => {
    if (!rejectModal.doc) return;
    updateDocument(rejectModal.doc.id, {
      status: 'Rejected',
      verificationStatus: 'rejected',
      verificationNote: rejectModal.reason || 'Document rejected by admin. Please re-upload.',
      verifiedAt: new Date().toISOString(),
    });
    setRejectModal({ doc: null, reason: '' });
    refreshDocs();
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = !search ||
      d.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      d.documentLabel?.toLowerCase().includes(search.toLowerCase()) ||
      d.documentDescription?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' ||
      d.status?.toLowerCase() === filterStatus.toLowerCase() ||
      (filterStatus === 'Pending Verification' && (d.status === 'Pending Verification' || d.verificationStatus === 'pending_verification'));
    const matchesStartup = filterStartup === 'All' || d.startupId === filterStartup;
    return matchesSearch && matchesStatus && matchesStartup;
  });

  const pendingCount = documents.filter(d => d.status === 'Pending Verification' || d.verificationStatus === 'pending_verification').length;
  const verifiedCount = documents.filter(d => d.verificationStatus === 'verified').length;
  const rejectedCount = documents.filter(d => d.verificationStatus === 'rejected').length;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
          <p className="text-gray-500 mt-1">Review and verify documents uploaded by founders.</p>
        </div>
        <button onClick={refreshDocs} className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Clock size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-black text-orange-600">{pendingCount}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Pending Review</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-green-600">{verifiedCount}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Verified</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <XCircle size={20} className="text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600">{rejectedCount}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Rejected</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Admin verification is only for document completeness, not official legal approval.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by document name or description..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white cursor-pointer">
            <option value="All">All Statuses</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
            <option value="Uploaded">Uploaded</option>
          </select>
          <select value={filterStartup} onChange={(e) => setFilterStartup(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white cursor-pointer">
            <option value="All">All Startups</option>
            {allStartups.map((s: any) => (
              <option key={s.startupId} value={s.startupId}>{s.startupName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Founder</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                    No documents found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const startup = getStartupById(doc.startupId);
                  const cat = startup ? detectStartupCategory(startup) : 'Unknown';
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-gray-400" />
                          <span className="text-sm font-bold text-gray-900">{startup?.startupName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{doc.documentLabel}</p>
                          {doc.documentDescription && <p className="text-xs text-gray-400 truncate max-w-xs">{doc.documentDescription}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                          {doc.documentSection || doc.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPreviewDoc(doc)} title="Preview"
                            className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                          {(doc.status === 'Pending Verification' || doc.verificationStatus === 'pending_verification') && (
                            <>
                              <button onClick={() => handleVerify(doc.id)} title="Verify"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <CheckCircle2 size={16} />
                              </button>
                              <button onClick={() => setRejectModal({ doc, reason: '' })} title="Reject"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      {/* Reject Modal */}
      {rejectModal.doc && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Document</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection. The founder will be notified.</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="e.g. Document is blurry, missing signature, wrong document type..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRejectModal({ doc: null, reason: '' })}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-sm">
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-base font-bold text-gray-900">{previewDoc.documentLabel}</h3>
              <button onClick={() => setPreviewDoc(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-gray-700">{previewDoc.documentDescription || 'No description.'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[previewDoc.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {previewDoc.status}
                </span>
              </div>
              {previewDoc.verificationNote && (
                <div className={`p-3 rounded-lg ${previewDoc.verificationStatus === 'rejected' ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Admin Note</p>
                  <p className={`text-sm ${previewDoc.verificationStatus === 'rejected' ? 'text-red-700' : 'text-green-700'}`}>{previewDoc.verificationNote}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setPreviewDoc(null)} className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors text-sm">
                Close
              </button>
              {(previewDoc.status === 'Pending Verification' || previewDoc.verificationStatus === 'pending_verification') && (
                <>
                  <button onClick={() => { handleVerify(previewDoc.id); setPreviewDoc(null); }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} /> Verify
                  </button>
                  <button onClick={() => { setRejectModal({ doc: previewDoc, reason: '' }); setPreviewDoc(null); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-2">
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentVerification;
