import React, { useState, useEffect } from 'react';
import {
  Scale, FileCheck, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight,
  UploadCloud, FileText, X, Shield, Clock, File
} from 'lucide-react';
import { saveDocument, getDocuments } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';

interface Props {
  startupData: any;
}

const DOCUMENT_TYPES = [
  'PAN Card',
  'Aadhaar Card',
  'FSSAI Certificate',
  'GST Certificate',
  'Shop & Establishment Certificate',
  'Trade License',
  'Rent Agreement',
  'NOC from Owner',
  'Trademark Certificate',
  'Pitch Deck',
  'Business Plan',
  'Financial Projection',
  'Other'
];

const FounderLegalDocs: React.FC<Props> = ({ startupData }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    required: true,
    optional: false,
    investor: false,
    timeline: false
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('PAN Card');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Read local documents
  useEffect(() => {
    setDocuments(getDocuments() || []);
  }, []);

  const toggle = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const isFoodBusiness = /food|cafe|restaurant|bakery|snacks|tea|coffee|eatery/i.test(startupData.startupIdea || startupData.startupName);
  
  const detectedCategory = isFoodBusiness ? 'Food / Restaurant / Cafe' : 'Technology / Software / SaaS';

  const requiredDocs = isFoodBusiness ? [
    { type: 'FSSAI Certificate', name: 'FSSAI Registration / License', required: true, reason: 'Mandatory for any food-related business in India.' },
    { type: 'Shop & Establishment Certificate', name: 'Shop & Establishment Registration', required: true, reason: 'Mandatory for physical premises and hiring employees.' },
    { type: 'Trade License', name: 'Trade License', required: true, reason: 'Required by local municipal corporation to operate.' },
    { type: 'GST Certificate', name: 'GST Certificate (if applicable)', required: true, reason: 'Required if turnover exceeds ₹20L/₹40L.' },
    { type: 'Rent Agreement', name: 'Rent Agreement / NOC from owner', required: true, reason: 'Proof of business address.' },
    { type: 'PAN Card', name: 'Founder PAN & Aadhaar', required: true, reason: 'Mandatory KYC for founders and directors.' },
    { type: 'Other', name: 'Business Bank Account', required: true, reason: 'To separate business and personal finances.' },
  ] : [
    { type: 'Other', name: 'Certificate of Incorporation', required: true, reason: 'Official proof of company registration (Pvt Ltd, LLP, etc.).' },
    { type: 'PAN Card', name: 'Founder PAN & Aadhaar', required: true, reason: 'Mandatory KYC for founders and directors.' },
    { type: 'GST Certificate', name: 'GST Certificate', required: true, reason: 'Required if turnover exceeds ₹20L or for interstate B2B.' },
    { type: 'Other', name: 'Business Bank Account', required: true, reason: 'To separate business and personal finances.' },
  ];

  const optionalDocs = [
    { type: 'Trademark Certificate', name: 'Trademark Registration', required: false, reason: 'Protects your brand name and logo from being copied.' },
    { type: 'Other', name: 'Non-Disclosure Agreement (NDA)', required: false, reason: 'Protects confidential ideas when sharing with partners.' },
  ];

  const investorDocs = [
    { type: 'Pitch Deck', name: 'Pitch Deck', reason: 'To present your startup to potential investors.' },
    { type: 'Business Plan', name: 'Business Plan', reason: 'Detailed strategy, go-to-market, and financial planning.' },
    { type: 'Financial Projection', name: 'Financial Projections', reason: '3-5 year revenue and cost forecasts.' },
  ];

  const timelineSteps = [
    'Month 1: Register Business Entity & Founders KYC',
    'Month 1: Apply for Core Licenses (FSSAI, Trade License, Shop & Establishment)',
    'Month 2: Open Business Bank Account & Register for GST',
    'Month 3: Trademark Application (Optional but recommended)',
    'Ongoing: Monthly GST returns, Annual ROC filings'
  ];

  const getDocStatus = (type: string) => {
    // Find if the document is uploaded by documentType mapping
    const doc = documents.find(d => 
      d.startupId === startupData.startupId && 
      (d.documentType === type || d.category === type)
    );
    if (!doc) return 'Action Required';
    return doc.status || 'Pending Verification';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>;
      case 'Pending Verification':
      case 'Pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pending</span>;
      case 'Rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1"><AlertTriangle size={12}/> Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-bold">Action Required</span>;
    }
  };

  const handleOpenModal = (defaultType: string) => {
    setUploadDocType(defaultType);
    setUploadFile(null);
    setUploadNotes('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadFile) return alert('Please select a file.');
    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const newDoc = {
        id: `doc_${Date.now()}`,
        startupId: startupData.startupId,
        founderId: user?.id || "founder_demo",
        fileName: uploadFile.name,
        fileType: (uploadFile.name.split('.').pop() || 'file').toUpperCase(),
        fileSize: (uploadFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileData: reader.result as string, // Save as Base64 for persistence
        category: 'Legal Document',
        documentType: uploadDocType,
        status: 'Pending Verification',
        notes: uploadNotes,
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveDocument(newDoc);
      setDocuments(getDocuments());
      setIsUploading(false);
      setIsModalOpen(false);
    };
    reader.readAsDataURL(uploadFile);
  };

  const Section = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
            <Icon size={20} className="text-indigo-600" />
          </div>
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        {expandedSections[id] ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
      </button>
      {expandedSections[id] && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );

  const DocumentCard = ({ doc }: { doc: any }) => {
    const status = getDocStatus(doc.type);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900 text-sm">{doc.name}</h4>
            {doc.required ? (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Required</span>
            ) : (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Optional</span>
            )}
            {getStatusBadge(status)}
          </div>
          <p className="text-xs text-gray-500">{doc.reason}</p>
        </div>
        <div className="shrink-0">
          <button 
            onClick={() => handleOpenModal(doc.type)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-sm transition-colors shadow-sm"
          >
            <UploadCloud size={16} /> Upload
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Legal & Documents</h3>
        <p className="text-gray-500 text-sm mt-1">Simplified checklist and document management for <span className="font-semibold text-indigo-600">{startupData.startupName}</span></p>
      </div>

      {/* 1. Detected Business Category */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center shrink-0">
          <Scale size={24} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Detected Category</p>
          <p className="text-lg font-bold text-gray-900">{detectedCategory}</p>
          <p className="text-sm text-gray-600 mt-0.5">Based on your idea, we've simplified your required legal checklist.</p>
        </div>
      </div>

      {/* 2. Top Required Documents */}
      <Section id="required" title="Top Required Documents" icon={FileCheck}>
        <div className="pt-4 space-y-3">
          {requiredDocs.map((doc, i) => <DocumentCard key={i} doc={doc} />)}
        </div>
      </Section>

      {/* 3. Optional Documents */}
      <Section id="optional" title="Advanced & Optional Documents" icon={Shield}>
        <div className="pt-4 space-y-3">
          {optionalDocs.map((doc, i) => <DocumentCard key={i} doc={doc} />)}
        </div>
      </Section>

      {/* 4. Investor-Ready Documents */}
      <Section id="investor" title="Investor-Ready Documents" icon={FileText}>
        <div className="pt-4 space-y-3">
          {investorDocs.map((doc, i) => <DocumentCard key={i} doc={doc} />)}
        </div>
      </Section>

      {/* 5. Compliance Timeline */}
      <Section id="timeline" title="Compliance Timeline" icon={Clock}>
        <div className="pt-4 px-2">
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-200 before:to-transparent">
            {timelineSteps.map((step, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-indigo-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10" />
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                  <p className="text-sm font-semibold text-gray-800">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 6. Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">Important Disclaimer</p>
          <p className="text-sm text-amber-800 mt-1">This is an AI-generated checklist. Please verify with a CA, lawyer, or local municipal authority before proceeding with registrations and compliance.</p>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Upload Document</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Startup Name</label>
                <input 
                  type="text" 
                  readOnly 
                  value={startupData.startupName} 
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document Type</label>
                <select 
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none"
                >
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select File</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadFile ? (
                      <>
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                          <File size={20} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">{uploadFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white border border-gray-200 text-gray-400 shadow-sm rounded-full flex items-center justify-center mb-2">
                          <UploadCloud size={20} />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">Click to browse file</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOCX (Max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes (Optional)</label>
                <textarea 
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g., Renewed certificate for 2026"
                  className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-[80px]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile || isUploading}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Clock size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderLegalDocs;
