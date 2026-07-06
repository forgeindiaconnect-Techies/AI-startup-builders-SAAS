import React, { useRef, useState } from 'react';
import { ShieldAlert, CheckCircle2, Upload, FileCheck, X } from 'lucide-react';

const InvestorKYC: React.FC = () => {
  const accreditationRef = useRef<HTMLInputElement>(null);
  const govIdRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const [govIdFile, setGovIdFile] = useState<string | null>(null);
  const [addressFile, setAddressFile] = useState<string | null>(null);
  const [accreditationFile, setAccreditationFile] = useState<string | null>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (name: string | null) => void,
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file.name);
      window.alert(`${label} uploaded successfully: ${file.name}`);
    }
    e.target.value = '';
  };

  return (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">KYC &amp; Accreditation</h1>
      <p className="text-gray-500 mt-1">Verify your identity and accredited investor status.</p>
    </div>

    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <p className="font-bold text-emerald-900 text-lg">Fully Verified</p>
          <p className="text-sm text-emerald-700">Your account is verified for investments up to $5M.</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Identity Verification */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Identity Verification</h2>

        {/* Government ID */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
          <div>
            <span className="text-sm font-semibold text-gray-700">Government ID</span>
            {govIdFile && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[140px]">{govIdFile}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
              {govIdFile ? 'Updated' : 'Approved'}
            </span>
            <button
              onClick={() => govIdRef.current?.click()}
              className="text-xs font-bold text-[#5B21B6] hover:text-[#7C3AED] underline transition-colors"
            >
              Re-upload
            </button>
          </div>
        </div>
        <input
          type="file"
          ref={govIdRef}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, setGovIdFile, 'Government ID')}
        />

        {/* Proof of Address */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <span className="text-sm font-semibold text-gray-700">Proof of Address</span>
            {addressFile && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[140px]">{addressFile}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
              {addressFile ? 'Updated' : 'Approved'}
            </span>
            <button
              onClick={() => addressRef.current?.click()}
              className="text-xs font-bold text-[#5B21B6] hover:text-[#7C3AED] underline transition-colors"
            >
              Re-upload
            </button>
          </div>
        </div>
        <input
          type="file"
          ref={addressRef}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, setAddressFile, 'Proof of Address')}
        />
      </div>

      {/* Accreditation Document */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Accreditation Document</h2>

        <div
          onClick={() => accreditationRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-[#5B21B6]/50 transition-all cursor-pointer mb-4"
        >
          {accreditationFile ? (
            <>
              <FileCheck size={24} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-emerald-700">Document uploaded!</p>
              <p className="text-xs text-gray-500 mt-1 truncate px-4">{accreditationFile}</p>
              <p className="text-xs text-[#5B21B6] mt-2 font-medium">Click to replace</p>
            </>
          ) : (
            <>
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-bold text-gray-700">Upload new document</p>
              <p className="text-xs text-gray-400 mt-1">CPA Letter, Tax Returns, etc.</p>
              <p className="text-xs text-[#5B21B6] mt-2 font-medium">Click to browse files</p>
            </>
          )}
        </div>
        <input
          type="file"
          ref={accreditationRef}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => handleFileUpload(e, setAccreditationFile, 'Accreditation document')}
        />

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ShieldAlert size={16} className="text-amber-500" />
          Current document expires on Dec 31, 2026.
        </div>
      </div>
    </div>
  </div>
  );
};

export default InvestorKYC;
