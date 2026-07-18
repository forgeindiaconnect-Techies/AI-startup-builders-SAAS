import React, { useState } from 'react';
import { Search, Play, X, Film, ChevronDown } from 'lucide-react';

const categories = [
  'All',
  'Startup Business Ideas',
  'Startup Guides',
  'Startup Roadmap',
  'Startup Fundamentals',
  'Startup Market Research',
  'Startup Funding & Investment',
  'Startup Business Planning',
  'How to Start a Startup',
];

const videos = [
  // ─── TAMIL VIDEOS ──────────────────────────────────────────

  // Startup Business Ideas - Tamil
  { id: 1, language: 'tamil', title: '2025 TRENDING Business Ideas in Tamil | Future Business Opportunities', description: 'Explore the latest low-investment, high-profit business opportunities perfect for small towns and online markets.', category: 'Startup Business Ideas', videoId: 'EQcn2T0DZCw', duration: '8:22', thumbnailUrl: 'https://img.youtube.com/vi/EQcn2T0DZCw/hqdefault.jpg' },
  { id: 2, language: 'tamil', title: 'Business Ideas 2025 | Low Investment Business Ideas Tamil', description: 'Looking for profitable low investment business ideas for 2025? Trending opportunities for aspiring entrepreneurs.', category: 'Startup Business Ideas', videoId: 'QSLcHcFxgbQ', duration: '7:15', thumbnailUrl: 'https://img.youtube.com/vi/QSLcHcFxgbQ/hqdefault.jpg' },
  { id: 3, language: 'tamil', title: '50 Business Ideas | Business Ideas Tamil 2024', description: 'Explore the future of entrepreneurship with 50 business ideas. Practical and beginner-friendly options.', category: 'Startup Business Ideas', videoId: 'Mk1CK7R8Ptg', duration: '9:45', thumbnailUrl: 'https://img.youtube.com/vi/Mk1CK7R8Ptg/hqdefault.jpg' },
  { id: 4, language: 'tamil', title: '5 Trending Business Ideas | Business Ideas Tamil', description: '5 trending and viral business ideas that anyone can start with low investment and high-profit potential.', category: 'Startup Business Ideas', videoId: 'hch07Mfi8j0', duration: '6:30', thumbnailUrl: 'https://img.youtube.com/vi/hch07Mfi8j0/hqdefault.jpg' },
  { id: 5, language: 'tamil', title: 'Business Ideas 2025 | Zero Investment Business Tamil', description: 'Zero investment business ideas for 2025. Trending business opportunities explained in Tamil.', category: 'Startup Business Ideas', videoId: 'pzenG3625e8', duration: '5:48', thumbnailUrl: 'https://img.youtube.com/vi/pzenG3625e8/hqdefault.jpg' },

  // Startup Guides - Tamil
  { id: 6, language: 'tamil', title: 'Startup Guide for Beginners - How to Start a Startup in Tamil', description: 'Complete startup guide in Tamil with step-by-step explanation from idea validation to launch.', category: 'Startup Guides', videoId: 'exyKhtldr7s', duration: '8:50', thumbnailUrl: 'https://img.youtube.com/vi/exyKhtldr7s/hqdefault.jpg' },
  { id: 7, language: 'tamil', title: 'Business Start பண்ணணுமா? | Step by Step Guide in Tamil', description: 'Step-by-step business guide in Tamil. Learn where to start and how to plan your business journey.', category: 'Startup Guides', videoId: 'sBHQWOSrBtQ', duration: '9:12', thumbnailUrl: 'https://img.youtube.com/vi/sBHQWOSrBtQ/hqdefault.jpg' },
  { id: 8, language: 'tamil', title: 'Top 5 Business Ideas to Start in Tamil Nadu in 2026', description: 'Detailed discussion about the top 5 most profitable business ideas in Tamil Nadu for 2026.', category: 'Startup Guides', videoId: 'SFXIyfzAHCo', duration: '7:35', thumbnailUrl: 'https://img.youtube.com/vi/SFXIyfzAHCo/hqdefault.jpg' },
  { id: 9, language: 'tamil', title: '2024 Tamil Business Ideas | Easy Startup Options', description: 'Easy startup options for Tamil entrepreneurs. Simple and practical business ideas explained.', category: 'Startup Guides', videoId: 'lM4cyDKckbI', duration: '6:20', thumbnailUrl: 'https://img.youtube.com/vi/lM4cyDKckbI/hqdefault.jpg' },

  // Startup Roadmap - Tamil
  { id: 10, language: 'tamil', title: 'How to Build a Startup in the AI Era | Incubation & Innovation', description: 'Learn how to build a startup in the AI era with incubation support and innovation strategies.', category: 'Startup Roadmap', videoId: 'pXCphpA6rSU', duration: '10:00', thumbnailUrl: 'https://img.youtube.com/vi/pXCphpA6rSU/hqdefault.jpg' },
  { id: 11, language: 'tamil', title: 'How to Build a Successful Startup in 2026 | Lean Startup Tamil', description: 'Lean startup methodology explained in Tamil. Build a successful startup with proven frameworks.', category: 'Startup Roadmap', videoId: 'zXIpyVWCJHg', duration: '8:00', thumbnailUrl: 'https://img.youtube.com/vi/zXIpyVWCJHg/hqdefault.jpg' },
  { id: 12, language: 'tamil', title: 'Startup Idea becomes Reality with Startup Incubator', description: 'Learn how startup ideas become reality through incubation programs. Real experiences shared.', category: 'Startup Roadmap', videoId: 'Dz5He02HDRU', duration: '9:30', thumbnailUrl: 'https://img.youtube.com/vi/Dz5He02HDRU/hqdefault.jpg' },
  { id: 13, language: 'tamil', title: 'Startup Singam Season 2 - Tamil Startup Ecosystem Roadmap', description: 'Complete roadmap of the Tamil startup ecosystem. From idea to execution.', category: 'Startup Roadmap', videoId: 'MckWapq2pVw', duration: '8:45', thumbnailUrl: 'https://img.youtube.com/vi/MckWapq2pVw/hqdefault.jpg' },

  // Startup Fundamentals - Tamil
  { id: 14, language: 'tamil', title: 'Startup Fundamentals: LLP vs Private Limited Tamil', description: 'Understand company structures for startups. Learn whether LLP or Private Limited is right for you.', category: 'Startup Fundamentals', videoId: 'SU112VPoL8s', duration: '7:55', thumbnailUrl: 'https://img.youtube.com/vi/SU112VPoL8s/hqdefault.jpg' },
  { id: 15, language: 'tamil', title: 'How to Start a Startup in India - Guide for Beginners 2026', description: 'Complete guide covering what is a startup, how it works, business models, and fundamentals.', category: 'Startup Fundamentals', videoId: 'l-aPwa7A8gc', duration: '8:22', thumbnailUrl: 'https://img.youtube.com/vi/l-aPwa7A8gc/hqdefault.jpg' },
  { id: 16, language: 'tamil', title: 'Startup Fundamentals Explained in Tamil | Complete Guide', description: 'Everything you need to know about startup fundamentals. From ideation to execution.', category: 'Startup Fundamentals', videoId: 'AcWuDESsIEk', duration: '8:10', thumbnailUrl: 'https://img.youtube.com/vi/AcWuDESsIEk/hqdefault.jpg' },
  { id: 17, language: 'tamil', title: 'LLP vs Private Limited | Startup Company Structure Guide', description: 'Detailed comparison of company structures. Choose the right legal structure for your startup.', category: 'Startup Fundamentals', videoId: 'NtuOeNqeSmE', duration: '6:45', thumbnailUrl: 'https://img.youtube.com/vi/NtuOeNqeSmE/hqdefault.jpg' },

  // Startup Market Research - Tamil
  { id: 18, language: 'tamil', title: 'Learn Startup in Tamil! Market Research & Co-founder Mistakes', description: 'Deep dive into market research for startups. Co-founder mistakes, B2B & Retail strategies.', category: 'Startup Market Research', videoId: '9tKG5Ioo7iU', duration: '9:40', thumbnailUrl: 'https://img.youtube.com/vi/9tKG5Ioo7iU/hqdefault.jpg' },
  { id: 19, language: 'tamil', title: 'Market Research for Startups | Tamil Guide', description: 'How to conduct market research for your startup. Practical tips and strategies.', category: 'Startup Market Research', videoId: 'sBHQWOSrBtQ', duration: '8:30', thumbnailUrl: 'https://img.youtube.com/vi/sBHQWOSrBtQ/hqdefault.jpg' },
  { id: 20, language: 'tamil', title: 'Marketing Research Techniques in Tamil | GUVI', description: 'Learn marketing research techniques used by Google, Spotify, Netflix to capture markets.', category: 'Startup Market Research', videoId: 'pzenG3625e8', duration: '7:20', thumbnailUrl: 'https://img.youtube.com/vi/pzenG3625e8/hqdefault.jpg' },
  { id: 21, language: 'tamil', title: 'How to Validate Your Business Idea | Market Research Tamil', description: 'Step-by-step guide to validate your business idea before investing. Market research basics.', category: 'Startup Market Research', videoId: 'EQcn2T0DZCw', duration: '8:15', thumbnailUrl: 'https://img.youtube.com/vi/EQcn2T0DZCw/hqdefault.jpg' },

  // Startup Funding & Investment - Tamil
  { id: 22, language: 'tamil', title: 'How To Raise Funding For Your Startup | 10 Ways Tamil', description: '10 proven ways to raise money for your startup. Bootstrapping to venture capital explained.', category: 'Startup Funding & Investment', videoId: 'tH1ts6tEe3Y', duration: '9:55', thumbnailUrl: 'https://img.youtube.com/vi/tH1ts6tEe3Y/hqdefault.jpg' },
  { id: 23, language: 'tamil', title: 'Startup Funding Explained in Tamil: Everything You Need', description: 'Complete guide to startup funding. Different funding stages, investors, and how to pitch.', category: 'Startup Funding & Investment', videoId: 'HaHpR_qpdu4', duration: '8:40', thumbnailUrl: 'https://img.youtube.com/vi/HaHpR_qpdu4/hqdefault.jpg' },
  { id: 24, language: 'tamil', title: '21 Startup Resources & Funding | KFETA Tamil', description: 'Various schemes available for startups in Tamil Nadu. Government funding resource guide.', category: 'Startup Funding & Investment', videoId: 'qnO9ArKLtSU', duration: '7:25', thumbnailUrl: 'https://img.youtube.com/vi/qnO9ArKLtSU/hqdefault.jpg' },
  { id: 25, language: 'tamil', title: 'Startup Fundraising Guide for Founders | Tamil', description: 'Complete fundraising process guide. Raise capital and connect with investors.', category: 'Startup Funding & Investment', videoId: '9vvR10S-QJE', duration: '9:15', thumbnailUrl: 'https://img.youtube.com/vi/9vvR10S-QJE/hqdefault.jpg' },

  // Startup Business Planning - Tamil
  { id: 26, language: 'tamil', title: 'Business Model & Profit Planning for Startups Tamil', description: 'Learn about business models and profit planning. Create a solid business plan.', category: 'Startup Business Planning', videoId: 'l-aPwa7A8gc', duration: '8:22', thumbnailUrl: 'https://img.youtube.com/vi/l-aPwa7A8gc/hqdefault.jpg' },
  { id: 27, language: 'tamil', title: 'Step-by-Step Business Roadmap & Planning in Tamil', description: 'Complete business roadmap and planning guide. From idea to execution.', category: 'Startup Business Planning', videoId: 'sBHQWOSrBtQ', duration: '9:12', thumbnailUrl: 'https://img.youtube.com/vi/sBHQWOSrBtQ/hqdefault.jpg' },
  { id: 28, language: 'tamil', title: 'Business Plan எப்படி எழுதுவது? | Startup Planning Tamil', description: 'How to write a business plan. Step-by-step guide to create a compelling plan.', category: 'Startup Business Planning', videoId: 'zXIpyVWCJHg', duration: '8:00', thumbnailUrl: 'https://img.youtube.com/vi/zXIpyVWCJHg/hqdefault.jpg' },
  { id: 29, language: 'tamil', title: 'MVP Development & Business Planning for Startups', description: 'Learn about MVP development and business planning. Build your minimum viable product.', category: 'Startup Business Planning', videoId: 'pXCphpA6rSU', duration: '10:00', thumbnailUrl: 'https://img.youtube.com/vi/pXCphpA6rSU/hqdefault.jpg' },

  // How to Start a Startup - Tamil
  { id: 30, language: 'tamil', title: 'How to Start a Startup in India | Step by Step Tamil', description: 'Complete step-by-step guide to starting a startup in India. Everything a beginner needs.', category: 'How to Start a Startup', videoId: 'l-aPwa7A8gc', duration: '8:22', thumbnailUrl: 'https://img.youtube.com/vi/l-aPwa7A8gc/hqdefault.jpg' },
  { id: 31, language: 'tamil', title: 'Startup Guide for Beginners - How to Start Tamil', description: 'Your complete startup guide in Tamil. Step-by-step explanation for absolute beginners.', category: 'How to Start a Startup', videoId: 'exyKhtldr7s', duration: '8:50', thumbnailUrl: 'https://img.youtube.com/vi/exyKhtldr7s/hqdefault.jpg' },
  { id: 32, language: 'tamil', title: 'How to Build a Successful Startup from Zero | Tamil', description: 'Build your startup from zero. Essential steps to go from idea to successful business.', category: 'How to Start a Startup', videoId: 'zXIpyVWCJHg', duration: '8:00', thumbnailUrl: 'https://img.youtube.com/vi/zXIpyVWCJHg/hqdefault.jpg' },
  { id: 33, language: 'tamil', title: 'Zero to Startup: Complete Tamil Guide for Entrepreneurs', description: 'From zero to startup. Complete guide for Tamil entrepreneurs building their own business.', category: 'How to Start a Startup', videoId: 'sBHQWOSrBtQ', duration: '9:12', thumbnailUrl: 'https://img.youtube.com/vi/sBHQWOSrBtQ/hqdefault.jpg' },
  { id: 34, language: 'tamil', title: 'Startup Journey Explained in Tamil | Idea to Execution', description: 'Complete startup journey. From ideation to execution with real-world examples.', category: 'How to Start a Startup', videoId: 'Dz5He02HDRU', duration: '9:30', thumbnailUrl: 'https://img.youtube.com/vi/Dz5He02HDRU/hqdefault.jpg' },
  { id: 35, language: 'tamil', title: 'Building My Startup with LinkedIn and ChatGPT', description: 'Leverage LinkedIn and AI tools like ChatGPT to build and grow your startup.', category: 'How to Start a Startup', videoId: 'hXbU8nLBLGY', duration: '7:50', thumbnailUrl: 'https://img.youtube.com/vi/hXbU8nLBLGY/hqdefault.jpg' },

  // ─── ENGLISH VIDEOS ────────────────────────────────────────

  // Startup Business Ideas - English
  { id: 36, language: 'english', title: '5 Businesses I\'d Start If I Was 22 Again ($500 to $100k/Month)', description: 'Greg Isenberg shares 5 startup ideas that could be launched for under $500 with minimal technical expertise.', category: 'Startup Business Ideas', videoId: 'cG8r7OT75lA', duration: '9:42', thumbnailUrl: 'https://img.youtube.com/vi/cG8r7OT75lA/hqdefault.jpg' },
  { id: 37, language: 'english', title: '50 BEST BUSINESS IDEAS 2026 LOW INVESTMENT', description: '50 practical, low-investment business ideas designed for aspiring entrepreneurs starting in 2026.', category: 'Startup Business Ideas', videoId: 'Yy353lZJ-IY', duration: '8:30', thumbnailUrl: 'https://img.youtube.com/vi/Yy353lZJ-IY/hqdefault.jpg' },
  { id: 38, language: 'english', title: 'Startup Ideas That Will EXPLODE in 2026! (Rise of AI)', description: 'Most promising tech business opportunities that will dominate the market in 2026. AI, AR/VR, and Web3.', category: 'Startup Business Ideas', videoId: 'Q1EcLV16Na0', duration: '9:50', thumbnailUrl: 'https://img.youtube.com/vi/Q1EcLV16Na0/hqdefault.jpg' },
  { id: 39, language: 'english', title: '20 Profitable New Business Ideas to Start in 2026', description: '20 new business ideas to start a new business for beginners. Profitable opportunities explained.', category: 'Startup Business Ideas', videoId: 'oiDiex7kYi8', duration: '8:15', thumbnailUrl: 'https://img.youtube.com/vi/oiDiex7kYi8/hqdefault.jpg' },
  { id: 40, language: 'english', title: '55 Best Startup Ideas to Launch and Grow in 2026', description: 'Comprehensive guide to the best startup ideas. From SaaS to e-commerce, explore all opportunities.', category: 'Startup Business Ideas', videoId: '2PzLA3yp3pY', duration: '9:55', thumbnailUrl: 'https://img.youtube.com/vi/2PzLA3yp3pY/hqdefault.jpg' },

  // Startup Guides - English
  { id: 41, language: 'english', title: 'How to Start a Startup in 2026 - Complete Guide', description: 'Complete step-by-step guide to launching your startup. From ideation to your first customers.', category: 'Startup Guides', videoId: 'cG8r7OT75lA', duration: '9:42', thumbnailUrl: 'https://img.youtube.com/vi/cG8r7OT75lA/hqdefault.jpg' },
  { id: 42, language: 'english', title: 'The Lean Startup Method Explained | Build Measure Learn', description: 'Lean Startup methodology explained. Build, measure, learn framework and engine of growth.', category: 'Startup Guides', videoId: 'WGObD5Zwy2Q', duration: '8:00', thumbnailUrl: 'https://img.youtube.com/vi/WGObD5Zwy2Q/hqdefault.jpg' },
  { id: 43, language: 'english', title: 'How to Pitch Your Startup in 3 Minutes', description: 'Learn the structure of a solid 3-minute pitch for your startup. From tagline to team.', category: 'Startup Guides', videoId: 'XWRtG_PDRik', duration: '3:12', thumbnailUrl: 'https://img.youtube.com/vi/XWRtG_PDRik/hqdefault.jpg' },
  { id: 44, language: 'english', title: 'Startup Funding Explained: What Every Founder Must Know', description: 'Everything you need to know about startup funding rounds, from pre-seed to Series C.', category: 'Startup Guides', videoId: '78Zxx3o55PM', duration: '9:30', thumbnailUrl: 'https://img.youtube.com/vi/78Zxx3o55PM/hqdefault.jpg' },

  // Startup Roadmap - English
  { id: 45, language: 'english', title: 'The Roadmap of a Venture Funded Startup', description: 'First-time founders learn the what, when, and hows of venture funding and building a company.', category: 'Startup Roadmap', videoId: 'NT5z6ROVHHA', duration: '8:20', thumbnailUrl: 'https://img.youtube.com/vi/NT5z6ROVHHA/hqdefault.jpg' },
  { id: 46, language: 'english', title: 'From Idea to $650M Exit: Lessons in Building AI Startups', description: 'Y Combinator shares lessons from building AI startups that achieved massive exits.', category: 'Startup Roadmap', videoId: 'l0h3nAW13ao', duration: '9:45', thumbnailUrl: 'https://img.youtube.com/vi/l0h3nAW13ao/hqdefault.jpg' },
  { id: 47, language: 'english', title: 'How I Would Start a SaaS Business Today', description: 'Step-by-step roadmap for starting a SaaS business in 2026. Proven strategies and frameworks.', category: 'Startup Roadmap', videoId: '98vye4o9NNk', duration: '8:55', thumbnailUrl: 'https://img.youtube.com/vi/98vye4o9NNk/hqdefault.jpg' },
  { id: 48, language: 'english', title: 'Startup Growth Hacking: How to Double Down on What Works', description: 'Growth hacking strategies for startups. How to scale your business efficiently.', category: 'Startup Roadmap', videoId: 'L6xtqZnqRfA', duration: '7:40', thumbnailUrl: 'https://img.youtube.com/vi/L6xtqZnqRfA/hqdefault.jpg' },

  // Startup Fundamentals - English
  { id: 49, language: 'english', title: 'What is a Startup? Fundamentals Explained', description: 'Clear explanation of startup fundamentals. Business models, MVP, product-market fit, and more.', category: 'Startup Fundamentals', videoId: 'XWRtG_PDRik', duration: '3:12', thumbnailUrl: 'https://img.youtube.com/vi/XWRtG_PDRik/hqdefault.jpg' },
  { id: 50, language: 'english', title: 'LLC vs C-Corp vs S-Corp: Which is Right for Your Startup?', description: 'Understand different business structures. Choose the right legal entity for your startup.', category: 'Startup Fundamentals', videoId: 'LyGm_ka745c', duration: '8:14', thumbnailUrl: 'https://img.youtube.com/vi/LyGm_ka745c/hqdefault.jpg' },
  { id: 51, language: 'english', title: 'Product-Market Fit: How to Know You Have It', description: 'Learn how to identify and achieve product-market fit. The most critical startup milestone.', category: 'Startup Fundamentals', videoId: '2_FS5w7LIHo', duration: '7:50', thumbnailUrl: 'https://img.youtube.com/vi/2_FS5w7LIHo/hqdefault.jpg' },
  { id: 52, language: 'english', title: 'Ideal Customer Profile: 3 Things You Need to Know', description: 'Define your ideal customer profile. Understand who you are building for and why it matters.', category: 'Startup Fundamentals', videoId: 'u8fDxtfw9RI', duration: '7:20', thumbnailUrl: 'https://img.youtube.com/vi/u8fDxtfw9RI/hqdefault.jpg' },

  // Startup Market Research - English
  { id: 53, language: 'english', title: 'Market Research for Startups: Complete Guide', description: 'How to conduct market research. Surveys, competitor analysis, and customer interviews explained.', category: 'Startup Market Research', videoId: '78Zxx3o55PM', duration: '9:30', thumbnailUrl: 'https://img.youtube.com/vi/78Zxx3o55PM/hqdefault.jpg' },
  { id: 54, language: 'english', title: 'How to Validate Your Business Idea Before Building', description: '5 powerful ways to validate your business idea. Save time and money before you build.', category: 'Startup Market Research', videoId: 'b_bbLijk_d8', duration: '9:00', thumbnailUrl: 'https://img.youtube.com/vi/b_bbLijk_d8/hqdefault.jpg' },
  { id: 55, language: 'english', title: 'Competitor Analysis: How to Study Your Competition', description: 'Step-by-step competitor analysis framework. Learn from competitors and find your edge.', category: 'Startup Market Research', videoId: 'lY-1CxIz9Z4', duration: '8:30', thumbnailUrl: 'https://img.youtube.com/vi/lY-1CxIz9Z4/hqdefault.jpg' },
  { id: 56, language: 'english', title: 'Customer Discovery: Talk to Users the Right Way', description: 'How to do customer discovery interviews. Get insights that drive product decisions.', category: 'Startup Market Research', videoId: 'u8CGUDLyTvs', duration: '8:45', thumbnailUrl: 'https://img.youtube.com/vi/u8CGUDLyTvs/hqdefault.jpg' },

  // Startup Funding & Investment - English
  { id: 57, language: 'english', title: 'How to Raise Startup Funding: EVERYTHING You Need to Know', description: 'Complete guide to startup fundraising. Pre-seed, seed, Series A and beyond explained.', category: 'Startup Funding & Investment', videoId: '78Zxx3o55PM', duration: '9:30', thumbnailUrl: 'https://img.youtube.com/vi/78Zxx3o55PM/hqdefault.jpg' },
  { id: 58, language: 'english', title: 'How to Create a Startup Pitch Deck That Gets Funded', description: 'Build a pitch deck that investors love. Slide-by-slide breakdown with examples.', category: 'Startup Funding & Investment', videoId: 'Sgr9m8qxl5Q', duration: '8:55', thumbnailUrl: 'https://img.youtube.com/vi/Sgr9m8qxl5Q/hqdefault.jpg' },
  { id: 59, language: 'english', title: 'Venture Capital EXPLAINED in 10 Minutes', description: 'What is venture capital? How VCs think, what they look for, and how to get funded.', category: 'Startup Funding & Investment', videoId: 'ZEcg1X_ErN0', duration: '8:14', thumbnailUrl: 'https://img.youtube.com/vi/ZEcg1X_ErN0/hqdefault.jpg' },
  { id: 60, language: 'english', title: 'Angel Investors vs VCs: Which is Right for You?', description: 'Understand the difference between angel investors and venture capitalists. Choose wisely.', category: 'Startup Funding & Investment', videoId: 'M-vt6D77-40', duration: '7:40', thumbnailUrl: 'https://img.youtube.com/vi/M-vt6D77-40/hqdefault.jpg' },

  // Startup Business Planning - English
  { id: 61, language: 'english', title: 'How to Write a Business Plan in 2026', description: 'Step-by-step guide to writing a compelling business plan. Financial projections and strategy.', category: 'Startup Business Planning', videoId: 'lY-1CxIz9Z4', duration: '8:30', thumbnailUrl: 'https://img.youtube.com/vi/lY-1CxIz9Z4/hqdefault.jpg' },
  { id: 62, language: 'english', title: 'Strategic Planning for Startups: A Complete Framework', description: 'Build a strategic plan for your startup. Goal setting, milestones, and execution frameworks.', category: 'Startup Business Planning', videoId: '98vye4o9NNk', duration: '8:55', thumbnailUrl: 'https://img.youtube.com/vi/98vye4o9NNk/hqdefault.jpg' },
  { id: 63, language: 'english', title: 'MVP Development: Build Your First Product the Right Way', description: 'How to build a minimum viable product. Prioritize features and launch fast.', category: 'Startup Business Planning', videoId: 'Qne7Jdtr7qA', duration: '9:15', thumbnailUrl: 'https://img.youtube.com/vi/Qne7Jdtr7qA/hqdefault.jpg' },
  { id: 64, language: 'english', title: 'Creating a SaaS Sales Funnel for Your Startup', description: 'Build a high-converting sales funnel. From awareness to conversion, step by step.', category: 'Startup Business Planning', videoId: 'Qne7Jdtr7qA', duration: '9:15', thumbnailUrl: 'https://img.youtube.com/vi/Qne7Jdtr7qA/hqdefault.jpg' },

  // How to Start a Startup - English
  { id: 65, language: 'english', title: 'How to Start a Startup | Sam Altman & Dustin Moskovitz (Stanford)', description: 'Legendary Stanford lecture by Sam Altman and Dustin Moskovitz on how to start a startup.', category: 'How to Start a Startup', videoId: 'CBYhVcO4WgI', duration: '9:50', thumbnailUrl: 'https://img.youtube.com/vi/CBYhVcO4WgI/hqdefault.jpg' },
  { id: 66, language: 'english', title: 'Quitting Your Job to Start a Business: The Complete Guide', description: 'When and how to quit your job to start a business. Financial prep and mindset shifts.', category: 'How to Start a Startup', videoId: 'PGrxuPAObts', duration: '8:40', thumbnailUrl: 'https://img.youtube.com/vi/PGrxuPAObts/hqdefault.jpg' },
  { id: 67, language: 'english', title: 'Team and Execution with Sam Altman (How to Start a Startup)', description: 'Sam Altman covers team building and execution. Essential lecture for every startup founder.', category: 'How to Start a Startup', videoId: 'crMVJAf5TjA', duration: '9:30', thumbnailUrl: 'https://img.youtube.com/vi/crMVJAf5TjA/hqdefault.jpg' },
  { id: 68, language: 'english', title: 'How to Succeed with a Startup | Sam Altman (Y Combinator)', description: 'Sam Altman shares key insights on how to succeed with your startup. Y Combinator wisdom.', category: 'How to Start a Startup', videoId: '0lJKucu6HJc', duration: '9:50', thumbnailUrl: 'https://img.youtube.com/vi/0lJKucu6HJc/hqdefault.jpg' },
  { id: 69, language: 'english', title: '5 Simple Business Ideas Anyone Can Start Today', description: 'Simple business ideas that anyone can start. Practical, low-barrier entry points explained.', category: 'How to Start a Startup', videoId: 'SUYBggpA3ZU', duration: '9:10', thumbnailUrl: 'https://img.youtube.com/vi/SUYBggpA3ZU/hqdefault.jpg' },
];

const FounderLearningVideos: React.FC = () => {
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
        <h1 className="text-2xl font-bold text-gray-900">Learning Videos</h1>
        <p className="text-gray-500 mt-1">
          Watch startup lessons, guides, roadmaps, funding tips, and business tutorials.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        {/* Search Bar + Language Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search startup videos..."
              autoComplete="off"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Language Dropdown */}
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

        {/* Category Buttons */}
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

export default FounderLearningVideos;
