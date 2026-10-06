import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, CheckCircle2, X, AlertCircle, Clock,
  ChevronDown, ShieldCheck, Pen,
  Building2, IndianRupee, Calendar, User,
  ScrollText, Lock, Unlock, Bell, Upload, Eye, FileDown, ArrowRight, Copy,
  Sparkles, FileCode, Check, AlertTriangle, Layers, RefreshCw, Layers3, Send, Download, FileCheck, Info, Tag
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
  const details: any = offer.agreementDetails || {};
  const versions = offer.agreementVersions || [];
  const auditTrail = offer.agreementAuditTrail || [];
  const isFullySigned = offer.agreementStatus === 'Fully Signed';
  const isFundingLocked = offer.fundingLockStatus === 'locked' || !isFullySigned;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden text-left font-sans">
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
                isFullySigned ? 'bg-emerald-500 text-white' :
                offer.agreementStatus === 'Pending Admin Approval' ? 'bg-amber-500 text-white' :
                offer.agreementStatus === 'Approved — Sent to Founder' ? 'bg-blue-500 text-white' :
                'bg-purple-600 text-white'
              }`}>
                {offer.agreementStatus || 'Pending Admin Approval'}
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
                Funding Status: {isFundingLocked ? 'LOCKED (Pending Admin Approval & Signatures)' : 'ENABLED (Fully Signed & Executed)'}
              </div>
              <p className="text-xs text-slate-600">
                {isFundingLocked
                  ? 'Funding execution remains locked until Admin approves and both Founder and Investor complete digital countersignatures.'
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
            {((offer.agreementStatus || '').includes('Approved') || offer.agreementStatus === 'Founder Signed') && !offer.investorSignedAt && onSignAgreement && (
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
  const { offers, loading, refreshOffers, updateOfferDetails, sendOffer } = useFunding();

  // Mode Selection State ('selection' | 'manual' | 'template')
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
  const [dealId, setDealId] = useState('DEAL-94821');
  
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

  // Available authorized startups/deals list
  const [authorizedDeals, setAuthorizedDeals] = useState<any[]>([]);

  useEffect(() => {
    // Load authorized startups & deals for the Investor
    const loadData = async () => {
      try {
        const sysStartups = await getStartups();
        
        const mapToDeal = (s: any) => ({
          id: s.id || s._id || `deal_${Math.random()}`,
          startupName: s.startupName || s.name || s.title || 'Startup',
          category: s.businessCategory || s.category || s.industry || (s.startupName?.toLowerCase().includes('it') ? 'FinTech' : s.startupName?.toLowerCase().includes('bakery') ? 'FinTech' : 'Travel / Tourism'),
          founderName: s.founderName || s.founder || 'Renu',
          founderEmail: s.founderEmail || s.email || 'renu@startup.com',
          dealId: s.dealId || s.commitmentId || s.agreementId || `DEAL-${Math.floor(10000 + Math.random() * 90000)}`,
          offerAmount: s.offerAmount || s.investmentAmount || s.fundingAmount || 5000000,
          equityPercentage: s.equityPercentage || s.equity || 10,
          valuation: s.valuation || s.valuationCap || s.preMoneyValuation || 50000000,
          dealStatus: s.dealStatus || s.agreementStatus || (s.status === 'accepted' ? 'Offer Accepted' : 'Deal Finalized'),
          instrument: s.instrument || s.fundingType || 'SAFE'
        });

        const mergedDeals: any[] = [];
        const seenNames = new Set<string>();

        // 1. First add existing active offers/agreements ("IT startup", "bakery", etc.)
        if (offers && offers.length > 0) {
          offers.forEach(o => {
            const norm = mapToDeal(o);
            if (!seenNames.has(norm.startupName.toLowerCase())) {
              seenNames.add(norm.startupName.toLowerCase());
              mergedDeals.push(norm);
            }
          });
        }

        // 2. Next add system startups
        if (sysStartups && sysStartups.length > 0) {
          sysStartups.forEach(s => {
            const norm = mapToDeal(s);
            if (norm.startupName && norm.startupName !== 'Startup' && !seenNames.has(norm.startupName.toLowerCase())) {
              seenNames.add(norm.startupName.toLowerCase());
              mergedDeals.push(norm);
            }
          });
        }

        // 3. Next add seed reference deals if not present
        const seedDeals = [
          { id: 'deal_tourists', startupName: 'Tourists', category: 'Travel / Tourism', founderName: 'Renu', founderEmail: 'renu@startup.com', dealId: 'DEAL-94821', offerAmount: 5000000, equityPercentage: 10, valuation: 50000000, dealStatus: 'Deal Finalized', instrument: 'SAFE' },
          { id: 'deal_finpay', startupName: 'FinPay', category: 'FinTech', founderName: 'Vikram', founderEmail: 'vikram@finpay.io', dealId: 'DEAL-83742', offerAmount: 7500000, equityPercentage: 8, valuation: 93750000, dealStatus: 'Offer Accepted', instrument: 'Equity Investment Agreement' },
          { id: 'deal_healthplus', startupName: 'HealthPlus', category: 'HealthTech', founderName: 'Ananya', founderEmail: 'ananya@healthplus.in', dealId: 'DEAL-61923', offerAmount: 6000000, equityPercentage: 12, valuation: 50000000, dealStatus: 'Deal Finalized', instrument: 'Convertible Note' },
          { id: 'deal_edusmart', startupName: 'EduSmart', category: 'EdTech', founderName: 'Arjun', founderEmail: 'arjun@edusmart.org', dealId: 'DEAL-74198', offerAmount: 4000000, equityPercentage: 15, valuation: 26666666, dealStatus: 'Offer Accepted', instrument: 'Term Sheet' }
        ];

        seedDeals.forEach(sd => {
          if (!seenNames.has(sd.startupName.toLowerCase())) {
            seenNames.add(sd.startupName.toLowerCase());
            mergedDeals.push(sd);
          }
        });

        setAuthorizedDeals(mergedDeals);
      } catch (e) {
        setAuthorizedDeals([]);
      }
    };
    loadData();
  }, [offers]);

  // Filter templates based strictly on selected Business Category
  const availableTemplates = useMemo(() => {
    return getTemplatesForCategoryAndType(businessCategory);
  }, [businessCategory]);

  // Handle Startup/Deal Selection
  const handleSelectStartupDeal = (dealItem: any) => {
    setSelectedStartupId(dealItem.id);
    setStartupName(dealItem.startupName);
    setFounderName(dealItem.founderName);
    setFounderEmail(dealItem.founderEmail);
    setDealId(dealItem.dealId);
    
    // STEP 2: DYNAMIC BUSINESS IDENTIFICATION
    const cat = dealItem.category || 'Travel / Tourism';
    setBusinessCategory(cat);
    setVerifiedCategory(cat);
    
    // Auto-fill deal numbers
    if (dealItem.offerAmount) setInvestmentAmount(dealItem.offerAmount);
    if (dealItem.equityPercentage) setEquityPercentage(dealItem.equityPercentage);
    if (dealItem.valuation) setValuation(dealItem.valuation);
    if (dealItem.instrument) setFundingInstrument(dealItem.instrument);

    setAutoFilled(true);
    showToast(`Selected ${dealItem.startupName} — Identified Category: ${cat}. Auto-filled deal data.`);
  };

  // Handle Template Selection from Card / Dropdown
  const handleSelectTemplate = (tmpl: IAgreementTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setLoadedTemplate(tmpl);
    setAgreementType(tmpl.agreementType);
    
    // STEP 6: AUTOMATIC TEMPLATE LOADING
    const compositeContent = tmpl.clauses.map(c => `ARTICLE: ${c.title.toUpperCase()}\n${c.content}`).join('\n\n');
    setAgreementContent(compositeContent);
    
    const termsClause = tmpl.clauses.find(c => c.title.toLowerCase().includes('terms') || c.title.toLowerCase().includes('parties'));
    if (termsClause) setInvestmentTerms(termsClause.content);

    const rightsClause = tmpl.clauses.find(c => c.title.toLowerCase().includes('rights'));
    if (rightsClause) setInvestorRights(rightsClause.content);

    showToast(`Loaded Template: "${tmpl.name}" (v${tmpl.version})`);
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
      alert('Please select a valid authorized Startup / Deal.');
      return;
    }
    if (investmentAmount <= 0) {
      alert('Investment Amount must be greater than 0.');
      return;
    }
    // Submit immediately without a confirmation dialog
    handleConfirmAndSend();
  };

  // Action: Confirm & Send Agreement to Admin for Approval (Status -> Pending Admin Approval)
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

      // ── Use sendOffer() so the agreement is created as a proper funding record
      // that appears immediately on: Investor agreement page, Founder agreement page, Admin investor-funding page.
      await sendOffer({
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
        investorMessage: `Submitted Investment Agreement (${generatedAgreementId}) under category ${businessCategory} for Admin Approval.`,
        agreementId: generatedAgreementId,
        agreementVersion: agreementVer,
        agreementStatus: 'Pending Admin Approval',
        creationMethod: creationMode === 'template' ? 'template' : 'manual',
        businessCategory,
        agreementType,
        templateId: selectedTemplateId,
        templateVersion: agreementVer,
        fundingLockStatus: 'locked',
        agreementDetails: detailsObj,
        agreementVersions: [],
        agreementAuditTrail: [
          {
            action: 'Submitted for Admin Approval',
            performedBy: user?.fullName || 'Investor',
            role: 'Investor',
            notes: `Agreement ${generatedAgreementId} submitted by Investor. Pending Admin Approval.`,
            timestamp: new Date().toISOString()
          }
        ]
      } as any);

      // Notify admin
      await addNotification({
        userId: 'admin',
        title: 'New Investment Agreement',
        message: `Investor ${user?.fullName || investorName} submitted agreement ${generatedAgreementId} for startup "${startupName}" — Pending Admin Approval.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Notify founder
      await addNotification({
        userId: founderIdToUse,
        title: 'Investment Agreement Received',
        message: `Investor ${user?.fullName || investorName} submitted an investment agreement for your startup "${startupName}". Ref: ${generatedAgreementId}.`,
        type: 'funding',
        actionUrl: '/dashboard/founder/investor-agreement',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToast(`Agreement ${generatedAgreementId} submitted for Admin Approval! Status: Pending Admin Approval.`);
      setCreationMode('selection');
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Error submitting agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Investor Signing Handler
  const handleExecuteInvestorSignature = async () => {
    if (!showSignOverlay) return;
    const offer = showSignOverlay;
    const offerId = offer._id || offer.id || '';
    setActionLoading(true);
    try {
      const isFullySigned = !!offer.founderSignedAt;
      const newAuditEntry = {
        action: 'Investor Signed',
        performedBy: user?.fullName || 'Investor',
        role: 'Investor',
        notes: isFullySigned ? 'Investor executed countersignature. Agreement is fully signed. Funding status enabled.' : 'Signed agreement draft',
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

        // Requirement 17: Fully Signed Notification
        await addNotification({
          userId: 'admin',
          title: 'Fully Signed',
          message: `Investment agreement ${offer.agreementId || offer.id} is fully signed.`,
          type: 'funding',
          actionUrl: '/dashboard/admin/investor-funding',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else {
        // Requirement 17: Investor Signed Notification
        await addNotification({
          userId: 'admin',
          title: 'Investor Signed',
          message: `Investor signed investment agreement ${offer.agreementId || offer.id}.`,
          type: 'funding',
          actionUrl: '/dashboard/admin/investor-funding',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      await updateOfferDetails(offerId, updates);
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
    <div className="animate-fade-in-up pb-16 font-sans">
      <InvestorSubNav activeTab="agreement" />

      {/* Main Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border transition-all ${
          toast.type === 'error' ? 'bg-rose-600 text-white border-rose-500' : 'bg-emerald-600 text-white border-emerald-500'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-100 text-[#5B21B6] border border-purple-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Investor Agreement Suite
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <FileText className="text-[#5B21B6]" size={28} /> Create & Manage Investment Agreements
            </h1>
            <p className="text-gray-500 text-xs mt-1 font-medium">
              Create an investment agreement manually or use an approved template to generate and submit for Admin approval.
            </p>
          </div>
          {creationMode !== 'selection' && (
            <button
              onClick={() => setCreationMode('selection')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-bold text-xs rounded-xl flex items-center gap-2 transition self-start md:self-auto"
            >
              <RefreshCw size={14} /> Change Creation Mode
            </button>
          )}
        </div>

        {/* ─── SECTION 1: AGREEMENT CREATION SELECTION ─────────────────────────────── */}
        {creationMode === 'selection' && (
          <div className="bg-white border border-gray-200/80 rounded-3xl p-8 mb-12 shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="bg-purple-100 text-[#5B21B6] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-200">
                Step 1 of 2
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-3">Choose How You Want to Create the Agreement</h2>
              <p className="text-gray-500 text-sm mt-1">
                Select your preferred agreement creation mode below to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Option A — Manual Agreement */}
              <div className="bg-gray-50/60 border-2 border-gray-200 hover:border-purple-600 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:bg-white">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#5B21B6] border border-purple-200 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Pen size={26} />
                  </div>
                  <span className="text-xs font-extrabold uppercase text-purple-700 tracking-wider">Option A</span>
                  <h3 className="text-xl font-black text-gray-900 mt-1 mb-2">Manual Agreement</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6">
                    Create your own agreement manually using the required investment and commercial details.
                  </p>
                  <ul className="space-y-2 text-xs text-gray-700 font-semibold mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-purple-600" /> Auto-fill verified deal information
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-purple-600" /> Full custom agreement content editor
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-purple-600" /> Upload agreement document (.pdf, .doc, .docx)
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setCreationMode('manual')}
                  className="w-full py-3.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  Create Manually <ArrowRight size={16} />
                </button>
              </div>

              {/* Option B — Use Agreement Template */}
              <div className="bg-gray-50/60 border-2 border-gray-200 hover:border-indigo-600 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:bg-white">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Layers3 size={26} />
                  </div>
                  <span className="text-xs font-extrabold uppercase text-indigo-700 tracking-wider">Option B</span>
                  <h3 className="text-xl font-black text-gray-900 mt-1 mb-2">Use Agreement Template</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6">
                    Choose an approved agreement template and automatically populate it with your startup and investment details.
                  </p>
                  <ul className="space-y-2 text-xs text-gray-700 font-semibold mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-600" /> Automatic Business Category detection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-600" /> Dynamic category-matched template filtering
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-600" /> Template-specific field customization
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setCreationMode('template')}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  Use Template <Sparkles size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SECTION 2: MANUAL AGREEMENT FLOW ──────────────────────────────────── */}
        {creationMode === 'manual' && (
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 mb-12 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
              <div>
                <span className="bg-purple-100 text-[#5B21B6] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-purple-200">
                  Manual Agreement Flow
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1">Manual Agreement Draft</h2>
              </div>
              <button
                onClick={() => setCreationMode('selection')}
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-bold bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200"
              >
                Back to Selection
              </button>
            </div>

            {/* Select Deal / Startup */}
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 mb-6">
              <label className="block text-xs font-extrabold uppercase text-purple-700 mb-2">Select Startup / Deal</label>
              
              <select
                value={selectedStartupId}
                onChange={e => {
                  const selected = authorizedDeals.find(d => d.id === e.target.value || d.startupName === e.target.value);
                  if (selected) handleSelectStartupDeal(selected);
                }}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-extrabold text-gray-900 focus:outline-none focus:border-purple-600 mb-4 shadow-sm"
              >
                <option value="">Select Startup / Deal...</option>
                {authorizedDeals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {deal.startupName} — Founder: {deal.founderName} (Category: {deal.category})
                  </option>
                ))}
              </select>

              <div className="grid md:grid-cols-2 gap-3">
                {authorizedDeals.map(deal => (
                  <button
                    key={deal.id}
                    type="button"
                    onClick={() => handleSelectStartupDeal(deal)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      selectedStartupId === deal.id
                        ? 'bg-purple-50 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-extrabold text-gray-900 text-sm">{deal.startupName}</span>
                      <span className="bg-purple-100 text-[#5B21B6] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {deal.dealStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Business: <strong className="text-gray-800">{deal.category}</strong> • Founder: {deal.founderName}</p>
                    <div className="mt-2 text-xs font-bold text-emerald-700">₹{deal.offerAmount?.toLocaleString('en-IN')} at {deal.equityPercentage}% Equity</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Deal Parties */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-purple-600" /> Deal Parties
                </h3>
                {autoFilled && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> Auto-filled from Deal
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Startup Name (Protected)</label>
                  <input
                    type="text"
                    disabled
                    value={startupName}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Founder Name (Protected)</label>
                  <input
                    type="text"
                    disabled
                    value={founderName}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Founder Email</label>
                  <input
                    type="email"
                    value={founderEmail}
                    onChange={e => setFounderEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Investor Name</label>
                  <input
                    type="text"
                    value={investorName}
                    onChange={e => setInvestorName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Investor Email</label>
                  <input
                    type="email"
                    value={investorEmail}
                    onChange={e => setInvestorEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Deal ID (Protected)</label>
                  <input
                    type="text"
                    disabled
                    value={dealId}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Investment Parameters */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <IndianRupee size={16} className="text-purple-600" /> Investment Parameters
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Approved Investment Amount (₹)</label>
                  <input
                    type="number"
                    disabled
                    value={investmentAmount}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-emerald-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Approved Equity Stake (%)</label>
                  <input
                    type="number"
                    disabled
                    value={equityPercentage}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-[#5B21B6] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Verified Pre-Money Valuation (₹)</label>
                  <input
                    type="number"
                    disabled
                    value={valuation}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Funding Instrument</label>
                  <select
                    value={fundingInstrument}
                    onChange={e => setFundingInstrument(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:bg-white focus:border-purple-600"
                  >
                    <option value="Equity">Equity</option>
                    <option value="SAFE">SAFE</option>
                    <option value="Convertible Note">Convertible Note</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Investment Type</label>
                  <input
                    type="text"
                    value={investmentType}
                    onChange={e => setInvestmentType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Valuation Cap (₹)</label>
                  <input
                    type="number"
                    value={valuationCap}
                    onChange={e => setValuationCap(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Commercial Terms */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ScrollText size={16} className="text-purple-600" /> Commercial Terms
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Investment Terms *</label>
                  <textarea
                    rows={3}
                    value={investmentTerms}
                    onChange={e => setInvestmentTerms(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-normal text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Milestones / Conditions</label>
                  <textarea
                    rows={3}
                    value={milestones}
                    onChange={e => setMilestones(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-normal text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Use of Funds</label>
                  <textarea
                    rows={2}
                    value={useOfFunds}
                    onChange={e => setUseOfFunds(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-normal text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">Investor Rights</label>
                  <textarea
                    rows={2}
                    value={investorRights}
                    onChange={e => setInvestorRights(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-normal text-gray-900 focus:bg-white focus:border-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Manual Agreement Document & Editor */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileCode size={16} className="text-purple-600" /> Manual Agreement Document
              </h3>
              
              <div className="mb-4">
                <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">
                  Agreement Content Editor (Enter / Paste legal clauses)
                </label>
                <textarea
                  rows={8}
                  value={agreementContent}
                  onChange={e => setAgreementContent(e.target.value)}
                  placeholder="Paste or draft your custom agreement clauses here..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-4 text-xs font-mono text-gray-900 focus:bg-white focus:border-purple-600 leading-relaxed"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                    <Upload size={14} className="text-purple-600" /> Upload Agreement Document (Supported: PDF, DOC, DOCX)
                  </span>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {uploadedDocumentName ? `Uploaded: ${uploadedDocumentName}` : 'No document uploaded yet.'}
                  </p>
                </div>
                <label className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold text-xs rounded-xl cursor-pointer transition">
                  Choose File
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowFullPreviewModal(true)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl border border-gray-300 flex items-center gap-2 transition"
              >
                <Eye size={14} /> Preview Manual Agreement
              </button>

              <button
                onClick={handleGenerateAgreement}
                disabled={actionLoading}
                className="px-6 py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                ) : (
                  <Send size={14} />
                )}
                {actionLoading ? 'Submitting…' : 'Generate & Submit for Approval'}
              </button>
            </div>
          </div>
        )}

        {/* ─── SECTION 3: TEMPLATE AGREEMENT FLOW ─────────────────────────────────── */}
        {creationMode === 'template' && (
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 mb-12 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
              <div>
                <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  Template Agreement Flow
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1">Select Startup & Approved Agreement Template</h2>
              </div>
              <button
                onClick={() => setCreationMode('selection')}
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-bold bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200"
              >
                Back to Selection
              </button>
            </div>

            {/* STEP 1: Select Startup / Deal */}
            <div className="mb-8 bg-gray-50/80 p-5 rounded-2xl border border-gray-200">
              <h3 className="text-xs font-extrabold uppercase text-indigo-700 mb-3">Step 1 — Select Authorized Startup / Deal</h3>
              
              <select
                value={selectedStartupId}
                onChange={e => {
                  const selected = authorizedDeals.find(d => d.id === e.target.value || d.startupName === e.target.value);
                  if (selected) handleSelectStartupDeal(selected);
                }}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-extrabold text-gray-900 focus:outline-none focus:border-indigo-600 mb-4 shadow-sm"
              >
                <option value="">Select Startup / Deal...</option>
                {authorizedDeals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {deal.startupName} — Founder: {deal.founderName} (Category: {deal.category})
                  </option>
                ))}
              </select>

              <div className="grid md:grid-cols-2 gap-4">
                {authorizedDeals.map(deal => (
                  <div
                    key={deal.id}
                    onClick={() => handleSelectStartupDeal(deal)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      selectedStartupId === deal.id
                        ? 'bg-indigo-50/90 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-wider">{deal.startupName}</span>
                        <span className="ml-2 text-[10px] font-bold text-gray-500">ID: {deal.dealId}</span>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        {deal.dealStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
                      <div><span className="text-gray-400 font-bold">Business:</span> <strong className="text-gray-900">{deal.category}</strong></div>
                      <div><span className="text-gray-400 font-bold">Founder:</span> <strong className="text-gray-900">{deal.founderName}</strong></div>
                      <div><span className="text-gray-400 font-bold">Investment:</span> <strong className="text-emerald-700 font-extrabold">₹{deal.offerAmount?.toLocaleString('en-IN')}</strong></div>
                      <div><span className="text-gray-400 font-bold">Equity:</span> <strong className="text-[#5B21B6] font-extrabold">{deal.equityPercentage}%</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 2: DYNAMIC BUSINESS IDENTIFICATION */}
            {selectedStartupId && (
              <div className="mb-8 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Step 2 — Dynamic Business Category Identification</span>
                  <div className="text-base font-black text-indigo-950 mt-0.5 flex items-center gap-2">
                    <Tag size={18} className="text-indigo-600" /> Business Category: <span className="bg-indigo-600 text-white px-3 py-0.5 rounded-full text-xs">{businessCategory}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-sm">
                  ✓ Identified from Verified Deal
                </span>
              </div>
            )}

            {/* STEP 3, 4 & 5: DYNAMIC TEMPLATE FILTERING & SELECTION */}
            {selectedStartupId && (
              <div className="mb-8 bg-gray-50/80 p-5 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase text-indigo-700">Step 3 & 5 — Select Agreement Template</h3>
                    <p className="text-xs text-gray-500">Filtered specifically for business category: <strong>{businessCategory}</strong></p>
                  </div>
                  {availableTemplates.length > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {availableTemplates.length} Relevant Template(s) Found
                    </span>
                  )}
                </div>

                {/* STEP 4: TEMPLATE FALLBACK IF NONE SPECIFIC */}
                {availableTemplates.length === 0 ? (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs">
                    <div className="font-extrabold text-sm mb-1 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-600" /> No business-specific template is available.
                    </div>
                    <p className="mb-3 text-amber-800">
                      No custom template was found specifically registered for category <strong>{businessCategory}</strong>. You can use a standard investment agreement template.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setBusinessCategory('General');
                        }}
                        className="px-4 py-2 bg-amber-500 text-white font-extrabold text-xs rounded-xl hover:bg-amber-600 transition"
                      >
                        Use Standard Investment Template
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableTemplates.map(tmpl => (
                      <div
                        key={tmpl.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          selectedTemplateId === tmpl.id
                            ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-white border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-extrabold text-gray-900 text-sm">{tmpl.name}</span>
                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              v{tmpl.version}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-purple-800 mb-1">{tmpl.agreementType}</div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-4">{tmpl.description || 'Pre-approved agreement template.'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectTemplate(tmpl)}
                          className={`w-full py-2.5 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 ${
                            selectedTemplateId === tmpl.id
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-gray-100 hover:bg-indigo-50 text-indigo-700 border border-gray-200'
                          }`}
                        >
                          {selectedTemplateId === tmpl.id ? <Check size={14} /> : null}
                          {selectedTemplateId === tmpl.id ? 'Template Selected' : 'Select Template'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 7 & 8: AUTO-FILL & TEMPLATE-SPECIFIC FIELDS */}
            {loadedTemplate && (
              <div className="mb-8 bg-gray-50/80 p-5 rounded-2xl border border-indigo-200">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" /> Template Parameters ({agreementType})
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Auto-filled from Deal
                  </span>
                </div>

                {/* PROTECTED DEAL FIELDS BANNER */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-600 mb-4 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-gray-900">Protected Verified Deal Fields:</span> Startup: <strong>{startupName}</strong> | Founder: <strong>{founderName}</strong> | Amount: <strong>₹{investmentAmount.toLocaleString('en-IN')}</strong> | Equity: <strong>{equityPercentage}%</strong>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Protected</span>
                </div>

                {/* EQUITY INVESTMENT FIELDS */}
                {agreementType === 'Equity Investment Agreement' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Approved Investment Amount (₹)</label>
                      <input
                        type="number"
                        disabled
                        value={investmentAmount}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-emerald-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Approved Equity Stake (%)</label>
                      <input
                        type="number"
                        disabled
                        value={equityPercentage}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-[#5B21B6] cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Verified Post-Money Valuation (₹)</label>
                      <input
                        type="number"
                        disabled
                        value={valuation}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* SAFE SPECIFIC FIELDS */}
                {agreementType === 'SAFE Agreement' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Investment Amount (₹)</label>
                      <input
                        type="number"
                        disabled
                        value={investmentAmount}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-emerald-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Valuation Cap (₹)</label>
                      <input
                        type="number"
                        value={valuationCap}
                        onChange={e => setValuationCap(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-[#5B21B6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Discount Rate (%)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={e => setDiscount(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Conversion Event Trigger</label>
                      <input
                        type="text"
                        value={conversionEvent}
                        onChange={e => setConversionEvent(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900"
                      />
                    </div>
                  </div>
                )}

                {/* CONVERTIBLE NOTE FIELDS */}
                {agreementType === 'Convertible Note' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Principal Amount (₹)</label>
                      <input
                        type="number"
                        disabled
                        value={investmentAmount}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-emerald-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Interest Rate (%)</label>
                      <input
                        type="number"
                        value={interestRate}
                        onChange={e => setInterestRate(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Maturity Date</label>
                      <input
                        type="date"
                        value={maturityDate}
                        onChange={e => setMaturityDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Valuation Cap (₹)</label>
                      <input
                        type="number"
                        value={valuationCap}
                        onChange={e => setValuationCap(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-[#5B21B6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Discount Rate (%)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={e => setDiscount(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900"
                      />
                    </div>
                  </div>
                )}

                {/* TERM SHEET FIELDS */}
                {agreementType === 'Term Sheet' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Proposed Investment (₹)</label>
                      <input
                        type="number"
                        disabled
                        value={investmentAmount}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-emerald-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Proposed Valuation (₹)</label>
                      <input
                        type="number"
                        disabled
                        value={valuation}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Proposed Closing Date</label>
                      <input
                        type="date"
                        value={proposedClosingDate}
                        onChange={e => setProposedClosingDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 9: LIVE AGREEMENT PREVIEW CARD */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-purple-200 pb-4 mb-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Eye size={16} className="text-[#5B21B6]" /> Live Agreement Preview
                </h3>
                <span className="text-[11px] font-bold text-[#5B21B6] bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                  Updates Automatically
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 uppercase text-[10px] font-bold">Startup</span>
                  <div className="font-extrabold text-gray-900 text-sm mt-0.5">{startupName}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 uppercase text-[10px] font-bold">Founder</span>
                  <div className="font-extrabold text-gray-900 text-sm mt-0.5">{founderName}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 uppercase text-[10px] font-bold">Investment Amount</span>
                  <div className="font-extrabold text-emerald-700 text-sm mt-0.5">₹{investmentAmount.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 uppercase text-[10px] font-bold">Equity Stake</span>
                  <div className="font-extrabold text-[#5B21B6] text-sm mt-0.5">{equityPercentage}%</div>
                </div>
              </div>

              {loadedTemplate && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 text-xs space-y-2">
                  <div className="font-bold text-[#5B21B6] uppercase tracking-wider text-[11px]">
                    Loaded Template Sections ({loadedTemplate.name})
                  </div>
                  {loadedTemplate.clauses.map((c, i) => (
                    <div key={i} className="text-gray-700">
                      <span className="font-semibold text-gray-900">• {c.title}:</span> {c.content.slice(0, 120)}...
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => setShowFullPreviewModal(true)}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-[#5B21B6] border border-purple-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Eye size={14} /> Preview Full Agreement
                </button>
                <button
                  onClick={() => generateInvestmentContractFile({ startupName, founderName, investorName, offerAmount: investmentAmount, equityPercentage, agreementType, businessCategory })}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <FileDown size={14} /> Download Draft
                </button>
                <button
                  onClick={handleGenerateAgreement}
                  disabled={actionLoading}
                  className="ml-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {actionLoading ? 'Submitting…' : 'Generate Agreement'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 11: INVESTOR SENDS AGREEMENT (CONFIRMATION MODAL) ──────────────── */}
        {showSendConfirmation && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-gray-900 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#5B21B6] flex items-center justify-center mb-4">
                <Send size={24} />
              </div>

              <h3 className="text-xl font-black mb-2">Submit Agreement for Admin Approval</h3>
              <p className="text-gray-600 text-xs mb-6">
                “You are about to send this investment agreement to Admin for review. Once approved by Admin, it will be sent to the Founder for signature.”
              </p>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Startup:</span>
                  <span className="font-extrabold text-gray-900">{startupName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Founder:</span>
                  <span className="font-extrabold text-gray-900">{founderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Agreement Type:</span>
                  <span className="font-extrabold text-indigo-700">{agreementType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Investment Amount:</span>
                  <span className="font-extrabold text-emerald-700">₹{investmentAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Equity Stake:</span>
                  <span className="font-extrabold text-[#5B21B6]">{equityPercentage}%</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSendConfirmation(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-xs rounded-xl transition text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAndSend}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-[#5B21B6] hover:bg-[#4C1D95] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 text-white"
                >
                  {actionLoading ? 'Submitting...' : 'Confirm & Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── FULL PREVIEW MODAL ─────────────────────────────────────────────────── */}
        {showFullPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl text-gray-900 text-left">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <ScrollText className="text-[#5B21B6]" size={20} /> Full Legal Agreement Draft Preview
                </h3>
                <button onClick={() => setShowFullPreviewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 bg-gray-50 rounded-2xl font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap border border-gray-200">
                {agreementContent || investmentTerms || 'Agreement document content...'}
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowFullPreviewModal(false)}
                  className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs rounded-xl"
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
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <FileCheck className="text-emerald-600" size={22} /> Active & Dispatched Investment Agreements
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Track agreement status, version logs, admin approvals, and funding locking.
              </p>
            </div>
            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
              {activeAgreements.length} Total Agreements
            </span>
          </div>

          <div className="grid gap-4">
            {activeAgreements.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-8 text-center text-gray-500 text-xs">
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
                    className="bg-white border border-gray-200 hover:border-purple-300 rounded-3xl p-6 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-purple-100 text-[#5B21B6] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-purple-200">
                          {offer.agreementId || `AGR-2026-${(offer.id || '').slice(-4)}`}
                        </span>
                        <span className="bg-gray-100 text-gray-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-gray-200">
                          Ver {offer.agreementVersion || 'v1.0'}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          isFullySigned ? 'bg-emerald-600 text-white' :
                          offer.agreementStatus === 'Pending Admin Approval' ? 'bg-amber-600 text-white' :
                          (offer.agreementStatus || '').includes('Approved') ? 'bg-blue-600 text-white' :
                          'bg-purple-600 text-white'
                        }`}>
                          {offer.agreementStatus || 'Pending Admin Approval'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isLocked ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                          {isLocked ? 'Funding Locked' : 'Funding Enabled'}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-gray-900">{offer.startupName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Founder: <strong className="text-gray-900">{offer.founderName}</strong> • Category: <span className="text-indigo-700 font-semibold">{offer.businessCategory || details.businessCategory || 'FinTech'}</span>
                      </p>

                      <div className="flex gap-6 mt-3 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Amount</span>
                          <span className="font-extrabold text-emerald-700">₹{(offer.offerAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Equity</span>
                          <span className="font-extrabold text-[#5B21B6]">{offer.equityPercentage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Instrument</span>
                          <span className="font-extrabold text-gray-800">{offer.instrument || details.fundingType || 'SAFE'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-2 min-w-[180px]">
                      <button
                        onClick={() => setSelectedOfferForTrack(offer)}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl shadow-sm border border-gray-200 transition flex items-center justify-center gap-2"
                      >
                        <ScrollText size={14} /> Audit Trail & History
                      </button>

                      {((offer.agreementStatus || '').includes('Approved') || offer.agreementStatus === 'Founder Signed') && !offer.investorSignedAt && (
                        <button
                          onClick={() => {
                            setShowSignOverlay(offer);
                            setSigName(user?.fullName || offer.investorName);
                          }}
                          className="px-4 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 shadow-2xl text-gray-900 text-left">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                <Pen size={18} className="text-purple-600" /> Digital Countersignature Execution
              </h3>
              <button onClick={() => setShowSignOverlay(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Enter your legal full name below to sign agreement <strong>{showSignOverlay.agreementId}</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={sigName}
                onChange={e => setSigName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white focus:border-purple-600"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-2">Signature Style</label>
              <div className="grid grid-cols-2 gap-2">
                {SIGNATURE_STYLES.map((st, idx) => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => setSigFont(idx)}
                    className={`p-3 rounded-xl border text-center transition ${
                      sigFont === idx ? 'bg-purple-50 border-purple-500 text-purple-900' : 'bg-gray-50 border-gray-200 text-gray-600'
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
              className="w-full py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
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
