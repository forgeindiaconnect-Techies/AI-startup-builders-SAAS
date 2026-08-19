import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, CheckCircle2, X, AlertCircle, Clock,
  ChevronDown, ShieldCheck, Pen,
  Building2, IndianRupee, Calendar, User,
  ScrollText, Lock, Unlock, Bell, FileDown, Eye, MessageSquare, AlertTriangle
} from 'lucide-react';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { useAuth } from '../../../context/AuthContext';
import { addNotification, getStartups } from '../../../utils/localStorageHelper';

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

const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
};

// ─── Agreement Review & Sign Modal ────────────────────────────────────────────
const AgreementReviewModal: React.FC<{
  offer: FundingOffer;
  onClose: () => void;
  onSign: (offer: FundingOffer, sigName: string, fontIdx: number) => void;
  onRequestChanges: (offer: FundingOffer, notes: string) => void;
  onReject: (offer: FundingOffer) => void;
  actionLoading: boolean;
}> = ({ offer, onClose, onSign, onRequestChanges, onReject, actionLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [readConfirmed, setReadConfirmed] = useState(false);

  // Changes request notes input
  const [showChangesBox, setShowChangesBox] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');

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
  const details = offer.agreementDetails;
  
  const isFounderSigned = !!offer.founderSignedAt;



  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 60) {
      setHasScrolledToBottom(true);
    }
  }, [offer]);

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
  };

  const handleSignSubmit = () => {
    if (!readConfirmed) return;
    onSign(offer, signatureName.trim(), selectedFontIndex);
  };

  const handleChangesSubmit = () => {
    if (!changesNotes.trim()) {
      alert('Please specify the details or changes requested.');
      return;
    }
    onRequestChanges(offer, changesNotes.trim());
  };

  return createPortal(
    <div className="fixed inset-0 z-[170] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative my-4 flex flex-col font-sans max-h-[94vh] text-left">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 z-10 cursor-pointer">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-start gap-3 shrink-0 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center shrink-0">
            <ScrollText size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-gray-900">Review & Sign Investment Agreement</h2>
              {offer.agreementStatus === 'Fully Signed' && (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black flex items-center gap-1">
                  <CheckCircle2 size={10} /> Fully Executed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{agreementId} (Commitment: {commitmentId}) · {offer.agreementVersion || 'v1.0'}</p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 sm:p-8 py-5 text-xs text-gray-700 space-y-6 text-left"
        >
          {/* Action Boxes (Request changes UI) */}
          {showChangesBox && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <h4 className="font-extrabold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <MessageSquare size={12} /> Request Amendments / Changes
              </h4>
              <p className="text-[11px] text-amber-700">Specify exactly which terms, valuations, or clauses require updates. The agreement status will set to 'Changes Requested' and the Investor will be notified.</p>
              <textarea
                rows={3}
                value={changesNotes}
                onChange={e => setChangesNotes(e.target.value)}
                placeholder="Type details of changes needed..."
                className="w-full p-3 bg-white border border-amber-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowChangesBox(false)} className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold">Cancel</button>
                <button onClick={handleChangesSubmit} disabled={actionLoading} className="px-4 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-lg font-extrabold shadow">Submit Request</button>
              </div>
            </div>
          )}

          {/* Deal details overview */}
          {details ? (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <h4 className="font-extrabold text-[#5B21B6] uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5 font-bold">
                <IndianRupee size={11} /> Active Commercial Details (Filled by Investor)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Investment Capital', value: `₹${offer.offerAmount.toLocaleString('en-IN')}`, big: true },
                  { label: 'Equity Allocation', value: `${offer.equityPercentage}%` },
                  { label: 'Pre-Money Valuation', value: `₹${(details.preMoneyValuation || 0).toLocaleString('en-IN')}` },
                  { label: 'Post-Money Valuation', value: `₹${(details.postMoneyValuation || 0).toLocaleString('en-IN')}` },
                  { label: 'Funding Instrument', value: details.fundingType || 'SAFE' },
                  { label: 'Investment Type', value: details.investmentType || 'Primary' },
                  { label: 'Expected Funding Date', value: details.expectedFundingDate || 'N/A' },
                  { label: 'Agreement Expiry', value: details.agreementExpiryDate || 'N/A' },
                  { label: 'Agreement Version', value: details.version || 'v1.0' },
                ].map(item => (
                  <div key={item.label} className="bg-white border border-purple-100 rounded-xl p-2.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase">{item.label}</p>
                    <p className={`font-bold mt-0.5 ${item.big ? 'text-[#5B21B6] text-sm' : 'text-gray-900'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">No Commercial Metadata Submitted</p>
                <p className="text-[10px] mt-0.5">The investor has not populated the active deal parameters structure yet. Reviewing default terms only.</p>
              </div>
            </div>
          )}

          {/* Legal documents download */}
          {details && (details.uploadedDocument || details.supportingDocuments) && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <h4 className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] flex items-center gap-1 font-bold">
                <FileDown size={11} /> Attached Formal Contracts & Supporting Files
              </h4>
              <div className="flex flex-wrap gap-3">
                {details.uploadedDocument && (
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(details.uploadedDocument!, details.uploadedDocumentName || 'Investment_Agreement.pdf')}
                    className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileDown size={14} /> Download Investment Agreement Contract File
                  </button>
                )}
                {details.supportingDocuments && (
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(details.supportingDocuments!, details.supportingDocumentsName || 'Supporting_Exhibit.pdf')}
                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileDown size={14} /> Supporting Documents
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Commercial terms body paragraphs */}
          {details && (
            <div className="space-y-3.5">
              <h4 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] flex items-center gap-1 font-bold">
                <FileText size={11} /> Detailed Agreement Clauses
              </h4>
              {[
                { title: '1. Conversion / Investment Conversion Terms', text: details.investmentTerms },
                { title: '2. Equity & Share Issuance Terms', text: details.equityTerms },
                { title: '3. Investor Protection & Information Rights', text: details.investorRights },
                { title: '4. Founder Obligations & Compliance Requirements', text: details.founderObligations },
                { title: '5. Specific Allocation and Use of Funds', text: details.useOfFunds },
                { title: '6. Operational Milestones / Tranches Conditions', text: details.milestones },
                { title: '7. Exit Rights & Equity Transfer Conditions', text: details.exitTerms },
                { title: '8. Confidentiality Obligations', text: details.confidentialityTerms },
                { title: '9. Special Clauses / Indemnity Caps', text: details.specialClauses || offer.investorMessage },
                { title: '10. Additional Platform Conditions', text: details.additionalConditions },
              ].map((clause, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <h5 className="font-black text-gray-850 mb-1.5 text-gray-900">{clause.title}</h5>
                  <p className="text-gray-600 leading-relaxed font-semibold">{clause.text || 'Standard Platform guidelines and rules govern this clause.'}</p>
                </div>
              ))}
            </div>
          )}

          {/* Signatures */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-extrabold text-blue-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5 font-bold">
                <Pen size={11} /> Signature Block Preview
              </h4>
              {!isFounderSigned && (
                <button
                  type="button"
                  onClick={() => setShowSignModal(true)}
                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-[#5B21B6] border border-purple-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Pen size={10} /> Choose Font Style
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col justify-center min-h-[75px]">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Investor Signature (Party A)</p>
                {offer.investorSignedAt ? (
                  <div>
                    <p
                      className="text-2xl text-[#5B21B6] italic select-none font-bold"
                      style={SIGNATURE_STYLES[offer.investorSignatureFontIndex ?? 0]?.style}
                    >
                      {offer.investorSignatureName}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Digitally signed: {fmtDate(offer.investorSignedAt)}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-[11px]">
                    Pending investor final signature
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
                      Countersigned: {offer.founderSignedAt ? fmtDate(offer.founderSignedAt) : ''}
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

          {/* Scroll bottom prompt */}
          {!hasScrolledToBottom && !isFounderSigned && (
            <div className="sticky bottom-2 flex justify-center">
              <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm animate-bounce">
                <ChevronDown size={12} /> Scroll to bottom to unlock decisions
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-3xl">
          {isFounderSigned ? (
            <div className="flex items-center justify-between gap-3 flex-wrap text-left">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={18} />
                <div>
                  <p className="text-sm">Agreement Signed By You</p>
                  <p className="text-[10px] text-gray-500 font-normal">Awaiting final investor execution or platform processing</p>
                </div>
              </div>
              <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 cursor-pointer">Close</button>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              {/* Checkbox block */}
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
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex gap-2">
                  <button
                    disabled={!hasScrolledToBottom || actionLoading}
                    onClick={() => setShowChangesBox(true)}
                    className={`px-4 py-2.5 font-bold rounded-xl text-xs transition-colors border cursor-pointer ${
                      hasScrolledToBottom
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Request Changes
                  </button>
                  <button
                    disabled={!hasScrolledToBottom || actionLoading}
                    onClick={() => {
                      if (confirm('Are you sure you want to reject this entire agreement offer? This will cancel the funding commitment.')) {
                        onReject(offer);
                      }
                    }}
                    className={`px-4 py-2.5 font-bold rounded-xl text-xs transition-colors border cursor-pointer ${
                      hasScrolledToBottom
                        ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Reject
                  </button>
                </div>

                <div className="flex gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 cursor-pointer">Close</button>
                  <button
                    disabled={!readConfirmed || actionLoading}
                    onClick={handleSignSubmit}
                    className={`px-6 py-2.5 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                      readConfirmed && !actionLoading
                        ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Pen size={13} />
                    {actionLoading ? 'Signing...' : 'Accept & Sign Agreement'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── FONT CUSTOMIZER MODAL OVERLAY ─── */}
        {showSignModal && (
          <div className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative font-sans text-left">
              <button onClick={() => setShowSignModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer">
                <X size={16} />
              </button>
              <h3 className="text-base font-black text-gray-900 mb-1 flex items-center gap-1.5">
                <Pen size={16} className="text-[#5B21B6]" /> Select Custom Signature style
              </h3>
              <p className="text-xs text-gray-500 mb-4">Select cursive font index for your countersignature.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Signature Name</label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-950 text-xs focus:ring-2 focus:ring-[#5B21B6]"
                  />
                </div>
                
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 text-center min-h-[80px] flex items-center justify-center relative">
                  <p className="text-[#5B21B6]" style={SIGNATURE_STYLES[selectedFontIndex].style}>{signatureName || 'Your Signature'}</p>
                  <span className="absolute bottom-2 right-3 text-[9px] text-purple-400 font-mono">Style: {SIGNATURE_STYLES[selectedFontIndex].name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {SIGNATURE_STYLES.map((f, i) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setSelectedFontIndex(i)}
                      className={`p-2 border text-center rounded-xl transition-all min-h-[50px] flex flex-col justify-center cursor-pointer ${
                        selectedFontIndex === i ? 'bg-purple-50 border-[#5B21B6] text-[#5B21B6] font-bold' : 'bg-white hover:bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      <span className="text-[8px] font-bold text-gray-400 mb-0.5">{f.name}</span>
                      <span style={{ ...f.style, fontSize: '14px' }}>{signatureName || 'Signature'}</span>
                    </button>
                  ))}
                </div>

                <button onClick={handleSaveSignature} className="w-full py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer">Confirm Custom style</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TERMS & GUIDELINES MODAL OVERLAY ─── */}
        {showTermsGuidelinesModal && (
          <div className="fixed inset-0 z-[190] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative my-6 flex flex-col font-sans max-h-[85vh] text-left">
              <button onClick={() => setShowTermsGuidelinesModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 z-10 cursor-pointer">
                <X size={16} />
              </button>
              <div className="p-6 pb-4 border-b border-gray-100 flex items-start gap-2.5 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-[#5B21B6]/10 text-[#5B21B6] flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Investment Terms Guidelines</h3>
                  <p className="text-[10px] text-gray-500 font-mono">Compliance & Code of Conduct</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 py-4 text-[11px] text-gray-600 space-y-4 leading-relaxed">
                <div className="space-y-3">
                  {[
                    { title: '1. Representations', desc: 'The founder represents that all information shared is 100% accurate and verifiable.' },
                    { title: '2. Share Issuance', desc: 'Commitment to issue ordinary shares or execution of SAFE/Convertible note within 15 business days of funds release.' },
                    { title: '3. Proper Use of Funds', desc: 'Proceeds utilized only for approved company operations targets. Personal expense routing is strictly barred.' },
                    { title: '4. Reporting & Audits', desc: 'Submission of quarterly operations reports and verified annual financial statements.' }
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2 shrink-0 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => {
                    setTermsGuidelinesRead(true);
                    setShowTermsGuidelinesModal(false);
                  }}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Accept Guidelines Terms
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

// ─── Main Page Component ──────────────────────────────────────────────────────
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

  // Show accepted active commitments (ignore Draft agreement status since they haven't been sent yet!)
  const agreementOffers = useMemo(() => {
    return founderOffers.filter(o => 
      ['accepted', 'payment_pending', 'payment_submitted', 'under_verification', 'completed', 'funded', 'failed'].includes(o.status) &&
      o.agreementStatus && o.agreementStatus !== 'Draft'
    );
  }, [founderOffers]);

  const metrics = useMemo(() => {
    const total = agreementOffers.length;
    const awaitingInvestor = agreementOffers.filter(o => ['Sent to Founder', 'Viewed by Founder', 'Resent'].includes(o.agreementStatus || '') && !o.investorSignedAt).length;
    const awaitingFounder = agreementOffers.filter(o => ['Sent to Founder', 'Viewed by Founder', 'Resent'].includes(o.agreementStatus || '') && !o.founderSignedAt).length;
    const fullySigned = agreementOffers.filter(o => o.agreementStatus === 'Fully Signed').length;
    return { total, awaitingInvestor, awaitingFounder, fullySigned };
  }, [agreementOffers]);

  // Open modal and trigger Viewed status
  const handleOpenReview = async (offer: FundingOffer) => {
    setSelectedOffer(offer);
    
    // Update status to 'Viewed by Founder' if it is currently 'Sent to Founder' or 'Resent'
    if (['Sent to Founder', 'Resent'].includes(offer.agreementStatus || '')) {
      try {
        const newAudit = {
          action: 'Viewed by Founder',
          performedBy: user?.fullName || 'Founder',
          role: 'Founder',
          notes: 'Founder opened agreement to review terms',
          timestamp: new Date().toISOString()
        };
        await updateOfferDetails(offer.id || offer._id || '', {
          agreementStatus: 'Viewed by Founder',
          agreementAuditTrail: [...(offer.agreementAuditTrail || []), newAudit]
        });

        // Notify Investor
        await addNotification({
          userId: offer.investorId,
          title: '👁️ Agreement Viewed',
          message: `${user?.fullName || 'Founder'} viewed the Investment Agreement for ${offer.startupName}.`,
          type: 'funding',
          actionUrl: '/dashboard/investor/agreement',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        await refreshOffers();
      } catch (err) {
        console.error('Failed to update viewed status:', err);
      }
    }
  };

  // ACTION: Founder countersigns
  const handleCountersign = async (offer: FundingOffer, sigName: string, fontIdx: number) => {
    const offerId = offer.id || offer._id || '';
    setActionLoading(true);
    try {
      const isInvestorSignedAlready = !!offer.investorSignedAt;
      
      const newAudit = {
        action: 'Founder Signed',
        performedBy: user?.fullName || 'Founder',
        role: 'Founder',
        notes: isInvestorSignedAlready ? 'Countersigned by founder. Agreement is fully execution-active.' : 'Founder signed agreement, awaiting final investor execution',
        timestamp: new Date().toISOString()
      };

      const updates: any = {
        founderSignedAt: new Date().toISOString(),
        founderSignatureName: sigName,
        founderSignatureFontIndex: fontIdx,
        agreementStatus: isInvestorSignedAlready ? 'Fully Signed' : 'Founder Signed',
        agreementAuditTrail: [...(offer.agreementAuditTrail || []), newAudit]
      };

      if (isInvestorSignedAlready) {
        updates.status = 'payment_pending';
      }

      await updateOfferDetails(offerId, updates);

      // Notify Investor
      await addNotification({
        userId: offer.investorId,
        title: '🤝 Agreement Signed by Founder',
        message: `${offer.founderName} signed the Investment Agreement for ${offer.startupName}. ${isInvestorSignedAlready ? 'The agreement is fully executed.' : 'Please countersign to fully execute.'}`,
        type: 'funding',
        actionUrl: '/dashboard/investor/agreement',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Notify Admin
      await addNotification({
        userId: 'admin',
        title: 'Founder Signed Investment Agreement',
        message: `Founder ${offer.founderName} signed agreement Ref: ${offer.agreementId}.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // System notification for admin if fully signed
      if (isInvestorSignedAlready) {
        await addNotification({
          userId: 'admin',
          title: 'Agreement Fully Signed',
          message: `Agreement ID ${offer.agreementId} is fully signed by both parties. Funding release unlocked.`,
          type: 'funding',
          actionUrl: '/dashboard/admin/investor-funding',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      showToast(isInvestorSignedAlready ? 'Agreement fully executed! Investor funding is now unlocked.' : 'Countersigned successfully! Awaiting investor signature.');
      setSelectedOffer(null);
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to sign agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: Founder requests changes
  const handleRequestChanges = async (offer: FundingOffer, notes: string) => {
    const offerId = offer.id || offer._id || '';
    setActionLoading(true);
    try {
      const newAudit = {
        action: 'Changes Requested',
        performedBy: user?.fullName || 'Founder',
        role: 'Founder',
        notes: notes,
        timestamp: new Date().toISOString()
      };

      await updateOfferDetails(offerId, {
        agreementStatus: 'Changes Requested',
        agreementAuditTrail: [...(offer.agreementAuditTrail || []), newAudit]
      });

      // Notify Investor
      await addNotification({
        userId: offer.investorId,
        title: '✍️ Changes Requested by Founder',
        message: `${offer.founderName} requested changes for the Investment Agreement. Notes: "${notes}"`,
        type: 'funding',
        actionUrl: '/dashboard/investor/agreement',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Notify Admin
      await addNotification({
        userId: 'admin',
        title: 'Changes Requested for Agreement',
        message: `Founder ${offer.founderName} requested changes for Agreement Ref: ${offer.agreementId}.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToast('Changes request submitted to investor.');
      setSelectedOffer(null);
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: Founder rejects
  const handleRejectAgreement = async (offer: FundingOffer) => {
    const offerId = offer.id || offer._id || '';
    setActionLoading(true);
    try {
      const newAudit = {
        action: 'Rejected',
        performedBy: user?.fullName || 'Founder',
        role: 'Founder',
        notes: 'Founder rejected the agreement terms',
        timestamp: new Date().toISOString()
      };

      await updateOfferDetails(offerId, {
        agreementStatus: 'Rejected',
        agreementAuditTrail: [...(offer.agreementAuditTrail || []), newAudit]
      });

      // Notify Investor
      await addNotification({
        userId: offer.investorId,
        title: '❌ Agreement Rejected by Founder',
        message: `${offer.founderName} rejected the Investment Agreement for ${offer.startupName}.`,
        type: 'funding',
        actionUrl: '/dashboard/investor/agreement',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Notify Admin
      await addNotification({
        userId: 'admin',
        title: 'Agreement Rejected',
        message: `Founder ${offer.founderName} rejected agreement Ref: ${offer.agreementId}.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/investor-funding',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToast('Agreement terms rejected.', 'error');
      setSelectedOffer(null);
      await refreshOffers();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject agreement.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (o: FundingOffer) => {
    const status = o.agreementStatus;
    if (status === 'Fully Signed') {
      return (
        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit uppercase">
          <CheckCircle2 size={9} className="text-emerald-700" /> Fully Signed
        </span>
      );
    }
    if (status === 'Changes Requested') {
      return (
        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit uppercase">
          <AlertCircle size={9} /> Changes Requested
        </span>
      );
    }
    if (status === 'Founder Signed') {
      return (
        <span className="px-2.5 py-0.5 bg-purple-50 text-[#6C4CF1] border border-purple-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit uppercase">
          <CheckCircle2 size={9} /> Signed By You
        </span>
      );
    }
    if (['Sent to Founder', 'Resent', 'Viewed by Founder'].includes(status || '')) {
      return (
        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit uppercase animate-pulse">
          <Clock size={9} /> Review & Sign
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit uppercase">
        {status || 'Draft'}
      </span>
    );
  };

  const handleLifecycleStepClick = (step: string) => {
    if (step === '1') {
      showToast('Investor must create and send the agreement terms first.');
    } else if (step === '2' || step === '3') {
      const signDeal = agreementOffers.find(o => ['Sent to Founder', 'Resent', 'Viewed by Founder'].includes(o.agreementStatus || '') && !o.founderSignedAt);
      if (signDeal) {
        handleOpenReview(signDeal);
      } else {
        showToast('No agreements are currently awaiting your signature review.');
      }
    } else if (step === '4') {
      showToast('Once countersigned, payment release will be unlocked for the investor.');
    }
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
          <ScrollText className="text-[#5B21B6]" size={28} /> Investment Agreements Workspace
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review details and digitally countersign agreements received from your investors. All signature steps notify the investor and platform admin.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Received Agreements</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Awaiting Your Countersign</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1 animate-pulse">{metrics.awaitingFounder}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-4 text-white">
          <p className="text-[10px] font-black text-emerald-100 uppercase tracking-wider">Fully Executed</p>
          <p className="text-2xl font-extrabold mt-1">{metrics.fullySigned}</p>
        </div>
      </div>

      {/* Agreement guidelines */}
      <div className="mb-8 bg-gradient-to-r from-[#5B21B6] to-[#4C1D95] rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <ShieldCheck size={14} /> Agreement Signing Flow
        </h3>
        <p className="text-xs text-purple-100 leading-relaxed max-w-2xl mb-4">
          Investor creates and dispatches the terms. Open the deal document below to review pre-money, post-money valuation, milestones, exit terms, and execute your cursive digital signature.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[10px] font-bold">
          {[
            { step: '1', title: 'Investor Sends\nAgreement Terms', Icon: ScrollText },
            { step: '2', title: 'Founder Reviews\nDetails & Files', Icon: Eye },
            { step: '3', title: 'Countersign\nDigitally', Icon: Pen },
            { step: '4', title: 'Payment Released\nFrom Escrow', Icon: Unlock },
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
          <h3 className="text-base font-bold text-gray-800">No Agreements Received Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Investment agreements will display here once your investor dispatches the document details.
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
                  <th className="px-5 py-3.5">Agreement ID</th>
                  <th className="px-5 py-3.5">Startup</th>
                  <th className="px-5 py-3.5">Investor</th>
                  <th className="px-5 py-3.5">Investment Amount</th>
                  <th className="px-5 py-3.5">Equity %</th>
                  <th className="px-5 py-3.5">Date Received</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {agreementOffers.map((o) => {
                  const offerId = o.id || o._id || '';
                  const status = o.agreementStatus;
                  const agreementId = o.agreementId || `AGR-2026-${offerId.slice(-4).toUpperCase()}`;

                  return (
                    <tr key={offerId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[#5B21B6] text-[11px]">{agreementId}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{o.startupName}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-700">{o.investorName}</p>
                        <p className="text-[10px] text-gray-400">{o.investorCompany}</p>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-[#5B21B6]">₹{o.offerAmount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{o.equityPercentage}%</td>
                      <td className="px-5 py-4 text-gray-500">{o.agreementDetails?.agreementDate ? fmtDate(o.agreementDetails.agreementDate) : fmtDate(o.createdAt)}</td>
                      <td className="px-5 py-4">{getStatusBadge(o)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {status === 'Fully Signed' ? (
                            <button
                              onClick={() => handleOpenReview(o)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={10} /> View Signed
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenReview(o)}
                              className={`px-3 py-1.5 font-bold rounded-lg text-[10px] transition-colors flex items-center gap-1 cursor-pointer ${
                                ['Sent to Founder', 'Resent', 'Viewed by Founder'].includes(status || '')
                                  ? 'bg-[#5B21B6] hover:bg-[#4C1D95] text-white animate-pulse'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                              }`}
                            >
                              <Pen size={10} /> Review & Sign
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

      {/* Review details */}
      {selectedOffer && (
        <AgreementReviewModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSign={handleCountersign}
          onRequestChanges={handleRequestChanges}
          onReject={handleRejectAgreement}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default FounderInvestorAgreement;
