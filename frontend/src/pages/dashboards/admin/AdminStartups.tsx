import React, { useState } from 'react';
import { Search, MoreVertical, Building2, X, Cpu, CheckCircle2, AlertTriangle, ArrowLeft, FileText } from 'lucide-react';
import SharedStartupDetailsTabs from '../../../components/shared/SharedStartupDetailsTabs';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { getDocuments } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const AdminStartups: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [startups, setStartups] = React.useState<any[]>([]);
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [selectedStartup, setSelectedStartup] = React.useState<any>(null);
  const [viewMode, setViewMode] = useState<'details' | 'documents' | 'funding'>('details');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const { getStartupOffers, markAsFunded, updateOfferAdminNote, verifyOffer } = useFunding();
  const startupOffers = selectedStartup ? getStartupOffers(selectedStartup.startupId, selectedStartup.startupName) : [];
  const [adminNote, setAdminNote] = useState('');
  
  // Details Modal State
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<FundingOffer | null>(null);
  const [editableNote, setEditableNote] = useState('');

  const handleDelete = (startupId: string) => {
    if (window.confirm('Are you sure you want to delete this startup?')) {
      localStorage.removeItem(`startup_${startupId}`);
      setStartups(prev => prev.filter(s => s.startupId !== startupId));
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

  React.useEffect(() => {
    const keys = Object.keys(localStorage);
    const locals: any[] = [];
    keys.forEach(key => {
      if (key.startsWith('startup_')) {
        try {
          locals.push(JSON.parse(localStorage.getItem(key) || ''));
        } catch (e) {}
      }
    });
    locals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setStartups(locals);
    setDocuments(getDocuments());
  }, []);

  const filtered = startups.filter(s => {
    const matchesSearch = s.startupName?.toLowerCase().includes(search.toLowerCase()) ||
      s.startupIdea?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || s.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Manage Startups</h1>
      <p className="text-gray-500 mt-1">View, edit, and moderate all startups on the platform.</p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search startups..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" 
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Under Review</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-48 min-h-[500px]">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Startup</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Founder</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400 text-sm">No startups match your search or filters.</td>
              </tr>
            ) : (
              filtered.map(s => (
                <tr key={s.startupId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" /> {s.startupName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Local Founder</td>
                  <td className="px-6 py-4 text-sm text-gray-600 line-clamp-1">{s.aiGenerated?.ideaAnalysis?.businessModel || 'Tech'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.status === 'generated' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {s.status === 'generated' ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right relative">
                    <div className="inline-block text-left relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(dropdownOpen === s.startupId ? null : s.startupId);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center justify-center"
                      >
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>
                      {dropdownOpen === s.startupId && (
                        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[100] animate-fade-in-up text-left">
                          <button 
                            onClick={() => { setSelectedStartup(s); setViewMode('details'); setDropdownOpen(null); }} 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => { setSelectedStartup(s); setViewMode('funding'); setDropdownOpen(null); }} 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                          >
                            Funding Offers
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button 
                            onClick={() => { handleDownload(`${s.startupName.replace(/\s+/g, '_')}_Report`, 'PDF'); setDropdownOpen(null); }} 
                            className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
                          >
                            Download PDF Report
                          </button>
                          <button 
                            onClick={() => { handleDownload(`${s.startupName.replace(/\s+/g, '_')}_Report`, 'WORD'); setDropdownOpen(null); }} 
                            className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
                          >
                            Download Word Report
                          </button>
                          <button 
                            onClick={() => { handleDownload(`${s.startupName.replace(/\s+/g, '_')}_Full_Package`, 'ZIP'); setDropdownOpen(null); }} 
                            className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
                          >
                            Download ZIP Package
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button 
                            onClick={() => { handleDelete(s.startupId); setDropdownOpen(null); }} 
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
                          >
                            Delete Startup
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    
    {/* Modal Overlay */}
    {selectedStartup && (
      <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-[95%] lg:w-full max-w-[1200px] max-h-[90vh] flex flex-col rounded-[24px] shadow-xl animate-fade-in-up overflow-hidden">
          <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex items-center gap-4 shrink-0 z-10">
            <button 
              onClick={() => setSelectedStartup(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h2 className="text-[22px] font-bold text-gray-900">
                {viewMode === 'documents' ? 'Startup Documents' : viewMode === 'funding' ? 'Funding Offers' : 'Startup Details'}
              </h2>
              <p className="text-[15px] text-gray-500 mt-1">{selectedStartup.startupName}</p>
            </div>
            <button 
              onClick={() => setSelectedStartup(null)}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            {viewMode === 'details' ? (
              <SharedStartupDetailsTabs startupData={selectedStartup} />
            ) : viewMode === 'funding' ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Funding Offers & Term Sheets</h3>
                {startupOffers.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                    No funding offers have been made to this startup yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {startupOffers.map(offer => (
                      <div key={offer.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${offer.status === 'funded' ? 'bg-green-100 text-green-800' : offer.status === 'accepted' ? 'bg-purple-100 text-purple-800' : offer.status === 'counter_offer' ? 'bg-orange-100 text-orange-800' : offer.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                              {offer.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg">Offer from {offer.investorCompany}</h4>
                          <p className="text-xs text-gray-500 mt-1">Investor: {offer.investorName} • Instrument: {offer.instrument}</p>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-left md:text-right">
                            <p className="text-xl font-black text-gray-900">${offer.offerAmount.toLocaleString()} {offer.currency || 'USD'}</p>
                            <p className="text-xs text-gray-500 font-semibold">{offer.equityPercentage}% Equity</p>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedOfferForDetails(offer);
                              setEditableNote(offer.adminNote || '');
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">All Documents & Exports</h3>
                {documents.filter(d => d.startupId === selectedStartup.startupId).length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                    No documents found for this startup.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {documents.filter(d => d.startupId === selectedStartup.startupId).map((doc: any) => (
                      <div key={doc.id} className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{doc.fileName}</p>
                          <div className="flex gap-3 mt-1.5">
                            <span className="text-xs text-gray-500">{doc.category}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{doc.fileType}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{doc.fileSize}</span>
                          </div>
                          <div className="mt-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${doc.status === 'shared' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {doc.status}
                            </span>
                            {doc.status === 'shared' && doc.sharedWith?.length > 0 && (
                              <span className="text-xs text-gray-500 ml-2">Shared with: {doc.sharedWith.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => window.alert(`Previewing ${doc.fileName}...`)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors">
                            Preview
                          </button>
                          <button onClick={() => window.alert(`Downloading ${doc.fileName}...`)} className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg transition-colors">
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-start">
              <button 
                onClick={() => setSelectedStartup(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors flex items-center"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Startups
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Admin Offer Details Modal */}
      {selectedOfferForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <FileText size={20} className="text-[#5B21B6]" /> Offer details: {selectedOfferForDetails.startupName}
              </h3>
              <button 
                onClick={() => setSelectedOfferForDetails(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Startup Name</p>
                  <p className="font-semibold text-gray-900">{selectedOfferForDetails.startupName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Founder Name</p>
                  <p className="font-semibold text-gray-900">{selectedOfferForDetails.founderName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Investor Name</p>
                  <p className="font-semibold text-gray-900">{selectedOfferForDetails.investorName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Investor Company</p>
                  <p className="font-semibold text-gray-900">{selectedOfferForDetails.investorCompany}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Offer Amount</p>
                  <p className="font-bold text-gray-900">${selectedOfferForDetails.offerAmount.toLocaleString()} {selectedOfferForDetails.currency || 'USD'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Equity %</p>
                  <p className="font-bold text-gray-900">{selectedOfferForDetails.equityPercentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Investment Type</p>
                  <p className="font-bold text-gray-900">{selectedOfferForDetails.instrument}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Valuation Cap</p>
                  <p className="font-bold text-gray-900">${(selectedOfferForDetails.valuationCap / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Expiry Date</p>
                  <p className="font-bold text-gray-900">
                    {new Date(new Date(selectedOfferForDetails.createdAt).getTime() + selectedOfferForDetails.expiresInDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedOfferForDetails.status === 'funded' ? 'bg-green-100 text-green-800' : selectedOfferForDetails.status === 'accepted' ? 'bg-purple-100 text-purple-800' : selectedOfferForDetails.status === 'counter_offer' ? 'bg-orange-100 text-orange-800' : selectedOfferForDetails.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {selectedOfferForDetails.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {selectedOfferForDetails.investorMessage && (
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase mb-1">Investor Message</p>
                  <p className="text-sm text-gray-700 italic">"{selectedOfferForDetails.investorMessage}"</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Offer History & Timeline</p>
                <div className="space-y-4">
                  {selectedOfferForDetails.history.filter((h, index, self) => {
                    if (['accepted', 'funded', 'offer_received', 'rejected'].includes(h.action)) {
                      return index === self.findIndex(t => t.action === h.action);
                    }
                    return index === self.findIndex(t => t.action === h.action && t.createdAt === h.createdAt);
                  }).map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-1.5 bg-gray-200 rounded-full my-1"></div>
                      <div>
                        <p className="font-bold text-gray-800">{h.action.toUpperCase()} <span className="text-gray-400 font-medium text-xs ml-2">{new Date(h.createdAt).toLocaleString()}</span></p>
                        <p className="text-gray-600 mt-0.5">By {h.performedBy} ({h.role}) - {h.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Notes</label>
                <textarea 
                  value={editableNote}
                  onChange={(e) => setEditableNote(e.target.value)}
                  placeholder="Internal audit notes, document check confirmation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
                <button 
                  onClick={() => {
                    updateOfferAdminNote(selectedOfferForDetails.id, editableNote);
                    window.alert("Admin note saved!");
                    // Sync modal state with localstorage changes
                    setSelectedOfferForDetails(prev => prev ? { ...prev, adminNote: editableNote } : null);
                  }}
                  className="mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setSelectedOfferForDetails(null)}
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg transition-colors"
              >
                Close
              </button>
              
              <button 
                onClick={() => {
                  verifyOffer(selectedOfferForDetails.id, "System Admin");
                  window.alert("Offer verified! History logged.");
                  setSelectedOfferForDetails(null);
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors"
              >
                Verify Offer
              </button>

              {selectedOfferForDetails.status === 'accepted' && (
                <button 
                  onClick={() => {
                    markAsFunded(selectedOfferForDetails.id, editableNote || "Verified by Admin", "System Admin");
                    window.alert("Offer verified and marked as Funded!");
                    setSelectedOfferForDetails(null);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Mark as Funded
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStartups;
