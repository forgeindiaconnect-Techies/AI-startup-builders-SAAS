import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, FileText, Download, ShieldCheck, Lock, Eye, MessageSquare, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { fetchInvestorAccessibleDataRooms, submitDataRoomQA, logDataRoomActivity } from '../../../utils/dataroomApi';
import jsPDF from 'jspdf';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const DATAROOM_CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'company_legal', name: 'Company & Legal' },
  { id: 'business_startup', name: 'Business & Startup' },
  { id: 'financial_info', name: 'Financial Information' },
  { id: 'market_customer', name: 'Market & Customer' },
  { id: 'product_tech', name: 'Product & Technology' },
  { id: 'team_org', name: 'Team & Organization' },
  { id: 'fundraising', name: 'Fundraising' },
  { id: 'compliance_risk', name: 'Compliance & Risk' },
];

const InvestorDueDiligence: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dataRooms, setDataRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Question modal
  const [questionDoc, setQuestionDoc] = useState<any>(null);
  const [questionText, setQuestionText] = useState('');
  const [submittingQ, setSubmittingQ] = useState(false);

  // Get logged in investor details
  const userJson = localStorage.getItem('ai_startup_builder_user');
  const currentUser = userJson ? JSON.parse(userJson) : { id: 'investor_rakesh', name: 'Rakesh', email: 'rakesh@investor.com' };
  const investorId = currentUser.email || currentUser.id || 'rakesh@investor.com';

  const loadDataRooms = async () => {
    setLoading(true);
    try {
      const rooms = await fetchInvestorAccessibleDataRooms(investorId);
      setDataRooms(rooms || []);
      if (rooms && rooms.length > 0) {
        setActiveRoom(rooms[0]);
      }
    } catch (err) {
      console.error('Error fetching investor data rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataRooms();
  }, []);

  const filteredRooms = dataRooms.filter((d) =>
    d.startupName.toLowerCase().includes(search.toLowerCase()) ||
    d.documents.some((doc: any) => doc.name.toLowerCase().includes(search.toLowerCase()))
  );

  const activeDocs = activeRoom?.documents
    ? activeRoom.documents.filter((doc: any) => {
        if (doc.permission === 'No Access') return false;
        if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
        return true;
      })
    : [];

  const handleDownload = async (docObj: any, format?: string) => {
    if (docObj.permission !== 'View + Download') {
      alert('Download restricted by founder. You have View Only permission for this document.');
      return;
    }

    const name = docObj.name;
    const finalFormat = format ? format.toLowerCase() : docObj.fileType || 'pdf';
    const baseName = name.replace(/\.[^/.]+$/, '');
    const finalName = `${baseName}.${finalFormat}`;

    // Log Activity
    logDataRoomActivity(activeRoom.startupId, {
      userId: investorId,
      userName: currentUser.name || 'Investor',
      userRole: 'investor',
      action: 'Document Downloaded',
      documentId: docObj._id,
      documentName: docObj.name,
      details: `Downloaded ${finalFormat.toUpperCase()} version.`,
    });

    try {
      if (finalFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`Startup Due Diligence: ${baseName}`, 20, 20);
        doc.setFontSize(10);
        doc.text(`Confidential - Authorized Investor Review (${currentUser.name})`, 20, 30);
        doc.text(`Category: ${docObj.category} • Stage: ${docObj.stageRequirement || 'Seed'}`, 20, 40);
        doc.setFontSize(12);
        doc.text(`Document Description: ${docObj.description || 'Verified Due Diligence Record'}`, 20, 55);
        doc.save(finalName);
      } else if (finalFormat === 'docx' || finalFormat === 'doc' || finalFormat === 'word') {
        const docx = new DocxDocument({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Startup Due Diligence: ${baseName}`, bold: true, size: 28 })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Confidential - Authorized Investor Review (${currentUser.name})`, size: 20 })],
                }),
              ],
            },
          ],
        });
        const blob = await Packer.toBlob(docx);
        saveAs(blob, `${baseName}.docx`);
      } else if (finalFormat === 'zip') {
        const zip = new JSZip();
        zip.file('readme.txt', `Due Diligence Package for ${activeRoom.startupName}`);
        zip.file(`${baseName}.txt`, `Document: ${name}\nDescription: ${docObj.description}`);
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${baseName}_package.zip`);
      } else {
        const content = `Mock content for ${finalName}`;
        const blob = new Blob([content], { type: 'text/plain' });
        saveAs(blob, finalName);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to generate document file.');
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !activeRoom) return;

    setSubmittingQ(true);
    try {
      const updatedRoom = await submitDataRoomQA(activeRoom.startupId, {
        documentId: questionDoc?._id || '',
        documentName: questionDoc?.name || 'General Data Room',
        investorId: investorId,
        investorName: currentUser.name || 'Investor',
        investorEmail: investorId,
        question: questionText.trim(),
        userId: investorId,
        userName: currentUser.name || 'Investor',
        userRole: 'investor',
      });
      setActiveRoom(updatedRoom);
      setQuestionDoc(null);
      setQuestionText('');
      alert('Your question has been sent to the founder!');
    } catch (err) {
      alert('Failed to submit question');
    } finally {
      setSubmittingQ(false);
    }
  };

  return (
    <div className="animate-fade-in-up pb-10 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investor Due Diligence Data Room</h1>
          <p className="text-xs text-gray-500 mt-1">
            Access secure due diligence vaults and review confidential startup documents granted by founders.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data rooms..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-xs font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Rooms List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Accessible Data Rooms</h2>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-xs animate-pulse">Loading data rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3 shadow-xs">
              <Lock size={36} className="mx-auto text-amber-500" />
              <h3 className="text-sm font-bold text-gray-900">No Data Room Available</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                The founder has not yet provided access to confidential due diligence documents. Detailed documents become available after mutual interest approval.
              </p>
            </div>
          ) : (
            filteredRooms.map((d) => (
              <div
                key={d._id || d.startupId}
                onClick={() => setActiveRoom(d)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeRoom?.startupId === d.startupId
                    ? 'bg-[#5B21B6] text-white shadow-lg shadow-purple-900/20 border-transparent'
                    : 'bg-white border-gray-100 hover:border-gray-300 text-gray-900'
                }`}
              >
                <h3 className="font-bold text-base mb-1">{d.startupName}</h3>
                <div
                  className={`flex items-center justify-between text-xs font-medium ${
                    activeRoom?.startupId === d.startupId ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FolderOpen size={14} /> {d.documents?.length || 0} Vault Documents
                  </span>
                  <span>{d.startupStage || 'Seed'}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      activeRoom?.startupId === d.startupId
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    Granted Access
                  </span>
                  <span className="text-[10px] opacity-80">Stage: {d.dealStage || 'Due Diligence'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Active Room Content */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full space-y-6">
          {!activeRoom ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-gray-50 rounded-xl border border-gray-100 border-dashed space-y-3 p-6">
              <Lock size={44} className="text-gray-300" />
              <h3 className="text-base font-bold text-gray-800">No Data Room Selected</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                The founder has not yet provided access to confidential due diligence documents. Express interest in a startup to request data room access.
              </p>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{activeRoom.startupName}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Founder: <strong className="text-gray-800">{activeRoom.founderName}</strong> • Stage: {activeRoom.startupStage}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Verified Investor Access
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Filter size={14} className="text-gray-400 shrink-0" />
                {DATAROOM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-[#5B21B6] text-white border-transparent'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Documents Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Permitted Vault Files</h3>

                {activeDocs.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded-xl border border-gray-100 text-center text-xs text-gray-500">
                    No documents available under selected category filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeDocs.map((doc: any) => (
                      <div
                        key={doc._id || doc.name}
                        className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-purple-100 text-[#5B21B6] rounded-lg shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-xs truncate">{doc.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{doc.fileSize} • Version v{doc.version || 1}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-semibold">
                              {doc.permission}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-xs">
                          <button
                            onClick={() => {
                              setQuestionDoc(doc);
                              setQuestionText('');
                            }}
                            className="text-[#5B21B6] hover:underline font-bold flex items-center gap-1 text-[11px]"
                          >
                            <MessageSquare size={12} /> Ask Question
                          </button>

                          {doc.permission === 'View + Download' ? (
                            <button
                              onClick={() => handleDownload(doc)}
                              className="px-3 py-1 bg-[#5B21B6] text-white rounded-lg text-[11px] font-bold hover:bg-[#4C1D95] flex items-center gap-1"
                            >
                              <Download size={12} /> Download
                            </button>
                          ) : (
                            <span className="text-gray-400 font-medium text-[11px] flex items-center gap-1">
                              <Lock size={10} /> View Only
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Due Diligence Q&A History */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#5B21B6]" />
                  Your Clarification Inquiries & Founder Responses
                </h3>

                {activeRoom.questions?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No questions raised yet for this startup.</p>
                ) : (
                  <div className="space-y-3">
                    {activeRoom.questions?.map((q: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
                        <div className="flex justify-between font-bold text-gray-900 text-[11px]">
                          <span>Doc: {q.documentName || 'General'}</span>
                          <span
                            className={q.status === 'answered' ? 'text-emerald-600' : 'text-amber-600'}
                          >
                            {q.status === 'answered' ? 'Answered by Founder' : 'Pending Response'}
                          </span>
                        </div>
                        <p className="text-gray-800 font-semibold">Q: "{q.question}"</p>
                        {q.answer && <p className="text-purple-900 font-medium bg-purple-50 p-2 rounded-lg border border-purple-100">A: {q.answer}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* QUESTION MODAL */}
      {questionDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs font-medium">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-[#5B21B6]" />
                Ask Clarification to Founder
              </h3>
              <button onClick={() => setQuestionDoc(null)} className="text-gray-400 font-bold">✕</button>
            </div>

            <p className="text-gray-600">
              Target Document: <strong className="text-gray-900">{questionDoc.name}</strong>
            </p>

            <form onSubmit={handleAskQuestion} className="space-y-3">
              <textarea
                rows={3}
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Could you provide the assumptions used for the projected revenue growth in FY27?"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#5B21B6]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuestionDoc(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQ}
                  className="px-5 py-2 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95]"
                >
                  {submittingQ ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDueDiligence;
