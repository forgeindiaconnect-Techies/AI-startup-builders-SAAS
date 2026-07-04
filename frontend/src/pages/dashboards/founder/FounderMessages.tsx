import React, { useState } from 'react';
import { Search, Send } from 'lucide-react';

const convs = [
  { id: 1, name: 'Alex Rivera', role: 'Mentor', avatar: 'A', gradient: 'from-blue-500 to-indigo-600', lastMsg: 'Great progress on the pitch deck!', time: '2m ago', unread: 2 },
  { id: 2, name: 'Capital Ventures', role: 'Investor', avatar: 'C', gradient: 'from-emerald-500 to-teal-500', lastMsg: 'Can we schedule a call this week?', time: '1h ago', unread: 1 },
  { id: 3, name: 'Maria Lopez', role: 'Mentor', avatar: 'M', gradient: 'from-pink-500 to-rose-500', lastMsg: 'I left feedback on your report.', time: '3h ago', unread: 0 },
  { id: 4, name: 'TechSeed Fund', role: 'Investor', avatar: 'T', gradient: 'from-orange-500 to-red-500', lastMsg: 'Thanks for the deck, reviewing now.', time: 'Yesterday', unread: 0 },
];

const chatHistory: Record<number, { from: 'me' | 'them'; text: string }[]> = {
  1: [
    { from: 'them', text: "Hey Sarah! I reviewed your latest startup submission. Really solid problem-solution fit." },
    { from: 'me', text: "Thank you Alex! I worked hard on the market analysis section." },
    { from: 'them', text: "It shows! One suggestion — tighten up the 'Go to Market' slide. Investors want to see a clear 90-day plan." },
    { from: 'me', text: "That's really helpful. I'll revise it tonight and share the updated version." },
    { from: 'them', text: "Great progress on the pitch deck!" },
  ],
  2: [
    { from: 'them', text: "Hi Sarah, we reviewed your pitch deck. There's a lot of potential here." },
    { from: 'me', text: "Thank you so much! I'd love to get your detailed thoughts." },
    { from: 'them', text: "Can we schedule a call this week?" },
  ],
  3: [
    { from: 'them', text: "I left feedback on your AI report. Check the comments section." },
  ],
  4: [
    { from: 'me', text: "Hi! I sent over our latest pitch deck. Would love your feedback." },
    { from: 'them', text: "Thanks for the deck, reviewing now." },
  ],
};

const FounderMessages: React.FC = () => {
  const [active, setActive] = useState(1);
  const [input, setInput] = useState('');
  const [chats, setChats] = useState(chatHistory);
  const [search, setSearch] = useState('');

  const filteredConvs = convs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const send = () => {
    if (!input.trim()) return;
    setChats(c => ({ ...c, [active]: [...(c[active] || []), { from: 'me', text: input }] }));
    setInput('');
  };

  const conv = convs.find(c => c.id === active)!;

  return (
    <div className="animate-fade-in-up flex flex-col h-[calc(100vh-160px)] min-h-[500px]">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">Chat with your mentors and investors in real time.</p>
      </div>

      <div className="flex-1 flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">
        {/* Left panel */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search messages..." 
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredConvs.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No messages found.</div>
            ) : filteredConvs.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors ${active === c.id ? 'bg-purple-50/70' : ''}`}>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}>{c.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-[#5B21B6] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{c.unread}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${conv.gradient} flex items-center justify-center text-white font-bold shadow-sm`}>{conv.avatar}</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{conv.name}</p>
              <p className="text-xs text-gray-400">{conv.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {(chats[active] || []).map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === 'me' ? 'bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={`Message ${conv.name}...`}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
            />
            <button onClick={send} className="px-4 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl transition-colors shadow">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderMessages;
