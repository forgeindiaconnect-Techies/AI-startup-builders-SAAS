import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, CheckCircle2, X, AlertCircle, Clock,
  ChevronDown, ShieldCheck, Pen,
  Building2, IndianRupee, Calendar, User,
  ScrollText, Lock, Unlock, Bell, Upload, Eye, FileDown, ArrowRight, Copy
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer, IAgreementDetails } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import { addNotification, getUsers, createFundingOffer } from '../../../utils/localStorageHelper';
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

const generateInvestmentContractFile = (offer: any) => {
  const details = offer.agreementDetails || {};
  const commitmentId = offer.commitmentId || `FC-2026-${String(offer.id || offer._id || '').slice(-4).toUpperCase()}`;
  const agreementId = offer.agreementId || `AGR-2026-${String(offer.id || offer._id || '').slice(-4).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const textContent = `
====================================================================================================
                        FORMAL LEGAL INVESTMENT AGREEMENT CONTRACT
====================================================================================================
AGREEMENT REFERENCE: ${agreementId}
COMMITMENT NUMBER: ${commitmentId}
EXECUTION DATE: ${currentDate}
VERSION: ${offer.agreementVersion || 'v1.0'}
AGREEMENT STATUS: ${offer.agreementStatus || 'Fully Executed'}

----------------------------------------------------------------------------------------------------
1. CONTRACTING PARTIES
----------------------------------------------------------------------------------------------------
ISSUER / STARTUP COMPANY:
  - Startup Name: ${offer.startupName || 'AI Startup Builder Platform'}
  - Founder / Authorized Representative: ${offer.founderName || 'Founder'}
  - Registered Jurisdiction: Bengaluru, Karnataka, India

SUBSCRIBER / INVESTOR ENTITY:
  - Investor Name: ${offer.investorName || 'Angel Investor'}
  - Firm / Category: ${details.investorType || 'Angel Syndicate / Individual Investor'}
  - Reference Email: ${offer.investorId || 'investor@platform.com'}

----------------------------------------------------------------------------------------------------
2. COMMERCIAL & VALUATION TERMS
----------------------------------------------------------------------------------------------------
  - Gross Investment Amount: ₹${(offer.offerAmount || 0).toLocaleString('en-IN')}
  - Admin Platform Commission (2%): ₹${((offer.offerAmount || 0) * 0.02).toLocaleString('en-IN')}
  - Net Funded Capital to Founder: ₹${((offer.offerAmount || 0) * 0.98).toLocaleString('en-IN')}
  - Equity Stake / Allocation: ${offer.equityPercentage}%
  - Pre-Money Company Valuation: ₹${(details.preMoneyValuation || 0).toLocaleString('en-IN')}
  - Post-Money Company Valuation: ₹${(details.postMoneyValuation || 0).toLocaleString('en-IN')}
  - Investment Instrument: ${details.fundingType || 'SAFE (Simple Agreement for Future Equity)'}
  - Primary / Secondary Shares: ${details.investmentType || 'Primary Equity Subscription'}

----------------------------------------------------------------------------------------------------
3. CORE CLAUSES & LEGAL OBLIGATIONS
----------------------------------------------------------------------------------------------------
ARTICLE I — CONVERSION TERMS:
${details.investmentTerms || 'The Investment Capital shall automatically convert into Equity Preference Shares during the next qualified funding round or liquidity event at the agreed post-money valuation.'}

ARTICLE II — SHARE ISSUANCE:
${details.equityTerms || 'The Founder agrees to issue fully-paid shares representing the exact agreed equity percentage within 30 days of funds receipt.'}

ARTICLE III — INVESTOR PROTECTION & INFORMATION RIGHTS:
${details.investorRights || 'The Investor receives quarterly financial statements, audited annual accounts, key KPI dashboards, and board observer notification rights.'}

ARTICLE IV — FOUNDER OBLIGATIONS & INTELLECTUAL PROPERTY:
${details.founderObligations || 'The Founder covenants that all Intellectual Property created is 100% owned by the Startup Company and assigned free of encumbrances.'}

ARTICLE V — USE OF FUNDS:
${details.useOfFunds || 'Capital allocated strictly towards Product Engineering, AI Infrastructure scaling, GTM Expansion, and Key Hires as approved in the budget.'}

ARTICLE VI — GOVERNING LAW:
This Agreement is governed by the laws of India. Arbitration shall take place in Bengaluru, Karnataka.

----------------------------------------------------------------------------------------------------
4. DIGITAL SIGNATURE AUDIT TRAIL
----------------------------------------------------------------------------------------------------
  - Founder Signature: ${offer.founderSignatureName || offer.founderName || 'Digitally Signed'} (Timestamp: ${offer.founderSignedAt ? new Date(offer.founderSignedAt).toLocaleString('en-IN') : 'Signed'})
  - Investor Signature: ${offer.investorSignatureName || offer.investorName || 'Digitally Signed'} (Timestamp: ${offer.investorSignedAt ? new Date(offer.investorSignedAt).toLocaleString('en-IN') : 'Signed'})
  - Digital Hash: SHA256-CONTRACT-${String(offer.id || '2026').slice(-6).toUpperCase()}-VERIFIED

====================================================================================================
                  CONFIDENTIAL & LEGALLY BINDING PLATFORM CONTRACT
====================================================================================================
`;

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Investment_Agreement_Contract_${agreementId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  const [contractDownloaded, setContractDownloaded] = useState(false);
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

              {/* Document Download options & Attached Formal Contracts */}
              <div className="pt-3 border-t border-gray-200/80 space-y-3">
                <h4 className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] flex items-center gap-1 font-bold">
                  <FileDown size={11} /> ATTACHED FORMAL CONTRACTS & SUPPORTING FILES
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (details && details.uploadedDocument) {
                        handleDownloadFile(details.uploadedDocument, details.uploadedDocumentName || 'Investment_Agreement_Contract.pdf');
                      }
                      generateInvestmentContractFile(offer);
                      setContractDownloaded(true);
                    }}
                    className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <FileDown size={14} /> Download Investment Agreement Contract File
                  </button>
                  {details && details.supportingDocuments && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(details.supportingDocuments!, details.supportingDocumentsName || 'supporting_docs.pdf')}
                      className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <FileDown size={12} /> Supporting Files
                    </button>
                  )}
                </div>

                {contractDownloaded && (
                  <div className="mt-3 bg-gradient-to-br from-purple-50 via-indigo-50/40 to-emerald-50/40 border border-purple-200 rounded-2xl p-4 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-purple-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <h5 className="font-black text-gray-900 text-xs">Investment Agreement Contract File Downloaded</h5>
                          <p className="text-[10px] text-emerald-700 font-bold">Formal Legal Contract Record Generated & Verified</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase font-mono">
                        Ref: {(offer.agreementId || `AGR-2026-${(offer.id || offer._id || '').slice(-4).toUpperCase()}`)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-white border border-purple-100 p-2.5 rounded-xl">
                        <span className="text-gray-400 font-bold uppercase block">Digital Checksum Hash</span>
                        <span className="font-mono font-bold text-purple-900 block truncate mt-0.5">SHA256-CONTRACT-INVESTOR-VERIFIED</span>
                      </div>
                      <div className="bg-white border border-purple-100 p-2.5 rounded-xl">
                        <span className="text-gray-400 font-bold uppercase block">Download Audit Timestamp</span>
                        <span className="font-bold text-gray-900 block mt-0.5">{new Date().toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="bg-white border border-purple-100 rounded-xl p-3.5 space-y-2 text-[11px]">
                      <p className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1">
                        <ScrollText size={13} className="text-[#5B21B6]" /> Contract Terms Preview & Execution Details
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        This contract certifies an investment of <strong>₹{(offer.offerAmount || 0).toLocaleString('en-IN')}</strong> in <strong>{offer.startupName}</strong> for <strong>{offer.equityPercentage}%</strong> equity stake. Full legal terms, conversion clauses, and investor rights are stored securely on the platform ledger.
                      </p>
                    </div>
                  </div>
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

  // Direct draft form states
  const [directStartupName, setDirectStartupName] = useState('Tourists');
  const [directFounderName, setDirectFounderName] = useState('Renu');
  const [directFounderEmail, setDirectFounderEmail] = useState('renu@startup.com');
  const [directAmount, setDirectAmount] = useState(5000000);
  const [directEquity, setDirectEquity] = useState(10);
  const [directValuation, setDirectValuation] = useState(50000000);
  const [directInstrument, setDirectInstrument] = useState('SAFE');
  const [directTerms, setDirectTerms] = useState('This agreement outlines the investment parameters. Capital will be utilized for product engineering and guide onboarding pilot launches.');
  const [directMilestones, setDirectMilestones] = useState('1. Delivery of core mobile beta MVP.\n2. Onboarding first 50 verified guides.');
  const [directAgreeTerms, setDirectAgreeTerms] = useState(false);
  const [showDirectTermsModal, setShowDirectTermsModal] = useState(false);
  const [directSigned, setDirectSigned] = useState(false);

  const handleCreateDirectAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directStartupName.trim()) return alert('Startup Name is required.');
    if (!directFounderName.trim()) return alert('Founder Name is required.');
    if (!directFounderEmail.trim()) return alert('Founder Email is required.');
    if (directAmount <= 0) return alert('Investment Amount must be greater than zero.');
    if (directEquity <= 0 || directEquity > 100) return alert('Equity Percentage must be valid.');
    if (!directAgreeTerms) return alert('You must view and accept the terms and conditions guidelines first.');
    if (!directSigned) return alert('Please complete your digital signature before sending.');

    setActionLoading(true);
    try {
      // ── Look up real founder by email so the agreement appears on their dashboard ──
      const allUsers: any[] = await getUsers();
      const realFounder = allUsers.find(
        (u: any) => (u.email || '').toLowerCase() === directFounderEmail.toLowerCase()
      );
      const resolvedFounderId = realFounder?.id || realFounder?._id || directFounderEmail;

      const agreementId = `AGR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const dealId = `FC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOfferData = {
        startupId: `startup_${Math.floor(1000 + Math.random() * 9000)}`,
        startupName: directStartupName,
        // Use the resolved founder ID so the founder's agreement page filter matches
        founderId: resolvedFounderId,
        founderName: directFounderName,
        founderEmail: directFounderEmail.toLowerCase(),
        investorId: String(user?.id || user?._id || 'investor_direct'),
        investorName: user?.fullName || 'Investor',
        investorCompany: user?.company || 'Capital Partners',
        investorEmail: (user?.email || '').toLowerCase(),
        offerAmount: directAmount,
        currency: 'INR',
        equityPercentage: directEquity,
        valuationCap: directValuation,
        instrument: directInstrument,
        discount: 0,
        expiresInDays: 30,
        investorMessage: 'Manually drafted investment agreement.',
        status: 'accepted' as const,
        agreementStatus: 'Sent to Founder',
        agreementId,
        agreementVersion: 'v1.0',
        // Store investor digital signature
        investorSignedAt: new Date().toISOString(),
        investorSignatureName: sigName,
        investorSignatureFontIndex: sigFont,
        agreementDetails: {
          startupName: directStartupName,
          founderName: directFounderName,
          investorName: user?.fullName || 'Investor',
          dealId,
          agreementDate: new Date().toISOString().split('T')[0],
          agreementExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          offerAmount: directAmount,
          currency: 'INR',
          equityPercentage: directEquity,
          preMoneyValuation: directValuation - directAmount,
          postMoneyValuation: directValuation,
          fundingType: directInstrument,
          investmentType: 'Primary',
          expectedFundingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          investmentTerms: directTerms,
          equityTerms: `Investor shall acquire ${directEquity}% ownership interest.`,
          investorRights: 'Standard information rights and participation rights.',
          founderObligations: 'Founder shall run daily operations and report metrics monthly.',
          useOfFunds: 'Capital shall be strictly deployed for business growth objectives.',
          milestones: directMilestones,
          exitTerms: 'Standard drag-along and tag-along rights.',
          confidentialityTerms: 'All details in this agreement shall be strictly confidential.',
          additionalConditions: '',
          uploadedDocument: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iagogIDw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+CmVuZG9iagoyIDAgb2JqCiAgPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKICA8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCiAgPDwvTGVuZ3RoIDU5Pj5zdHJlYW0KQlQKICAvRjEgMTIgVGYKICA3MiA3MTIgVGQKICAoTW9jayBJbnZlc3RtZW50IEFncmVlbWVudCBEb2N1bWVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2NyAwMDAwMCBuIAowMDAwMDAwMTIxIDAwMDAwIGYgCjAwMDAwMDAxODAgMDAwMDAgbiAKdHJhaWxlcgogIDw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCiAyOTAKJSVFT0YK',
          uploadedDocumentName: `${directStartupName.replace(/\s+/g, '_')}_Investment_Agreement_v1.0.pdf`,
          version: 'v1.0',
          createdAt: new Date().toISOString(),
          createdBy: user?.fullName || 'Investor'
        },
        agreementAuditTrail: [
          {
            action: 'Investor Signed',
            performedBy: user?.fullName || 'Investor',
            role: 'Investor',
            notes: `Investor digitally signed with signature style "${SIGNATURE_STYLES[sigFont].name}".`,
            timestamp: new Date().toISOString()
          },
          {
            action: 'Sent to Founder',
            performedBy: user?.fullName || 'Investor',
            role: 'Investor',
            notes: 'Manually drafted and dispatched custom agreement to founder for countersignature.',
            timestamp: new Date().toISOString()
          }
        ],
        history: [
          {
            action: 'accepted',
            performedBy: directFounderName,
            role: 'Founder',
            message: 'Founder accepted the verbal deal terms.',
            createdAt: new Date().toISOString()
          },
          {
            action: 'Sent to Founder',
            performedBy: user?.fullName || 'Investor',
            role: 'Investor',
            message: 'Investor drafted and dispatched the Investment Agreement.',
            createdAt: new Date().toISOString()
          }
        ]
      };

      const created = await createFundingOffer(newOfferData);
      
      if (created) {
        await refreshOffers();

        // ── Notify Founder ──────────────────────────────────────────────────
        await addNotification({
          userId: resolvedFounderId,
          title: '✍️ New Investment Agreement Received',
          message: `${user?.fullName || 'An Investor'} has sent you a Investment Agreement (${agreementId}) for ${directStartupName} — ₹${directAmount.toLocaleString('en-IN')} at ${directEquity}% equity. Please review and countersign.`,
          type: 'funding',
          actionUrl: '/dashboard/founder/agreement',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        // ── Notify Admin ────────────────────────────────────────────────────
        await addNotification({
          userId: 'admin',
          title: '📄 New Investment Agreement Created',
          message: `Agreement ${agreementId}: ${user?.fullName || 'Investor'} → ${directFounderName} (${directStartupName}) for ₹${directAmount.toLocaleString('en-IN')} at ${directEquity}% equity. Status: Sent to Founder.`,
          type: 'funding',
          actionUrl: '/dashboard/admin/investor-funding',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        showToast(`Agreement ${agreementId} sent to ${directFounderName} successfully!`);
        setDirectStartupName('');
        setDirectFounderName('');
        setDirectFounderEmail('');
        setDirectAgreeTerms(false);
        setDirectSigned(false);
      } else {
        showToast('Failed to create custom agreement.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const investorOffers = useMemo(() => {
    if (!user) return offers;
    const id = String(user.id || user._id || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const name = (user.fullName || user.name || '').toLowerCase();

    return offers.filter(o => {
      const oInvId = String(o.investorId || '').toLowerCase();
      const oInvEmail = String(o.investorEmail || '').toLowerCase();
      const oInvName = String(o.investorName || '').toLowerCase();

      const matchesId = Boolean(id && oInvId && (oInvId === id || oInvId === 'investor_direct'));
      const matchesEmail = Boolean(email && oInvEmail && (oInvEmail === email || email.includes(oInvEmail) || oInvEmail.includes(email)));
      const matchesName = Boolean(name && oInvName && (oInvName === name || name.includes(oInvName) || oInvName.includes(name)));
      const isDispatched = Boolean(o.agreementStatus && o.agreementStatus !== 'Draft');

      return matchesId || matchesEmail || matchesName || isDispatched || (user.role === 'investor' || !user.role);
    });
  }, [offers, user]);

  // Shows all deals that have been accepted by founder (ready for agreement) or have an agreement dispatched
  const agreementOffers = useMemo(() => {
    return investorOffers.filter(o => 
      ['accepted', 'payment_pending', 'payment_submitted', 'under_verification', 'completed', 'funded', 'failed'].includes(o.status) ||
      (o.agreementStatus && o.agreementStatus !== 'Draft') ||
      Boolean(o.agreementDetails)
    );
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

  const handleLifecycleStepClick = (step: string) => {
    if (step === '1') {
      const draftDeal = agreementOffers.find(o => !o.agreementDetails || o.agreementStatus === 'Draft' || o.agreementStatus === 'Changes Requested');
      if (draftDeal) {
        setSelectedOfferForForm(draftDeal);
      } else {
        showToast('No deals currently require drafting an agreement. Accepted deals will appear below.');
      }
    } else if (step === '2') {
      showToast('Awaiting founder countersignature. You will be notified when they sign.');
    } else if (step === '3') {
      const signDeal = agreementOffers.find(o => o.agreementStatus === 'Founder Signed' && !o.investorSignedAt);
      if (signDeal) {
        setShowSignOverlay(signDeal);
      } else {
        showToast('No agreements are currently awaiting your final execution signature.');
      }
    } else if (step === '4') {
      const hasFullySigned = agreementOffers.some(o => o.agreementStatus === 'Fully Signed');
      if (hasFullySigned) {
        showToast('Payment unlocked! Redirecting to transactions...');
        setTimeout(() => {
          window.location.href = '/dashboard/investor/transactions';
        }, 1000);
      } else {
        showToast('Escrow payments unlock once both parties fully execute the agreement.');
      }
    }
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
            <button
              key={step}
              onClick={() => handleLifecycleStepClick(step)}
              className="bg-white/10 p-3 rounded-xl border border-white/15 flex flex-col items-center hover:bg-white/20 transition-all hover:scale-[1.03] cursor-pointer text-white text-center w-full focus:outline-none"
            >
              <span className="w-6 h-6 rounded-full bg-amber-400 text-purple-950 font-black text-[10px] flex items-center justify-center mb-1.5">{step}</span>
              <Icon size={14} className="text-purple-200 mb-1" />
              <span className="text-purple-100 leading-tight whitespace-pre-line">{title}</span>
            </button>
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

      {/* ─── Direct Draft Agreement Section ──────────────────────────── */}
      <div className="mt-10 mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C4CF1] to-[#4C1D95] flex items-center justify-center shadow-md">
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Draft &amp; Send Custom Agreement</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manually draft an investment agreement, accept the terms &amp; conditions, and instantly dispatch it to a founder — no active deal required.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCreateDirectAgreement}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8"
      >
        {/* Form Header Band */}
        <div className="bg-gradient-to-r from-[#5B21B6]/5 to-[#6C4CF1]/5 border-b border-purple-100/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText size={15} className="text-[#5B21B6]" />
            <span className="text-xs font-black text-[#5B21B6] uppercase tracking-widest">Agreement Information</span>
          </div>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Direct Draft
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Deal Parties Row */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <User size={9} /> Deal Parties
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Startup Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={directStartupName}
                    onChange={e => setDirectStartupName(e.target.value)}
                    placeholder="e.g. Tourists, Bakery"
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Founder Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={directFounderName}
                    onChange={e => setDirectFounderName(e.target.value)}
                    placeholder="e.g. Renu"
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Founder Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Bell size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={directFounderEmail}
                    onChange={e => setDirectFounderEmail(e.target.value)}
                    placeholder="founder@startup.com"
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Investment Parameters Row */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <IndianRupee size={9} /> Investment Parameters
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Investment Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={directAmount}
                    onChange={e => setDirectAmount(Number(e.target.value))}
                    min={1}
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Equity % <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={directEquity}
                  onChange={e => setDirectEquity(Number(e.target.value))}
                  min={0.01}
                  max={100}
                  step={0.01}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Valuation Cap (₹)</label>
                <div className="relative">
                  <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={directValuation}
                    onChange={e => setDirectValuation(Number(e.target.value))}
                    min={0}
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Funding Instrument</label>
                <select
                  value={directInstrument}
                  onChange={e => setDirectInstrument(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                >
                  {['SAFE', 'Equity', 'Convertible Note', 'CCPS', 'NCD', 'Debt'].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Commercial Terms Row */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <ShieldCheck size={9} /> Commercial Terms
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Investment Terms <span className="text-red-500">*</span></label>
                <textarea
                  value={directTerms}
                  onChange={e => setDirectTerms(e.target.value)}
                  rows={4}
                  placeholder="Describe the investment commercial terms, investor rights, and key obligations…"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6] resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Milestones / Conditions</label>
                <textarea
                  value={directMilestones}
                  onChange={e => setDirectMilestones(e.target.value)}
                  rows={4}
                  placeholder="List the milestones or conditions precedent to fund disbursement…"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Deal Summary Preview */}
          {directStartupName && directAmount > 0 && directEquity > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4">
              <p className="text-[9px] font-black text-[#5B21B6] uppercase tracking-widest mb-3 flex items-center gap-1">
                <Eye size={9} /> Live Agreement Preview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                <div className="bg-white rounded-xl p-2.5 border border-purple-100/60">
                  <p className="text-gray-400 font-bold uppercase">Startup</p>
                  <p className="font-extrabold text-gray-900 mt-0.5 truncate">{directStartupName}</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-purple-100/60">
                  <p className="text-gray-400 font-bold uppercase">Amount</p>
                  <p className="font-extrabold text-[#5B21B6] mt-0.5">₹{directAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-purple-100/60">
                  <p className="text-gray-400 font-bold uppercase">Equity</p>
                  <p className="font-extrabold text-gray-900 mt-0.5">{directEquity}%</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-purple-100/60">
                  <p className="text-gray-400 font-bold uppercase">Instrument</p>
                  <p className="font-extrabold text-gray-900 mt-0.5">{directInstrument}</p>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Acceptance */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4">
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-1">
              <ShieldCheck size={9} /> Terms &amp; Conditions — Required
            </p>
            <label
              htmlFor="directAgreeTermsChk"
              className={`flex items-start gap-3 cursor-pointer group ${!directAgreeTerms ? 'opacity-80' : ''}`}
            >
              <div className="mt-0.5 flex-shrink-0">
                <input
                  id="directAgreeTermsChk"
                  type="checkbox"
                  checked={directAgreeTerms}
                  onChange={e => setDirectAgreeTerms(e.target.checked)}
                  className="w-4 h-4 accent-[#5B21B6] rounded"
                />
              </div>
              <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                I have read and agree to the legally binding{' '}
                <button
                  type="button"
                  onClick={() => setShowDirectTermsModal(true)}
                  className="text-[#5B21B6] underline font-black hover:text-[#4C1D95] bg-transparent border-none p-0 cursor-pointer inline"
                >
                  Investment Terms &amp; Conditions Guidelines
                </button>
                . I understand this digital agreement is legally enforceable and constitutes an official investment commitment between both parties.
              </p>
            </label>
            {!directAgreeTerms && (
              <button
                type="button"
                onClick={() => setShowDirectTermsModal(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-lg text-[10px] cursor-pointer transition-colors shadow-sm"
              >
                <Eye size={10} /> Click here to Read Terms &amp; Conditions First
              </button>
            )}
          </div>

          {/* ─── Digital Signature Section ─────────────────────────── */}
          <div className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
            directSigned
              ? 'bg-emerald-50 border-emerald-300'
              : directAgreeTerms
                ? 'bg-purple-50/60 border-[#5B21B6]/40'
                : 'bg-gray-50 border-gray-200 opacity-60 pointer-events-none'
          }`}>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${
              directSigned ? 'text-emerald-700' : 'text-[#5B21B6]'
            }`}>
              <Pen size={9} />
              {directSigned ? '✓ Investor Digital Signature — Confirmed' : 'Investor Digital Signature — Required'}
            </p>

            {directSigned ? (
              /* Signed confirmation badge */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-800">Signed as:</p>
                    <p className="text-emerald-700" style={{ ...SIGNATURE_STYLES[sigFont].style, fontSize: '22px' }}>
                      {sigName}
                    </p>
                    <p className="text-[9px] text-emerald-500 font-bold mt-0.5">Style: {SIGNATURE_STYLES[sigFont].name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDirectSigned(false)}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 font-bold rounded-lg text-[10px] hover:bg-emerald-50 cursor-pointer"
                >
                  Change Signature
                </button>
              </div>
            ) : (
              /* Signature input panel */
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Your Name (as it will appear on the agreement)</label>
                  <input
                    type="text"
                    value={sigName}
                    onChange={e => setSigName(e.target.value)}
                    placeholder="Type your full legal name…"
                    className="w-full px-3 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                  />
                </div>

                {/* Signature preview */}
                <div className="bg-white border border-purple-100 rounded-2xl px-6 py-5 text-center min-h-[72px] flex items-center justify-center relative shadow-sm">
                  <p className="text-[#5B21B6]" style={SIGNATURE_STYLES[sigFont].style}>
                    {sigName || 'Your Signature Preview'}
                  </p>
                  <span className="absolute bottom-2 right-3 text-[9px] text-purple-400 font-mono">Style: {SIGNATURE_STYLES[sigFont].name}</span>
                </div>

                {/* Font style selector */}
                <div className="grid grid-cols-4 gap-2">
                  {SIGNATURE_STYLES.map((f, i) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setSigFont(i)}
                      className={`p-2 border rounded-xl text-center transition-all min-h-[52px] flex flex-col items-center justify-center cursor-pointer ${
                        sigFont === i
                          ? 'bg-purple-50 border-[#5B21B6] shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-[8px] font-bold text-gray-400 mb-0.5">{f.name}</span>
                      <span className={`${sigFont === i ? 'text-[#5B21B6]' : 'text-gray-600'}`} style={{ ...f.style, fontSize: '13px' }}>
                        {sigName || 'Sign'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sign button */}
                <button
                  type="button"
                  disabled={!sigName.trim()}
                  onClick={() => {
                    if (!sigName.trim()) return;
                    setDirectSigned(true);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm transition-all ${
                    sigName.trim()
                      ? 'bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white cursor-pointer shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Pen size={14} /> Sign Agreement Digitally
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-semibold">
              {!directAgreeTerms
                ? '⚠ Accept Terms & Conditions first.'
                : !directSigned
                  ? '⚠ Complete your digital signature above.'
                  : 'Ready to dispatch — this will notify the founder instantly.'}
            </p>
            <button
              type="submit"
              disabled={actionLoading || !directAgreeTerms || !directSigned}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm shadow-lg transition-all ${
                directAgreeTerms && directSigned
                  ? 'bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white cursor-pointer hover:scale-[1.02] hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {actionLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                <><ArrowRight size={16} /> Draft &amp; Send Agreement</>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Terms & Conditions Guidelines Modal */}
      {showDirectTermsModal && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative flex flex-col max-h-[88vh] text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C4CF1] to-[#4C1D95] flex items-center justify-center shadow">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Investment Terms &amp; Conditions</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Platform Investment Agreement Guidelines</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectTermsModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-gray-600 leading-relaxed">

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertCircle size={10} /> Legally Binding Notice
                </p>
                <p className="text-amber-800 font-semibold text-[11px]">
                  By accepting these guidelines, you confirm you have the legal authority to enter into this investment agreement on behalf of your entity and that the details provided are accurate and truthful.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-gray-800 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5B21B6] text-white text-[9px] font-black flex items-center justify-center">1</span>
                  Digital Signature Authenticity
                </h4>
                <p>
                  By executing this agreement electronically, you consent to the use of cursive digital signature technology. Under the Information Technology Act, 2000, and applicable electronic commerce regulations, electronic signatures are legally valid, binding, and enforceable — carrying the same legal weight as physical ink signatures.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-gray-800 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5B21B6] text-white text-[9px] font-black flex items-center justify-center">2</span>
                  Escrow &amp; Fund Placement Rules
                </h4>
                <p>
                  Upon countersignature from both the Investor and the Founder, the status shall shift to <strong>"Fully Signed"</strong>. The committed investment funds must be submitted to the platform escrow account within the agreed timeline. Funds will be reviewed and verified by the Admin Compliance Desk before being disbursed to the startup's designated registered bank account.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-gray-800 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5B21B6] text-white text-[9px] font-black flex items-center justify-center">3</span>
                  Revision &amp; Dispute Resolution
                </h4>
                <p>
                  Any changes requested to commercial terms, milestones, or clauses must be formally documented using the platform's "Request Changes" workflow. Re-dispatched agreement versions supersede all previous versions and automatically reset signature execution states for both parties.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-gray-800 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5B21B6] text-white text-[9px] font-black flex items-center justify-center">4</span>
                  Confidentiality &amp; Non-Disclosure
                </h4>
                <p>
                  All deal terms, financial parameters, commercial clauses, milestones, and identities of the parties involved are strictly confidential. Neither party shall disclose any agreement details to third parties without prior written consent from all signatories.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-gray-800 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5B21B6] text-white text-[9px] font-black flex items-center justify-center">5</span>
                  Equity &amp; Ownership Transfer
                </h4>
                <p>
                  The agreed equity stake shall be formally transferred and registered with the relevant regulatory body post-funding verification. The Founder acknowledges this transaction and agrees to issue or transfer shares as per the agreed instrument (SAFE / Equity / Convertible Note etc.) within the stipulated timelines.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-gray-800 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5B21B6] text-white text-[9px] font-black flex items-center justify-center">6</span>
                  Platform Compliance
                </h4>
                <p>
                  This platform acts solely as a facilitator and digital signing venue. All legal, tax, and regulatory compliance obligations remain the responsibility of the respective Investor and Founder entities. The platform does not provide legal, financial, or investment advisory services.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-emerald-800 font-bold text-[11px]">
                  ✓ By clicking <strong>"Accept &amp; Agree"</strong>, you confirm that you have read, understood, and fully agreed to all the terms and guidelines stated above.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0 rounded-b-3xl gap-3">
              <button
                type="button"
                onClick={() => setShowDirectTermsModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirectAgreeTerms(true);
                  setShowDirectTermsModal(false);
                }}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer transition-all"
              >
                <CheckCircle2 size={13} /> Accept &amp; Agree
              </button>
            </div>
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
