import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  startupData: any;
  setStartupData: (data: any) => void;
}

type Msg = { role: 'user' | 'ai'; text: string };

const starters = [
  '🚀 How do I find my first 100 customers?',
  '💡 What makes a great investor pitch?',
  '📊 How should I price my product?',
  '🎯 What metrics matter most right now?',
];

const getInitialMessages = (startupName: string): Msg[] => [
  { role: 'ai', text: `Hi! I'm your AI co-founder for ${startupName ? startupName : 'your startup'}. I have all your business plan and market research context. What would you like to discuss today?` },
];

const FounderAIChat: React.FC<Props> = ({ startupData }) => {
  const [messages, setMessages] = useState<Msg[]>(getInitialMessages(startupData?.startupName || ''));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    
    if (!startupData) {
      setMessages(m => [...m, { role: 'ai', text: "Please generate a startup in the AI Idea Generator first so I have context to help you!" }]);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/ai-builder/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          startupName: startupData.startupName,
          aiContext: startupData.aiGenerated
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(m => [...m, { role: 'ai', text: data.message }]);
      } else {
        setMessages(m => [...m, { role: 'ai', text: "Sorry, I had trouble processing that request." }]);
      }
    } catch (err) {
       setMessages(m => [...m, { role: 'ai', text: "Failed to connect to the AI server. Please make sure the backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up flex flex-col h-[calc(100vh-160px)] min-h-[500px]">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h1>
        <p className="text-gray-500 mt-1">Your AI co-founder is here 24/7, armed with your startup's context.</p>
      </div>

      {!startupData ? (
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center">
          <p className="text-[#5B21B6] font-bold">Please generate a startup in the AI Idea Generator first to chat about it.</p>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#4C1D95]/5 to-transparent flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center text-[#FBBF24] shadow">
              <Bot size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AI Co-Founder for {startupData.startupName}</p>
              <p className="text-xs text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Context loaded</p>
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
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'ai'
                    ? 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm'
                    : 'bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-tr-sm shadow'
                }`}>
                  {m.text}
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
              <button key={i} onClick={() => send(s)} className="flex-shrink-0 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-100 text-[#5B21B6] text-xs font-medium rounded-full transition-colors whitespace-nowrap">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Ask your AI co-founder anything..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
            />
            <button onClick={() => send(input)} disabled={loading} className="px-4 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl transition-colors shadow flex items-center gap-2 font-bold text-sm disabled:opacity-50">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderAIChat;
