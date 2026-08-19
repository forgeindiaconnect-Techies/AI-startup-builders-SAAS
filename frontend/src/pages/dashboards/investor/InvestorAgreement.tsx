import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText, CheckCircle2, X, AlertCircle, Clock,
  ChevronDown, ShieldCheck, Pen,
  Building2, IndianRupee, Calendar, User,
  ScrollText, Lock, Unlock, Bell
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import { addNotification } from '../../../utils/localStorageHelper';
import InvestorSubNav from '../../../components/shared/InvestorSubNav';

const AGREEMENT_VERSION = 'v1.0-2026';

// Signature font styles
const SIGNATURE_STYLES = [
  { name: 'Sacramento', style: { fontFamily: "'Sacramento', cursive", fontSize: '28px', fontWeight: 400 } },
  { name: 'Great Vibes', style: { fontFamily: "'Great Vibes', cursive", fontSize: '28px', fontWeight: 400 } },
  { name: 'Dancing Script', style: { fontFamily: "'Dancing Script', cursive", fontSize: '24px', fontWeight: 700 } },
  { name: 'Caveat', style: { fontFamily: "'Caveat', cursive", fontSize: '24px', fontWeight: 700 } },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const AGREEMENT_KEY = 'ai_startup_builder_signed_agreements';

interface AgreementRecord {
  offerId: string;
  commitmentId: string;
  startupName: string;
  investorId: string;
  investorName: string;
  founderId: string;
  founderName: string;
  amount: number;
  instrument: string;
  signedAt: string;
  version: string;
  signatureName?: string;
  signatureFontIndex?: number;
}

const getSignedAgreements = (): AgreementRecord[] => {
  try { return JSON.parse(localStorage.getItem(AGREEMENT_KEY) || '[]'); }
  catch { return []; }
};

const saveSignedAgreement = (record: AgreementRecord) => {
  const list = getSignedAgreements().filter(r => r.offerId !== record.offerId);
  localStorage.setItem(AGREEMENT_KEY, JSON.stringify([...list, record]));
};

// ─── Agreement Document Modal ─────────────────────────────────────────────────
const AgreementDocument: React.FC<{
  offer: FundingOffer;
  onClose: () => void;
  onSign: (offer: FundingOffer, sigName: string, fontIdx: number) => void;
  onUpdateSignature: (offer: FundingOffer, sigName: string, fontIdx: number) => void;
  isAlreadySigned: boolean;
  signedRecord?: AgreementRecord;
  actionLoading: boolean;
}> = ({ offer, onClose, onSign, onUpdateSignature, isAlreadySigned, signedRecord, actionLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [readConfirmed, setReadConfirmed] = useState(false);

  // Signature customization state
  const [showSignModal, setShowSignModal] = useState(false);
  const [signatureName, setSignatureName] = useState(
    signedRecord?.signatureName || offer.investorName || ''
  );
  const [selectedFontIndex, setSelectedFontIndex] = useState(
    signedRecord?.signatureFontIndex ?? 0
  );

  const commitmentId = offer.commitmentId || `FC-${String(offer.id || '').slice(-6).toUpperCase()}`;

  useEffect(() => {
    if (signedRecord) {
      if (signedRecord.signatureName) setSignatureName(signedRecord.signatureName);
      if (signedRecord.signatureFontIndex !== undefined) setSelectedFontIndex(signedRecord.signatureFontIndex);
    }
  }, [signedRecord]);

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
    if (isAlreadySigned) {
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

  return (
    <div className="fixed inset-0 z-[170] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-8 flex flex-col font-sans max-h-[92vh]">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 z-10">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 flex items-start gap-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center shrink-0">
            <ScrollText size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-gray-900">Investment Agreement</h2>
              {isAlreadySigned && (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black flex items-center gap-1">
                  <CheckCircle2 size={10} /> Signed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{commitmentId} · {AGREEMENT_VERSION}</p>
            {isAlreadySigned && signedRecord?.signedAt && (
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Digitally signed on {fmtDate(signedRecord.signedAt)}</p>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 sm:p-8 py-5 text-xs text-gray-700 space-y-5"
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
                {offer.founderEmail && <p className="text-[10px] text-gray-400 mt-0.5">{offer.founderEmail}</p>}
              </div>
            </div>
          </div>

          {/* Deal Summary */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <h4 className="font-extrabold text-[#5B21B6] uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5">
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
            <h4 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col justify-center min-h-[75px]">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Investor Signature</p>
                {isAlreadySigned ? (
                  <div>
                    <p
                      className="text-2xl text-[#5B21B6] italic select-none"
                      style={SIGNATURE_STYLES[selectedFontIndex]?.style}
                    >
                      {signatureName}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Digitally signed: {signedRecord?.signedAt ? fmtDate(signedRecord.signedAt) : today}
                    </p>
                  </div>
                ) : (
                  <div>
                    {signatureName ? (
                      <p
                        className="text-2xl text-[#5B21B6] italic select-none"
                        style={SIGNATURE_STYLES[selectedFontIndex]?.style}
                      >
                        {signatureName}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic text-[11px]">Ready to sign as: {offer.investorName}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col justify-center min-h-[75px]">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Founder Countersignature</p>
                <p className="text-gray-400 italic text-[11px]">Pending — Founder will be notified after investor signs</p>
              </div>
            </div>
          </div>

          {/* Scroll prompt */}
          {!hasScrolledToBottom && !isAlreadySigned && (
            <div className="sticky bottom-2 flex justify-center">
              <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm animate-bounce">
                <ChevronDown size={12} /> Scroll to bottom to enable signing
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-3xl">
          {isAlreadySigned ? (
            <div className="space-y-3 text-left">
              {/* Terms & Conditions acknowledgment shown as checked/disabled when signed */}
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
                  I have read, understood, and agree to all terms in this Investment Agreement (Ref: {commitmentId} · {AGREEMENT_VERSION}).
                  This constitutes a legally binding digital signature.
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Agreement Digitally Signed</p>
                    {signedRecord?.signedAt && <p className="text-[10px]">Signed on {fmtDate(signedRecord.signedAt)} · {AGREEMENT_VERSION}</p>}
                  </div>
                </div>
                <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200">Close</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`flex items-start gap-2.5 rounded-xl border-2 p-3 transition-all ${hasScrolledToBottom ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200 bg-gray-100/50'}`}>
                <input
                  type="checkbox"
                  id="agreementReadCheck"
                  disabled={!hasScrolledToBottom}
                  checked={readConfirmed}
                  onChange={e => setReadConfirmed(e.target.checked)}
                  className={`mt-0.5 w-4 h-4 rounded transition-all ${hasScrolledToBottom ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                />
                <label
                  htmlFor="agreementReadCheck"
                  className={`text-[11px] font-semibold leading-relaxed ${hasScrolledToBottom ? 'text-gray-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  I have read, understood, and agree to all terms in this Investment Agreement (Ref: {commitmentId} · {AGREEMENT_VERSION}).
                  I understand this constitutes a legally binding digital signature.
                  {!hasScrolledToBottom && (
                    <span className="block text-[10px] text-amber-600 font-bold mt-0.5 italic">← Scroll through the full agreement to unlock</span>
                  )}
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  {hasScrolledToBottom
                    ? readConfirmed
                      ? <><Unlock size={11} className="text-emerald-600" /><span className="text-emerald-600 font-bold">Ready to sign</span></>
                      : <><Unlock size={11} className="text-purple-500" /><span className="text-purple-600 font-semibold">Agreement read — tick checkbox to continue</span></>
                    : <><Lock size={11} /><span>Read the full agreement to enable signing</span></>}
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs shadow-sm hover:bg-gray-50">Close</button>
                  <button
                    disabled={!readConfirmed || actionLoading}
                    onClick={() => onSign(offer, signatureName, selectedFontIndex)}
                    className={`px-6 py-2.5 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 ${
                      readConfirmed && !actionLoading
                        ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Pen size={13} />
                    {actionLoading ? 'Signing...' : 'Sign Agreement'}
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
                className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
              >
                <X size={16} />
              </button>

              <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-1.5">
                <Pen size={18} className="text-[#5B21B6]" /> Customize Digital Signature
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
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSignature}
                    disabled={!signatureName.trim()}
                    className={`flex-1 py-2.5 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
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
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const InvestorAgreement: React.FC = () => {
  const { user } = useAuth();
  const { offers, loading, refreshOffers } = useFunding();

  const [selectedOffer, setSelectedOffer] = useState<FundingOffer | null>(null);
  const [signedAgreements, setSignedAgreements] = useState<AgreementRecord[]>(getSignedAgreements);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

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

  const agreementOffers = useMemo(() => investorOffers, [investorOffers]);

  const isOfferSigned = (offerId: string) => signedAgreements.some(r => r.offerId === offerId);
  const getSignedRecord = (offerId: string) => signedAgreements.find(r => r.offerId === offerId);

  const metrics = useMemo(() => ({
    total: agreementOffers.length,
    signed: agreementOffers.filter(o => isOfferSigned(o.id || o._id || '')).length,
    pending: agreementOffers.filter(o => !isOfferSigned(o.id || o._id || '')).length,
  }), [agreementOffers, signedAgreements]);

  const handleSign = async (offer: FundingOffer, sigName: string, fontIdx: number) => {
    const offerId = offer.id || offer._id || '';
    setActionLoading(true);
    try {
      const record: AgreementRecord = {
        offerId,
        commitmentId: offer.commitmentId || `FC-${offerId.slice(-6).toUpperCase()}`,
        startupName: offer.startupName,
        investorId: String(user?.id || ''),
        investorName: offer.investorName,
        founderId: offer.founderId,
        founderName: offer.founderName,
        amount: offer.offerAmount,
        instrument: offer.instrument || 'SAFE',
        signedAt: new Date().toISOString(),
        version: AGREEMENT_VERSION,
        signatureName: sigName,
        signatureFontIndex: fontIdx,
      };

      saveSignedAgreement(record);
      setSignedAgreements(getSignedAgreements());

      // Notify Founder
      await addNotification({
        userId: offer.founderId,
        title: '✍️ Investment Agreement Signed',
        message: `${sigName} (${offer.investorCompany}) has digitally signed the Investment Agreement for ${offer.startupName}. Please review and countersign at your earliest convenience.`,
        type: 'funding',
        actionUrl: '/dashboard/founder/funding-transactions',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Notify Admin
      await addNotification({
        userId: 'admin',
        title: '✍️ Investment Agreement Executed',
        message: `${sigName} signed the Investment Agreement for ${offer.startupName} (₹${offer.offerAmount.toLocaleString('en-IN')}). Commitment: ${record.commitmentId}. Awaiting founder countersignature.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      showToast(`Agreement signed! ${offer.founderName} and Admin have been notified.`);
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
    const existing = getSignedRecord(offerId);
    if (!existing) return;

    const updated: AgreementRecord = {
      ...existing,
      signatureName: sigName,
      signatureFontIndex: fontIdx,
    };
    saveSignedAgreement(updated);
    setSignedAgreements(getSignedAgreements());
    showToast('Signature style modified successfully.');
  };

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const getStatusBadge = (status: string, signed: boolean) => {
    if (signed) return (
      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
        <CheckCircle2 size={9} /> Signed
      </span>
    );
    if (status === 'accepted') return (
      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
        <Clock size={9} /> Awaiting Signature
      </span>
    );
    if (status === 'offer_received') return (
      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
        <FileText size={9} /> Commitment Submitted
      </span>
    );
    return (
      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-bold w-fit">{status}</span>
    );
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
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <ScrollText className="text-[#5B21B6]" size={28} /> Investment Agreements
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and digitally sign your Investment Agreements. Signing notifies the Founder and Admin dashboard.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Agreements</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Pending Signature</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-5 text-white">
          <p className="text-[10px] font-black text-emerald-100 uppercase tracking-wider">Signed</p>
          <p className="text-2xl font-extrabold mt-1">{metrics.signed}</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-8 bg-gradient-to-r from-[#5B21B6] to-[#4C1D95] rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <ShieldCheck size={14} /> How Agreement Signing Works
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[10px] font-bold">
          {[
            { step: '1', title: 'Open\nAgreement', Icon: FileText },
            { step: '2', title: 'Read All\nClauses', Icon: ScrollText },
            { step: '3', title: 'Sign\nDigitally', Icon: Pen },
            { step: '4', title: 'Founder &\nAdmin Notified', Icon: Bell },
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
          <h3 className="text-base font-bold text-gray-800">No Agreements Available Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Investment agreements appear here once you create a funding commitment.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileText size={16} className="text-[#5B21B6]" /> Investment Agreement Documents
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
                  <th className="px-5 py-3.5">Founder</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Instrument</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Signature Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {agreementOffers.map((o) => {
                  const offerId = o.id || o._id || '';
                  const signed = isOfferSigned(offerId);
                  const signedRec = getSignedRecord(offerId);
                  const commitmentId = o.commitmentId || `FC-${offerId.slice(-6).toUpperCase()}`;

                  return (
                    <tr key={offerId} className={`hover:bg-gray-50/80 transition-colors ${!signed ? 'border-l-4 border-l-amber-300' : 'border-l-4 border-l-emerald-400'}`}>
                      <td className="px-5 py-4 font-mono font-bold text-[#5B21B6] text-[11px]">{commitmentId}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{o.startupName}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-700">{o.founderName}</p>
                        {o.founderEmail && <p className="text-[10px] text-gray-400">{o.founderEmail}</p>}
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
                          {getStatusBadge(o.status, signed)}
                          {signed && signedRec && (
                            <p className="text-[9px] text-gray-400 mt-0.5">Signed: {fmtDate(signedRec.signedAt)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedOffer(o)}
                          className={`px-3 py-1.5 font-bold rounded-lg text-[10px] transition-colors flex items-center gap-1 ml-auto ${
                            signed
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-[#5B21B6] hover:bg-[#4C1D95] text-white'
                          }`}
                        >
                          {signed
                            ? <><CheckCircle2 size={10} /> View Signed</>
                            : <><Pen size={10} /> Read & Sign</>
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
          onSign={handleSign}
          onUpdateSignature={handleUpdateSignature}
          isAlreadySigned={isOfferSigned(selectedOffer.id || selectedOffer._id || '')}
          signedRecord={getSignedRecord(selectedOffer.id || selectedOffer._id || '')}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default InvestorAgreement;
