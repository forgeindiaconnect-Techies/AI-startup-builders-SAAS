import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, CheckCircle2, X, AlertCircle, Clock,
  ChevronDown, ShieldCheck, Pen,
  Building2, IndianRupee, Calendar, User,
  ScrollText, Lock, Unlock, Bell
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import { addNotification, getStartups } from '../../../utils/localStorageHelper';

const AGREEMENT_VERSION = 'v1.0';

// Signature font styles
const SIGNATURE_STYLES = [
  { name: 'Sacramento', style: { fontFamily: "'Sacramento', cursive", fontSize: '28px', fontWeight: 400 } },
  { name: 'Great Vibes', style: { fontFamily: "'Great Vibes', cursive", fontSize: '28px', fontWeight: 400 } },
  { name: 'Dancing Script', style: { fontFamily: "'Dancing Script', cursive", fontSize: '24px', fontWeight: 700 } },
  { name: 'Caveat', style: { fontFamily: "'Caveat', cursive", fontSize: '24px', fontWeight: 700 } },
];

// ─── Agreement Document Modal ─────────────────────────────────────────────────
const AgreementDocument: React.FC<{
  offer: FundingOffer;
  onClose: () => void;
  onSign: (offer: FundingOffer, sigName: string, fontIdx: number) => void;
  onUpdateSignature: (offer: FundingOffer, sigName: string, fontIdx: number) => void;
  actionLoading: boolean;
}> = ({ offer, onClose, onSign, onUpdateSignature, actionLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [readConfirmed, setReadConfirmed] = useState(false);

  // Guidelines status
  const [termsGuidelinesRead, setTermsGuidelinesRead] = useState(false);
  const [showTermsGuidelinesModal, setShowTermsGuidelinesModal] = useState(false);

  // Countersignature customization state
  const [showSignModal, setShowSignModal] = useState(false);
  const [signatureName, setSignatureName] = useState(
    offer.founderSignatureName || offer.founderName || ''
  );
  const [selectedFontIndex, setSelectedFontIndex] = useState(
    offer.founderSignatureFontIndex ?? 0
  );

  const commitmentId = offer.commitmentId || `FC-2026-${String(offer.id || offer._id || '').slice(-4).toUpperCase()}`;
  const agreementId = offer.agreementId || `AGR-2026-${String(offer.id || offer._id || '').slice(-4).toUpperCase()}`;
  const isInvestorSigned = !!offer.investorSignedAt;
  const isFounderSigned = !!offer.founderSignedAt;

  useEffect(() => {
    if (offer.founderSignatureName) {
      setSignatureName(offer.founderSignatureName);
    }
    if (offer.founderSignatureFontIndex !== undefined) {
      setSelectedFontIndex(offer.founderSignatureFontIndex);
    }
  }, [offer]);

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  const today = fmtDate(new Date().toISOString());
  const expectedDate = offer.expectedInvestmentDate ? fmtDate(offer.expectedInvestmentDate) : '30 days from signing';

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handleSaveSignature = () => {
    if (!signatureName.trim()) return;
    setShowSignModal(false);
    if (isFounderSigned) {
      onUpdateSignature(offer, signatureName.trim(), selectedFontIndex);
    }
  };

  const clauses = [
    {
      num: '1', title: 'Investment Commitment',
      content: `Party A (${offer.investorName}, "${offer.investorCompany}") hereby irrevocably commits to invest ₹${offer.offerAmount.toLocaleString('en-IN')} into ${offer.startupName} pursuant to the terms of this Agreement dated ${today}. This commitment is binding from the date of digital execution by Party A.`,
    },
    {
      num: '2', title: 'Investment Instrument & Structure',
      content: `The investment shall be structured as a ${offer.instrument || 'Simple Agreement for Future Equity (SAFE)'}. ${offer.instrument === 'Equity'
        ? `Party A shall receive ${offer.equityPercentage}% equity in the Company on investment completion.`
        : offer.instrument === 'Convertible Note'
          ? `The Convertible Note shall convert to equity at the next qualifying financing round at a valuation cap of ₹${(offer.valuationCap || 0).toLocaleString('en-IN')} with ${offer.discount || 10}% discount.`
          : `The SAFE shall convert to equity at the next qualifying financing round at a valuation cap of ₹${(offer.valuationCap || 0).toLocaleString('en-IN')} with ${offer.discount || 10}% discount to the qualified financing price.`}`,
    },
    {
      num: '3', title: 'Payment Obligations & Timeline',
      content: `Party A shall transfer ₹${offer.offerAmount.toLocaleString('en-IN')} to the Platform Escrow Account within 30 calendar days of executing this Agreement or by ${expectedDate}, whichever is earlier. Payment must be made via NEFT/RTGS/IMPS Bank Transfer or UPI. The Transaction UTR must be submitted via the Platform within 24 hours of transfer. Failure to transfer funds within the agreed timeline shall constitute a material breach.`,
    },
    {
      num: '4', title: 'Platform Escrow & Fund Release',
      content: `Investment funds shall be held in the Platform's designated escrow. Upon UTR verification and reconciliation (typically 2–5 business days), funds will be released to ${offer.startupName}. Both parties will be notified upon completion.`,
    },
    {
      num: '5', title: 'Investor Representations & Warranties',
      content: `Party A represents that: (a) they have full legal authority to enter this Agreement; (b) investment funds comply with PMLA/FEMA regulations; (c) they have conducted independent due diligence on ${offer.startupName}; (d) they understand the risk of total loss; (e) they shall receive quarterly financial updates from the Company.`,
    },
    {
      num: '6', title: "Founder's Obligations & Use of Funds",
      content: `${offer.founderName} (Party B) agrees to: (a) use invested funds only for business development and growth; (b) maintain proper accounting records accessible to Party A on request; (c) notify Party A of material business changes within 7 days; (d) not use investment proceeds for personal expenses without Party A's written consent.`,
    },
    {
      num: '7', title: 'Information Rights',
      content: `Party A shall be entitled to information rights including: (a) quarterly financial statements within 30 days of quarter end; (b) annual audited accounts within 90 days of year end; (c) material event disclosures within 7 days; (d) access to management for reasonable queries. These rights persist for the duration of Party A's investment in the Company.`,
    },
    {
      num: '8', title: 'Confidentiality',
      content: `Both parties shall maintain strict confidentiality over all non-public information shared during due diligence and subsequent to investment. Terms of this Agreement shall not be disclosed to third parties without prior written consent, except as required by applicable law, regulatory bodies, or the party's legal counsel.`,
    },
    {
      num: '9', title: 'Dispute Resolution & Governing Law',
      content: `Any dispute shall be resolved through mutual negotiation within 30 days. If unresolved, disputes shall go to binding arbitration under the Arbitration and Conciliation Act 1996, with a single arbitrator, seated in Mumbai, India. This Agreement is governed by the laws of India and subject to the exclusive jurisdiction of Mumbai courts.`,
    },
    {
      num: '10', title: 'Entire Agreement & Amendments',
      content: `This Agreement, together with the Platform's Funding Guidelines (${AGREEMENT_VERSION}), constitutes the entire agreement between the parties and supersedes all prior negotiations and representations. Amendments require written consent from authorized representatives of both parties through the Platform's official process.`,
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[170] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-8 flex flex-col font-sans max-h-[92vh]">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 z-10 cursor-pointer">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 flex items-start gap-3 shrink-0 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center shrink-0">
            <ScrollText size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-gray-900">Investment Agreement</h2>
              {isFounderSigned && (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black flex items-center gap-1">
                  <CheckCircle2 size={10} /> Fully Executed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{agreementId} (Commitment: {commitmentId}) · {AGREEMENT_VERSION}</p>
            {isFounderSigned && offer.founderSignedAt && (
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Countersigned by Founder on {fmtDate(offer.founderSignedAt)}</p>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 sm:p-8 py-5 text-xs text-gray-700 space-y-5 text-left"
        >
          {/* Parties */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px]">Parties to This Agreement</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-[9px] font-black text-purple-500 uppercase mb-1 flex items-center gap-1"><User size={9} /> Investor (Party A)</p>
                <p className="font-bold text-gray-900">{offer.investorName}</p>
                <p className="text-gray-500">{offer.investorCompany}</p>
                {offer.investorEmail && <p className="text-[10px] text-gray-400 mt-0.5">{offer.investorEmail}</p>}
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-[9px] font-black text-blue-500 uppercase mb-1 flex items-center gap-1"><Building2 size={9} /> Founder / Company (Party B)</p>
                <p className="font-bold text-gray-900">{offer.founderName}</p>
                <p className="text-gray-500">{offer.startupName}</p>
                {offer.founderResponse && <p className="text-[10px] text-gray-400 mt-0.5">Response: {offer.founderResponse}</p>}
              </div>
            </div>
          </div>

          {/* Deal Summary */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <h4 className="font-extrabold text-[#5B21B6] uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5 font-bold">
              <IndianRupee size={11} /> Investment Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Investment Amount', value: `₹${offer.offerAmount.toLocaleString('en-IN')}`, big: true },
                { label: 'Instrument', value: offer.instrument || 'SAFE' },
                { label: 'Funding Round', value: offer.fundingRound || 'Seed' },
                { label: 'Equity %', value: offer.equityPercentage > 0 ? `${offer.equityPercentage}%` : 'Per SAFE Terms' },
                { label: 'Valuation Cap', value: `₹${(offer.valuationCap || 0).toLocaleString('en-IN')}` },
                { label: 'Discount Rate', value: `${offer.discount || 10}%` },
                { label: 'Commitment Date', value: fmtDate(offer.createdAt) },
                { label: 'Expected Transfer Date', value: expectedDate },
                { label: 'Agreement Version', value: AGREEMENT_VERSION },
              ].map(item => (
                <div key={item.label} className="bg-white border border-purple-100 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-gray-400 uppercase">{item.label}</p>
                  <p className={`font-bold mt-0.5 ${item.big ? 'text-[#5B21B6] text-sm' : 'text-gray-900'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clauses */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 font-bold">
              <FileText size={11} /> Agreement Terms & Conditions
            </h4>
            {clauses.map(clause => (
              <div key={clause.num} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <h5 className="font-black text-gray-800 mb-1.5">
                  <span className="text-[#5B21B6]">Clause {clause.num}:</span> {clause.title}
                </h5>
                <p className="text-gray-600 leading-relaxed">{clause.content}</p>
              </div>
            ))}
          </div>

          {/* Signature Block */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-extrabold text-blue-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5 font-bold">
                <Pen size={11} /> Digital Signature Block
              </h4>
              <button
                type="button"
                onClick={() => setShowSignModal(true)}
                className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-[#5B21B6] border border-purple-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Pen size={10} /> Edit Signature
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col justify-center min-h-[75px]">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Investor Signature (Party A)</p>
                {isInvestorSigned ? (
                  <div>
                    <p
                      className="text-2xl text-[#5B21B6] italic select-none"
                      style={SIGNATURE_STYLES[offer.investorSignatureFontIndex ?? 0]?.style}
                    >
                      {offer.investorSignatureName}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Digitally signed: {fmtDate(offer.investorSignedAt || '')}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-[11px]">
                    Pending investor signature
                  </p>
                )}
              </div>
              <div className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col justify-center min-h-[75px]">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Founder Countersignature (Party B)</p>
                {isFounderSigned ? (
                  <div>
                    <p
                      className="text-2xl text-[#5B21B6] italic select-none"
                      style={SIGNATURE_STYLES[selectedFontIndex]?.style}
                    >
                      {signatureName}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Countersigned: {offer.founderSignedAt ? fmtDate(offer.founderSignedAt) : today}
                    </p>
                  </div>
                ) : (
                  <div>
                    {signatureName ? (
                      <div>
                        <p
                          className="text-2xl text-gray-400 italic select-none"
                          style={SIGNATURE_STYLES[selectedFontIndex]?.style}
                        >
                          {signatureName}
                        </p>
                        <p className="text-[9px] text-gray-400 mt-1 italic">Preview style (not yet submitted)</p>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-[11px]">Ready to countersign as: {offer.founderName}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scroll prompt */}
          {!hasScrolledToBottom && !isFounderSigned && (
            <div className="sticky bottom-2 flex justify-center">
              <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm animate-bounce">
                <ChevronDown size={12} /> Scroll to bottom to enable countersigning
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-3xl">
          {isFounderSigned ? (
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-2.5 rounded-xl border-2 p-3 border-emerald-200 bg-emerald-50/30">
                <input
                  type="checkbox"
                  id="agreementReadCheckSigned"
                  disabled={true}
                  checked={true}
                  className="mt-0.5 w-4 h-4 rounded cursor-not-allowed text-emerald-600"
                />
                <label
                  htmlFor="agreementReadCheckSigned"
                  className="text-[11px] font-semibold leading-relaxed text-emerald-800 cursor-not-allowed"
                >
                  I have read, understood, and agree to all terms in this Investment Agreement (Ref: {agreementId}).
                  This constitutes a legally binding digital signature.
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Agreement Fully Executed</p>
                    {offer.founderSignedAt && <p className="text-[10px]">Countersigned on {fmtDate(offer.founderSignedAt)}</p>}
                  </div>
                </div>
                <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 cursor-pointer">Close</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-left">
              <div className={`flex items-start gap-2.5 rounded-xl border-2 p-3 transition-all ${
                (hasScrolledToBottom && termsGuidelinesRead) 
                  ? 'border-purple-200 bg-purple-50/30' 
                  : 'border-gray-200 bg-gray-100/50'
              }`}>
                <input
                  type="checkbox"
                  id="agreementReadCheck"
                  disabled={!hasScrolledToBottom || !termsGuidelinesRead}
                  checked={readConfirmed}
                  onChange={e => setReadConfirmed(e.target.checked)}
                  className={`mt-0.5 w-4 h-4 rounded transition-all ${
                    (hasScrolledToBottom && termsGuidelinesRead) 
                      ? 'cursor-pointer text-[#5B21B6]' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                />
                <label
                  htmlFor="agreementReadCheck"
                  className={`text-[11px] font-semibold leading-relaxed ${
                    (hasScrolledToBottom && termsGuidelinesRead) 
                      ? 'text-gray-700 cursor-pointer' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  I have read, understood, and agree to all terms in this{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsGuidelinesModal(true)}
                    className="text-[#5B21B6] underline hover:text-[#4C1D95] font-black bg-transparent border-none p-0 inline cursor-pointer"
                  >
                    Investment Terms & Conditions Guidelines
                  </button>{" "}
                  (Ref: {agreementId}). I understand this constitutes a legally binding digital signature.
                  
                  {!hasScrolledToBottom && (
                    <span className="block text-[10px] text-amber-600 font-bold mt-1 italic">
                      ← Scroll through the full agreement text to unlock
                    </span>
                  )}
                  {hasScrolledToBottom && !termsGuidelinesRead && (
                    <span className="block text-[10px] text-[#5B21B6] font-bold mt-1 italic animate-pulse">
                      ← Click the link above and read the Terms & Conditions to enable the checkbox
                    </span>
                  )}
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                  {!hasScrolledToBottom ? (
                    <><Lock size={11} /><span>Scroll the agreement to begin</span></>
                  ) : !termsGuidelinesRead ? (
                    <><Lock size={11} className="text-purple-500" /><span className="text-purple-600">Click link & accept guidelines to unlock</span></>
                  ) : !readConfirmed ? (
                    <><Unlock size={11} className="text-purple-500" /><span className="text-purple-600">Tick checkbox to sign</span></>
                  ) : (
                    <><Unlock size={11} className="text-emerald-600" /><span className="text-emerald-600">Ready to sign</span></>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs shadow-sm hover:bg-gray-50 cursor-pointer">Close</button>
                  <button
                    disabled={!readConfirmed || actionLoading}
                    onClick={() => onSign(offer, signatureName, selectedFontIndex)}
                    className={`px-6 py-2.5 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                      readConfirmed && !actionLoading
                        ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Pen size={13} />
                    {actionLoading ? 'Signing...' : 'Countersign Agreement'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── DIGITAL SIGNATURE CUSTOMIZATION MODAL (OVERLAY) ─── */}
        {showSignModal && (
          <div className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative font-sans text-left">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-1.5">
                <Pen size={18} className="text-[#5B21B6]" /> Customize Founder Signature
              </h3>
              <p className="text-xs text-gray-500 mb-5">Type your name and select a style for your digital signature.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Signature Name</label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    placeholder="Type your name..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-950 outline-none focus:ring-2 focus:ring-[#5B21B6] text-xs"
                  />
                </div>

                {/* Signature Preview */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Live Signature Preview</label>
                  <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 text-center min-h-[90px] flex items-center justify-center relative overflow-hidden">
                    <p
                      className="text-[#5B21B6] transition-all select-none"
                      style={SIGNATURE_STYLES[selectedFontIndex]?.style}
                    >
                      {signatureName || 'Your Signature'}
                    </p>
                    <span className="absolute bottom-2 right-3 text-[9px] text-purple-400 font-mono">
                      Style: {SIGNATURE_STYLES[selectedFontIndex]?.name}
                    </span>
                  </div>
                </div>

                {/* Style Selector */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 font-bold">Select Signature Font Style</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {SIGNATURE_STYLES.map((font, idx) => (
                      <button
                        key={font.name}
                        type="button"
                        onClick={() => setSelectedFontIndex(idx)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-center min-h-[60px] cursor-pointer ${
                          selectedFontIndex === idx
                            ? 'bg-purple-50 border-[#5B21B6] text-[#5B21B6] shadow-sm font-bold'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-[9px] font-bold text-gray-400 mb-1">{font.name}</span>
                        <span
                          className="text-base select-none leading-none truncate max-w-full"
                          style={{ ...font.style, fontSize: '18px' }}
                        >
                          {signatureName || 'Signature'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowSignModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSignature}
                    disabled={!signatureName.trim()}
                    className={`flex-1 py-2.5 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      signatureName.trim()
                        ? 'bg-[#5B21B6] hover:bg-[#4C1D95]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <CheckCircle2 size={13} /> Confirm Style
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TERMS & CONDITIONS GUIDELINES MODAL (OVERLAY) ─── */}
        {showTermsGuidelinesModal && (
          <div className="fixed inset-0 z-[190] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative my-6 flex flex-col font-sans max-h-[85vh] text-left">
              <button
                type="button"
                onClick={() => setShowTermsGuidelinesModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 z-10 cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="p-6 pb-4 border-b border-gray-100 flex items-start gap-2.5 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-[#5B21B6]/10 text-[#5B21B6] flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Investment Terms & Conditions</h3>
                  <p className="text-[10px] text-gray-500 font-mono">Platform Guidelines & Compliance Framework</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 py-4 text-[11px] text-gray-600 space-y-4 leading-relaxed">
                <p className="font-semibold text-gray-700">
                  Please review the following platform guidelines, allocation compliance, and founder code of conduct. You must read these terms to activate the acknowledgment checkbox.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-1">1. Company Representations</h4>
                    <p className="text-gray-500">The founder represents that all information shared about company status, revenue, team size, and legal standing is 100% accurate and verifiable during due diligence.</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-1">2. Allocation and Share Issuance</h4>
                    <p className="text-gray-505">The company commits to issue ordinary shares or execution of SAFE/Convertible note within 15 business days of the fund release from the platform's escrow account.</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-1">3. Proper Use of Funds</h4>
                    <p className="text-gray-600">The funding proceeds shall only be utilized for approved company operations and growth targets. Personal expense routing or direct distribution of proceeds to existing shareholders without investor approval is strictly barred.</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-1">4. Reporting & Auditing</h4>
                    <p className="text-gray-650">The company agrees to submit quarterly operations reports and verified annual financial statements to the investor within the designated timelines.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2.5 shrink-0 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setShowTermsGuidelinesModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTermsGuidelinesRead(true);
                    setShowTermsGuidelinesModal(false);
                  }}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  I Have Read & Accept the Terms
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

// ─── Main Page ────────────────────────────────────────────────────────────────
const FounderInvestorAgreement: React.FC = () => {
  const { user } = useAuth();
  const { offers, loading, refreshOffers, updateOfferDetails } = useFunding();

  const [selectedOffer, setSelectedOffer] = useState<FundingOffer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [startupsList, setStartupsList] = useState<any[]>([]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const list = await getStartups();
        setStartupsList(list || []);
      } catch (err) {
        console.error("Failed to load startups:", err);
      }
    };
    fetchStartups();
  }, []);

  // Find all commitments for this founder's startups
  const founderOffers = useMemo(() => {
    if (!user) return [];
    const founderStartupNames = startupsList
      .filter((s: any) => String(s.founderId || s.userId || '') === String(user.id || ''))
      .map((s: any) => (s.startupName || s.name || '').toLowerCase());

    const id = String(user.id || '');
    const email = (user.email || '').toLowerCase();

    return offers.filter(o =>
      (o.founderId && String(o.founderId) === id) ||
      (o.founderEmail && o.founderEmail.toLowerCase() === email) ||
      (o.startupName && founderStartupNames.includes(o.startupName.toLowerCase()))
    );
  }, [offers, user, startupsList]);

  // Show accepted, active agreements
  const agreementOffers = useMemo(() => {
    return founderOffers.filter(o => ['accepted', 'payment_pending', 'payment_submitted', 'under_verification', 'completed', 'funded', 'failed'].includes(o.status));
  }, [founderOffers]);

  const metrics = useMemo(() => {
    const total = agreementOffers.length;
    const awaitingInvestor = agreementOffers.filter(o => !o.investorSignedAt).length;
    const awaitingFounder = agreementOffers.filter(o => !!o.investorSignedAt && !o.founderSignedAt).length;
    const fullySigned = agreementOffers.filter(o => !!o.investorSignedAt && !!o.founderSignedAt).length;
    return { total, awaitingInvestor, awaitingFounder, fullySigned };
  }, [agreementOffers]);

  const handleCountersign = async (offer: FundingOffer, sigName: string, fontIdx: number) => {
    const offerId = offer.id || offer._id || '';
    setActionLoading(true);
    try {
      const isFullySignedNow = !!offer.investorSignedAt;
      const updates = {
        founderSignedAt: new Date().toISOString(),
        founderSignatureName: sigName,
        founderSignatureFontIndex: fontIdx,
        agreementStatus: isFullySignedNow ? 'Fully Signed' : 'Pending Investor Signature',
      };
      
      if (isFullySignedNow) {
        (updates as any).status = 'payment_pending';
      }

      await updateOfferDetails(offerId, updates);

      // Notify Investor
      await addNotification({
        userId: offer.investorId,
        title: '🤝 Investment Agreement Executed',
        message: `${offer.founderName} countersigned the Investment Agreement for ${offer.startupName}. The agreement is now fully executed. Please proceed with payment release.`,
        type: 'funding',
        actionUrl: '/dashboard/investor/transactions',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Notify Admin
      await addNotification({
        userId: 'admin',
        title: '🤝 Investment Agreement Executed',
        message: `Both parties signed the Investment Agreement for ${offer.startupName} (₹${offer.offerAmount.toLocaleString('en-IN')}). Agreement Ref: ${offer.agreementId || `AGR-2026-${offerId.slice(-4).toUpperCase()}`}.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      showToast(isFullySignedNow ? `Agreement executed successfully! ${offer.investorName} can now release funds.` : 'Agreement countersigned successfully!');
      setSelectedOffer(null);
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to sign agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSignature = async (offer: FundingOffer, sigName: string, fontIdx: number) => {
    const offerId = offer.id || offer._id || '';
    try {
      await updateOfferDetails(offerId, {
        founderSignatureName: sigName,
        founderSignatureFontIndex: fontIdx,
      });
      showToast('Signature style modified successfully.');
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update signature style.', 'error');
    }
  };

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const getStatusBadge = (o: FundingOffer) => {
    if (o.agreementStatus === 'Fully Signed') {
      return (
        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit">
          <CheckCircle2 size={9} className="text-emerald-700" /> Fully Signed
        </span>
      );
    }
    if (o.founderSignedAt) {
      return (
        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
          <CheckCircle2 size={9} /> Awaiting Investor
        </span>
      );
    }
    if (o.investorSignedAt) {
      return (
        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit animate-pulse">
          <Clock size={9} /> Awaiting Your Countersign
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
        <Clock size={9} /> Awaiting Investor Signature
      </span>
    );
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans text-left">
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <ScrollText className="text-[#5B21B6]" size={28} /> Investment Agreements
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and digitally countersign agreements from your active investors. Signing notifies the investor and platform admin.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Agreements</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Awaiting Investor</p>
          <p className="text-2xl font-extrabold text-gray-500 mt-1">{metrics.awaitingInvestor}</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Awaiting Your Sign</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1 animate-pulse">{metrics.awaitingFounder}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-4 text-white">
          <p className="text-[10px] font-black text-emerald-100 uppercase tracking-wider">Fully Executed</p>
          <p className="text-2xl font-extrabold mt-1">{metrics.fullySigned}</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-8 bg-gradient-to-r from-[#5B21B6] to-[#4C1D95] rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <ShieldCheck size={14} /> Agreement Acknowledgment Guidelines
        </h3>
        <p className="text-xs text-purple-100 leading-relaxed max-w-2xl mb-4">
          Investment contracts are legally binding. Before countersigning, founders must verify that the term sheet parameters match internal capitalization tables and board-approved resolutions.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[10px] font-bold">
          {[
            { step: '1', title: 'Investor Signs\nAgreement First', Icon: Pen },
            { step: '2', title: 'Open & Audit\nDocument', Icon: ScrollText },
            { step: '3', title: 'Countersign\nDigitally', Icon: Pen },
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
          <h3 className="text-base font-bold text-gray-800">No Agreements Issued Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Investment agreements will display here once you accept a funding commitment offer.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileText size={16} className="text-[#5B21B6]" /> Startup Investment Agreements
            </h3>
            <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-lg text-xs font-bold">
              {agreementOffers.length} Agreement(s)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs font-medium">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-5 py-3.5">Agreement Ref</th>
                  <th className="px-5 py-3.5">Startup</th>
                  <th className="px-5 py-3.5">Investor</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Instrument</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Execution Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {agreementOffers.map((o) => {
                  const offerId = o.id || o._id || '';
                  const hasSigned = !!o.founderSignedAt;
                  const isInvSigned = !!o.investorSignedAt;
                  const agreementId = o.agreementId || `AGR-2026-${offerId.slice(-4).toUpperCase()}`;

                  return (
                    <tr key={offerId} className={`hover:bg-gray-50/80 transition-colors ${hasSigned ? 'border-l-4 border-l-emerald-400' : isInvSigned ? 'border-l-4 border-l-amber-300' : 'border-l-4 border-l-gray-200'}`}>
                      <td className="px-5 py-4 font-mono font-bold text-[#5B21B6] text-[11px]">{agreementId}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{o.startupName}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-700">{o.investorName}</p>
                        <p className="text-[10px] text-gray-400">{o.investorCompany}</p>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-[#5B21B6]">₹{o.offerAmount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-lg text-[10px] font-semibold">
                          {o.instrument || 'SAFE'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{fmtDate(o.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          {getStatusBadge(o)}
                          {hasSigned && o.founderSignedAt && (
                            <p className="text-[9px] text-gray-400 mt-0.5">Countersigned: {fmtDate(o.founderSignedAt)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedOffer(o)}
                          className={`px-3 py-1.5 font-bold rounded-lg text-[10px] transition-colors flex items-center gap-1 ml-auto cursor-pointer ${
                            hasSigned
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : isInvSigned
                                ? 'bg-[#5B21B6] hover:bg-[#4C1D95] text-white animate-pulse'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {hasSigned
                            ? <><CheckCircle2 size={10} /> View Signed</>
                            : isInvSigned
                              ? <><Pen size={10} /> Countersign</>
                              : <><FileText size={10} /> Review Agreement</>
                          }
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agreement Document Modal */}
      {selectedOffer && (
        <AgreementDocument
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSign={handleCountersign}
          onUpdateSignature={handleUpdateSignature}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default FounderInvestorAgreement;
