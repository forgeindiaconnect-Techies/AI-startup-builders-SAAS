import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Search, HelpCircle, FileText, Users, Shield, X, ChevronDown } from 'lucide-react';

interface FAQ {
  category: string;
  q: string;
  a: string;
}

const faqs: FAQ[] = [
  { category: 'Getting Started', q: 'How do I create an account?', a: 'Click "Sign up" on the landing page, select your role (Founder, Mentor, or Investor), fill in your details, and submit. Your account will be reviewed or instantly accessible depending on role verification.' },
  { category: 'AI Features', q: 'How does AI startup analysis work?', a: 'Our AI analyzes your startup idea across multiple dimensions — market size, competition, revenue model, team strength, and investment readiness — and generates a comprehensive report with actionable insights.' },
  { category: 'Getting Started', q: 'Can I change my role after signing up?', a: 'Role changes can be requested through the admin. Contact support or reach out to an admin from your dashboard settings.' },
  { category: 'Mentorship', q: 'How do I connect with mentors?', a: 'Founders can browse available mentors from the Mentors section in their dashboard. You can filter by expertise, view profiles, and request mentoring sessions directly.' },
  { category: 'Funding & Investors', q: 'How does funding work on the platform?', a: 'Investors can browse startup profiles in the marketplace and express interest. Founders receive funding offers which they can review, negotiate, and accept securely.' },
  { category: 'Security & Privacy', q: 'Is my data secure?', a: 'Yes, all data is encrypted in transit and at rest. We follow industry best practices for data protection and privacy compliance.' },
  { category: 'AI Features', q: 'What AI tools are included for founders?', a: 'Founders get access to AI Idea Validation, Business Plan Generator, Pitch Deck Builder, Competitor Analysis, Financial Plan Modeling, and Originality Verification.' },
  { category: 'Mentorship', q: 'How are mentor payouts processed?', a: 'Mentors receive session payouts directly to their bank accounts or UPI upon completing approved mentoring sessions.' },
];

const categories = [
  { id: 'all', icon: HelpCircle, title: 'All Topics', desc: 'Browse all platform help topics', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { id: 'Getting Started', icon: HelpCircle, title: 'Getting Started', desc: 'Account setup, roles, and platform basics', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
  { id: 'AI Features', icon: FileText, title: 'AI Features', desc: 'Idea analysis, business plans, pitch decks', color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200' },
  { id: 'Mentorship', icon: Users, title: 'Mentorship', desc: 'Finding mentors, scheduling sessions', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
  { id: 'Security & Privacy', icon: Shield, title: 'Security & Privacy', desc: 'Data protection, account safety', color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
];

const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesSearch = faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q) || faq.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#5B21B6] font-medium text-sm mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-2.5 rounded-xl shadow-md">
            <Rocket size={26} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">Help Center</h1>
        </div>
        <p className="text-[#6B7280] mb-8 ml-12 text-sm sm:text-base">
          Find answers to common questions and learn how to use the platform.
        </p>

        {/* Live Search Bar */}
        <div className="relative max-w-xl mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B21B6]" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help, topics, features..."
            className="w-full pl-12 pr-12 py-3.5 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-[#5B21B6] focus:ring-4 focus:ring-purple-500/10 text-base bg-white shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Category Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCategory(isSelected && c.id !== 'all' ? 'all' : c.id)}
                className={`bg-white rounded-2xl border-2 p-5 flex items-start gap-4 transition-all cursor-pointer select-none ${
                  isSelected ? 'border-[#5B21B6] shadow-md bg-purple-50/30' : 'border-gray-100 shadow-sm hover:border-purple-200 hover:shadow'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                  <c.icon size={22} className={c.color} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2937] text-base flex items-center gap-2">
                    {c.title}
                    {isSelected && <span className="text-[10px] bg-[#5B21B6] text-white px-2 py-0.5 rounded-full font-semibold">Active</span>}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Header & Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1F2937]">
            {selectedCategory === 'all' ? 'Frequently Asked Questions' : `${selectedCategory} FAQs`}
          </h2>
          <span className="text-xs font-semibold text-[#5B21B6] bg-purple-100 px-3 py-1 rounded-full">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'Result' : 'Results'}
          </span>
        </div>

        {/* FAQ List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <details
                key={i}
                open={!!searchQuery.trim()} // Auto expand when searching
                className="bg-white rounded-2xl border border-gray-200 shadow-sm group overflow-hidden transition-all duration-200"
              >
                <summary className="px-6 py-4 font-bold text-[#1F2937] text-sm sm:text-base cursor-pointer list-none flex items-center justify-between hover:text-[#5B21B6] transition-colors">
                  <div className="flex items-center gap-3">
                    <span>{faq.q}</span>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md hidden sm:inline-block">
                      {faq.category}
                    </span>
                  </div>
                  <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                </summary>
                <div className="px-6 pb-5 text-sm text-[#4B5563] leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <HelpCircle size={48} className="mx-auto text-purple-300 mb-4" />
            <h3 className="text-lg font-bold text-[#1F2937] mb-2">No matching help articles found</h3>
            <p className="text-sm text-[#6B7280] mb-6 max-w-md mx-auto">
              We couldn't find any results matching "{searchQuery}". Try searching with different keywords or browse all categories.
            </p>
            <button
              onClick={clearSearch}
              className="px-6 py-2.5 bg-[#5B21B6] text-white font-semibold text-sm rounded-xl hover:bg-[#7C3AED] transition-colors cursor-pointer shadow-md shadow-purple-500/20"
            >
              Clear Search & Show All FAQs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenterPage;
