import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, RefreshCw, UploadCloud, FileText, Trash2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import { addNotification } from '../../../utils/localStorageHelper';

interface Props {
  startupData?: any;
  setStartupData?: (data: any) => void;
}

type Msg = { 
  role: 'user' | 'ai'; 
  text: string; 
  sources?: string[]; 
  isRag?: boolean; 
  badge?: string; 
  mode?: 'document' | 'general' 
};

interface Document {
  docId: string;
  filename: string;
  fileType: string;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
  chunkCount: number;
  errorMessage?: string;
  createdAt: string;
}

const starters = [
  '🚀 How do I find my first 100 customers?',
  '💡 What makes a great investor pitch?',
  '📊 How should I price my product?',
  '🎯 What metrics matter most right now?',
];

const getInitialMessages = (startupName: string): Msg[] => [
  { role: 'ai', text: `Hi! I'm your Hybrid RAG AI Assistant for ${startupName ? startupName : 'your startup'}. I can answer questions directly from your uploaded documents or provide general business guidance. What would you like to discuss today?` },
];

const FounderAIChat: React.FC<Props> = ({ startupData = {} }) => {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Msg[]>(getInitialMessages(startupData?.startupName || ''));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startupId = startupData?._id || startupData?.id || '';

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Fetch documents for the startup
  const fetchDocuments = async () => {
    if (!startupId) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/rag/documents/${startupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(() => {
      const activeProcessing = documents.some(d => d.status === 'uploading' || d.status === 'processing');
      if (activeProcessing) {
        fetchDocuments();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [startupId, documents.map(d => d.status).join(',')]);

  // File Upload
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !startupId) return;
    setUploading(true);
    const token = getToken();
    const formData = new FormData();
    formData.append('startupId', startupId);
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch(`${API_URL}/rag/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        fetchDocuments();
      } else {
        alert(data.error || 'Failed to upload files');
      }
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Error connecting to RAG server.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document from the knowledge base?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/rag/document/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(docs => docs.filter(d => d.docId !== docId));
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleReindex = (doc: Document) => {
    alert(`To re-index "${doc.filename}", please delete it and upload the file again.`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const send = async (text: string) => {
    if (loading || !text.trim()) return;
    const userMessage: Msg = { role: 'user', text };
    setMessages(m => [...m, userMessage]);
    setInput('');

    addNotification({
      id: `notification_${Date.now()}`,
      userId: 'admin',
      title: 'Founder AI Chat Message',
      message: `[${startupData.startupName || 'Startup'}] ${text}`,
      type: 'ai_builder',
      isRead: false,
      actionUrl: `/dashboard/admin/startups`,
      createdAt: new Date().toISOString()
    });
    
    if (!startupData || !startupId) {
      setMessages(m => [...m, { role: 'ai', text: "Please generate a startup in the AI Idea Generator first so I have context to help you!" }]);
      return;
    }

    setLoading(true);

    const historyPayload = messages
      .filter(m => m.text)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
    
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/ai-builder/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: text,
          startupId: startupId,
          startupName: startupData.startupName,
          aiContext: startupData.aiGenerated,
          history: historyPayload
        })
      });

      const data = await response.json();
      
      let cleanMsg = data.message || data.error || "AI usage limit reached. Please wait a moment and try again.";
      if (typeof cleanMsg === 'string' && (cleanMsg.includes('{"error"') || cleanMsg.includes('RESOURCE_EXHAUSTED'))) {
        cleanMsg = "AI usage limit reached. Please wait a moment and try again.";
      }

      if (data.success) {
        setMessages(m => [...m, { 
          role: 'ai', 
          text: cleanMsg, 
          sources: data.sources,
          isRag: data.isRag,
          badge: data.badge,
          mode: data.mode
        }]);
      } else {
        setMessages(m => [...m, { 
          role: 'ai', 
          text: cleanMsg
        }]);
      }
    } catch (err: any) {
       setMessages(m => [...m, { 
         role: 'ai', 
         text: "AI usage limit reached. Please wait a moment and try again." 
       }]);
    } finally {
      setLoading(false);
    }
  };

  const hasIndexedDocs = documents.some(d => d.status === 'indexed');

  return (
    <div className="animate-fade-in-up flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px] pb-4">
      {/* RAG Knowledge Base Panel */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit max-h-full">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-transparent">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-[#6C4CF1]" />
            Knowledge Files
          </h2>
          <p className="text-xs text-gray-500 mt-1">Upload startup docs to chat directly from their context.</p>
        </div>

        {/* Upload Box */}
        <div className="p-4 border-b border-gray-100">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-[#6C4CF1] bg-purple-50/50' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleUpload(e.target.files)}
              multiple
              accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#6C4CF1] animate-spin" />
                <span className="text-xs font-semibold text-gray-700">Uploading files...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-gray-400" />
                <span className="text-xs font-semibold text-[#6C4CF1] hover:underline">Choose files</span>
                <span className="text-[10px] text-gray-400">PDF, DOCX, TXT, CSV, XLSX</span>
              </div>
            )}
          </div>
        </div>

        {/* Documents list */}
        <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-[calc(100vh-380px)] p-4 space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No documents uploaded yet.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.docId} className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <FileText size={20} className="text-[#6C4CF1] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 truncate" title={doc.filename}>{doc.filename}</p>
                  
                  {/* Status labels */}
                  {doc.status === 'uploading' && (
                    <span className="text-[10px] font-medium text-blue-600 flex items-center gap-1 mt-0.5">
                      <Loader2 size={10} className="animate-spin" /> Uploading
                    </span>
                  )}
                  {doc.status === 'processing' && (
                    <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1 mt-0.5 animate-pulse">
                      <Loader2 size={10} className="animate-spin" /> Processing
                    </span>
                  )}
                  {doc.status === 'indexed' && (
                    <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                      • Indexed ({doc.chunkCount} chunks)
                    </span>
                  )}
                  {doc.status === 'error' && (
                    <div className="text-[10px] font-medium text-red-500 mt-0.5">
                      <span className="flex items-center gap-1"><AlertCircle size={10} /> Indexing Failed</span>
                      <p className="text-[9px] text-red-400 mt-0.5 font-normal break-all">{doc.errorMessage || 'Unknown error'}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {doc.status === 'error' && (
                    <button 
                      onClick={() => handleReindex(doc)} 
                      className="p-1 hover:bg-gray-200 text-gray-500 rounded transition-colors"
                      title="Re-index file"
                    >
                      <RefreshCw size={12} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteDoc(doc.docId)} 
                    className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                    title="Delete document"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#4C1D95]/5 to-transparent flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center text-[#FBBF24] shadow">
            <Bot size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">AI Co-Founder for {startupData.startupName}</p>
            {hasIndexedDocs ? (
              <p className="text-xs text-purple-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block animate-pulse"></span>
                RAG Context Mode Active
              </p>
            ) : (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                Startup Context loaded
              </p>
            )}
          </div>
          <button onClick={() => setMessages(getInitialMessages(startupData.startupName))} className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center text-[#FBBF24] flex-shrink-0 mt-0.5 shadow">
                  <Bot size={16} />
                </div>
              )}
              <div className="flex flex-col max-w-[80%] gap-1">
                {/* Mode Badges */}
                {m.role === 'ai' && (m.badge || m.isRag !== undefined) && (
                  <div className="flex items-center gap-1.5 px-1">
                    {(m.mode === 'document' || m.badge === 'Based on your uploaded documents' || m.isRag) ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full shadow-xs">
                        <FileText size={10} /> Based on your uploaded documents
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shadow-xs">
                        <Sparkles size={10} /> General business guidance
                      </span>
                    )}
                  </div>
                )}

                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'ai'
                    ? 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm'
                    : 'bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-tr-sm shadow'
                }`}>
                  {m.text}
                </div>
                
                {/* Citations / Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-2 pt-0.5">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1">
                      Sources:
                    </span>
                    {Array.from(new Set(m.sources)).map((src, idx) => (
                      <span key={idx} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium border border-purple-100 max-w-[160px] truncate" title={src}>
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5 shadow">
                  F
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center text-[#FBBF24] flex-shrink-0 shadow">
                <Bot size={16} />
              </div>
              <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starter prompts */}
        <div className="px-5 py-3 border-t border-gray-100 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {starters.map((s, i) => (
            <button key={i} onClick={() => send(s)} disabled={loading} className="flex-shrink-0 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-100 text-[#5B21B6] text-xs font-medium rounded-full transition-colors whitespace-nowrap disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <input
            value={input}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder={loading ? "AI is processing your query..." : (hasIndexedDocs ? "Ask something about your uploaded documents..." : "Ask your AI co-founder anything...")}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] disabled:bg-gray-50"
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()} className="px-4 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl transition-colors shadow flex items-center gap-2 font-bold text-sm disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FounderAIChat;
