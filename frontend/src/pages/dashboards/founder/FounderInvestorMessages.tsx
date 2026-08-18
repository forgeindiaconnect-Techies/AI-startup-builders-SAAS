import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare, Send, Paperclip, CheckCircle2, User, Building2,
  FileText, ShieldCheck, Search, Image as ImageIcon, X, Sparkles
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  getInvestmentRequests, getInvestorMessages, sendInvestorMessage
} from '../../../utils/investorModuleStorage';
import type { InvestorMessage, InvestmentRequest } from '../../../utils/investorModuleStorage';

// Safe property getters for snake_case and camelCase compatibility
const getInvName = (r: any): string => r?.investorName || r?.investor_name || r?.name || 'Investor';
const getInvEmail = (r: any): string => r?.investorEmail || r?.investor_email || r?.email || r?.investorId || r?.investor_id || r?.id || 'investor@example.com';
const getInvFirm = (r: any): string => r?.investorFirm || r?.investor_firm || r?.companyName || 'Independent Investor';
const getStartupName = (r: any): string => r?.startupName || r?.startup_name || 'Startup IT';
const getFounderName = (r: any, fallback?: string): string => r?.founderName || r?.founder_name || fallback || 'Founder';

const FounderInvestorMessages: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const stateEmail = location.state?.investorEmail;
  const stateName = location.state?.investorName;
  const stateStartup = location.state?.startupName;
  const stateFounderName = location.state?.founderName || user?.fullName || user?.name || 'Renu';

  const founderEmail = user?.email || 'renugopal24022000@gmail.com';
  const founderDisplayName = user?.fullName || user?.name || stateFounderName || 'Renu';

  const [connectedRequests, setConnectedRequests] = useState<InvestmentRequest[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<string>('');
  const [activeInvestorEmail, setActiveInvestorEmail] = useState<string>(stateEmail || '');
  const [messages, setMessages] = useState<InvestorMessage[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const allReqs = getInvestmentRequests();
    setConnectedRequests(allReqs);

    if (allReqs.length > 0 && !activeRequestId) {
      const targetReq = stateEmail
        ? allReqs.find(r => getInvEmail(r) === stateEmail || r.investorEmail === stateEmail)
        : allReqs[0];
      const firstId = String(targetReq?.id || (targetReq as any)?._id || allReqs[0]?.id || (allReqs[0] as any)?._id || '');
      setActiveRequestId(firstId);
      setActiveInvestorEmail(stateEmail || getInvEmail(targetReq || allReqs[0]));
    }

    const allMsgs = getInvestorMessages();
    setMessages(allMsgs);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('investor_messages_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('investor_messages_updated', loadData);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRequestId, activeInvestorEmail]);

  // Resolve active request item
  const activeRequest = connectedRequests.find(r => {
    const rId = String(r.id || (r as any)._id || '');
    return rId && rId === activeRequestId;
  }) || connectedRequests.find(r => {
    const rEmail = getInvEmail(r);
    return rEmail && rEmail === activeInvestorEmail;
  }) || (connectedRequests.length > 0 ? connectedRequests[0] : (stateName || activeInvestorEmail ? {
    id: 'req_active_fallback',
    investorEmail: activeInvestorEmail || stateEmail || 'rakesh@investor.com',
    investorName: stateName || 'Rakesh',
    investorFirm: 'Independent Investor',
    startupName: stateStartup || 'Startup IT',
    founderName: founderDisplayName,
    founderEmail: founderEmail,
    status: 'ACCEPTED',
    createdAt: new Date().toISOString(),
  } as any : null));

  const currentInvEmail = activeRequest ? getInvEmail(activeRequest) : activeInvestorEmail;
  const currentInvName = activeRequest ? getInvName(activeRequest) : stateName || 'Investor';

  // Filter messages for active conversation
  const currentConversation = messages.filter(
    m =>
      (m.senderEmail === founderEmail && (m.receiverEmail === currentInvEmail || m.receiverEmail === activeInvestorEmail)) ||
      ((m.senderEmail === currentInvEmail || m.senderEmail === activeInvestorEmail) && m.receiverEmail === founderEmail) ||
      (m.receiverName && currentInvName && m.receiverName.toLowerCase() === currentInvName.toLowerCase()) ||
      (m.senderName && currentInvName && m.senderName.toLowerCase() === currentInvName.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!textInput.trim() && !selectedFile) || !activeRequest) return;

    sendInvestorMessage({
      senderEmail: founderEmail,
      senderName: founderDisplayName,
      senderRole: 'founder',
      receiverEmail: currentInvEmail,
      receiverName: currentInvName,
      startupName: getStartupName(activeRequest),
      text: textInput.trim(),
      attachmentUrl: selectedFile?.url,
      attachmentName: selectedFile?.name,
    });

    setTextInput('');
    setSelectedFile(null);
    loadData();
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const filteredRequests = connectedRequests.filter(req => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      getInvName(req).toLowerCase().includes(term) ||
      getInvFirm(req).toLowerCase().includes(term) ||
      getStartupName(req).toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-fade-in-up pb-12 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-[#5B21B6]" size={28} /> Investor Messages
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Direct, encrypted communication channel with your connected investors.
        </p>
      </div>

      {connectedRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Connected Investors Yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Once an investor accepts your proposal in the Investor Marketplace, messaging will unlock automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[75vh]">
          {/* Left Sidebar: Connected Conversations */}
          <div className="lg:col-span-4 border-r border-gray-100 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-100 bg-white">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Connected Conversations</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter conversations..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filteredRequests.map((req, idx) => {
                const reqId = String(req.id || (req as any)._id || `req_${idx}`);
                const invName = getInvName(req);
                const invEmail = getInvEmail(req);
                const invFirm = getInvFirm(req);
                const startupName = getStartupName(req);

                const isSelected = activeRequest ? String(activeRequest.id || (activeRequest as any)._id || '') === reqId : idx === 0;

                const unreadCount = messages.filter(
                  m => (m.senderEmail === invEmail || m.senderName === invName) && m.receiverEmail === founderEmail && !m.isRead
                ).length;

                return (
                  <button
                    key={reqId}
                    onClick={() => {
                      setActiveRequestId(reqId);
                      setActiveInvestorEmail(invEmail);
                    }}
                    className={`w-full p-4 text-left transition-all flex items-start gap-3 relative cursor-pointer ${
                      isSelected ? 'bg-purple-50/70 border-l-4 border-[#5B21B6]' : 'hover:bg-gray-100/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-sm font-black shadow shrink-0">
                      {(invName || 'I').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 text-xs truncate">{invName}</h4>
                        {unreadCount > 0 && (
                          <span className="w-4 h-4 bg-[#5B21B6] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{invFirm}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100/70 text-[#5B21B6] rounded text-[10px] font-bold">
                        {startupName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Chat Pane */}
          <div className="lg:col-span-8 flex flex-col bg-white">
            {activeRequest ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-sm font-black shadow shrink-0">
                      {(getInvName(activeRequest) || 'I').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        {getInvName(activeRequest)}
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200">
                          Verified Investor
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        From Founder: <span className="font-bold text-gray-900">{founderDisplayName}</span> • Investor: <span className="font-bold text-gray-900">{getInvName(activeRequest)}</span> ({getInvFirm(activeRequest)}) • Startup: <span className="font-bold text-[#5B21B6]">{getStartupName(activeRequest)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Timeline */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30">
                  {currentConversation.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      <Sparkles size={24} className="mx-auto mb-2 text-purple-300" />
                      No messages yet. Send a message to start discussing your proposal with {getInvName(activeRequest)}!
                    </div>
                  ) : (
                    currentConversation.map((msg) => {
                      const isMe = msg.senderRole === 'founder';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[75%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-[#5B21B6] text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                            }`}
                          >
                            <p>{msg.text}</p>

                            {/* Attachment if present */}
                            {msg.attachmentName && (
                              <div className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-[11px] font-bold ${
                                isMe ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'
                              }`}>
                                <FileText size={14} />
                                <span className="truncate">{msg.attachmentName}</span>
                              </div>
                            )}
                          </div>

                          <span className="text-[10px] text-gray-400 font-bold mt-1 px-1">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
                  {selectedFile && (
                    <div className="mb-2 p-2 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between text-xs font-bold text-[#5B21B6]">
                      <span className="flex items-center gap-1.5 truncate">
                        <FileText size={14} /> {selectedFile.name}
                      </span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors shrink-0">
                      <Paperclip size={18} />
                      <input type="file" onChange={handleSimulatedFileUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={`Message ${getInvName(activeRequest)}...`}
                      className="flex-1 py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#5B21B6] transition-all"
                    />

                    <button
                      type="submit"
                      disabled={!textInput.trim() && !selectedFile}
                      className="p-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] disabled:opacity-50 text-white rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 text-xs">
                <MessageSquare size={44} className="mb-2 text-purple-300" />
                <p className="font-bold text-gray-700 text-sm">Select a Conversation</p>
                <p className="text-gray-400 mt-1">Choose an investor from the sidebar to view messages.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderInvestorMessages;
