import React, { useState, useEffect } from 'react';
import {
  FolderLock, ShieldCheck, Lock, Unlock, Upload, FileText, CheckCircle2,
  AlertTriangle, Sparkles, HelpCircle, Eye, Download, UserCheck, Clock,
  Layers, RefreshCw, FileCode, ShieldAlert, Plus, Search, Filter, MessageSquare, Send
} from 'lucide-react';
import { getStartups, getStartupById } from '../../../utils/localStorageHelper';
import {
  fetchFounderDataRoom,
  addDataRoomDocument,
  updateDataRoomDocument,
  manageInvestorDataRoomAccess,
  submitDataRoomQA,
  logDataRoomActivity
} from '../../../utils/dataroomApi';

const DATAROOM_CATEGORIES = [
  { id: 'company_legal', name: 'A. Company & Legal', icon: ShieldCheck, desc: 'Incorporation, MOA/AOA, Tax ID, material contracts' },
  { id: 'business_startup', name: 'B. Business & Startup', icon: FileText, desc: 'Pitch Deck, Business Plan, Executive Summary, Roadmap' },
  { id: 'financial_info', name: 'C. Financial Information', icon: Layers, desc: 'Financial Model, P&L, Cap Table, Funding Details' },
  { id: 'market_customer', name: 'D. Market & Customer', icon: Search, desc: 'TAM/SAM/SOM, Market Research, Customer LOIs' },
  { id: 'product_tech', name: 'E. Product & Technology', icon: FileCode, desc: 'System Architecture, AI/ML docs, Patents & IP' },
  { id: 'team_org', name: 'F. Team & Organization', icon: UserCheck, desc: 'Founder profiles, Org structure, Employment agreements' },
  { id: 'fundraising', name: 'G. Fundraising', icon: Sparkles, desc: 'Term Sheets, Round Details, Investor Rights, Ownership' },
  { id: 'compliance_risk', name: 'H. Compliance & Risk', icon: ShieldAlert, desc: 'Regulatory approvals, Privacy policies, Risk disclosures' },
];

const STAGE_REQUIREMENTS = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'];

const FounderDataRoom: React.FC = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState<string>('');
  const [dataRoom, setDataRoom] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'access' | 'qa' | 'ai' | 'audit'>('documents');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('business_startup');
  const [docName, setDocName] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [permission, setPermission] = useState<'No Access' | 'View Only' | 'View + Download'>('View Only');
  const [statusReq, setStatusReq] = useState<'Required' | 'Recommended' | 'Optional' | 'Not Applicable'>('Required');
  const [stageReq, setStageReq] = useState<'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Growth'>('Seed');

  // Grant Access modal state
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorName, setInvestorName] = useState('');

  // Q&A answer input state
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadStartupsList = async () => {
      const list = await getStartups();
      setStartups(list || []);
      if (list && list.length > 0) {
        setSelectedStartupId(list[0].startupId || list[0].id || list[0]._id);
      }
    };
    loadStartupsList();
  }, []);

  const loadDataRoom = async (startupId: string) => {
    if (!startupId) return;
    setLoading(true);
    try {
      const room = await fetchFounderDataRoom(startupId);
      setDataRoom(room);
    } catch (err) {
      console.error('Error loading data room:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStartupId) {
      loadDataRoom(selectedStartupId);
    }
  }, [selectedStartupId]);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !selectedStartupId) return;

    try {
      const newDocPayload = {
        name: docName.trim(),
        category: uploadCategory,
        description: docDesc.trim(),
        fileUrl: `/uploads/${docName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileType: 'pdf',
        fileSize: '2.4 MB',
        permission,
        status: statusReq,
        stageRequirement: stageReq,
        uploadedBy: 'founder',
        uploaderName: 'Founder',
      };

      const updatedRoom = await addDataRoomDocument(selectedStartupId, newDocPayload);
      setDataRoom(updatedRoom);
      setShowUploadModal(false);
      setDocName('');
      setDocDesc('');
    } catch (err) {
      alert('Failed to upload document to data room');
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorEmail.trim() || !selectedStartupId) return;

    try {
      const accessPayload = {
        investorId: investorEmail.trim().toLowerCase(),
        investorName: investorName.trim() || investorEmail.split('@')[0],
        investorEmail: investorEmail.trim(),
        action: 'grant',
        permissionLevel: 'View Only',
        performedByName: 'Founder',
      };

      const updatedRoom = await manageInvestorDataRoomAccess(selectedStartupId, accessPayload);
      setDataRoom(updatedRoom);
      setShowGrantModal(false);
      setInvestorEmail('');
      setInvestorName('');
    } catch (err) {
      alert('Failed to grant access');
    }
  };

  const handleRevokeAccess = async (invId: string, invName: string) => {
    if (!confirm(`Are you sure you want to revoke data room access for ${invName}?`)) return;
    try {
      const updatedRoom = await manageInvestorDataRoomAccess(selectedStartupId, {
        investorId: invId,
        investorName: invName,
        action: 'revoke',
      });
      setDataRoom(updatedRoom);
    } catch (err) {
      alert('Failed to revoke access');
    }
  };

  const handlePermissionChange = async (docId: string, newPermission: 'No Access' | 'View Only' | 'View + Download') => {
    try {
      const updatedRoom = await updateDataRoomDocument(selectedStartupId, docId, {
        permission: newPermission,
        userName: 'Founder',
        userRole: 'founder',
      });
      setDataRoom(updatedRoom);
    } catch (err) {
      alert('Failed to update document permission');
    }
  };

  const handleAnswerSubmit = async (qId: string) => {
    const ansText = answers[qId];
    if (!ansText || !ansText.trim()) return;

    try {
      const updatedRoom = await submitDataRoomQA(selectedStartupId, {
        questionId: qId,
        answer: ansText.trim(),
        userName: 'Founder',
      });
      setDataRoom(updatedRoom);
      setAnswers((prev) => ({ ...prev, [qId]: '' }));
    } catch (err) {
      alert('Failed to submit answer');
    }
  };

  const filteredDocs = dataRoom?.documents
    ? dataRoom.documents.filter((d: any) => selectedCategory === 'all' || d.category === selectedCategory)
    : [];

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-[#5B21B6] to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-purple-200 border border-white/20 uppercase tracking-widest">
            Due Diligence Data Room
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Investor Due Diligence Vault</h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
            Securely upload, organize, and grant granular view/download permissions to verified investors for fundraising due diligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowGrantModal(true)}
            className="px-4 py-2.5 bg-white text-[#5B21B6] font-bold rounded-xl text-xs shadow-md hover:bg-purple-50 transition-all flex items-center gap-2"
          >
            <UserCheck size={16} /> Grant Investor Access
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Upload size={16} /> Upload Document
          </button>
        </div>
      </div>

      {/* Startup Selector & Metrics Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Selected Startup</label>
          <select
            value={selectedStartupId}
            onChange={(e) => setSelectedStartupId(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-[#5B21B6]"
          >
            {startups.map((s) => (
              <option key={s.startupId || s.id || s._id} value={s.startupId || s.id || s._id}>
                {s.startupName || 'Untitled Startup'}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-[#5B21B6] shrink-0 font-bold text-xl">
            {dataRoom?.documents?.length || 0}
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Vault Files</span>
            <span className="text-sm font-black text-gray-800">
              {dataRoom?.documents?.filter((d: any) => d.status === 'Required').length || 0} Required
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 font-bold text-xl">
            {dataRoom?.investorAccess?.filter((a: any) => a.status === 'granted').length || 0}
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Approved Investors</span>
            <span className="text-sm font-black text-gray-800">Active Access</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 font-bold text-xl">
            {dataRoom?.questions?.filter((q: any) => q.status === 'pending').length || 0}
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Pending Investor Q&A</span>
            <span className="text-sm font-black text-gray-800">Due Diligence Questions</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {[
          { id: 'documents', label: 'Vault Documents', icon: FolderLock },
          { id: 'access', label: 'Investor Access Control', icon: Lock },
          { id: 'qa', label: 'Investor Clarifications & Q&A', icon: MessageSquare },
          { id: 'ai', label: 'AI Due Diligence Readiness', icon: Sparkles },
          { id: 'audit', label: 'Activity Audit Log', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 font-bold text-xs rounded-t-xl transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-[#5B21B6] border-t-2 border-[#5B21B6] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 bg-gray-50/60'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: VAULT DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-[#5B21B6] text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Categories ({dataRoom?.documents?.length || 0})
            </button>
            {DATAROOM_CATEGORIES.map((cat) => {
              const count = dataRoom?.documents?.filter((d: any) => d.category === cat.id).length || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-[#5B21B6] text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Documents Table / Grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">Data Room Index Documents</h3>
              <span className="text-xs text-gray-500 font-semibold">
                Showing {filteredDocs.length} of {dataRoom?.documents?.length || 0} documents
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400 font-medium text-sm animate-pulse">
                Loading Data Room documents...
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FolderLock size={40} className="mx-auto text-gray-300" />
                <h4 className="text-base font-bold text-gray-800">No Documents Uploaded in Category</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Upload pitch decks, financial models, cap tables, and incorporation documents to complete your investor due diligence vault.
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-[#5B21B6] text-white font-bold text-xs rounded-xl hover:bg-[#4C1D95]"
                >
                  Upload First Document
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="py-3 px-4">Document Name & Category</th>
                      <th className="py-3 px-4">Stage Req.</th>
                      <th className="py-3 px-4">Version</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Investor Permission</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredDocs.map((doc: any) => (
                      <tr key={doc._id || doc.name} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-[#5B21B6] rounded-xl shrink-0">
                              <FileText size={18} />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{doc.name}</span>
                              <span className="text-[11px] text-gray-500 block">
                                {DATAROOM_CATEGORIES.find((c) => c.id === doc.category)?.name || doc.category} • {doc.fileSize}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold">
                            {doc.stageRequirement || 'Seed'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            v{doc.version || 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              doc.status === 'Required'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : doc.status === 'Recommended'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={doc.permission}
                            onChange={(e) => handlePermissionChange(doc._id, e.target.value as any)}
                            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:border-[#5B21B6]"
                          >
                            <option value="No Access">🔒 Restricted (No Access)</option>
                            <option value="View Only">👁 View Only (Watermarked)</option>
                            <option value="View + Download">📥 View + Download</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-600 hover:text-[#5B21B6] inline-block font-bold"
                            title="Preview Document"
                          >
                            <Eye size={16} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVESTOR ACCESS CONTROL */}
      {activeTab === 'access' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#5B21B6]" />
                Granular Investor Access Permissions
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Investors can only view confidential due diligence documents after you grant explicit authorization.
              </p>
            </div>
            <button
              onClick={() => setShowGrantModal(true)}
              className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-xs flex items-center gap-2"
            >
              <Plus size={14} /> Add Approved Investor
            </button>
          </div>

          {dataRoom?.investorAccess?.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-2">
              <Lock size={36} className="mx-auto text-gray-400" />
              <h4 className="font-bold text-gray-800 text-sm">No Investors Granted Data Room Access Yet</h4>
              <p className="text-xs text-gray-500">
                Data rooms remain completely private during early startup discovery stage. Grant access when entering due diligence.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dataRoom?.investorAccess?.map((inv: any) => (
                <div
                  key={inv.investorId}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">{inv.investorName}</span>
                    <span className="text-gray-500 font-medium block">{inv.investorEmail || inv.investorId}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Granted by {inv.grantedBy || 'Founder'} on {new Date(inv.grantedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                        inv.status === 'granted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {inv.status === 'granted' ? 'Access Granted' : 'Access Revoked'}
                    </span>

                    {inv.status === 'granted' ? (
                      <button
                        onClick={() => handleRevokeAccess(inv.investorId, inv.investorName)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition-colors border border-red-200"
                      >
                        Revoke Access
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          manageInvestorDataRoomAccess(selectedStartupId, {
                            investorId: inv.investorId,
                            investorName: inv.investorName,
                            action: 'grant',
                          }).then(setDataRoom)
                        }
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors border border-emerald-200"
                      >
                        Re-grant Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVESTOR QUESTIONS & CLARIFICATIONS */}
      {activeTab === 'qa' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#5B21B6]" />
              Investor Due Diligence Clarifications & Q&A
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Respond directly to investor inquiries regarding financial models, regulatory agreements, and technology architecture.
            </p>
          </div>

          {dataRoom?.questions?.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-2">
              <HelpCircle size={36} className="mx-auto text-gray-400" />
              <h4 className="font-bold text-gray-800 text-sm">No Pending Investor Questions</h4>
              <p className="text-xs text-gray-500">
                When investors review your vault documents, their clarification questions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dataRoom?.questions?.map((q: any) => (
                <div key={q._id || q.question} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 text-xs space-y-3">
                  <div className="flex justify-between items-start gap-3 border-b border-gray-200 pb-3">
                    <div>
                      <span className="font-bold text-gray-900 text-sm block">{q.investorName}</span>
                      <span className="text-purple-700 font-semibold block text-[11px]">
                        Target Document: {q.documentName || 'General Data Room'}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        q.status === 'answered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {q.status === 'answered' ? 'Answered' : 'Pending Response'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-500 block mb-1 text-[11px]">Investor Question:</span>
                    <p className="text-gray-900 font-semibold text-sm">"{q.question}"</p>
                  </div>

                  {q.answer ? (
                    <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 space-y-1">
                      <span className="font-bold text-[#5B21B6] block text-[11px]">Founder Answer:</span>
                      <p className="text-purple-950 font-medium text-xs leading-relaxed">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        value={answers[q._id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                        placeholder="Type founder response clarification..."
                        className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#5B21B6]"
                      />
                      <button
                        onClick={() => handleAnswerSubmit(q._id)}
                        className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <Send size={12} /> Submit Founder Clarification
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI DUE DILIGENCE ASSISTANCE */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 uppercase tracking-wider">
                  AI Assistance & Readiness Report
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-2">Overall Due Diligence Readiness</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automated scan detecting missing documents, valuation inconsistencies, and investor readiness.
                </p>
              </div>

              <div className="text-right bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <span className="text-xs font-bold text-gray-500 block">Readiness Score</span>
                <span className="text-3xl font-black text-[#5B21B6]">{dataRoom?.aiAnalysis?.overallReadiness || 78}%</span>
              </div>
            </div>

            {/* Pillar Scores */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-bold text-center">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 block mb-1 text-[10px]">Business</span>
                <span className="text-emerald-700 text-sm font-black">{dataRoom?.aiAnalysis?.businessScore || 'Strong'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 block mb-1 text-[10px]">Market</span>
                <span className="text-emerald-700 text-sm font-black">{dataRoom?.aiAnalysis?.marketScore || 'High potential'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 block mb-1 text-[10px]">Financials</span>
                <span className="text-amber-600 text-sm font-black">{dataRoom?.aiAnalysis?.financialsScore || 'Pending Info'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 block mb-1 text-[10px]">Technology</span>
                <span className="text-emerald-700 text-sm font-black">{dataRoom?.aiAnalysis?.techScore || 'Low risk'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 block mb-1 text-[10px]">Legal & Cap Table</span>
                <span className="text-amber-600 text-sm font-black">{dataRoom?.aiAnalysis?.legalScore || 'In Progress'}</span>
              </div>
            </div>

            {/* Checklist & Missing Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Due Diligence Readiness Checklist
                </h4>
                <ul className="space-y-2 font-medium text-gray-700">
                  {dataRoom?.aiAnalysis?.checklist?.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100">
                      <span>{item.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          item.status === 'Complete'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                <h4 className="font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  Detected Missing Documents & Red Flags
                </h4>
                <ul className="space-y-2 font-medium text-amber-950">
                  {dataRoom?.aiAnalysis?.missingDocuments?.map((doc: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-100">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>Missing: {doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-medium">
              🛡 <strong>AI Assistance Disclaimer:</strong> AI due diligence insights provide structural analysis and missing document detection. They do not constitute legal, tax, or investment advice.
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#5B21B6]" />
              Immutable Access & Activity Log
            </h3>
            <span className="text-xs text-gray-400 font-semibold">Strict audit logging active</span>
          </div>

          <div className="space-y-2 text-xs font-medium">
            {dataRoom?.auditLogs?.map((log: any, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="font-bold text-gray-900">{log.userName}</span>
                  <span className="text-gray-500 font-semibold ml-2">({log.userRole})</span>
                  <span className="font-bold text-[#5B21B6] ml-2">• {log.action}</span>
                  {log.documentName && <span className="text-gray-700 ml-2 font-mono">[{log.documentName}]</span>}
                  {log.details && <p className="text-gray-600 text-[11px] mt-0.5">{log.details}</p>}
                </div>
                <span className="text-gray-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Upload size={18} className="text-[#5B21B6]" />
                Upload Vault Document
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-gray-700 font-bold block mb-1">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                >
                  {DATAROOM_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Document Title / Name</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Cap Table FY26, Audited Tax Return"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5B21B6]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  placeholder="Brief summary of file contents..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5B21B6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Investor Permission</label>
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="View Only">View Only</option>
                    <option value="View + Download">View + Download</option>
                    <option value="No Access">Restricted (No Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 font-bold block mb-1">Requirement Status</label>
                  <select
                    value={statusReq}
                    onChange={(e) => setStatusReq(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="Required">Required</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl shadow-md"
                >
                  Add to Data Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRANT ACCESS MODAL */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserCheck size={18} className="text-[#5B21B6]" />
                Grant Investor Access
              </h3>
              <button onClick={() => setShowGrantModal(false)} className="text-gray-400 hover:text-gray-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantAccess} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-gray-700 font-bold block mb-1">Investor Email Address</label>
                <input
                  type="email"
                  required
                  value={investorEmail}
                  onChange={(e) => setInvestorEmail(e.target.value)}
                  placeholder="investor@venturecapital.com"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5B21B6]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Investor / Firm Name</label>
                <input
                  type="text"
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  placeholder="e.g. Rakesh Capital, Sequoia India"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5B21B6]"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-900 text-[11px]">
                🔒 The investor will gain access to view documents where permissions are configured as <strong>View Only</strong> or <strong>View + Download</strong>.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl shadow-md"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderDataRoom;
