import React, { useState } from 'react';
import { Search, Play, X, Film, ChevronDown } from 'lucide-react';

const categories = [
  'All',
  'How to Invest in Startups',
  'Startup Valuation',
  'Due Diligence',
  'Portfolio Management',
  'Angel Investing',
  'Venture Capital',
  'Risk Assessment',
  'Investment Strategy',
];

const videos = [
  // ─── TAMIL VIDEOS ──────────────────────────────────────────

  // How to Invest in Startups - Tamil
  { id: 1, language: 'tamil', title: 'Startup-ல முதலீடு எப்படி செய்வது? | Beginner Guide Tamil', description: 'Beginners guide to investing in startups. How to evaluate and invest wisely.', category: 'How to Invest in Startups', videoId: 'r8sLR1EhFh8', duration: '8:30', thumbnailUrl: 'https://img.youtube.com/vi/r8sLR1EhFh8/hqdefault.jpg' },
  { id: 2, language: 'tamil', title: 'Startup Investment Guide Tamil | முதலீட்டு அடிப்படைகள்', description: 'Basics of startup investing explained in Tamil. Key things every investor must know.', category: 'How to Invest in Startups', videoId: 'tH1ts6tEe3Y', duration: '9:55', thumbnailUrl: 'https://img.youtube.com/vi/tH1ts6tEe3Y/hqdefault.jpg' },
  { id: 3, language: 'tamil', title: 'Angel Investor ஆக வேண்டுமா? | Tamil Guide', description: 'How to become an angel investor. Requirements, mindset, and practical steps.', category: 'How to Invest in Startups', videoId: 'HaHpR_qpdu4', duration: '8:40', thumbnailUrl: 'https://img.youtube.com/vi/HaHpR_qpdu4/hqdefault.jpg' },
  { id: 4, language: 'tamil', title: 'Startup-ல முதலீடு செய்யும் முன் தெரிந்து கொள்ள வேண்டியவை', description: 'What to know before investing in startups. Due diligence tips for Tamil investors.', category: 'How to Invest in Startups', videoId: 'qnO9ArKLtSU', duration: '7:25', thumbnailUrl: 'https://img.youtube.com/vi/qnO9ArKLtSU/hqdefault.jpg' },

  // Startup Valuation - Tamil
  { id: 5, language: 'tamil', title: 'Startup Valuation Explained in Tamil | How to Value a Startup', description: 'Learn how to value a startup. Different valuation methods explained simply.', category: 'Startup Valuation', videoId: '9vvR10S-QJE', duration: '9:15', thumbnailUrl: 'https://img.youtube.com/vi/9vvR10S-QJE/hqdefault.jpg' },
  { id: 6, language: 'tamil', title: 'Startup-க்கு எவ்வளவு முதலீடு செய்ய வேண்டும்? | Valuation Tamil', description: 'How much to invest in a startup? Understanding valuation and equity.', category: 'Startup Valuation', videoId: 'SU112VPoL8s', duration: '7:55', thumbnailUrl: 'https://img.youtube.com/vi/SU112VPoL8s/hqdefault.jpg' },
  { id: 7, language: 'tamil', title: 'Pre-Revenue Startup Valuation | Tamil Investor Guide', description: 'How to value startups that don\'t have revenue yet. Practical frameworks.', category: 'Startup Valuation', videoId: 'l-aPwa7A8gc', duration: '8:22', thumbnailUrl: 'https://img.youtube.com/vi/l-aPwa7A8gc/hqdefault.jpg' },

  // Due Diligence - Tamil
  { id: 8, language: 'tamil', title: 'Startup Due Diligence என்றால் என்ன? | Tamil Explanation', description: 'What is startup due diligence? Step-by-step process for investors.', category: 'Due Diligence', videoId: '9tKG5Ioo7iU', duration: '9:40', thumbnailUrl: 'https://img.youtube.com/vi/9tKG5Ioo7iU/hqdefault.jpg' },
  { id: 9, language: 'tamil', title: 'Investor Due Diligence Checklist | Tamil', description: 'Complete checklist for investors before investing. Financial, legal, and team evaluation.', category: 'Due Diligence', videoId: 'AcWuDESsIEk', duration: '8:10', thumbnailUrl: 'https://img.youtube.com/vi/AcWuDESsIEk/hqdefault.jpg' },
  { id: 10, language: 'tamil', title: 'Startup ஐ எப்படி Evaluate செய்வது? | Due Diligence Tamil', description: 'How to evaluate a startup before investing. Red flags and green flags.', category: 'Due Diligence', videoId: 'sBHQWOSrBtQ', duration: '9:12', thumbnailUrl: 'https://img.youtube.com/vi/sBHQWOSrBtQ/hqdefault.jpg' },

  // Portfolio Management - Tamil
  { id: 11, language: 'tamil', title: 'Investment Portfolio எப்படி Manage செய்வது? | Tamil Guide', description: 'How to manage your investment portfolio. Diversification and rebalancing strategies.', category: 'Portfolio Management', videoId: 'zXIpyVWCJHg', duration: '8:00', thumbnailUrl: 'https://img.youtube.com/vi/zXIpyVWCJHg/hqdefault.jpg' },
  { id: 12, language: 'tamil', title: 'Startup Portfolio அமைப்பது எப்படி? | Tamil Investor', description: 'How to build a startup investment portfolio. Risk-return balance explained.', category: 'Portfolio Management', videoId: 'pXCphpA6rSU', duration: '10:00', thumbnailUrl: 'https://img.youtube.com/vi/pXCphpA6rSU/hqdefault.jpg' },
  { id: 13, language: 'tamil', title: 'Diversification in Startup Investing | Tamil', description: 'Why diversification matters in startup investing. Spread risk wisely.', category: 'Portfolio Management', videoId: 'Dz5He02HDRU', duration: '9:30', thumbnailUrl: 'https://img.youtube.com/vi/Dz5He02HDRU/hqdefault.jpg' },

  // Angel Investing - Tamil
  { id: 14, language: 'tamil', title: 'Angel Investing Tamil | ஆரம்ப முதலீட்டாளர் கைடு', description: 'Complete guide to angel investing for Tamil investors. From first check to returns.', category: 'Angel Investing', videoId: 'MckWapq2pVw', duration: '8:45', thumbnailUrl: 'https://img.youtube.com/vi/MckWapq2pVw/hqdefault.jpg' },
  { id: 15, language: 'tamil', title: 'Angel Investor ஆக எப்படி ஆரம்பிப்பது? | Tamil', description: 'How to start as an angel investor. First steps and common mistakes.', category: 'Angel Investing', videoId: 'exyKhtldr7s', duration: '8:50', thumbnailUrl: 'https://img.youtube.com/vi/exyKhtldr7s/hqdefault.jpg' },
  { id: 16, language: 'tamil', title: 'Angel vs VC: யார் முதலீடு செய்வது சிறந்தது? | Tamil', description: 'Angel investors vs venture capitalists. Which is better for startups and investors.', category: 'Angel Investing', videoId: 'NtuOeNqeSmE', duration: '6:45', thumbnailUrl: 'https://img.youtube.com/vi/NtuOeNqeSmE/hqdefault.jpg' },

  // Venture Capital - Tamil
  { id: 17, language: 'tamil', title: 'Venture Capital என்றால் என்ன? | VC Explained Tamil', description: 'What is venture capital? How VCs operate and make investment decisions.', category: 'Venture Capital', videoId: 'hch07Mfi8j0', duration: '6:30', thumbnailUrl: 'https://img.youtube.com/vi/hch07Mfi8j0/hqdefault.jpg' },
  { id: 18, language: 'tamil', title: 'VC Fund எப்படி Work ஆகுது? | Tamil Explanation', description: 'How a VC fund works. Fund structure, returns, and management fees explained.', category: 'Venture Capital', videoId: 'pzenG3625e8', duration: '5:48', thumbnailUrl: 'https://img.youtube.com/vi/pzenG3625e8/hqdefault.jpg' },

  // Risk Assessment - Tamil
  { id: 19, language: 'tamil', title: 'Startup Investment Risk எப்படி கணிப்பது? | Tamil', description: 'How to assess risk in startup investments. Frameworks for risk evaluation.', category: 'Risk Assessment', videoId: 'EQcn2T0DZCw', duration: '8:22', thumbnailUrl: 'https://img.youtube.com/vi/EQcn2T0DZCw/hqdefault.jpg' },
  { id: 20, language: 'tamil', title: 'Investment Risk Management Tamil | முதலீட்டு ஆபத்து மேலாண்மை', description: 'Investment risk management strategies. Protect your capital while investing.', category: 'Risk Assessment', videoId: 'QSLcHcFxgbQ', duration: '7:15', thumbnailUrl: 'https://img.youtube.com/vi/QSLcHcFxgbQ/hqdefault.jpg' },
  { id: 21, language: 'tamil', title: 'Startup Investment இல் தவறான முடிவுகள் | Common Mistakes', description: 'Common mistakes investors make. Learn from others\' failures in startup investing.', category: 'Risk Assessment', videoId: 'Mk1CK7R8Ptg', duration: '9:45', thumbnailUrl: 'https://img.youtube.com/vi/Mk1CK7R8Ptg/hqdefault.jpg' },

  // Investment Strategy - Tamil
  { id: 22, language: 'tamil', title: 'Investment Strategy for Beginners Tamil | முதலீட்டு உத்தி', description: 'Investment strategies for beginners. Long-term thinking and value investing.', category: 'Investment Strategy', videoId: 'lM4cyDKckbI', duration: '6:20', thumbnailUrl: 'https://img.youtube.com/vi/lM4cyDKckbI/hqdefault.jpg' },
  { id: 23, language: 'tamil', title: 'Smart Investing Tamil | புத்திசாலி முதலீடு எப்படி', description: 'Smart investing principles. How professional investors think about deals.', category: 'Investment Strategy', videoId: 'SFXIyfzAHCo', duration: '7:35', thumbnailUrl: 'https://img.youtube.com/vi/SFXIyfzAHCo/hqdefault.jpg' },
  { id: 24, language: 'tamil', title: 'How to Build Wealth through Startup Investing | Tamil', description: 'Building wealth through startup investments. Patient capital and long-term returns.', category: 'Investment Strategy', videoId: 'hXbU8nLBLGY', duration: '7:50', thumbnailUrl: 'https://img.youtube.com/vi/hXbU8nLBLGY/hqdefault.jpg' },

  // ─── ENGLISH VIDEOS ────────────────────────────────────────

  // How to Invest in Startups - English
  { id: 25, language: 'english', title: 'How to Invest in Startups as a Beginner (Complete Guide)', description: 'Step-by-step guide to investing in startups. What to look for and how to start.', category: 'How to Invest in Startups', videoId: 'cG8r7OT75lA', duration: '9:42', thumbnailUrl: 'https://img.youtube.com/vi/cG8r7OT75lA/hqdefault.jpg' },
  { id: 26, language: 'english', title: 'Startup Investing for Beginners: What I Wish I Knew', description: 'Lessons from experienced angel investors. What beginners should know before investing.', category: 'How to Invest in Startups', videoId: 'Yy353lZJ-IY', duration: '8:30', thumbnailUrl: 'https://img.youtube.com/vi/Yy353lZJ-IY/hqdefault.jpg' },
  { id: 27, language: 'english', title: 'The Complete Guide to Investing in Startups (2026)', description: 'Everything about startup investing. Platforms, due diligence, and portfolio building.', category: 'How to Invest in Startups', videoId: 'Q1EcLV16Na0', duration: '9:50', thumbnailUrl: 'https://img.youtube.com/vi/Q1EcLV16Na0/hqdefault.jpg' },
  { id: 28, language: 'english', title: 'How I Analyze a Startup Before Investing', description: 'Professional framework for analyzing startups. Financial, team, and market analysis.', category: 'How to Invest in Startups', videoId: 'oiDiex7kYi8', duration: '8:15', thumbnailUrl: 'https://img.youtube.com/vi/oiDiex7kYi8/hqdefault.jpg' },

  // Startup Valuation - English
  { id: 29, language: 'english', title: 'Startup Valuation: How to Value a Startup (Investor Guide)', description: 'Complete guide to startup valuation. Methods, multiples, and practical examples.', category: 'Startup Valuation', videoId: '2PzLA3yp3pY', duration: '9:55', thumbnailUrl: 'https://img.youtube.com/vi/2PzLA3yp3pY/hqdefault.jpg' },
  { id: 30, language: 'english', title: 'How Venture Capitalists Value Startups', description: 'How VCs determine startup valuation. Pre-money, post-money, and dilution explained.', category: 'Startup Valuation', videoId: 'NT5z6ROVHHA', duration: '8:20', thumbnailUrl: 'https://img.youtube.com/vi/NT5z6ROVHHA/hqdefault.jpg' },
  { id: 31, language: 'english', title: 'Pre-Seed & Seed Stage Startup Valuation', description: 'How to value early-stage startups. When there\'s no revenue yet, how do you decide?', category: 'Startup Valuation', videoId: 'l0h3nAW13ao', duration: '9:45', thumbnailUrl: 'https://img.youtube.com/vi/l0h3nAW13ao/hqdefault.jpg' },

  // Due Diligence - English
  { id: 32, language: 'english', title: 'Startup Due Diligence: What Every Investor Must Check', description: 'Complete due diligence checklist. Legal, financial, technical, and team evaluation.', category: 'Due Diligence', videoId: '98vye4o9NNk', duration: '8:55', thumbnailUrl: 'https://img.youtube.com/vi/98vye4o9NNk/hqdefault.jpg' },
  { id: 33, language: 'english', title: 'How to Do Due Diligence on a Startup (Real Examples)', description: 'Real-world due diligence examples. What to look for and red flags to avoid.', category: 'Due Diligence', videoId: 'L6xtqZnqRfA', duration: '7:40', thumbnailUrl: 'https://img.youtube.com/vi/L6xtqZnqRfA/hqdefault.jpg' },
  { id: 34, language: 'english', title: 'Legal Due Diligence for Startup Investments', description: 'Legal aspects of startup due diligence. Cap table, IP, contracts, and compliance.', category: 'Due Diligence', videoId: 'WGObD5Zwy2Q', duration: '8:00', thumbnailUrl: 'https://img.youtube.com/vi/WGObD5Zwy2Q/hqdefault.jpg' },

  // Portfolio Management - English
  { id: 35, language: 'english', title: 'How to Build a Startup Investment Portfolio', description: 'Portfolio construction for angel investors. Diversification, allocation, and rebalancing.', category: 'Portfolio Management', videoId: 'XWRtG_PDRik', duration: '3:12', thumbnailUrl: 'https://img.youtube.com/vi/XWRtG_PDRik/hqdefault.jpg' },
  { id: 36, language: 'english', title: 'Angel Portfolio Management: Track and Optimize Returns', description: 'How to manage and track your angel investments. Tools and strategies for returns.', category: 'Portfolio Management', videoId: 'LyGm_ka745c', duration: '8:14', thumbnailUrl: 'https://img.youtube.com/vi/LyGm_ka745c/hqdefault.jpg' },
  { id: 37, language: 'english', title: 'Startup Portfolio Diversification Strategy', description: 'Why diversification is critical in startup investing. How many bets to make and when.', category: 'Portfolio Management', videoId: '2_FS5w7LIHo', duration: '7:50', thumbnailUrl: 'https://img.youtube.com/vi/2_FS5w7LIHo/hqdefault.jpg' },

  // Angel Investing - English
  { id: 38, language: 'english', title: 'Angel Investing 101: Everything You Need to Know', description: 'Complete angel investing course. From writing your first check to getting returns.', category: 'Angel Investing', videoId: 'u8fDxtfw9RI', duration: '7:20', thumbnailUrl: 'https://img.youtube.com/vi/u8fDxtfw9RI/hqdefault.jpg' },
  { id: 39, language: 'english', title: 'How to Become an Angel Investor (Step by Step)', description: 'Step-by-step guide to becoming an angel investor. Requirements and mindset shifts.', category: 'Angel Investing', videoId: '78Zxx3o55PM', duration: '9:30', thumbnailUrl: 'https://img.youtube.com/vi/78Zxx3o55PM/hqdefault.jpg' },
  { id: 40, language: 'english', title: 'Angel Investing Mistakes: Lessons from $2M Invested', description: 'Real lessons from an angel investor who invested over $2M in startups. What went wrong.', category: 'Angel Investing', videoId: 'b_bbLijk_d8', duration: '9:00', thumbnailUrl: 'https://img.youtube.com/vi/b_bbLijk_d8/hqdefault.jpg' },

  // Venture Capital - English
  { id: 41, language: 'english', title: 'Venture Capital EXPLAINED in 10 Minutes', description: 'What is venture capital? How VCs think, what they look for, and how to get funded.', category: 'Venture Capital', videoId: 'ZEcg1X_ErN0', duration: '8:14', thumbnailUrl: 'https://img.youtube.com/vi/ZEcg1X_ErN0/hqdefault.jpg' },
  { id: 42, language: 'english', title: 'How VC Funds Actually Work (LP, GP, Carry)', description: 'Inside a VC fund. Limited partners, general partners, carry, and fund economics.', category: 'Venture Capital', videoId: 'M-vt6D77-40', duration: '7:40', thumbnailUrl: 'https://img.youtube.com/vi/M-vt6D77-40/hqdefault.jpg' },
  { id: 43, language: 'english', title: 'From Angel to VC: Understanding the Investment Landscape', description: 'How the startup investment landscape works from angels to Series C and beyond.', category: 'Venture Capital', videoId: 'Sgr9m8qxl5Q', duration: '8:55', thumbnailUrl: 'https://img.youtube.com/vi/Sgr9m8qxl5Q/hqdefault.jpg' },

  // Risk Assessment - English
  { id: 44, language: 'english', title: 'Startup Investment Risk: How to Evaluate and Mitigate', description: 'Framework for evaluating startup investment risk. Market, team, and financial risk.', category: 'Risk Assessment', videoId: 'lY-1CxIz9Z4', duration: '8:30', thumbnailUrl: 'https://img.youtube.com/vi/lY-1CxIz9Z4/hqdefault.jpg' },
  { id: 45, language: 'english', title: 'The Biggest Risk in Startup Investing (And How to Avoid It)', description: 'The #1 risk investors face and how to protect your capital. Real examples.', category: 'Risk Assessment', videoId: 'u8CGUDLyTvs', duration: '8:45', thumbnailUrl: 'https://img.youtube.com/vi/u8CGUDLyTvs/hqdefault.jpg' },
  { id: 46, language: 'english', title: 'Startup Failure Rates: What Investors Should Know', description: 'Understanding startup failure rates. Statistical analysis and what it means for your portfolio.', category: 'Risk Assessment', videoId: 'Qne7Jdtr7qA', duration: '9:15', thumbnailUrl: 'https://img.youtube.com/vi/Qne7Jdtr7qA/hqdefault.jpg' },

  // Investment Strategy - English
  { id: 47, language: 'english', title: 'Investment Strategy for Angel Investors (Proven Framework)', description: 'Proven investment frameworks used by top angel investors. Decision-making strategies.', category: 'Investment Strategy', videoId: 'SUYBggpA3ZU', duration: '9:10', thumbnailUrl: 'https://img.youtube.com/vi/SUYBggpA3ZU/hqdefault.jpg' },
  { id: 48, language: 'english', title: 'How Top Angel Investors Pick Winning Startups', description: 'What separates great angel investors. Pattern recognition and thesis-driven investing.', category: 'Investment Strategy', videoId: 'PGrxuPAObts', duration: '8:40', thumbnailUrl: 'https://img.youtube.com/vi/PGrxuPAObts/hqdefault.jpg' },
  { id: 49, language: 'english', title: 'Building Wealth through Startup Investing (Long-Term Strategy)', description: 'Long-term wealth building through startup investments. Patient capital and compound returns.', category: 'Investment Strategy', videoId: 'CBYhVcO4WgI', duration: '9:50', thumbnailUrl: 'https://img.youtube.com/vi/CBYhVcO4WgI/hqdefault.jpg' },
];

const InvestorLearningCenter: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);

  const filtered = videos.filter(v => {
    if (language !== 'all' && v.language !== language) return false;
    const catOk = category === 'All' || v.category === category;
    if (!catOk) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.title?.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Learning Center</h1>
        <p className="text-gray-500 mt-1">
          Master startup investing. Valuation, due diligence, portfolio management, and more.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search investing videos..."
              autoComplete="off"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="appearance-none w-full sm:w-48 pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="all">All Languages</option>
              <option value="tamil">Tamil</option>
              <option value="english">English</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                category === c
                  ? 'bg-[#5B21B6] text-white shadow-md shadow-[#5B21B6]/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              {c === 'All' ? 'All Videos' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Video Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filtered.length} video{filtered.length !== 1 ? 's' : ''} available
        </p>
        <span className="text-xs text-gray-400">
          {language === 'all' ? 'Tamil & English' : language === 'tamil' ? 'Tamil Videos' : 'English Videos'}
        </span>
      </div>

      {/* Video Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Film size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-900 text-lg mb-1">No videos found</h3>
          <p className="text-sm text-gray-500">Try a different search, category, or language filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={v.thumbnailUrl}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/480x360/1F2937/9CA3AF?text=${v.language === 'tamil' ? 'Tamil' : 'English'}+Video`; }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play size={24} className="text-[#5B21B6] ml-0.5" />
                  </div>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 text-gray-800 backdrop-blur-sm">
                  {v.category}
                </span>
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-sm ${
                  v.language === 'tamil' ? 'bg-[#F59E0B]/90 text-white' : 'bg-[#3B82F6]/90 text-white'
                }`}>
                  {v.language === 'tamil' ? 'Tamil' : 'English'}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                  {v.duration}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2">{v.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{v.description}</p>
                <button
                  onClick={() => setSelectedVideo(v)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  <Play size={14} /> Watch Video
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Watch Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-bold text-gray-900 text-base truncate">{selectedVideo.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#5B21B6]/10 text-[#5B21B6]">
                    {selectedVideo.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    selectedVideo.language === 'tamil' ? 'bg-[#F59E0B]/10 text-[#D97706]' : 'bg-[#3B82F6]/10 text-[#2563EB]'
                  }`}>
                    {selectedVideo.language === 'tamil' ? 'Tamil' : 'English'}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600">
                    {selectedVideo.duration}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?rel=0&modestbranding=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            {selectedVideo.description && (
              <div className="p-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">{selectedVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorLearningCenter;
