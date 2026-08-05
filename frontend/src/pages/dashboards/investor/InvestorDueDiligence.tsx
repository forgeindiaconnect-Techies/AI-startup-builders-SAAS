import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, FileText, Download, ShieldCheck, Lock, Image, File } from 'lucide-react';
import { getDocuments, getStartups } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf': return <FileText size={24} />;
    case 'zip': return <Image size={24} />;
    case 'ppt': case 'pptx': return <File size={24} />;
    case 'xls': case 'xlsx': return <File size={24} />;
    case 'word': case 'doc': case 'docx': return <File size={24} />;
    default: return <File size={24} />;
  }
};

const getFileColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf': return 'bg-red-100 text-red-600';
    case 'zip': return 'bg-blue-100 text-blue-600';
    case 'ppt': case 'pptx': return 'bg-orange-100 text-orange-600';
    case 'xls': case 'xlsx': return 'bg-green-100 text-green-600';
    case 'word': case 'doc': case 'docx': return 'bg-blue-100 text-blue-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const InvestorDueDiligence: React.FC = () => {
  const [search, setSearch] = useState('');
  const [dataroomData, setDataroomData] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const allDocs = getDocuments();
      const startups = await getStartups();
      
      // Find all documents (since sharing was removed)
      const investorDocs = allDocs;
      
      // Group by startup
      const roomsMap: any = {};
      investorDocs.forEach((doc: any) => {
      if (!roomsMap[doc.startupId]) {
        const startup = startups.find((s: any) => s.startupId === doc.startupId);
        roomsMap[doc.startupId] = {
          id: doc.startupId,
          company: startup ? startup.startupName : 'Unknown Startup',
          filesCount: 0,
          updated: 'Recently',
          status: 'Active Review',
          access: 'Access granted by founder',
          docs: []
        };
      }
      roomsMap[doc.startupId].filesCount++;
      roomsMap[doc.startupId].docs.push({
        name: doc.fileName,
        date: new Date(doc.createdAt).toLocaleDateString(),
        size: doc.fileSize,
        type: doc.fileType,
        bg: getFileColor(doc.fileType),
        icon: getFileIcon(doc.fileType)
      });
    });
    
    const rooms = Object.values(roomsMap);
    setDataroomData(rooms);
    if (rooms.length > 0) {
      setActiveRoom(rooms[0]);
    }
    };
    fetchData();
  }, []);

  const filteredRooms = dataroomData.filter(d => 
    d.company.toLowerCase().includes(search.toLowerCase()) || 
    d.docs.some((doc: any) => doc.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDownload = async (name: string, format?: string) => {
    const finalFormat = format ? format.toLowerCase() : name.split('.').pop()?.toLowerCase() || 'txt';
    const baseName = name.replace(/\.[^/.]+$/, "");
    const finalName = `${baseName}.${finalFormat}`;
    
    try {
      if (finalFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(`Startup Document: ${baseName.replace(/_/g, ' ')}`, 20, 20);
        doc.setFontSize(12);
        doc.text("This is an automatically generated document by AI Startup Builder.", 20, 30);
        doc.text("Contains full strategic planning, market analysis, and AI roadmap.", 20, 40);
        doc.save(finalName);
      } else if (finalFormat === 'word' || finalFormat === 'docx' || finalFormat === 'doc') {
        const docx = new DocxDocument({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Startup Document: ${baseName.replace(/_/g, ' ')}`, bold: true, size: 28 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "This is an automatically generated document by AI Startup Builder.", size: 24 }),
                ],
              }),
            ],
          }],
        });
        const blob = await Packer.toBlob(docx);
        saveAs(blob, `${baseName}.docx`);
      } else if (finalFormat === 'zip') {
        const zip = new JSZip();
        zip.file("readme.txt", "This ZIP contains the startup package documents.");
        zip.file(`${baseName}.txt`, `Startup Document: ${baseName.replace(/_/g, ' ')}\nThis is an automatically generated document.`);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, finalName);
      } else {
        const content = `Mock content for ${finalName}`;
        const blob = new Blob([content], { type: 'text/plain' });
        saveAs(blob, finalName);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      window.alert(`Failed to generate ${finalFormat.toUpperCase()} file.`);
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Due Diligence</h1>
        <p className="text-gray-500 mt-1">Access secure data rooms and review confidential startup documents.</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search data rooms..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Rooms List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Data Rooms</h2>
          {filteredRooms.map(d => (
            <div 
              key={d.company} 
              onClick={() => setActiveRoom(d)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeRoom?.company === d.company ? 'bg-[#5B21B6] text-white shadow-lg shadow-purple-900/20 border-transparent' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-900'}`}
            >
              <h3 className="font-bold text-base mb-1">{d.company}</h3>
              <div className={`flex items-center justify-between text-xs font-medium ${activeRoom?.company === d.company ? 'text-white/70' : 'text-gray-500'}`}>
                <span className="flex items-center gap-1.5"><FolderOpen size={14} /> {d.filesCount} Files</span>
                <span>{d.updated}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${activeRoom?.company === d.company ? 'bg-white/20 text-white' : d.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {d.status}
                </span>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <p className="text-sm text-gray-500 py-4">
              {search ? 'No data rooms match your search.' : 'No data rooms available.'}
            </p>
          )}
        </div>

        {/* Active Room Content */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{activeRoom?.company || 'No Data Room Selected'}</h2>
              {activeRoom && <p className="text-sm text-gray-500 mt-1">Data Room • {activeRoom.access}</p>}
            </div>
            {activeRoom?.status === 'Pending Access' ? (
              <Lock size={32} className="text-amber-500" />
            ) : activeRoom ? (
              <ShieldCheck size={32} className="text-emerald-500" />
            ) : null}
          </div>

          <div className="flex-grow">
            {!activeRoom ? (
               <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                 <Lock size={40} className="text-gray-300 mb-3" />
                 <p className="text-gray-500 font-medium text-sm">Select a data room to view documents</p>
               </div>
            ) : activeRoom.status === 'Pending Access' ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <Lock size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-sm">Access pending founder approval</p>
                <button 
                  onClick={() => window.alert('Sent reminder to founder for access.')}
                  className="mt-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Send Reminder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {activeRoom.docs.map((doc: any) => (
                  <div 
                    key={doc.name}
                    onClick={() => handleDownload(doc.name)}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className={`p-3 rounded-lg ${doc.bg}`}>{doc.icon}</div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm truncate w-36 sm:w-auto">{doc.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 mt-6 flex-wrap">
            <button 
              onClick={() => handleDownload(`${activeRoom?.company.replace(/\s+/g, '_')}_Report`, 'PDF')}
              disabled={!activeRoom || activeRoom.status === 'Pending Access'}
              className="flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={16} className="mr-2" /> Download PDF
            </button>
            <button 
              onClick={() => handleDownload(`${activeRoom?.company.replace(/\s+/g, '_')}_Report`, 'WORD')}
              disabled={!activeRoom || activeRoom.status === 'Pending Access'}
              className="flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <File size={16} className="mr-2" /> Download Word
            </button>
            <button 
              onClick={() => handleDownload(`${activeRoom?.company.replace(/\s+/g, '_')}_Full_Package`, 'ZIP')}
              disabled={!activeRoom || activeRoom.status === 'Pending Access'}
              className="flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} className="mr-2" /> Download All (.zip)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDueDiligence;
