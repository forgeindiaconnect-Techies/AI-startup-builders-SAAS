import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, CheckCircle2, X, AlertCircle, Clock,
  ChevronDown, ShieldCheck, Pen,
  Building2, IndianRupee, Calendar, User,
  ScrollText, Lock, Unlock, Bell, Upload, Eye, FileDown, ArrowRight
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer, IAgreementDetails } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import { addNotification } from '../../../utils/localStorageHelper';
import InvestorSubNav from '../../../components/shared/InvestorSubNav';

const SIGNATURE_STYLES = [
  { name: 'Sacramento', style: { fontFamily: "'Sacramento', cursive", fontSize: '28px', fontWeight: 400 } },
  { name: 'Great Vibes', style: { fontFamily: "'Great Vibes', cursive", fontSize: '28px', fontWeight: 400 } },
  { name: 'Dancing Script', style: { fontFamily: "'Dancing Script', cursive", fontSize: '24px', fontWeight: 700 } },
  { name: 'Caveat', style: { fontFamily: "'Caveat', cursive", fontSize: '24px', fontWeight: 700 } },
];

const handleDownloadFile = (base64Data: string, filename: string) => {
  if (!base64Data) return;
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename || 'document.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ─── Create/Edit Agreement Form Modal ─────────────────────────────────────────
const CreateAgreementModal: React.FC<{
  offer: FundingOffer;
  onClose: () => void;
  onSend: (offer: FundingOffer, details: Omit<IAgreementDetails, 'version' | 'createdAt' | 'createdBy'>) => void;
  actionLoading: boolean;
}> = ({ offer, onClose, onSend, actionLoading }) => {
  const currentDetails = offer.agreementDetails;
  
  // Deal Info
  const [agreementExpiryDate, setAgreementExpiryDate] = useState(currentDetails?.agreementExpiryDate || '');
  
  // Investment Details
  const [preMoneyValuation, setPreMoneyValuation] = useState(currentDetails?.preMoneyValuation || 0);
  const [postMoneyValuation, setPostMoneyValuation] = useState(currentDetails?.postMoneyValuation || 0);
  const [fundingType, setFundingType] = useState(currentDetails?.fundingType || offer.instrument || 'SAFE');
  const [investmentType, setInvestmentType] = useState(currentDetails?.investmentType || 'Primary');
  const [expectedFundingDate, setExpectedFundingDate] = useState(currentDetails?.expectedFundingDate || offer.expectedInvestmentDate || '');
  
  // Commercial Terms
  const [investmentTerms, setInvestmentTerms] = useState(currentDetails?.investmentTerms || '');
  const [equityTerms, setEquityTerms] = useState(currentDetails?.equityTerms || '');
  const [investorRights, setInvestorRights] = useState(currentDetails?.investorRights || '');
  const [founderObligations, setFounderObligations] = useState(currentDetails?.founderObligations || '');
  const [useOfFunds, setUseOfFunds] = useState(currentDetails?.useOfFunds || '');
  const [milestones, setMilestones] = useState(currentDetails?.milestones || '');
  const [exitTerms, setExitTerms] = useState(currentDetails?.exitTerms || '');
  const [confidentialityTerms, setConfidentialityTerms] = useState(currentDetails?.confidentialityTerms || '');
  const [additionalConditions, setAdditionalConditions] = useState(currentDetails?.additionalConditions || '');
  
  // Documents
  const [uploadedDocument, setUploadedDocument] = useState(currentDetails?.uploadedDocument || '');
  const [uploadedDocumentName, setUploadedDocumentName] = useState(currentDetails?.uploadedDocumentName || '');
  const [supportingDocuments, setSupportingDocuments] = useState(currentDetails?.supportingDocuments || '');
  const [supportingDocumentsName, setSupportingDocumentsName] = useState(currentDetails?.supportingDocumentsName || '');
  const [specialClauses, setSpecialClauses] = useState(currentDetails?.specialClauses || '');

  // Form tab navigation
  const [activeTab, setActiveTab] = useState<'info' | 'details' | 'terms' | 'docs'>('info');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // File change handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'support') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (allowed doc formats)
    const allowedExtensions = /(\.pdf|\.doc|\.docx|\.png|\.jpg|\.jpeg)$/i;
    if (!allowedExtensions.exec(file.name)) {
      alert('Please upload a PDF, Word document, or image file (.pdf, .doc, .docx, .png, .jpg).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'main') {
        setUploadedDocument(base64);
        setUploadedDocumentName(file.name);
      } else {
        setSupportingDocuments(base64);
        setSupportingDocumentsName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const dealId = offer.commitmentId || `FC-2026-${String(offer.id || offer._id || '').slice(-4).toUpperCase()}`;

  const validate = () => {
    if (!agreementExpiryDate) return 'Agreement Expiry Date is required.';
    if (offer.offerAmount <= 0) return 'Investment Amount must be greater than zero.';
    if (offer.equityPercentage < 0 || offer.equityPercentage > 100) return 'Equity Percentage must be valid.';
    if (!expectedFundingDate) return 'Expected Funding Date is required.';
    if (!investmentTerms.trim()) return 'Investment Terms are required.';
    if (!uploadedDocument) return 'Investment Agreement Document is required.';
    return null;
  };

  const handleSendClick = () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSend = () => {
    setShowConfirmModal(false);
    onSend(offer, {
      startupName: offer.startupName,
      founderName: offer.founderName,
      investorName: offer.investorName,
      dealId,
      agreementDate: new Date().toISOString().split('T')[0],
      agreementExpiryDate,
      offerAmount: offer.offerAmount,
      currency: offer.currency || 'INR',
      equityPercentage: offer.equityPercentage,
      preMoneyValuation,
      postMoneyValuation,
      fundingType,
      investmentType,
      expectedFundingDate,
      investmentTerms,
      equityTerms,
      investorRights,
      founderObligations,
      useOfFunds,
      milestones,
      exitTerms,
      confidentialityTerms,
      additionalConditions,
      uploadedDocument,
      uploadedDocumentName,
      supportingDocuments,
      supportingDocumentsName,
      specialClauses
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[170] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative my-4 flex flex-col font-sans max-h-[95vh] text-left">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <ScrollText className="text-[#5B21B6]" size={22} />
              {currentDetails ? 'Update & Resend Agreement' : 'Create Investment Agreement'}
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-mono">Deal ID: {dealId} | Target: {offer.startupName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form Tabs */}
        <div className="bg-gray-50 px-6 border-b border-gray-100 flex gap-4 text-xs font-bold shrink-0">
          {[
            { id: 'info', label: '1. Deal Info' },
            { id: 'details', label: '2. Investment Details' },
            { id: 'terms', label: '3. Commercial Terms' },
            { id: 'docs', label: '4. Documents' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#6C4CF1] text-[#6C4CF1] font-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-700">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-black text-gray-500 uppercase tracking-wider mb-1.5">Startup Name</label>
                <input type="text" disabled value={offer.startupName} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-black text-gray-500 uppercase tracking-wider mb-1.5">Founder Name</label>
                <input type="text" disabled value={offer.founderName} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-black text-gray-500 uppercase tracking-wider mb-1.5">Investor Name</label>
                <input type="text" disabled value={offer.investorName} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-black text-gray-500 uppercase tracking-wider mb-1.5">Deal/Investment ID</label>
                <input type="text" disabled value={dealId} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-mono text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-black text-gray-500 uppercase tracking-wider mb-1.5">Agreement Date</label>
                <input type="text" disabled value={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Agreement Expiry Date *</label>
                <input
                  type="date"
                  value={agreementExpiryDate}
                  onChange={e => setAgreementExpiryDate(e.target.value)}
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-black text-gray-500 uppercase tracking-wider mb-1.5">Investment Amount</label>
                <input type="text" disabled value={`₹${offer.offerAmount.toLocaleString('en-IN')}`} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-black text-gray-500 uppercase tracking-wider mb-1.5">Equity Percentage</label>
                <input type="text" disabled value={`${offer.equityPercentage}%`} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Pre-Money Valuation (₹)</label>
                <input
                  type="number"
                  value={preMoneyValuation}
                  onChange={e => setPreMoneyValuation(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Post-Money Valuation (₹)</label>
                <input
                  type="number"
                  value={postMoneyValuation}
                  onChange={e => setPostMoneyValuation(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Funding Type</label>
                <select
                  value={fundingType}
                  onChange={e => setFundingType(e.target.value)}
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                >
                  <option value="SAFE">SAFE Note</option>
                  <option value="Equity">Equity</option>
                  <option value="Convertible Note">Convertible Note</option>
                  <option value="Debt">Debt</option>
                </select>
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Investment Type</label>
                <select
                  value={investmentType}
                  onChange={e => setInvestmentType(e.target.value)}
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                >
                  <option value="Primary">Primary Issuance</option>
                  <option value="Secondary">Secondary Share Purchase</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Expected Funding Date *</label>
                <input
                  type="date"
                  value={expectedFundingDate}
                  onChange={e => setExpectedFundingDate(e.target.value)}
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Investment Terms *</label>
                <textarea
                  rows={2}
                  value={investmentTerms}
                  onChange={e => setInvestmentTerms(e.target.value)}
                  placeholder="Detail parameters of investment conversion, pricing, trigger events..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Equity / Ownership Terms</label>
                <textarea
                  rows={2}
                  value={equityTerms}
                  onChange={e => setEquityTerms(e.target.value)}
                  placeholder="Rules on option pools, dilution protections, transfer conditions..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Investor Rights</label>
                <textarea
                  rows={2}
                  value={investorRights}
                  onChange={e => setInvestorRights(e.target.value)}
                  placeholder="Information rights, board observer seat rights, participation rights..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Founder Obligations</label>
                <textarea
                  rows={2}
                  value={founderObligations}
                  onChange={e => setFounderObligations(e.target.value)}
                  placeholder="Lock-in timelines, non-compete rules, operational reports obligations..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Use of Funds</label>
                <textarea
                  rows={2}
                  value={useOfFunds}
                  onChange={e => setUseOfFunds(e.target.value)}
                  placeholder="Describe operational areas allowed (R&D, marketing, hiring etc.)..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Milestones / Conditions</label>
                <textarea
                  rows={2}
                  value={milestones}
                  onChange={e => setMilestones(e.target.value)}
                  placeholder="Tranche release conditions, product launch deliverables, registration checks..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Exit / Transfer Terms</label>
                <textarea
                  rows={2}
                  value={exitTerms}
                  onChange={e => setExitTerms(e.target.value)}
                  placeholder="Tag-along, drag-along rights, IPO guidelines, buyback terms..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Confidentiality Terms</label>
                <textarea
                  rows={2}
                  value={confidentialityTerms}
                  onChange={e => setConfidentialityTerms(e.target.value)}
                  placeholder="Confidentiality duration, exceptions, public announcement rules..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Additional Conditions</label>
                <textarea
                  rows={2}
                  value={additionalConditions}
                  onChange={e => setAdditionalConditions(e.target.value)}
                  placeholder="Key warranties, indemnity clauses, dispute seats..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-5">
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-[#5B21B6] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Upload size={13} /> Upload Agreement Document *
                </h4>
                <div className="flex items-center gap-4">
                  <label className="px-4 py-2.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Upload size={14} /> Choose File
                    <input type="file" onChange={e => handleFileChange(e, 'main')} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <div>
                    {uploadedDocumentName ? (
                      <p className="font-bold text-gray-900 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" /> {uploadedDocumentName}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">No document selected (.pdf, .doc, .docx allowed)</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Upload size={13} /> Supporting Documents (Optional)
                </h4>
                <div className="flex items-center gap-4">
                  <label className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Upload size={14} /> Choose File
                    <input type="file" onChange={e => handleFileChange(e, 'support')} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <div>
                    {supportingDocumentsName ? (
                      <p className="font-bold text-gray-900 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" /> {supportingDocumentsName}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">No document selected</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-black text-purple-700 uppercase tracking-wider mb-1.5">Special Clauses / Additional Notes</label>
                <textarea
                  rows={3}
                  value={specialClauses}
                  onChange={e => setSpecialClauses(e.target.value)}
                  placeholder="Enter any additional representations, specific indemnity caps, or special conditions..."
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#6C4CF1]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between rounded-b-3xl">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Eye size={13} /> Preview Agreement
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSendClick}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FileText size={13} />
              {currentDetails ? 'Resend Agreement' : 'Send Agreement'}
            </button>
          </div>
        </div>

        {/* ─── CONFIRMATION MODAL OVERLAY ─── */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative font-sans text-left">
              <h3 className="text-base font-black text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle size={18} className="text-purple-600" /> Confirm Agreement Dispatch
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                Are you sure you want to send this investment agreement to the Founder? Once sent, the Founder will be able to review and sign the agreement.
              </p>
              
              <div className="flex gap-3 pt-5 border-t border-gray-100 mt-5">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSend}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow cursor-pointer"
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── PREVIEW CLAUSE MODAL OVERLAY ─── */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-6 flex flex-col font-sans max-h-[85vh]">
              <button onClick={() => setShowPreviewModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer">
                <X size={16} />
              </button>

              <div className="p-6 border-b border-gray-100 flex items-start gap-2.5 shrink-0 text-left">
                <div className="w-10 h-10 rounded-2xl bg-[#5B21B6]/10 text-[#5B21B6] flex items-center justify-center shrink-0">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Agreement Draft Preview</h3>
                  <p className="text-[10px] text-gray-500 font-mono">Simulated Legal Clauses Presentation</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 text-xs text-gray-700 space-y-4 leading-relaxed text-left">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-2">Deal Information Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <p><strong>Startup Name:</strong> {offer.startupName}</p>
                    <p><strong>Founder Name:</strong> {offer.founderName}</p>
                    <p><strong>Investor Name:</strong> {offer.investorName}</p>
                    <p><strong>Expiry Date:</strong> {agreementExpiryDate || 'Not Set'}</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100">
                  <h4 className="font-bold text-[#5B21B6] mb-2">Commercial & Investment Terms</h4>
                  <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                    <p><strong>Amount:</strong> ₹{offer.offerAmount.toLocaleString('en-IN')}</p>
                    <p><strong>Equity Percentage:</strong> {offer.equityPercentage}%</p>
                    <p><strong>Pre-Money Valuation:</strong> ₹{preMoneyValuation.toLocaleString('en-IN')}</p>
                    <p><strong>Post-Money Valuation:</strong> ₹{postMoneyValuation.toLocaleString('en-IN')}</p>
                    <p><strong>Expected Funding Date:</strong> {expectedFundingDate}</p>
                  </div>
                  <div className="space-y-2 border-t border-purple-100/50 pt-2 text-[11px]">
                    <p><strong>Conversion/Investment Terms:</strong> {investmentTerms || 'N/A'}</p>
                    <p><strong>Equity Terms:</strong> {equityTerms || 'N/A'}</p>
                    <p><strong>Investor Rights:</strong> {investorRights || 'N/A'}</p>
                    <p><strong>Founder Obligations:</strong> {founderObligations || 'N/A'}</p>
                    <p><strong>Use of Funds:</strong> {useOfFunds || 'N/A'}</p>
                    <p><strong>Milestones:</strong> {milestones || 'N/A'}</p>
                    <p><strong>Exit terms:</strong> {exitTerms || 'N/A'}</p>
                    <p><strong>Confidentiality terms:</strong> {confidentialityTerms || 'N/A'}</p>
                    <p><strong>Additional notes:</strong> {specialClauses || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2 shrink-0 rounded-b-3xl">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

// ─── Track Status & Audit Trail Modal ─────────────────────────────────────────
const TrackStatusModal: React.FC<{
  offer: FundingOffer;
  onClose: () => void;
  onSignAgreement?: (offer: FundingOffer) => void;
  onCancelAgreement?: (offer: FundingOffer) => void;
  actionLoading: boolean;
}> = ({ offer, onClose, onSignAgreement, onCancelAgreement, actionLoading }) => {
  const details = offer.agreementDetails;
  const auditTrail = offer.agreementAuditTrail || [];
  const versions = offer.agreementVersions || [];

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  return createPortal(
    <div className="fixed inset-0 z-[170] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-8 flex flex-col font-sans max-h-[92vh] text-left">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Eye size={18} className="text-[#5B21B6]" />
              Agreement #{(offer.agreementId || `AGR-2026-${(offer.id || offer._id || '').slice(-4).toUpperCase()}`)} Tracking
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">Deal target: {offer.startupName} · Version: {offer.agreementVersion || 'v1.0'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-700">
          {/* Status badge */}
          <div className="flex items-center gap-2 flex-wrap bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <span className="font-bold text-gray-700 uppercase tracking-wide">Current Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
              offer.agreementStatus === 'Fully Signed' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : offer.agreementStatus === 'Changes Requested'
                  ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                  : offer.agreementStatus === 'Rejected'
                    ? 'bg-red-50 text-red-700 border-red-100'
                    : 'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
              {offer.agreementStatus || 'Draft'}
            </span>
          </div>

          {/* Deal & Commercial Terms Summary */}
          {details && (
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50/20">
              <h4 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] flex items-center gap-1"><FileText size={10} /> Active Terms & Parameters</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-white border border-gray-200/50 p-2.5 rounded-xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Valuation Cap</p>
                  <p className="font-extrabold text-gray-900 mt-0.5">₹{(details.preMoneyValuation || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white border border-gray-200/50 p-2.5 rounded-xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Funding Type</p>
                  <p className="font-extrabold text-gray-900 mt-0.5">{details.fundingType || 'SAFE'}</p>
                </div>
                <div className="bg-white border border-gray-200/50 p-2.5 rounded-xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Investment Type</p>
                  <p className="font-extrabold text-[#5B21B6] mt-0.5">{details.investmentType || 'Primary'}</p>
                </div>
                <div className="bg-white border border-gray-200/50 p-2.5 rounded-xl col-span-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Investment Terms Summary</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{details.investmentTerms || 'N/A'}</p>
                </div>
              </div>

              {/* Document Download options */}
              <div className="pt-2 flex flex-wrap gap-2">
                {details.uploadedDocument && (
                  <button
                    onClick={() => handleDownloadFile(details.uploadedDocument!, details.uploadedDocumentName || 'agreement.pdf')}
                    className="px-3 py-1.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileDown size={12} /> Download Executable Agreement
                  </button>
                )}
                {details.supportingDocuments && (
                  <button
                    onClick={() => handleDownloadFile(details.supportingDocuments!, details.supportingDocumentsName || 'supporting_docs.pdf')}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileDown size={12} /> Supporting Files
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Audit trail */}
          <div className="space-y-3.5">
            <h4 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] flex items-center gap-1"><Clock size={10} /> Agreement Audit Trail</h4>
            {auditTrail.length === 0 ? (
              <p className="text-gray-400 italic">No audit log history entries recorded yet.</p>
            ) : (
              <div className="relative pl-4 border-l-2 border-gray-100 space-y-4">
                {auditTrail.map((log, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white" />
                    <p className="font-bold text-gray-900">{log.action} <span className="text-[10px] text-gray-400 font-normal">({fmtDate(log.timestamp)})</span></p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Performed by: {log.performedBy} ({log.role})</p>
                    {log.notes && (
                      <p className="bg-amber-50/50 border border-amber-100/50 rounded-lg p-2 mt-1 text-[10px] text-amber-800 font-semibold italic">"{log.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <h4 className="font-extrabold text-blue-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5 font-bold"><ShieldCheck size={11} /> Digital Execution Stamps</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col justify-center min-h-[70px]">
                <p className="text-[9px] font-black text-gray-400 uppercase">Investor Signature (Party A)</p>
                {offer.investorSignedAt ? (
                  <div className="mt-1">
                    <p className="text-xl text-[#5B21B6] italic" style={SIGNATURE_STYLES[offer.investorSignatureFontIndex ?? 0]?.style}>
                      {offer.investorSignatureName}
                    </p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">Signed on {fmtDate(offer.investorSignedAt)}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-[10px] mt-1">Pending your final execution signature</p>
                )}
              </div>
              <div className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col justify-center min-h-[70px]">
                <p className="text-[9px] font-black text-gray-400 uppercase">Founder Countersignature (Party B)</p>
                {offer.founderSignedAt ? (
                  <div className="mt-1">
                    <p className="text-xl text-[#5B21B6] italic" style={SIGNATURE_STYLES[offer.founderSignatureFontIndex ?? 0]?.style}>
                      {offer.founderSignatureName}
                    </p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">Signed on {fmtDate(offer.founderSignedAt)}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-[10px] mt-1">Awaiting founder digital countersign</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-3 rounded-b-3xl">
          {offer.agreementStatus === 'Founder Signed' && !offer.investorSignedAt && onSignAgreement && (
            <button
              onClick={() => onSignAgreement(offer)}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Pen size={12} /> Sign & Execute Agreement
            </button>
          )}

          {['Sent to Founder', 'Resent'].includes(offer.agreementStatus || '') && onCancelAgreement && (
            <button
              onClick={() => onCancelAgreement(offer)}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs border border-red-200 cursor-pointer"
            >
              Cancel/Revoke Agreement
            </button>
          )}
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 cursor-pointer">Close</button>
        </div>

      </div>
    </div>,
    document.body
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const InvestorAgreement: React.FC = () => {
  const { user } = useAuth();
  const { offers, loading, refreshOffers, updateOfferDetails } = useFunding();

  // Modals state
  const [selectedOfferForForm, setSelectedOfferForForm] = useState<FundingOffer | null>(null);
  const [selectedOfferForTrack, setSelectedOfferForTrack] = useState<FundingOffer | null>(null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showSignOverlay, setShowSignOverlay] = useState<FundingOffer | null>(null);
  const [sigName, setSigName] = useState(user?.fullName || '');
  const [sigFont, setSigFont] = useState(0);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const investorOffers = useMemo(() => {
    if (!user) return offers;
    const id = String(user.id || '');
    const email = (user.email || '').toLowerCase();
    return offers.filter(o =>
      (o.investorId && String(o.investorId) === id) ||
      (o.investorEmail && o.investorEmail.toLowerCase() === email)
    );
  }, [offers, user]);

  // Shows all deals that have been accepted by founder (ready for agreement)
  const agreementOffers = useMemo(() => {
    return investorOffers.filter(o => ['accepted', 'payment_pending', 'payment_submitted', 'under_verification', 'completed', 'funded', 'failed'].includes(o.status));
  }, [investorOffers]);

  const metrics = useMemo(() => {
    const total = agreementOffers.length;
    const pending = agreementOffers.filter(o => !o.agreementStatus || o.agreementStatus === 'Draft').length;
    const signed = agreementOffers.filter(o => o.agreementStatus === 'Fully Signed').length;
    return { total, pending, signed };
  }, [agreementOffers]);

  // ACTION: Investor sends agreement details
  const handleSendAgreement = async (offer: FundingOffer, formDetails: Omit<IAgreementDetails, 'version' | 'createdAt' | 'createdBy'>) => {
    const offerId = offer.id || offer._id || '';
    setActionLoading(true);
    try {
      const prevDetails = offer.agreementDetails;
      const prevVersions = offer.agreementVersions || [];
      const currentVersionNumber = prevDetails ? `v${(parseFloat(prevDetails.version.slice(1)) + 1.0).toFixed(1)}` : 'v1.0';
      
      const newDetails: IAgreementDetails = {
        ...formDetails,
        version: currentVersionNumber,
        createdAt: new Date().toISOString(),
        createdBy: user?.fullName || 'Investor'
      };

      const newVersions = prevDetails ? [...prevVersions, prevDetails] : [];

      const newAuditEntry = {
        action: prevDetails ? 'Resent' : 'Sent to Founder',
        performedBy: user?.fullName || 'Investor',
        role: 'Investor',
        notes: prevDetails ? `Updated agreement to version ${currentVersionNumber}` : 'Dispatched initial agreement document',
        timestamp: new Date().toISOString()
      };

      const newAuditTrail = [...(offer.agreementAuditTrail || []), newAuditEntry];

      const updates = {
        agreementId: offer.agreementId || `AGR-${Math.floor(10000 + Math.random() * 90000)}`,
        agreementVersion: currentVersionNumber,
        agreementStatus: prevDetails ? 'Resent' : 'Sent to Founder',
        agreementDetails: newDetails,
        agreementVersions: newVersions,
        agreementAuditTrail: newAuditTrail
      };

      await updateOfferDetails(offerId, updates);

      // Create Founder notification
      await addNotification({
        userId: offer.founderId,
        title: '✍️ New Investment Agreement',
        message: `${offer.investorName} has sent the Investment Agreement ${updates.agreementId} (Version ${currentVersionNumber}) for ₹${offer.offerAmount.toLocaleString('en-IN')}. Please review and sign.`,
        type: 'funding',
        actionUrl: '/dashboard/founder/agreement',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Create Admin notification
      await addNotification({
        userId: 'admin',
        title: 'New Investment Agreement Sent',
        message: `Agreement ID ${updates.agreementId} (Amount: ₹${offer.offerAmount.toLocaleString('en-IN')}) sent by ${offer.investorName} to founder ${offer.founderName}.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToast(prevDetails ? 'Agreement updated and resent successfully!' : 'Agreement sent to founder successfully!');
      setSelectedOfferForForm(null);
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: Investor executes signature
  const handleExecuteInvestorSignature = async () => {
    if (!showSignOverlay) return;
    const offer = showSignOverlay;
    const offerId = offer.id || offer._id || '';
    setActionLoading(true);
    try {
      const isFullySigned = !!offer.founderSignedAt;
      const newAuditEntry = {
        action: 'Investor Signed',
        performedBy: user?.fullName || 'Investor',
        role: 'Investor',
        notes: isFullySigned ? 'Investor executed countersignature. Agreement is fully execution-active.' : 'Signed agreement draft',
        timestamp: new Date().toISOString()
      };

      const updates: any = {
        investorSignedAt: new Date().toISOString(),
        investorSignatureName: sigName,
        investorSignatureFontIndex: sigFont,
        agreementStatus: isFullySigned ? 'Fully Signed' : 'Investor Signed',
        agreementAuditTrail: [...(offer.agreementAuditTrail || []), newAuditEntry]
      };

      if (isFullySigned) {
        updates.status = 'payment_pending';
      }

      await updateOfferDetails(offerId, updates);

      // Notifications
      if (isFullySigned) {
        await addNotification({
          userId: offer.founderId,
          title: '🤝 Agreement Fully Executed',
          message: `The Investment Agreement for ${offer.startupName} is now fully signed by both parties. Escrow payment is now unlocked.`,
          type: 'funding',
          actionUrl: '/dashboard/founder/agreement',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        await addNotification({
          userId: 'admin',
          title: 'Agreement Fully Signed',
          message: `Agreement ID ${offer.agreementId || 'N/A'} is fully executed by ${offer.investorName} and ${offer.founderName}.`,
          type: 'funding',
          actionUrl: '/dashboard/admin/investor-funding',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      showToast('Agreement signed successfully!');
      setShowSignOverlay(null);
      setSelectedOfferForTrack(null);
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to sign agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: Investor cancels agreement
  const handleCancelAgreement = async (offer: FundingOffer) => {
    const offerId = offer.id || offer._id || '';
    if (!confirm('Are you sure you want to cancel/revoke this agreement? The founder will no longer be able to sign it.')) return;
    setActionLoading(true);
    try {
      const newAuditEntry = {
        action: 'Cancelled',
        performedBy: user?.fullName || 'Investor',
        role: 'Investor',
        notes: 'Investor revoked the agreement dispatch',
        timestamp: new Date().toISOString()
      };

      const updates = {
        agreementStatus: 'Cancelled',
        agreementAuditTrail: [...(offer.agreementAuditTrail || []), newAuditEntry]
      };

      await updateOfferDetails(offerId, updates);

      // Notify Founder
      await addNotification({
        userId: offer.founderId,
        title: 'Agreement Cancelled',
        message: `${offer.investorName} has cancelled the Investment Agreement ${offer.agreementId}.`,
        type: 'funding',
        actionUrl: '/dashboard/founder/agreement',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToast('Agreement revoked successfully.');
      setSelectedOfferForTrack(null);
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const getStatusBadge = (o: FundingOffer) => {
    const status = o.agreementStatus || 'Draft';
    if (status === 'Fully Signed') {
      return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase">Fully Signed</span>;
    }
    if (status === 'Founder Signed') {
      return <span className="px-2.5 py-0.5 bg-purple-100 text-[#6C4CF1] border border-purple-200 rounded-full text-[10px] font-extrabold uppercase animate-pulse">Founder Signed</span>;
    }
    if (status === 'Changes Requested') {
      return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase animate-pulse">Changes Requested</span>;
    }
    if (status === 'Sent to Founder') {
      return <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold uppercase">Sent to Founder</span>;
    }
    if (status === 'Cancelled') {
      return <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold uppercase">Cancelled</span>;
    }
    if (status === 'Rejected') {
      return <span className="px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded-full text-[10px] font-bold uppercase">Rejected</span>;
    }
    return <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-[10px] font-bold uppercase">Draft</span>;
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Dancing+Script:wght@750&family=Great+Vibes&family=Sacramento&display=swap');
      `}</style>
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <InvestorSubNav activeTab="agreement" />

      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <ScrollText className="text-[#5B21B6]" size={28} /> Investment Agreements Workspace
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Draft, dispatch, track, and execute formal Investment Agreements. Dispatched documents notify founders and update dashboard logs in real-time.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Active Deals</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Deals Draft/Pending Agreement</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-[#6C4CF1] to-[#5B21B6] rounded-2xl shadow-sm p-5 text-white text-left">
          <p className="text-[10px] font-black text-purple-100 uppercase tracking-wider">Fully Signed Deals</p>
          <p className="text-2xl font-extrabold mt-1">{metrics.signed}</p>
        </div>
      </div>

      {/* Action panel guide */}
      <div className="mb-8 bg-gradient-to-r from-[#5B21B6] to-[#4C1D95] rounded-3xl p-5 sm:p-6 text-white shadow-xl text-left">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <ShieldCheck size={14} /> Agreement Lifecycle Flow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[10px] font-bold">
          {[
            { step: '1', title: 'Investor Fills\n& Sends Form', Icon: FileText },
            { step: '2', title: 'Founder Reviews\n& Countersigns', Icon: Pen },
            { step: '3', title: 'Investor Final\nSignature Execution', Icon: ShieldCheck },
            { step: '4', title: 'Payment Release\nUnlocked', Icon: Unlock },
          ].map(({ step, title, Icon }) => (
            <div key={step} className="bg-white/10 p-3 rounded-xl border border-white/15 flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-purple-950 font-black text-[10px] flex items-center justify-center mb-1.5">{step}</span>
              <Icon size={14} className="text-purple-200 mb-1" />
              <span className="text-purple-100 leading-tight whitespace-pre-line">{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#5B21B6] border-t-transparent rounded-full" />
        </div>
      ) : agreementOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
          <ScrollText size={44} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Deals Awaiting Agreement</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Investment agreements will appear once you have commitments accepted by the startup founder.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileText size={16} className="text-[#5B21B6]" /> Deal Legal Documents & Agreements
            </h3>
            <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-lg text-xs font-bold">
              {agreementOffers.length} Active Deal(s)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs font-medium">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-5 py-3.5">Agreement ID</th>
                  <th className="px-5 py-3.5">Startup</th>
                  <th className="px-5 py-3.5">Founder</th>
                  <th className="px-5 py-3.5">Commitment Amount</th>
                  <th className="px-5 py-3.5">Funding Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {agreementOffers.map((o) => {
                  const offerId = o.id || o._id || '';
                  const status = o.agreementStatus || 'Draft';
                  const agreementId = o.agreementId || '—';

                  return (
                    <tr key={offerId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[#5B21B6] text-[11px]">{agreementId}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{o.startupName}</td>
                      <td className="px-5 py-4 font-semibold text-gray-700">{o.founderName}</td>
                      <td className="px-5 py-4 font-extrabold text-[#5B21B6]">₹{o.offerAmount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-lg text-[10px] font-semibold">
                          {o.instrument || 'SAFE'}
                        </span>
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(o)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {/* Send / Send Agreement Action */}
                          {(status === 'Draft' || status === 'Changes Requested') ? (
                            <button
                              onClick={() => setSelectedOfferForForm(o)}
                              className="px-3 py-1.5 bg-[#6C4CF1] hover:bg-[#5B21B6] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <FileText size={10} /> {status === 'Changes Requested' ? 'Update & Resend' : 'Send Agreement'}
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedOfferForTrack(o)}
                              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer shadow-sm"
                            >
                              <Eye size={10} /> Track Status
                            </button>
                          )}
                          
                          {/* View details summary */}
                          {status !== 'Draft' && (
                            <button
                              onClick={() => setSelectedOfferForTrack(o)}
                              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] rounded-lg font-bold text-[10px] border border-purple-200 cursor-pointer"
                            >
                              View History
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agreement dispatch form */}
      {selectedOfferForForm && (
        <CreateAgreementModal
          offer={selectedOfferForForm}
          onClose={() => setSelectedOfferForForm(null)}
          onSend={handleSendAgreement}
          actionLoading={actionLoading}
        />
      )}

      {/* Track status details */}
      {selectedOfferForTrack && (
        <TrackStatusModal
          offer={selectedOfferForTrack}
          onClose={() => setSelectedOfferForTrack(null)}
          onSignAgreement={(offer) => setShowSignOverlay(offer)}
          onCancelAgreement={handleCancelAgreement}
          actionLoading={actionLoading}
        />
      )}

      {/* Cursive Signature overlay */}
      {showSignOverlay && (
        <div className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <button onClick={() => setShowSignOverlay(null)} className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer">
              <X size={16} />
            </button>
            <h3 className="text-base font-black text-gray-900 mb-1 flex items-center gap-1.5">
              <Pen size={16} className="text-[#5B21B6]" /> Digitally Sign & Execute
            </h3>
            <p className="text-xs text-gray-500 mb-4">Select signature font style and sign terms.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Signature Name</label>
                <input
                  type="text"
                  value={sigName}
                  onChange={e => setSigName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-950 text-xs focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>

              {/* Preview */}
              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 text-center min-h-[80px] flex items-center justify-center relative">
                <p className="text-[#5B21B6]" style={SIGNATURE_STYLES[sigFont].style}>{sigName || 'Your Signature'}</p>
                <span className="absolute bottom-2 right-3 text-[9px] text-purple-400 font-mono">Style: {SIGNATURE_STYLES[sigFont].name}</span>
              </div>

              {/* Styles */}
              <div className="grid grid-cols-2 gap-2">
                {SIGNATURE_STYLES.map((f, i) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setSigFont(i)}
                    className={`p-2 border text-center rounded-xl transition-all min-h-[50px] flex flex-col justify-center cursor-pointer ${
                      sigFont === i ? 'bg-purple-50 border-[#5B21B6] text-[#5B21B6] font-bold' : 'bg-white hover:bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                  >
                    <span className="text-[8px] font-bold text-gray-400 mb-0.5">{f.name}</span>
                    <span style={{ ...f.style, fontSize: '14px' }}>{sigName || 'Signature'}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => setShowSignOverlay(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
                <button
                  onClick={handleExecuteInvestorSignature}
                  disabled={actionLoading || !sigName.trim()}
                  className="flex-1 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs cursor-pointer shadow"
                >
                  {actionLoading ? 'Executing...' : 'Confirm Signature'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorAgreement;
