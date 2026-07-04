import React, { useState, useRef } from 'react';
import { Upload, FileText, File, Image, Search, Plus, Download, Trash2 } from 'lucide-react';

const initialDocs = [
  { name: 'Executive Summary v2.pdf', type: 'pdf', size: '1.2 MB', date: 'Jul 1, 2026', icon: FileText, color: 'bg-red-100 text-red-600' },
  { name: 'Pitch Deck - Investors.pptx', type: 'ppt', size: '4.8 MB', date: 'Jun 28, 2026', icon: File, color: 'bg-orange-100 text-orange-600' },
  { name: 'Market Research Report.pdf', type: 'pdf', size: '2.1 MB', date: 'Jun 25, 2026', icon: FileText, color: 'bg-red-100 text-red-600' },
  { name: 'Product Screenshots.zip', type: 'zip', size: '18.4 MB', date: 'Jun 20, 2026', icon: Image, color: 'bg-blue-100 text-blue-600' },
  { name: 'Financial Projections.xlsx', type: 'xls', size: '0.9 MB', date: 'Jun 18, 2026', icon: File, color: 'bg-green-100 text-green-600' },
  { name: 'Incorporation Certificate.pdf', type: 'pdf', size: '0.3 MB', date: 'May 12, 2026', icon: FileText, color: 'bg-red-100 text-red-600' },
];

const FounderDocuments: React.FC = () => {
  const [documents, setDocuments] = useState(initialDocs);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newDoc = {
        name: file.name,
        type: (file.name.split('.').pop() || 'file').toLowerCase(),
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        icon: File, 
        color: 'bg-gray-100 text-gray-600'
      };
      setDocuments([newDoc, ...documents]);
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocuments(docs => docs.filter((_, i) => i !== index));
    }
  };

  const handleDownload = (name: string) => {
    window.alert(`Downloading ${name}...`);
  };

  return (
    <div className="animate-fade-in-up">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Upload and manage all your startup documents securely.</p>
        </div>
        <button onClick={handleUploadClick} className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
          <Plus size={16} className="mr-2" /> Upload File
        </button>
      </div>

    {/* Upload Drop Zone */}
    <div className="mb-8 border-2 border-dashed border-gray-200 hover:border-[#5B21B6]/50 rounded-2xl p-10 text-center bg-white transition-colors cursor-pointer group">
      <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-colors">
        <Upload size={28} className="text-[#5B21B6]" />
      </div>
      <p className="text-base font-bold text-gray-700 mb-1">Drop files here to upload</p>
      <p className="text-sm text-gray-400">PDF, PPTX, DOCX, XLSX, ZIP up to 50MB</p>
      <button onClick={handleUploadClick} className="mt-4 px-5 py-2 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] text-sm font-bold rounded-xl transition-colors">
        Browse Files
      </button>
    </div>

    {/* Search */}
    <div className="relative mb-6">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input type="text" placeholder="Search documents..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
    </div>

    {/* Documents table */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">File</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((doc, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.color}`}>
                      <doc.icon size={18} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold uppercase px-2 py-1 bg-gray-100 text-gray-600 rounded-md">{doc.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{doc.size}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{doc.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleDownload(doc.name)} className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors"><Download size={16} /></button>
                    <button onClick={() => handleDelete(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default FounderDocuments;
