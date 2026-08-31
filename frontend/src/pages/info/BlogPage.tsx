import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Calendar, User, Tag } from 'lucide-react';

const posts = [
  {
    title: 'How to Validate Your Startup Idea in 24 Hours',
    excerpt: 'Learn the step-by-step framework to validate your startup idea quickly using AI-powered market analysis and competitor research.',
    author: 'Sarah Chen',
    date: 'Jul 8, 2026',
    category: 'Startup Basics',
    readTime: '5 min read',
  },
  {
    title: 'The Ultimate Guide to Creating a Winning Pitch Deck',
    excerpt: 'Discover the 10 slides every pitch deck needs, with real examples from startups that raised millions from top investors.',
    author: 'Alex Rivera',
    date: 'Jul 5, 2026',
    category: 'Pitch Deck',
    readTime: '8 min read',
  },
  {
    title: 'Top 10 AI Tools Every Startup Founder Should Use',
    excerpt: 'From idea validation to financial forecasting, these AI tools will save you hundreds of hours and help you make data-driven decisions.',
    author: 'Priya Sharma',
    date: 'Jul 1, 2026',
    category: 'AI Tools',
    readTime: '6 min read',
  },
  {
    title: 'How to Approach Angel Investors and VCs',
    excerpt: 'A practical guide to finding, contacting, and pitching to angel investors and venture capitalists for your early-stage startup.',
    author: 'Michael Chang',
    date: 'Jun 28, 2026',
    category: 'Funding',
    readTime: '7 min read',
  },
  {
    title: 'Building an MVP: From Idea to Launch in 30 Days',
    excerpt: 'Follow this roadmap to build a minimum viable product that validates your core hypothesis without wasting time or money.',
    author: 'David Kim',
    date: 'Jun 22, 2026',
    category: 'MVP',
    readTime: '6 min read',
  },
];

const BlogPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#5B21B6] font-medium text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-2 rounded-lg">
            <Rocket size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1F2937]">Blog</h1>
        </div>
        <p className="text-[#6B7280] mb-10 ml-12">Insights, guides, and resources for startup founders.</p>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <article key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer" onClick={() => window.alert(`Opening: ${post.title}`)}>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B21B6]/10 text-[#5B21B6] flex items-center gap-1">
                  <Tag size={10} /> {post.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={12} /> {post.date}
                </span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
              <h2 className="text-lg font-bold text-[#1F2937] mb-2 hover:text-[#5B21B6] transition-colors">{post.title}</h2>
              <p className="text-sm text-[#6B7280] mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User size={14} /> {post.author}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
