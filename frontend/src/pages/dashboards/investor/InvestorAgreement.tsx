import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, CheckCircle2, X, AlertCircle, Clock,
  ChevronDown, ShieldCheck, Pen,
  Building2, IndianRupee, Calendar, User,
  ScrollText, Lock, Unlock, Bell, Upload, Eye, FileDown, ArrowRight, Copy,
  Sparkles, FileCode, Check, AlertTriangle, Layers, RefreshCw, Layers3, Send, Download, FileCheck, Info
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer, IAgreementDetails } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import { addNotification, getUsers, getStartups } from '../../../utils/localStorageHelper';
import InvestorSubNav from '../../../components/shared/InvestorSubNav';
import {
  getAgreementTemplates,
  getTemplatesForCategoryAndType,
  ALL_BUSINESS_CATEGORIES,
  STANDARD_AGREEMENT_TYPES,
  type IAgreementTemplate,
  type ITemplateClause
} from '../../../utils/agreementTemplateStorage';

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
BUSINESS CATEGORY: ${offer.businessCategory || details.businessCategory || 'FinTech'}
AGREEMENT TYPE: ${offer.agreementType || details.agreementType || 'Equity Investment Agreement'}
CREATION MODE: ${(offer.creationMethod || details.creationMethod || 'template').toUpperCase()}
VERSION: ${offer.agreementVersion || details.version || 'v1.0'}
AGREEMENT STATUS: ${offer.agreementStatus || 'Draft'}

----------------------------------------------------------------------------------------------------
1. CONTRACTING PARTIES
----------------------------------------------------------------------------------------------------
ISSUER / STARTUP COMPANY:
  - Startup Name: ${offer.startupName || details.startupName || 'Tourists'}
  - Founder / Authorized Representative: ${offer.founderName || details.founderName || 'Renu'}
  - Registered Jurisdiction: Bengaluru, Karnataka, India

SUBSCRIBER / INVESTOR ENTITY:
  - Investor Name: ${offer.investorName || details.investorName || 'Angel Investor'}
  - Firm / Category: ${details.investorType || 'Angel Syndicate / Individual Investor'}
  - Reference Email: ${offer.investorEmail || details.investorEmail || 'investor@platform.com'}

----------------------------------------------------------------------------------------------------
2. COMMERCIAL & VALUATION TERMS
----------------------------------------------------------------------------------------------------
  - Gross Investment Amount: ₹${(offer.offerAmount || details.offerAmount || 0).toLocaleString('en-IN')}
  - Admin Platform Commission (2%): ₹${((offer.offerAmount || details.offerAmount || 0) * 0.02).toLocaleString('en-IN')}
  - Net Funded Capital to Founder: ₹${((offer.offerAmount || details.offerAmount || 0) * 0.98).toLocaleString('en-IN')}
  - Equity Stake / Allocation: ${offer.equityPercentage || details.equityPercentage}%
  - Valuation / Cap: ₹${(details.valuation || details.valuationCap || details.preMoneyValuation || offer.valuationCap || 0).toLocaleString('en-IN')}
  - Investment Instrument: ${details.fundingType || offer.instrument || 'SAFE'}

----------------------------------------------------------------------------------------------------
3. CORE CLAUSES & AGREEMENT CONTENT
----------------------------------------------------------------------------------------------------
${details.agreementContent || details.investmentTerms || 'Standard Investment Agreement terms and provisions.'}

----------------------------------------------------------------------------------------------------
4. DIGITAL SIGNATURE AUDIT TRAIL
----------------------------------------------------------------------------------------------------
  - Founder Signature: ${offer.founderSignatureName || offer.founderName || 'Pending Signature'} (Timestamp: ${offer.founderSignedAt ? new Date(offer.founderSignedAt).toLocaleString('en-IN') : 'Unsigned'})
  - Investor Signature: ${offer.investorSignatureName || offer.investorName || 'Pending Signature'} (Timestamp: ${offer.investorSignedAt ? new Date(offer.investorSignedAt).toLocaleString('en-IN') : 'Unsigned'})
  - Digital Hash: SHA256-CONTRACT-${String(offer.id || '2026').slice(-6).toUpperCase()}-VERIFIED

====================================================================================================
                  CONFIDENTIAL & LEGALLY BINDING PLATFORM CONTRACT
====================================================================================================
`;

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Investment_Agreement_${agreementId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─── Agreement Audit Trail Modal Component ─────────────────────────────────────
const AgreementTrackingModal: React.FC<{
  offer: FundingOffer;
  onClose: () => void;
  onSignAgreement?: (offer: FundingOffer) => void;
  onCancelAgreement?: (offer: FundingOffer) => void;
}> = ({ offer, onClose, onSignAgreement, onCancelAgreement }) => {
  const details = offer.agreementDetails || {} as any;
  const versions = offer.agreementVersions || [];
  const auditTrail = offer.agreementAuditTrail || [];
  const isFullySigned = offer.agreementStatus === 'Fully Signed';
  const isFundingLocked = offer.fundingLockStatus === 'locked' || !isFullySigned;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 flex justify-between items-center relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-500/30 text-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {offer.agreementId || 'AGR-2026-00125'}
              </span>
              <span className="bg-white/10 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Version {offer.agreementVersion || 'v1.0'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                isFullySigned ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {offer.agreementStatus || 'Sent to Founder'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ScrollText className="text-purple-400" size={22} />
              Investment Agreement Audit & Version Tracking
            </h2>
            <p className="text-purple-200 text-xs mt-0.5">
              {offer.startupName} • Founder: {offer.founderName} • Category: {offer.businessCategory || details.businessCategory || 'FinTech'}
            </p>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
            <X size={20} />
          </button>
        </div>

        {/* Lock Status Bar */}
        <div className={`p-4 px-6 flex items-center justify-between border-b ${
          isFundingLocked ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-3">
            {isFundingLocked ? (
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Lock size={18} />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Unlock size={18} />
              </div>
            )}
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                Funding Status: {isFundingLocked ? 'LOCKED (Pending Signatures)' : 'ENABLED (Fully Signed & Executed)'}
              </div>
              <p className="text-xs text-slate-600">
                {isFundingLocked
                  ? 'Funding execution remains locked until both Founder and Investor complete digital countersignatures.'
                  : 'All signatures verified. Escrow and direct funding execution is unlocked and active.'}
              </p>
            </div>
          </div>
          {offer.agreementDetails?.uploadedDocument && (
            <button
              onClick={() => handleDownloadFile(offer.agreementDetails!.uploadedDocument!, offer.agreementDetails?.uploadedDocumentName || 'Agreement_Doc.pdf')}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-purple-600 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition text-slate-700 hover:text-purple-700"
            >
              <FileDown size={14} /> Download Document
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase text-slate-400">Investment Amount</span>
              <div className="text-lg font-black text-slate-900 mt-1">₹{(offer.offerAmount || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase text-slate-400">Equity Allocation</span>
              <div className="text-lg font-black text-purple-700 mt-1">{offer.equityPercentage}%</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase text-slate-400">Funding Instrument</span>
              <div className="text-base font-extrabold text-slate-800 mt-1">{offer.instrument || details.fundingType || 'SAFE'}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase text-slate-400">Business Category</span>
              <div className="text-base font-extrabold text-indigo-700 mt-1">{offer.businessCategory || details.businessCategory || 'FinTech'}</div>
            </div>
          </div>

          {/* Signatures Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Pen size={16} className="text-purple-600" /> Digital Signatures Execution Status
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${offer.founderSignedAt ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Founder Signature</span>
                    <div className="font-black text-slate-900 text-base">{offer.founderName}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${offer.founderSignedAt ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                    {offer.founderSignedAt ? 'Signed' : 'Pending Founder Signature'}
                  </span>
                </div>
                {offer.founderSignedAt ? (
                  <p className="text-xs text-emerald-800 font-semibold">Signed on {new Date(offer.founderSignedAt).toLocaleString('en-IN')}</p>
                ) : (
                  <p className="text-xs text-amber-800 font-medium">Awaiting countersignature from Founder ({offer.founderEmail || 'Founder'}).</p>
                )}
              </div>

              <div className={`p-4 rounded-xl border ${offer.investorSignedAt ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Investor Signature</span>
                    <div className="font-black text-slate-900 text-base">{offer.investorName}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${offer.investorSignedAt ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                    {offer.investorSignedAt ? 'Signed' : 'Pending Investor Signature'}
                  </span>
                </div>
                {offer.investorSignedAt ? (
                  <p className="text-xs text-emerald-800 font-semibold">Signed on {new Date(offer.investorSignedAt).toLocaleString('en-IN')}</p>
                ) : (
                  <p className="text-xs text-amber-800 font-medium">Click "Sign & Execute Agreement" below to sign as Investor.</p>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Clock size={16} className="text-purple-600" /> Complete Audit Trail & Version Log
            </h4>
            <div className="space-y-3">
              {auditTrail.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Initial draft created.</p>
              ) : (
                auditTrail.map((log: any, idx: number) => (
                  <div key={idx} className="flex gap-3 text-xs border-l-2 border-purple-200 pl-4 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600 -ml-[21px] mt-1"></div>
                    <div className="flex-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{log.action} — by {log.performedBy} ({log.role})</span>
                        <span className="text-slate-400 font-normal">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                      {log.notes && <p className="text-slate-600 mt-0.5">{log.notes}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Version History List */}
          {versions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" /> Immutable Version History ({versions.length + 1} Versions)
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-purple-900">Current Version {offer.agreementVersion || 'v1.0'}</span>
                    <span className="ml-2 text-purple-700">Created: {new Date(details.createdAt || offer.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <span className="bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
                </div>
                {versions.map((ver: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Version {ver.version}</span>
                      <span className="ml-2">Created by {ver.createdBy} on {new Date(ver.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">Archived</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-white border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => generateInvestmentContractFile(offer)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Download size={14} /> Download Agreement Text
          </button>
          <div className="flex gap-3">
            {!offer.investorSignedAt && onSignAgreement && (
              <button
                onClick={() => onSignAgreement(offer)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
              >
                <Pen size={14} /> Sign & Execute Agreement
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── MAIN INVESTOR AGREEMENT PAGE ──────────────────────────────────────────────
const InvestorAgreement: React.FC = () => {
  const { user } = useAuth();
  const { offers, loading, refreshOffers, updateOfferDetails } = useFunding();

  // Mode Selection State
  // 'selection' | 'manual' | 'template'
  const [creationMode, setCreationMode] = useState<'selection' | 'manual' | 'template'>('selection');

  // Modals & Overlay state
  const [selectedOfferForTrack, setSelectedOfferForTrack] = useState<FundingOffer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Digital Signature Modal Overlay State
  const [showSignOverlay, setShowSignOverlay] = useState<FundingOffer | null>(null);
  const [sigName, setSigName] = useState(user?.fullName || '');
  const [sigFont, setSigFont] = useState(0);

  // Send Confirmation Modal State
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);

  // ─── FORM STATE (Shared for Manual & Template) ─────────────────────────────────
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [startupName, setStartupName] = useState('Tourists');
  const [founderName, setFounderName] = useState('Renu');
  const [founderEmail, setFounderEmail] = useState('renu@startup.com');
  const [investorName, setInvestorName] = useState(user?.fullName || 'Angel Investor');
  const [investorEmail, setInvestorEmail] = useState(user?.email || 'investor@platform.com');
  const [dealId, setDealId] = useState(`DEAL-${Math.floor(10000 + Math.random() * 90000)}`);
  
  // Business Category & Template Selection
  const [businessCategory, setBusinessCategory] = useState('Travel / Tourism');
  const [verifiedCategory, setVerifiedCategory] = useState('Travel / Tourism');
  const [agreementType, setAgreementType] = useState<string>('Equity Investment Agreement');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loadedTemplate, setLoadedTemplate] = useState<IAgreementTemplate | null>(null);

  // Investment Parameters
  const [investmentAmount, setInvestmentAmount] = useState(5000000);
  const [equityPercentage, setEquityPercentage] = useState(10);
  const [valuation, setValuation] = useState(50000000);
  const [valuationCap, setValuationCap] = useState(50000000);
  const [discount, setDiscount] = useState(15);
  const [interestRate, setInterestRate] = useState(8);
  const [maturityDate, setMaturityDate] = useState('2027-12-31');
  const [conversionEvent, setConversionEvent] = useState('Next Qualified Financing Round of ₹2,00,00,000+');
  const [proRataRights, setProRataRights] = useState('Investor retains pro-rata rights in subsequent equity rounds.');
  const [proposedClosingDate, setProposedClosingDate] = useState('2026-09-30');
  const [fundingInstrument, setFundingInstrument] = useState('SAFE');
  const [investmentType, setInvestmentType] = useState('Primary Equity Subscription');

  // Commercial Terms & Manual Content
  const [investmentTerms, setInvestmentTerms] = useState('This agreement outlines the investment parameters. Capital will be utilized for product engineering and guide onboarding pilot launches.');
  const [milestones, setMilestones] = useState('1. Delivery of core mobile beta MVP.\n2. Onboarding first 50 verified guides.');
  const [useOfFunds, setUseOfFunds] = useState('Product development, mobile app launch, server infrastructure, and guide onboarding.');
  const [investorRights, setInvestorRights] = useState('Quarterly financial reports, annual audited statements, and board observer rights.');
  const [founderObligations, setFounderObligations] = useState('Exclusive dedication to company ops, full IP assignment to the startup.');
  const [exitTerms, setExitTerms] = useState('Tag-along rights, drag-along rights in acquisition over ₹50 Cr.');
  const [confidentialityTerms, setConfidentialityTerms] = useState('Standard 3-year mutual confidentiality and non-disclosure obligations.');
  const [additionalConditions, setAdditionalConditions] = useState('Customary regulatory compliance and company law approvals.');

  // Manual Document Editor & File Upload
  const [agreementContent, setAgreementContent] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState('');
  const [uploadedDocumentName, setUploadedDocumentName] = useState('');

  // Auto-fill Indicator & Live Preview Toggle
  const [autoFilled, setAutoFilled] = useState(true);
  const [showFullPreviewModal, setShowFullPreviewModal] = useState(false);

  // Available startups list from system
  const [availableStartups, setAvailableStartups] = useState<any[]>([]);

  useEffect(() => {
    // Load registered startups for selection dropdown
    const loadData = async () => {
      try {
        const startups = await getStartups();
        if (startups && startups.length > 0) {
          setAvailableStartups(startups);
        } else {
          setAvailableStartups([
            { id: 'st_tourists', name: 'Tourists', founderName: 'Renu', founderEmail: 'renu@startup.com', category: 'Travel / Tourism', stage: 'Seed', valuation: 50000000 },
            { id: 'st_payflow', name: 'PayFlow Tech', founderName: 'Vikram', founderEmail: 'vikram@payflow.io', category: 'FinTech', stage: 'Series A', valuation: 120000000 },
            { id: 'st_cloudai', name: 'CloudScale AI', founderName: 'Ananya', founderEmail: 'ananya@cloudscale.ai', category: 'SaaS', stage: 'Seed', valuation: 80000000 }
          ]);
        }
      } catch (e) {
        setAvailableStartups([]);
      }
    };
    loadData();
  }, []);

  // Filter templates based on selected Business Category & Agreement Type
  const availableTemplates = useMemo(() => {
    return getTemplatesForCategoryAndType(businessCategory, creationMode === 'template' ? agreementType : undefined);
  }, [businessCategory, agreementType, creationMode]);

  // Handle Startup/Deal Selection
  const handleSelectStartupDeal = (startupId: string) => {
    setSelectedStartupId(startupId);
    const selected = availableStartups.find(s => s.id === startupId || s.name === startupId);
    if (selected) {
      setStartupName(selected.name || 'Tourists');
      setFounderName(selected.founderName || selected.founder || 'Renu');
      setFounderEmail(selected.founderEmail || 'renu@startup.com');
      const cat = selected.category || selected.businessCategory || 'Travel / Tourism';
      setBusinessCategory(cat);
      setVerifiedCategory(cat);
      if (selected.valuation) setValuation(selected.valuation);
      setAutoFilled(true);
      showToast(`Selected ${selected.name} — Auto-filled startup and category (${cat}).`);
    }
  };

  // Handle Template Selection from Dropdown
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = getAgreementTemplates().find(t => t.id === templateId);
    if (tmpl) {
      setLoadedTemplate(tmpl);
      setAgreementType(tmpl.agreementType);
      
      // Build composite agreement content from template clauses
      const compositeContent = tmpl.clauses.map(c => `ARTICLE: ${c.title.toUpperCase()}\n${c.content}`).join('\n\n');
      setAgreementContent(compositeContent);
      
      // Auto fill standard investment terms from clauses if available
      const termsClause = tmpl.clauses.find(c => c.title.toLowerCase().includes('terms') || c.title.toLowerCase().includes('parties'));
      if (termsClause) setInvestmentTerms(termsClause.content);

      const rightsClause = tmpl.clauses.find(c => c.title.toLowerCase().includes('rights'));
      if (rightsClause) setInvestorRights(rightsClause.content);

      showToast(`Loaded Template: "${tmpl.name}" (Version ${tmpl.version})`);
    }
  };

  // Handle File Upload (.pdf, .doc, .docx)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = /(\.pdf|\.doc|\.docx)$/i;
    if (!allowed.exec(file.name)) {
      alert('Supported formats: PDF, DOC, DOCX');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedDocument(reader.result as string);
      setUploadedDocumentName(file.name);
      showToast(`Uploaded document: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const userOffers = useMemo(() => {
    if (!user) return offers;
    return offers;
  }, [offers, user]);

  const activeAgreements = useMemo(() => {
    return userOffers.filter(o => o.agreementStatus || o.agreementDetails || o.status === 'accepted');
  }, [userOffers]);

  // Action: Generate Agreement (Status -> Draft)
  const handleGenerateAgreement = () => {
    if (!startupName.trim() || !founderName.trim() || !founderEmail.trim()) {
      alert('Please select or specify Deal Parties (Startup Name, Founder Name, Founder Email).');
      return;
    }
    if (investmentAmount <= 0) {
      alert('Investment Amount must be greater than 0.');
      return;
    }
    setShowSendConfirmation(true);
  };

  // Action: Confirm & Dispatch Agreement to Founder
  const handleConfirmAndSend = async () => {
    setShowSendConfirmation(false);
    setActionLoading(true);

    try {
      const generatedAgreementId = `AGR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const agreementVer = loadedTemplate ? `v${loadedTemplate.version}` : 'v1.0';

      const detailsObj: IAgreementDetails = {
        startupName,
        founderName,
        investorName: user?.fullName || investorName,
        dealId,
        agreementDate: new Date().toISOString(),
        agreementExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        offerAmount: investmentAmount,
        currency: 'INR',
        equityPercentage,
        preMoneyValuation: valuation,
        postMoneyValuation: valuation + investmentAmount,
        valuation,
        fundingType: fundingInstrument,
        investmentType,
        investmentTerms,
        milestones,
        useOfFunds,
        investorRights,
        founderObligations,
        exitTerms,
        confidentialityTerms,
        additionalConditions,
        uploadedDocument,
        uploadedDocumentName,
        creationMethod: creationMode === 'template' ? 'template' : 'manual',
        businessCategory,
        templateId: selectedTemplateId || 'custom',
        templateName: loadedTemplate?.name || 'Manual Agreement',
        templateVersion: agreementVer,
        agreementType,
        agreementContent: agreementContent || investmentTerms,
        valuationCap,
        discount,
        interestRate,
        maturityDate,
        conversionEvent,
        proRataRights,
        proposedClosingDate,
        version: agreementVer,
        createdAt: new Date().toISOString(),
        createdBy: user?.fullName || 'Investor'
      };

      const allUsers = await getUsers();
      const realFounder = allUsers.find(
        (u: any) =>
          u.role === 'founder' &&
          (u.email?.toLowerCase() === founderEmail.toLowerCase() ||
           u.fullName?.toLowerCase().includes(founderName.toLowerCase()))
      );

      const founderIdToUse = realFounder ? (realFounder.id || realFounder._id) : `founder_${Date.now()}`;

      const offerPayload: any = {
        startupId: selectedStartupId || `st_${Date.now()}`,
        startupName,
        founderId: founderIdToUse,
        founderName,
        founderEmail,
        investorId: user?.id || user?._id || 'investor_direct',
        investorName: user?.fullName || investorName,
        investorCompany: user?.companyName || 'Angel Investor Syndicate',
        investorEmail: user?.email || investorEmail,
        offerAmount: investmentAmount,
        currency: 'INR',
        equityPercentage,
        valuationCap,
        instrument: fundingInstrument,
        discount,
        expiresInDays: 30,
        investorMessage: `Dispatched formal Investment Agreement (${generatedAgreementId}) under category ${businessCategory}.`,
        status: 'accepted',
        agreementId: generatedAgreementId,
        agreementVersion: agreementVer,
        agreementStatus: 'Sent to Founder',
        creationMethod: creationMode === 'template' ? 'template' : 'manual',
        businessCategory,
        agreementType,
        templateId: selectedTemplateId,
        templateVersion: agreementVer,
        fundingLockStatus: 'locked', // STRICTLY LOCKED UNTIL FULLY SIGNED
        agreementDetails: detailsObj,
        agreementVersions: [],
        agreementAuditTrail: [
          {
            action: 'Created & Sent to Founder',
            performedBy: user?.fullName || 'Investor',
            role: 'Investor',
            notes: `Agreement ${generatedAgreementId} generated via ${creationMode.toUpperCase()} mode. Status set to Sent to Founder.`,
            timestamp: new Date().toISOString()
          }
        ]
      };

      await updateOfferDetails(generatedAgreementId, offerPayload);

      // Add Founder Notification
      await addNotification({
        userId: founderIdToUse,
        title: '✍️ New Investment Agreement Received',
        message: `${user?.fullName || 'Investor'} sent Investment Agreement ${generatedAgreementId} for ${startupName} (₹${investmentAmount.toLocaleString('en-IN')}). Please review and sign.`,
        type: 'funding',
        actionUrl: '/dashboard/founder/agreement',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Add Admin Notification
      await addNotification({
        userId: 'admin',
        title: '📄 Investment Agreement Dispatched',
        message: `Agreement ${generatedAgreementId}: ${user?.fullName || 'Investor'} → ${founderName} (${startupName}). Status: Sent to Founder. Funding: Locked.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToast(`Agreement ${generatedAgreementId} successfully sent to ${founderName}! Status: Sent to Founder.`);
      setCreationMode('selection');
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Error dispatching agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Investor Signing Handler
  const handleExecuteInvestorSignature = async () => {
    if (!showSignOverlay) return;
    const offer = showSignOverlay;
    const offerId = offer.id || offer._id || offer.agreementId || '';
    setActionLoading(true);
    try {
      const isFullySigned = !!offer.founderSignedAt;
      const newAuditEntry = {
        action: 'Investor Signed',
        performedBy: user?.fullName || 'Investor',
        role: 'Investor',
        notes: isFullySigned ? 'Investor executed countersignature. Agreement is fully execution-active. Funding unlocked.' : 'Signed agreement draft',
        timestamp: new Date().toISOString()
      };

      const updates: any = {
        investorSignedAt: new Date().toISOString(),
        investorSignatureName: sigName,
        investorSignatureFontIndex: sigFont,
        agreementStatus: isFullySigned ? 'Fully Signed' : 'Investor Signed',
        fundingLockStatus: isFullySigned ? 'unlocked' : 'locked',
        agreementAuditTrail: [...(offer.agreementAuditTrail || []), newAuditEntry]
      };

      if (isFullySigned) {
        updates.status = 'payment_pending';
      }

      await updateOfferDetails(offerId, updates);

      if (isFullySigned) {
        await addNotification({
          userId: offer.founderId,
          title: '🤝 Agreement Fully Executed & Funding Unlocked',
          message: `The Investment Agreement for ${offer.startupName} is now fully signed by both parties. Escrow payment is unlocked!`,
          type: 'funding',
          actionUrl: '/dashboard/founder/agreement',
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

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans antialiased pb-20">
      <InvestorSubNav activeTab="agreement" />

      {/* Main Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white border-red-400' : 'bg-emerald-500 text-white border-emerald-400'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-6 rounded-3xl border border-purple-800/40 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Investor Agreement Suite
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <FileText className="text-purple-400" size={28} /> Create & Manage Investment Agreements
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Select between Manual Drafting or Admin-Approved Template Mode to generate, review, and dispatch binding agreements.
            </p>
          </div>
          {creationMode !== 'selection' && (
            <button
              onClick={() => setCreationMode('selection')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 font-bold text-xs rounded-xl flex items-center gap-2 transition self-start md:self-auto"
            >
              <RefreshCw size={14} /> Change Creation Mode
            </button>
          )}
        </div>

        {/* ─── SECTION 1: AGREEMENT CREATION SELECTION ─────────────────────────────── */}
        {creationMode === 'selection' && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-8 mb-12 shadow-2xl backdrop-blur-md">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Step 1 of 2
              </span>
              <h2 className="text-2xl font-black text-white mt-3">Choose How You Want to Create the Agreement</h2>
              <p className="text-slate-400 text-sm mt-1">
                Select your preferred agreement creation mode below to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Option A — Manual Agreement */}
              <div className="bg-slate-900/90 border-2 border-slate-700 hover:border-purple-500 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group hover:shadow-2xl hover:shadow-purple-500/10">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Pen size={26} />
                  </div>
                  <span className="text-xs font-extrabold uppercase text-purple-400 tracking-wider">Option A</span>
                  <h3 className="text-xl font-black text-white mt-1 mb-2">Manual Agreement</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Create your own agreement manually using the required investment and commercial details. Ideal when you have custom external legal terms or uploaded contracts.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-purple-400" /> Auto-fill verified deal information
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-purple-400" /> Full custom agreement content editor
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-purple-400" /> Upload agreement document (.pdf, .doc, .docx)
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setCreationMode('manual')}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 group-hover:bg-purple-500"
                >
                  Create Manually <ArrowRight size={16} />
                </button>
              </div>

              {/* Option B — Use Agreement Template */}
              <div className="bg-slate-900/90 border-2 border-slate-700 hover:border-indigo-500 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group hover:shadow-2xl hover:shadow-indigo-500/10">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Layers3 size={26} />
                  </div>
                  <span className="text-xs font-extrabold uppercase text-indigo-400 tracking-wider">Option B</span>
                  <h3 className="text-xl font-black text-white mt-1 mb-2">Use Agreement Template</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Choose an approved agreement template and automatically populate it with your startup, business category, and investment details.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-400" /> Automatic Business Category detection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-400" /> Admin-controlled approved legal template library
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-400" /> Template-specific field customization
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setCreationMode('template')}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 group-hover:bg-indigo-500"
                >
                  Use Template <Sparkles size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SECTION 2: MANUAL AGREEMENT FLOW ──────────────────────────────────── */}
        {creationMode === 'manual' && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6">
              <div>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  Manual Agreement Flow
                </span>
                <h2 className="text-xl font-black text-white mt-1">Manual Agreement Draft</h2>
              </div>
              <button
                onClick={() => setCreationMode('selection')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold bg-slate-700/50 px-3 py-1.5 rounded-xl"
              >
                Back to Selection
              </button>
            </div>

            {/* Select Deal / Startup */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700 mb-6">
              <label className="block text-xs font-bold uppercase text-purple-400 mb-2">Select Startup / Deal</label>
              <select
                value={selectedStartupId}
                onChange={e => handleSelectStartupDeal(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select a Startup Deal...</option>
                {availableStartups.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Founder: {s.founderName || s.founder} ({s.category || 'Travel / Tourism'})
                  </option>
                ))}
              </select>
            </div>

            {/* Deal Parties */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-purple-400" /> Deal Parties
                </h3>
                {autoFilled && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> Auto-filled from Deal
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Startup Name *</label>
                  <input
                    type="text"
                    value={startupName}
                    onChange={e => setStartupName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Founder Name *</label>
                  <input
                    type="text"
                    value={founderName}
                    onChange={e => setFounderName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Founder Email *</label>
                  <input
                    type="email"
                    value={founderEmail}
                    onChange={e => setFounderEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Investor Name</label>
                  <input
                    type="text"
                    value={investorName}
                    onChange={e => setInvestorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Investor Email</label>
                  <input
                    type="email"
                    value={investorEmail}
                    onChange={e => setInvestorEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Deal ID</label>
                  <input
                    type="text"
                    value={dealId}
                    onChange={e => setDealId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Investment Parameters */}
            <div className="mb-8 border-t border-slate-700/80 pt-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <IndianRupee size={16} className="text-purple-400" /> Investment Parameters
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Investment Amount (₹) *</label>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={e => setInvestmentAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-emerald-400 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Equity Stake (%) *</label>
                  <input
                    type="number"
                    value={equityPercentage}
                    onChange={e => setEquityPercentage(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-purple-300 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Pre-Money Valuation (₹)</label>
                  <input
                    type="number"
                    value={valuation}
                    onChange={e => setValuation(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Funding Instrument</label>
                  <select
                    value={fundingInstrument}
                    onChange={e => setFundingInstrument(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  >
                    <option value="Equity">Equity</option>
                    <option value="SAFE">SAFE</option>
                    <option value="Convertible Note">Convertible Note</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Investment Type</label>
                  <input
                    type="text"
                    value={investmentType}
                    onChange={e => setInvestmentType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Valuation Cap (₹)</label>
                  <input
                    type="number"
                    value={valuationCap}
                    onChange={e => setValuationCap(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Commercial Terms */}
            <div className="mb-8 border-t border-slate-700/80 pt-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ScrollText size={16} className="text-purple-400" /> Commercial Terms
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Investment Terms *</label>
                  <textarea
                    rows={3}
                    value={investmentTerms}
                    onChange={e => setInvestmentTerms(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-normal text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Milestones / Conditions</label>
                  <textarea
                    rows={3}
                    value={milestones}
                    onChange={e => setMilestones(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-normal text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Use of Funds</label>
                  <textarea
                    rows={2}
                    value={useOfFunds}
                    onChange={e => setUseOfFunds(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-normal text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">Investor Rights</label>
                  <textarea
                    rows={2}
                    value={investorRights}
                    onChange={e => setInvestorRights(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-normal text-white focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Manual Agreement Document & Editor */}
            <div className="mb-8 border-t border-slate-700/80 pt-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileCode size={16} className="text-purple-400" /> Manual Agreement Document
              </h3>
              
              <div className="mb-4">
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-1">
                  Agreement Content Editor (Enter / Paste legal clauses)
                </label>
                <textarea
                  rows={8}
                  value={agreementContent}
                  onChange={e => setAgreementContent(e.target.value)}
                  placeholder="Paste or draft your custom agreement clauses here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Upload size={14} className="text-purple-400" /> Upload Agreement Document (Supported: PDF, DOC, DOCX)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {uploadedDocumentName ? `Uploaded: ${uploadedDocumentName}` : 'No document uploaded yet.'}
                  </p>
                </div>
                <label className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition">
                  Choose File
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
              <button
                onClick={() => setShowFullPreviewModal(true)}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <Eye size={14} /> Preview Manual Agreement
              </button>

              <button
                onClick={handleGenerateAgreement}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition"
              >
                <Send size={14} /> Generate & Send Agreement
              </button>
            </div>
          </div>
        )}

        {/* ─── SECTION 3: TEMPLATE AGREEMENT FLOW ─────────────────────────────────── */}
        {creationMode === 'template' && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6">
              <div>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  Template Agreement Flow
                </span>
                <h2 className="text-xl font-black text-white mt-1">Admin-Approved Agreement Template</h2>
              </div>
              <button
                onClick={() => setCreationMode('selection')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold bg-slate-700/50 px-3 py-1.5 rounded-xl"
              >
                Back to Selection
              </button>
            </div>

            {/* STEP 1: Select Startup / Deal */}
            <div className="mb-6 bg-slate-900/90 p-5 rounded-2xl border border-slate-700">
              <h3 className="text-xs font-extrabold uppercase text-indigo-400 mb-2">Step 1 — Select Startup / Deal</h3>
              <select
                value={selectedStartupId}
                onChange={e => handleSelectStartupDeal(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Startup / Deal...</option>
                {availableStartups.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Founder: {s.founderName || s.founder} (Category: {s.category || 'Travel / Tourism'})
                  </option>
                ))}
              </select>
            </div>

            {/* STEP 2: Business / Industry Selection */}
            <div className="mb-6 bg-slate-900/90 p-5 rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-extrabold uppercase text-indigo-400">Step 2 — Business / Industry Category</h3>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Verified Startup Category: {verifiedCategory}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Registered Category</label>
                  <select
                    value={businessCategory}
                    onChange={e => setBusinessCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white focus:border-indigo-500"
                  >
                    {ALL_BUSINESS_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 text-xs text-slate-300">
                  <span className="font-extrabold text-white">Category Protection Active:</span> Only templates approved for <strong>{businessCategory}</strong> or General fallback will be loaded.
                </div>
              </div>
            </div>

            {/* STEP 3 & 4: Select Agreement Template Dropdown & General Types */}
            <div className="mb-8 bg-slate-900/90 p-5 rounded-2xl border border-slate-700">
              <h3 className="text-xs font-extrabold uppercase text-indigo-400 mb-3">Step 3 & 4 — Select Agreement Template</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Standard Agreement Type</label>
                  <select
                    value={agreementType}
                    onChange={e => setAgreementType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-semibold text-white focus:border-indigo-500"
                  >
                    {STANDARD_AGREEMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Approved Template Dropdown</label>
                  <select
                    value={selectedTemplateId}
                    onChange={e => handleSelectTemplate(e.target.value)}
                    className="w-full bg-slate-800 border border-indigo-500/80 rounded-xl p-3 text-xs font-bold text-indigo-300 focus:outline-none"
                  >
                    <option value="">Choose Approved Template...</option>
                    {availableTemplates.map(tmpl => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name} ({tmpl.businessCategory}) — v{tmpl.version}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STEP 11: Fallback if no specific template exists */}
              {availableTemplates.length === 0 && (
                <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-amber-200 text-xs">
                  <div className="font-extrabold text-sm mb-1 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-400" /> No Business-Specific Template Available
                  </div>
                  <p className="mb-3 text-amber-300/90">
                    No custom template was found specifically registered for business category <strong>{businessCategory}</strong>.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setBusinessCategory('General');
                        const generalTmpl = getAgreementTemplates().find(t => t.businessCategory === 'General');
                        if (generalTmpl) handleSelectTemplate(generalTmpl.id);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 transition"
                    >
                      Use General Investment Template
                    </button>
                    <button
                      onClick={() => setCreationMode('manual')}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition"
                    >
                      Custom Agreement (Manual Mode)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 7: TEMPLATE-SPECIFIC FIELDS */}
            {loadedTemplate && (
              <div className="mb-8 bg-slate-900/90 p-5 rounded-2xl border border-indigo-500/30">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" /> Template-Specific Parameters ({agreementType})
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Auto-filled from Deal
                  </span>
                </div>

                {/* SAFE SPECIFIC FIELDS */}
                {agreementType === 'SAFE Agreement' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Investment Amount (₹)</label>
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={e => setInvestmentAmount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Valuation Cap (₹)</label>
                      <input
                        type="number"
                        value={valuationCap}
                        onChange={e => setValuationCap(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-purple-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Discount Rate (%)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={e => setDiscount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Conversion Event Trigger</label>
                      <input
                        type="text"
                        value={conversionEvent}
                        onChange={e => setConversionEvent(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Pro-Rata Rights</label>
                      <input
                        type="text"
                        value={proRataRights}
                        onChange={e => setProRataRights(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* CONVERTIBLE NOTE FIELDS */}
                {agreementType === 'Convertible Note' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Principal Amount (₹)</label>
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={e => setInvestmentAmount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Interest Rate (%)</label>
                      <input
                        type="number"
                        value={interestRate}
                        onChange={e => setInterestRate(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Maturity Date</label>
                      <input
                        type="date"
                        value={maturityDate}
                        onChange={e => setMaturityDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Valuation Cap (₹)</label>
                      <input
                        type="number"
                        value={valuationCap}
                        onChange={e => setValuationCap(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-purple-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Discount Rate (%)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={e => setDiscount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Conversion Trigger</label>
                      <input
                        type="text"
                        value={conversionEvent}
                        onChange={e => setConversionEvent(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* EQUITY INVESTMENT FIELDS */}
                {agreementType === 'Equity Investment Agreement' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Investment Amount (₹)</label>
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={e => setInvestmentAmount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Equity Allocation (%)</label>
                      <input
                        type="number"
                        value={equityPercentage}
                        onChange={e => setEquityPercentage(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-purple-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Post-Money Valuation (₹)</label>
                      <input
                        type="number"
                        value={valuation}
                        onChange={e => setValuation(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white"
                      />
                    </div>
                  </div>
                )}

                {/* TERM SHEET FIELDS */}
                {agreementType === 'Term Sheet' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Proposed Investment (₹)</label>
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={e => setInvestmentAmount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Proposed Valuation (₹)</label>
                      <input
                        type="number"
                        value={valuation}
                        onChange={e => setValuation(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Proposed Closing Date</label>
                      <input
                        type="date"
                        value={proposedClosingDate}
                        onChange={e => setProposedClosingDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 12: LIVE AGREEMENT PREVIEW CARD */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 mb-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4 mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye size={16} className="text-indigo-400" /> Live Agreement Preview
                </h3>
                <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full">
                  Updates Automatically
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Startup</span>
                  <div className="font-extrabold text-white text-sm mt-0.5">{startupName}</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Founder</span>
                  <div className="font-extrabold text-white text-sm mt-0.5">{founderName}</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Investment Amount</span>
                  <div className="font-extrabold text-emerald-400 text-sm mt-0.5">₹{investmentAmount.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Equity Stake</span>
                  <div className="font-extrabold text-purple-300 text-sm mt-0.5">{equityPercentage}%</div>
                </div>
              </div>

              {loadedTemplate && (
                <div className="mt-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                    Template Clauses ({loadedTemplate.name})
                  </div>
                  {loadedTemplate.clauses.slice(0, 3).map((c, i) => (
                    <div key={i} className="text-slate-300">
                      <span className="font-semibold text-white">• {c.title}:</span> {c.content.slice(0, 100)}...
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => setShowFullPreviewModal(true)}
                  className="px-4 py-2 bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Eye size={14} /> Preview Full Agreement
                </button>
                <button
                  onClick={() => generateInvestmentContractFile({ startupName, founderName, investorName, offerAmount: investmentAmount, equityPercentage, agreementType, businessCategory })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <FileDown size={14} /> Download Draft
                </button>
                <button
                  onClick={handleGenerateAgreement}
                  className="ml-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition"
                >
                  <Sparkles size={14} /> Generate Agreement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SECTION 14 & 15: AGREEMENT READY FOR REVIEW & SEND CONFIRMATION MODAL ─── */}
        {showSendConfirmation && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Send size={24} />
              </div>

              <h3 className="text-xl font-black mb-2">Send Agreement to Founder</h3>
              <p className="text-slate-300 text-xs mb-6">
                “You are about to send this agreement to the Founder for review and signature.”
              </p>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2 text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Founder:</span>
                  <span className="font-extrabold text-white">{founderName} ({founderEmail})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Startup:</span>
                  <span className="font-extrabold text-white">{startupName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Agreement Type:</span>
                  <span className="font-extrabold text-indigo-300">{agreementType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Investment Amount:</span>
                  <span className="font-extrabold text-emerald-400">₹{investmentAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Equity Stake:</span>
                  <span className="font-extrabold text-purple-300">{equityPercentage}%</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSendConfirmation(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl transition text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAndSend}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-white"
                >
                  {actionLoading ? 'Dispatching...' : 'Confirm & Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── FULL PREVIEW MODAL ─────────────────────────────────────────────────── */}
        {showFullPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl text-white">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <ScrollText className="text-purple-400" size={20} /> Full Legal Agreement Draft Preview
                </h3>
                <button onClick={() => setShowFullPreviewModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 bg-slate-950 rounded-2xl font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {agreementContent || investmentTerms || 'Agreement document content...'}
              </div>
              <div className="pt-4 border-t border-slate-700 flex justify-end">
                <button
                  onClick={() => setShowFullPreviewModal(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── DISPATCHED AGREEMENTS LIST & AUDIT TRACKING ────────────────────────── */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <FileCheck className="text-emerald-400" size={22} /> Active & Dispatched Investment Agreements
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Track agreement status, version logs, founder countersignatures, and funding locking.
              </p>
            </div>
            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
              {activeAgreements.length} Total Agreements
            </span>
          </div>

          <div className="grid gap-4">
            {activeAgreements.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8 text-center text-slate-400 text-xs">
                No active agreements found. Create your first agreement using Manual or Template mode above.
              </div>
            ) : (
              activeAgreements.map(offer => {
                const details: any = offer.agreementDetails || {};
                const isFullySigned = offer.agreementStatus === 'Fully Signed';
                const isLocked = offer.fundingLockStatus === 'locked' || !isFullySigned;

                return (
                  <div
                    key={offer.id || offer._id || offer.agreementId}
                    className="bg-slate-800/80 border border-slate-700 hover:border-purple-500/60 rounded-3xl p-6 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-500/20 text-purple-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                          {offer.agreementId || `AGR-2026-${(offer.id || '').slice(-4)}`}
                        </span>
                        <span className="bg-slate-700 text-slate-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          Ver {offer.agreementVersion || 'v1.0'}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          isFullySigned ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {offer.agreementStatus || 'Sent to Founder'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isLocked ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                          {isLocked ? 'Funding Locked' : 'Funding Enabled'}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">{offer.startupName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Founder: <strong className="text-white">{offer.founderName}</strong> • Category: <span className="text-indigo-300 font-semibold">{offer.businessCategory || details.businessCategory || 'FinTech'}</span>
                      </p>

                      <div className="flex gap-6 mt-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount</span>
                          <span className="font-extrabold text-emerald-400">₹{(offer.offerAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Equity</span>
                          <span className="font-extrabold text-purple-300">{offer.equityPercentage}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Instrument</span>
                          <span className="font-extrabold text-slate-200">{offer.instrument || details.fundingType || 'SAFE'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-2 min-w-[180px]">
                      <button
                        onClick={() => setSelectedOfferForTrack(offer)}
                        className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                      >
                        <ScrollText size={14} /> Audit Trail & History
                      </button>

                      {!offer.investorSignedAt && (
                        <button
                          onClick={() => {
                            setShowSignOverlay(offer);
                            setSigName(user?.fullName || offer.investorName);
                          }}
                          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                        >
                          <Pen size={14} /> Sign Agreement
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ─── DIGITAL SIGNATURE OVERLAY MODAL ────────────────────────────────────── */}
      {showSignOverlay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-white">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                <Pen size={18} className="text-purple-400" /> Digital Countersignature Execution
              </h3>
              <button onClick={() => setShowSignOverlay(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Enter your legal full name below to sign agreement <strong>{showSignOverlay.agreementId}</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={sigName}
                onChange={e => setSigName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white focus:border-purple-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-2">Signature Style</label>
              <div className="grid grid-cols-2 gap-2">
                {SIGNATURE_STYLES.map((st, idx) => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => setSigFont(idx)}
                    className={`p-3 rounded-xl border text-center transition ${
                      sigFont === idx ? 'bg-purple-900/60 border-purple-400 text-purple-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span style={st.style}>{sigName || 'Signature'}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecuteInvestorSignature}
              disabled={actionLoading || !sigName.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {actionLoading ? 'Signing...' : 'Execute Digital Signature'}
            </button>
          </div>
        </div>
      )}

      {/* ─── AUDIT TRACKING MODAL ──────────────────────────────────────────────── */}
      {selectedOfferForTrack && (
        <AgreementTrackingModal
          offer={selectedOfferForTrack}
          onClose={() => setSelectedOfferForTrack(null)}
          onSignAgreement={off => {
            setShowSignOverlay(off);
            setSigName(user?.fullName || off.investorName);
          }}
        />
      )}
    </div>
  );
};

export default InvestorAgreement;
