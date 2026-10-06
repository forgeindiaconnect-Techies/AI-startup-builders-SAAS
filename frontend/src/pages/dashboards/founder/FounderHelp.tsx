import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Book, Zap, Send } from 'lucide-react';

const faqs = [
  { q: 'How does the AI Idea Generator work?', a: 'Our AI analyses thousands of market trends, YC company patterns, and your inputs to generate validated startup ideas with market sizing and problem-solution fit scores.' },
  { q: 'Can I invite co-founders to my workspace?', a: 'Yes! Navigate to Team Members in the sidebar and click "Invite Member". Your co-founder will receive an email invitation to join your startup workspace.' },
  { q: 'How are mentors matched to my startup?', a: 'Our AI analyses your startup industry, stage, and goals, then matches you with mentors who have relevant expertise and a track record in your space.' },
  { q: 'How do I prepare for fundraising?', a: 'Use our Pitch Deck Builder and Business Plan Builder to create investor-ready materials. Then apply for funding through the Funding section and get introduced to investors in our network.' },
  { q: 'Can investors see my startup directly?', a: 'Yes, once you submit your startup for review, it becomes visible to verified investors on the platform. You control your privacy settings from your startup profile.' },
  { q: 'How do I upgrade my subscription?', a: 'Go to Subscription/Billing in your Account section. You can view all available plans and upgrade instantly. Your new features activate immediately.' },
];

const FounderHelp: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500 mt-1">Find answers, read documentation, or contact our support team.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Book, label: 'Documentation', desc: 'Read our full guides and tutorials', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Zap, label: 'Quick Start', desc: 'Get started in under 5 minutes', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { icon: MessageSquare, label: 'Live Chat', desc: 'Chat with our support team', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((item, i) => (
          <button key={i} className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
              <item.icon size={22} className={item.color} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <HelpCircle size={20} className="text-[#5B21B6]" /> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold text-gray-800 text-sm pr-4">{faq.q}</p>
                {open === i ? <ChevronUp size={18} className="text-[#5B21B6] flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t border-gray-50">
                  <p className="text-sm text-gray-600 leading-relaxed pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Still need help? Send us a message</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
            <input type="text" placeholder="e.g. Issue with Pitch Deck Builder" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Priority</label>
            <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
            <textarea rows={4} placeholder="Describe your issue in detail..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] resize-none" />
          </div>
        </div>
        <button className="flex items-center px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow">
          <Send size={15} className="mr-2" /> Submit Ticket
        </button>
      </div>
    </div>
  );
};

export default FounderHelp;
