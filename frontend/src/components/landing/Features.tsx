import React, { useState } from 'react';
import { 
  Lightbulb, Target, TrendingUp, Presentation, Users, Activity, 
  X, Sparkles, Plus, Trash2, ArrowLeft, ArrowRight, Check, 
  Play, RefreshCw, Calendar, Info, 
  ShieldCheck, AlertTriangle, ChevronRight
} from 'lucide-react';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  themeColor: string;
  gradient: string;
  badge: string;
}

const Features: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  // States for AI Business Analysis simulator
  const [bizName, setBizName] = useState('EcoPackage Hub');
  const [bizIndustry, setBizIndustry] = useState('SaaS / GreenTech');
  const [bizDesc, setBizDesc] = useState('Connecting D2C e-commerce brands with sustainable packaging manufacturers.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState('');

  // States for SWOT Analysis simulator
  const [swotStrengths, setSwotStrengths] = useState<string[]>([
    "Proprietary MOQ matching algorithm",
    "Exclusive supplier contracts",
    "Zero inventory platform model"
  ]);
  const [swotWeaknesses, setSwotWeaknesses] = useState<string[]>([
    "Initial brand awareness",
    "Premium pricing vs plastics",
    "Dependency on logistics partners"
  ]);
  const [swotOpportunities, setSwotOpportunities] = useState<string[]>([
    "Rapid expansion of green laws",
    "Direct integration with Shopify App Store",
    "Enterprise brand carbon tracking solutions"
  ]);
  const [swotThreats, setSwotThreats] = useState<string[]>([
    "Wholesale companies building software",
    "Supply chain raw bio-material shortages",
    "Fluctuations in global shipping costs"
  ]);
  const [swotInput, setSwotInput] = useState({ S: '', W: '', O: '', T: '' });

  // States for Financial Forecasting simulator
  const [aov, setAov] = useState(1200);
  const [growth, setGrowth] = useState(12);
  const [margin, setMargin] = useState(65);

  // States for Investor Pitch Deck simulator
  const [activeSlide, setActiveSlide] = useState(0);

  // States for Mentor Matching simulator
  const [isMatching, setIsMatching] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState('');
  const [matchingResult, setMatchingResult] = useState<boolean>(false);
  const [connectedMentors, setConnectedMentors] = useState<number[]>([]);

  // States for Startup Readiness Score simulator
  const [checkedItems, setCheckedItems] = useState<number[]>([0, 1, 2, 4]);

  const features: FeatureCard[] = [
    {
      icon: <Lightbulb size={28} className="text-[#FBBF24] group-hover:animate-pulse" />,
      title: "AI Business Analysis",
      description: "Business analysis evaluates a startup idea by examining the problem it solves, the solution it offers, who the target customers are, and how big the market opportunity is — using frameworks like TAM, SAM, and SOM to size the addressable market.",
      themeColor: "#FBBF24",
      gradient: "from-amber-600 via-amber-700 to-orange-850",
      badge: "Idea Analysis"
    },
    {
      icon: <Target size={28} className="text-[#8B5CF6] group-hover:animate-bounce" />,
      title: "SWOT Analysis",
      description: "SWOT stands for Strengths, Weaknesses, Opportunities, and Threats. It is a strategic planning framework that helps businesses evaluate internal capabilities and external market conditions to make informed decisions and build competitive strategies.",
      themeColor: "#8B5CF6",
      gradient: "from-violet-650 via-purple-700 to-indigo-900",
      badge: "Strategy Mapping"
    },
    {
      icon: <TrendingUp size={28} className="text-[#10B981] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />,
      title: "Financial Forecasting",
      description: "Financial forecasting is the process of estimating a startup's future revenue, costs, and profitability. It uses metrics like CAC (Customer Acquisition Cost), LTV (Lifetime Value), and profit margins to project growth over 1–3 years and determine business viability.",
      themeColor: "#10B981",
      gradient: "from-emerald-600 via-emerald-700 to-teal-900",
      badge: "Unit Economics"
    },
    {
      icon: <Presentation size={28} className="text-[#3B82F6] group-hover:scale-105 transition-transform" />,
      title: "Investor Pitch Deck",
      description: "A pitch deck is a concise 10-slide presentation that tells a startup's story to investors. It covers the vision, problem, solution, market size, business model, competition, traction, and the funding ask — designed to secure investment in a short meeting.",
      themeColor: "#3B82F6",
      gradient: "from-blue-600 via-blue-700 to-indigo-900",
      badge: "Deck Builder"
    },
    {
      icon: <Users size={28} className="text-[#EC4899] group-hover:scale-110 transition-transform" />,
      title: "Mentor Matching",
      description: "Mentor matching is the process of pairing startup founders with experienced industry experts based on domain relevance, skill gaps, and business stage. A good mentor provides guidance, avoids common mistakes, and opens doors to networks and funding opportunities.",
      themeColor: "#EC4899",
      gradient: "from-pink-600 via-rose-700 to-red-800",
      badge: "Expert Networks"
    },
    {
      icon: <Activity size={28} className="text-[#F97316] group-hover:scale-110 transition-transform" />,
      title: "Startup Readiness Score",
      description: "A startup readiness score is a weighted assessment that evaluates how prepared a business is for funding. It measures criteria like problem clarity, MVP status, unit economics, customer validation, and IP protection — scored out of 100 to indicate investor readiness.",
      themeColor: "#F97316",
      gradient: "from-orange-500 via-red-600 to-red-850",
      badge: "Investor Readiness"
    }
  ];

  // SWOT Handlers
  const addSwotItem = (quadrant: 'S' | 'W' | 'O' | 'T') => {
    const text = swotInput[quadrant].trim();
    if (!text) return;
    if (quadrant === 'S') setSwotStrengths([...swotStrengths, text]);
    if (quadrant === 'W') setSwotWeaknesses([...swotWeaknesses, text]);
    if (quadrant === 'O') setSwotOpportunities([...swotOpportunities, text]);
    if (quadrant === 'T') setSwotThreats([...swotThreats, text]);
    setSwotInput({ ...swotInput, [quadrant]: '' });
  };

  const removeSwotItem = (quadrant: 'S' | 'W' | 'O' | 'T', index: number) => {
    if (quadrant === 'S') setSwotStrengths(swotStrengths.filter((_, i) => i !== index));
    if (quadrant === 'W') setSwotWeaknesses(swotWeaknesses.filter((_, i) => i !== index));
    if (quadrant === 'O') setSwotOpportunities(swotOpportunities.filter((_, i) => i !== index));
    if (quadrant === 'T') setSwotThreats(swotThreats.filter((_, i) => i !== index));
  };

  // AI Business Analysis Handler
  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const steps = [
      "AI is parsing your industry profile...",
      "Evaluating competitors and logistics networks...",
      "Drafting zero-waste value propositions...",
      "Synthesizing addressable market sizing...",
      "Completed!"
    ];

    let i = 0;
    setAnalysisProgress(steps[0]);
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setAnalysisProgress(steps[i]);
      } else {
        clearInterval(interval);
        setAnalysisResult({
          valueProp: `${bizName}: The premium AI-driven marketplace standardizing verified zero-waste supply lines for fast-growing ${bizIndustry} brands.`,
          problem: "D2C brands face highly fragmented green supply chains, manual vetting processes, and inflated shipping costs.",
          solution: "A central SaaS marketplace offering certified supplier matching, MOQ aggregation, and automated carbon-neutral logistics tracking.",
          segments: [
            "Emerging Shopify D2C brands (Revenue $100k - $2M)",
            "Sustainable cosmetics and organic food retailers",
            "Eco-friendly packaging wholesalers needing digital distribution"
          ],
          market: {
            tam: "$52 Billion (Global green packaging)",
            sam: "$18.4 Billion (E-commerce packaging)",
            som: "$1.2 Billion (Target niche SaaS GMV)"
          }
        });
        setIsAnalyzing(false);
      }
    }, 800);
  };

  // Mentor Match Handler
  const startMentorMatch = () => {
    setIsMatching(true);
    setMatchingResult(false);
    const steps = [
      "Analyzing startup domain...",
      "Checking mentor availability calendars...",
      "Cross-referencing domain expertise tags...",
      "Finalizing top matches..."
    ];

    let i = 0;
    setMatchingProgress(steps[0]);
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setMatchingProgress(steps[i]);
      } else {
        clearInterval(interval);
        setIsMatching(false);
        setMatchingResult(true);
      }
    }, 800);
  };

  // Pitch Deck Slide Data
  const slides = [
    {
      title: "1. The Vision",
      content: `${bizName} is pioneering sustainable e-commerce distribution. We connect eco-conscious brands with certified zero-waste manufacturers under a unified checkout experience.`,
      highlight: "SaaS-Enabled Green Supply Chains"
    },
    {
      title: "2. The Problem",
      content: "Brands spend weeks manual-vetting packaging suppliers, pay 40% markup for green materials, and lack clear environmental carbon-offset tracking mechanisms.",
      highlight: "Fragmented Sourcing & High Markups"
    },
    {
      title: "3. The Solution",
      content: "An automated sourcing system that matches packaging requirements with checked manufacturers. Includes automatic shipping carbon calculators and certification ledgers.",
      highlight: "Unified checkout & ESG validation"
    },
    {
      title: "4. Market Sizing",
      content: "Total Addressable Market (TAM) is $52B. Serviceable Addressable Market (SAM) is $18.4B. Our 3-year Serviceable Obtainable Market (SOM) is $1.2B.",
      highlight: "Expanding 15% CAGR sustainable market"
    },
    {
      title: "5. Core Technology",
      content: "Automated MOQ matching engine, carbon tracking API widget for shop checkouts, and a secure ledger keeping track of vendor recycling credentials.",
      highlight: "Proprietary matching & ESG logging APIs"
    },
    {
      title: "6. Business Model",
      content: "Dual revenue model: 10% transaction fee paid by buyers, plus a tiered subscription software fee ($79/mo) paid by suppliers for advanced shipping carbon logs.",
      highlight: "High-Margin SaaS + Marketplace Fee"
    },
    {
      title: "7. Competitive Landscape",
      content: "EcoPackage Hub sits at high automation & high sustainability verification compared to traditional packaging wholesalers who operate manual portals.",
      highlight: "Automated Vetting Edge"
    },
    {
      title: "8. Go-To-Market",
      content: "Inbound integration listings on Shopify/WooCommerce App store, B2B direct outbound emails targeting eco-conscious startups, and industry packaging show partnerships.",
      highlight: "Product-Led Growth Loops"
    },
    {
      title: "9. Traction & Roadmap",
      content: "Over $120k GMV processed during closed-beta. 45 vendors fully onboarded. Targeting public launch in Q4 with automated API integrations.",
      highlight: "Accelerated Beta Velocity"
    },
    {
      title: "10. The Ask",
      content: "Seeking $1.5M Seed funding. Proceeds will support product design (45%), engineer hiring (35%), and sales outbound campaigns (20%).",
      highlight: "$1.5M Seed Round • 18 Months Runway"
    }
  ];

  // Startup Readiness Calculator
  const checklistItems = [
    { text: "Clear Problem & Solution Defined", points: 15 },
    { text: "Vetted Supplier Database Integrated", points: 15 },
    { text: "Customer Acquisition Cost < Lifetime Value", points: 15 },
    { text: "Functional Prototype / MVP Complete", points: 15 },
    { text: "Incorporated Sustainable Materials Vetting", points: 15 },
    { text: "Secured First 5 Paid Beta Clients", points: 15 },
    { text: "Secured Intellectual Property / Patent Filing", points: 10 }
  ];

  const currentReadinessScore = checkedItems.reduce((acc, curr) => acc + checklistItems[curr].points, 0);

  const toggleChecklistItem = (index: number) => {
    if (checkedItems.includes(index)) {
      setCheckedItems(checkedItems.filter(i => i !== index));
    } else {
      setCheckedItems([...checkedItems, index]);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 50) return "text-red-500 border-red-500 bg-red-950/20";
    if (score < 80) return "text-amber-500 border-amber-500 bg-amber-950/20";
    return "text-emerald-500 border-emerald-500 bg-emerald-950/20";
  };

  const getScoreGaugeStyle = (score: number) => {
    if (score < 50) return "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
    if (score < 80) return "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]";
    return "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]";
  };

  const mentors = [
    {
      name: "Dr. Sarah Jenkins",
      role: "Ex-VP of Sustainability at Patagonia",
      match: "98% Match",
      bio: "15+ years materials engineering. Specialized in biological polymers and retail product lifecycles.",
      skills: ["Bio-Materials", "B2B Scaling", "Patagonia Framework"]
    },
    {
      name: "Rajeev Mehta",
      role: "Founder of CleanChain (YC Alum)",
      match: "94% Match",
      bio: "Serial supply chain entrepreneur. Raised $12M from Tier 1 VCs. Expert in MOQ marketplaces.",
      skills: ["Seed Fundraising", "Marketplace Economics", "SaaS Scale"]
    },
    {
      name: "Elena Rostova",
      role: "Former Head of Logistics at Packhelp",
      match: "91% Match",
      bio: "Fulfillment automation specialist. Expert in European logistics lanes and packaging procurement.",
      skills: ["Logistics Automation", "Supplier Negotiation", "EU Policy"]
    }
  ];

  const handleCardClick = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedFeature === index) {
      setSelectedFeature(null);
      return;
    }
    setSelectedFeature(index);
    if (index === 4 && !matchingResult && !isMatching) {
      setConnectedMentors([]);
      setMatchingResult(false);
    }
    setTimeout(() => {
      const el = document.getElementById('simulator-static-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const renderModalContent = () => {
    if (selectedFeature === null) return null;

    switch (selectedFeature) {
      case 0: // AI Business Analysis
        return (
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="text-amber-400 animate-pulse" size={24} /> AI Business Analysis Simulator
            </h4>
            <p className="text-slate-400 text-sm">
              Input your startup profile parameters below. Our model will synthesize market data, draft customer personas, and compute addressable market sizes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Startup Name</label>
                  <input 
                    type="text" 
                    value={bizName} 
                    onChange={e => setBizName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Industry / Domain</label>
                  <input 
                    type="text" 
                    value={bizIndustry} 
                    onChange={e => setBizIndustry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Short Idea Concept</label>
                <textarea 
                  value={bizDesc} 
                  onChange={e => setBizDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); runAIAnalysis(); }}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-gradient-to-r from-amber-550 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>Generate AI Analysis</span>
                  </>
                )}
              </button>
            </div>

            {isAnalyzing && (
              <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl text-center space-y-3">
                <RefreshCw size={28} className="animate-spin text-amber-500 mx-auto" />
                <p className="text-amber-500 font-bold text-sm">{analysisProgress}</p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="bg-amber-950/20 border border-amber-900/30 p-5 rounded-2xl">
                  <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md tracking-wider mb-2 inline-block">AI Value Proposition</span>
                  <p className="text-white text-sm font-semibold leading-relaxed">{analysisResult.valueProp}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs font-bold text-red-400 block mb-2">Core Customer Pain Point</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{analysisResult.problem}</p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 block mb-2">Platform AI Solution</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{analysisResult.solution}</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wider">Identified Target Customer Segments</span>
                  <ul className="space-y-2">
                    {analysisResult.segments.map((seg: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{seg}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wider">Market Size Modeling (TAM / SAM / SOM)</span>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">TAM</div>
                      <div className="text-sm font-black text-white">{analysisResult.market.tam}</div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">SAM</div>
                      <div className="text-sm font-black text-white">{analysisResult.market.sam}</div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">SOM</div>
                      <div className="text-sm font-black text-white">{analysisResult.market.som}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 1: // SWOT Analysis
        return (
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Target className="text-purple-400 animate-bounce" size={24} /> Strategic SWOT Matrix Sandbox
            </h4>
            <p className="text-slate-400 text-sm">
              Dynamically add or modify strategic vectors. Our internal analyzer balances internal strengths against market threats.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-900/30 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Strengths (Internal)
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-black px-2 py-0.5 rounded">HELPFUL</span>
                </div>
                <ul className="space-y-2.5 min-h-[120px]">
                  {swotStrengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex justify-between items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                      <span className="leading-relaxed">{str}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); removeSwotItem('S', idx); }} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add strength..." 
                    value={swotInput.S}
                    onChange={e => setSwotInput({ ...swotInput, S: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSwotItem('S'); } }}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button type="button" onClick={(e) => { e.preventDefault(); addSwotItem('S'); }} className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer">
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Weaknesses */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-red-900/30 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    Weaknesses (Internal)
                  </span>
                  <span className="text-[10px] bg-red-500/10 text-red-300 font-black px-2 py-0.5 rounded">HARMFUL</span>
                </div>
                <ul className="space-y-2.5 min-h-[120px]">
                  {swotWeaknesses.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex justify-between items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 hover:border-red-500/30 transition-colors">
                      <span className="leading-relaxed">{str}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); removeSwotItem('W', idx); }} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add weakness..." 
                    value={swotInput.W}
                    onChange={e => setSwotInput({ ...swotInput, W: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSwotItem('W'); } }}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button type="button" onClick={(e) => { e.preventDefault(); addSwotItem('W'); }} className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer">
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Opportunities */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-blue-900/30 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    Opportunities (External)
                  </span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 font-black px-2 py-0.5 rounded">HELPFUL</span>
                </div>
                <ul className="space-y-2.5 min-h-[120px]">
                  {swotOpportunities.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex justify-between items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 hover:border-blue-500/30 transition-colors">
                      <span className="leading-relaxed">{str}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); removeSwotItem('O', idx); }} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add opportunity..." 
                    value={swotInput.O}
                    onChange={e => setSwotInput({ ...swotInput, O: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSwotItem('O'); } }}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button type="button" onClick={(e) => { e.preventDefault(); addSwotItem('O'); }} className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer">
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Threats */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-orange-900/30 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-sm font-bold text-orange-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                    Threats (External)
                  </span>
                  <span className="text-[10px] bg-orange-500/10 text-orange-300 font-black px-2 py-0.5 rounded">HARMFUL</span>
                </div>
                <ul className="space-y-2.5 min-h-[120px]">
                  {swotThreats.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex justify-between items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 hover:border-orange-500/30 transition-colors">
                      <span className="leading-relaxed">{str}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); removeSwotItem('T', idx); }} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add threat..." 
                    value={swotInput.T}
                    onChange={e => setSwotInput({ ...swotInput, T: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSwotItem('T'); } }}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button type="button" onClick={(e) => { e.preventDefault(); addSwotItem('T'); }} className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer">
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Financial Forecasting
        const year1Rev = Math.round(aov * 10 * 12 * 1.2);
        const year2Rev = Math.round(year1Rev * (1 + growth / 100 * 2.5));
        const year3Rev = Math.round(year2Rev * (1 + growth / 100 * 2));
        const arr = year3Rev;
        const netProfit = Math.round(arr * (margin / 100));

        return (
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="text-emerald-400 animate-pulse" size={24} /> Financial Unit Economics & Projections
            </h4>
            <p className="text-slate-400 text-sm">
              Adjust key revenue inputs to dynamically recalculate 3-year projections, margins, and projected Run-rate ARR.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400">Average Order Value (AOV)</span>
                    <span className="text-emerald-400 font-mono">₹{aov}</span>
                  </div>
                  <input 
                    type="range" 
                    min={100} 
                    max={10000} 
                    step={100} 
                    value={aov} 
                    onChange={e => setAov(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400">Monthly Growth Rate</span>
                    <span className="text-emerald-400 font-mono">{growth}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={50} 
                    value={growth} 
                    onChange={e => setGrowth(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400">Gross Profit Margin</span>
                    <span className="text-emerald-400 font-mono">{margin}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={10} 
                    max={95} 
                    value={margin} 
                    onChange={e => setMargin(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Year 1 Projected Revenue</span>
                  <div className="text-xl font-black text-white mt-2">₹{year1Rev.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-emerald-400 font-bold mt-2">Initial Launch Phase</span>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Year 2 Revenue (Scale)</span>
                  <div className="text-xl font-black text-white mt-2">₹{year2Rev.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-emerald-400 font-bold mt-2">Expansion Phase</span>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Year 3 ARR Target</span>
                  <div className="text-xl font-black text-emerald-400 mt-2">₹{year3Rev.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-emerald-400 font-bold mt-2">Est. Net Profit: ₹{netProfit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Investor Pitch Deck
        return (
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Presentation className="text-blue-400 animate-pulse" size={24} /> Interactive 10-Slide Investor Deck
            </h4>
            <p className="text-slate-400 text-sm">
              Preview and click through your automatically configured pitch deck. Highlight core parameters and demonstrate investor presentation flow.
            </p>

            <div className="flex flex-col lg:flex-row gap-5">
              {/* Slide Navigator List */}
              <div className="lg:w-1/3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-thin">
                {slides.map((slide, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={(e) => { e.preventDefault(); setActiveSlide(idx); }}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center justify-between gap-2 border cursor-pointer ${
                      activeSlide === idx 
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-md shadow-blue-500/5' 
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{slide.title.substring(3)}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeSlide === idx ? 'bg-blue-450 animate-ping' : 'bg-slate-700'}`}></span>
                  </button>
                ))}
              </div>

              {/* Active Slide Canvas */}
              <div className="flex-grow bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between min-h-[250px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl"></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-blue-500/10 text-blue-300 font-black px-2.5 py-1 rounded tracking-wider uppercase border border-blue-500/20">Slide {activeSlide + 1} of 10</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{bizName} Pitch Book</span>
                  </div>
                  <h5 className="text-lg font-black text-white">{slides[activeSlide].title}</h5>
                  <p className="text-slate-300 text-sm leading-relaxed">{slides[activeSlide].content}</p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-900 pt-4 mt-6">
                  <span className="text-xs text-blue-400 font-bold bg-blue-500/5 border border-blue-500/10 px-3 py-1.5 rounded-lg">
                    Focus: {slides[activeSlide].highlight}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setActiveSlide(prev => Math.max(prev - 1, 0)); }}
                      disabled={activeSlide === 0}
                      className="p-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg border border-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setActiveSlide(prev => Math.min(prev + 1, slides.length - 1)); }}
                      disabled={activeSlide === slides.length - 1}
                      className="p-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg border border-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Mentor Matching
        return (
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Users className="text-pink-400 animate-pulse" size={24} /> AI Mentor Matching Sandbox
            </h4>
            <p className="text-slate-400 text-sm">
              Cross-reference your startup requirements with our expert registrar database. Run the compiler below to review highly matching startup mentors.
            </p>

            {!matchingResult && !isMatching && (
              <div className="bg-slate-950 p-8 text-center rounded-2xl border border-slate-850 space-y-4">
                <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Users size={26} />
                </div>
                <h5 className="text-base font-bold text-white">Registry Ready for Scanning</h5>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">Click below to parse matching matrices with Patagonia leaders, YC founders, and logistics executives.</p>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); startMentorMatch(); }}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 text-sm cursor-pointer"
                >
                  Find Matching Mentors
                </button>
              </div>
            )}

            {isMatching && (
              <div className="bg-slate-950 p-8 text-center rounded-2xl border border-slate-850 space-y-3">
                <RefreshCw size={24} className="animate-spin text-pink-500 mx-auto" />
                <p className="text-pink-500 font-bold text-xs">{matchingProgress}</p>
              </div>
            )}

            {matchingResult && !isMatching && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">AI RECOMMENDED MATCHES (3 FOUND)</span>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); startMentorMatch(); }}
                    className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} /> Rescan Database
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mentors.map((mentor, index) => {
                    const isConnected = connectedMentors.includes(index);
                    return (
                      <div key={index} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded">{mentor.match}</span>
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500 font-bold">ONLINE</span>
                            </div>
                          </div>
                          <h5 className="font-black text-white text-sm">{mentor.name}</h5>
                          <div className="text-[11px] text-slate-400 font-medium">{mentor.role}</div>
                          <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3">{mentor.bio}</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {mentor.skills.map((s, idx) => (
                              <span key={idx} className="text-[8px] bg-slate-900 text-slate-400 border border-slate-805 px-1.5 py-0.5 rounded font-bold">{s}</span>
                            ))}
                          </div>
                          
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (isConnected) return;
                              setConnectedMentors([...connectedMentors, index]);
                            }}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isConnected 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' 
                                : 'bg-pink-550 hover:bg-pink-600 text-white shadow-md'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <Check size={12} />
                                <span>Request Sent</span>
                              </>
                            ) : (
                              <>
                                <Calendar size={12} />
                                <span>Connect with Mentor</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Startup Readiness Score
        const displayRecommendation = () => {
          if (currentReadinessScore < 50) {
            return (
              <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
                <AlertTriangle className="shrink-0 text-red-400" size={16} />
                <span><strong>High Sourcing Risk:</strong> Focus on refining your target customer demographics and defining the basic solution parameters.</span>
              </div>
            );
          }
          if (currentReadinessScore < 80) {
            return (
              <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <Info className="shrink-0 text-amber-400" size={16} />
                <span><strong>Solid Foundation:</strong> Focus on building out your core supplier API matching and testing pricing models with early beta signups.</span>
              </div>
            );
          }
          return (
            <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
              <ShieldCheck className="shrink-0 text-emerald-400" size={16} />
              <span><strong>VC Pitch Deck Ready:</strong> Your metrics indicate high operational readiness. You are in a strong position to pitch pre-seed and seed funds!</span>
            </div>
          );
        };

        return (
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="text-orange-405 animate-pulse" size={24} /> Interactive Readiness Score Gauge
            </h4>
            <p className="text-slate-400 text-sm">
              Toggle checklist requirements to watch the score calculate in real-time. Score criteria are weighted based on validation, tech feasibility, and team.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              
              {/* Dial Score Gauge */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3 border-r border-slate-800/50">
                <div className={`w-32 h-32 rounded-full border-[10px] flex flex-col items-center justify-center transition-all duration-355 ${getScoreGaugeStyle(currentReadinessScore)}`}>
                  <span className="text-3xl font-black text-white">{currentReadinessScore}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Score</span>
                </div>
                <div className={`mt-3 text-xs font-black uppercase px-2.5 py-1 rounded-md border ${getScoreColor(currentReadinessScore)}`}>
                  {currentReadinessScore < 50 ? 'Risky Phase' : currentReadinessScore < 80 ? 'Vetted Phase' : 'Funding Phase'}
                </div>
              </div>

              {/* Checklist */}
              <div className="md:col-span-8 space-y-3">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">Checklist Progress (Click items to toggle)</span>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {checklistItems.map((item, idx) => {
                    const isChecked = checkedItems.includes(idx);
                    return (
                      <button 
                        key={idx}
                        type="button"
                        onClick={(e) => { e.preventDefault(); toggleChecklistItem(idx); }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-slate-905 border-orange-500/20 text-white' 
                            : 'bg-slate-905/40 border-slate-850 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            isChecked ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-700 bg-slate-900'
                          }`}>
                            {isChecked && <Check size={11} />}
                          </span>
                          <span className={isChecked ? '' : 'line-through decoration-slate-800'}>{item.text}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${isChecked ? 'text-orange-400' : 'text-slate-600'}`}>+{item.points} pts</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {displayRecommendation()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="features" className="py-24 bg-[#F8FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[#5B21B6] font-bold tracking-wide uppercase text-sm mb-3">Core Features</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
            Everything you need to build from <span className="text-[#7C3AED]">idea to funding</span>
          </h3>
          <p className="text-[#6B7280] text-lg">
            Six powerful AI tools — each with an interactive simulator. Click any card to try it live on the page.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const isSelected = selectedFeature === index;
            return (
              <button 
                key={index} 
                type="button"
                onClick={(e) => handleCardClick(index, e)}
                className={`text-left bg-white border-2 hover:shadow-lg hover:-translate-y-1 rounded-2xl p-8 transition-all duration-300 group flex flex-col justify-between h-full cursor-pointer relative select-none ${
                  isSelected ? 'ring-4 ring-purple-500/20 shadow-xl' : ''
                }`}
                style={{ borderColor: isSelected ? feature.themeColor : `${feature.themeColor}30` }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = `${feature.themeColor}80`; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = `${feature.themeColor}30`; }}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl border shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${feature.themeColor}15`, borderColor: `${feature.themeColor}30` }}
                    >
                      {feature.icon}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white bg-[#5B21B6] shadow-sm animate-pulse">
                        Active Simulator
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-[#1F2937] mb-3">{feature.title}</h4>
                  <p className="text-[#6B7280] leading-relaxed text-sm mb-6">
                    {feature.description}
                  </p>
                </div>
                <div 
                  className="flex items-center justify-between text-xs font-bold transition-colors mt-auto pt-2 border-t"
                  style={{ color: feature.themeColor, borderColor: `${feature.themeColor}20` }}
                >
                  <span>{isSelected ? 'Hide Simulator' : 'Try Simulator'}</span>
                  <ChevronRight size={14} className={`transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Inline Static Interactive Simulator Panel */}
        {selectedFeature !== null && (
          <div id="simulator-static-panel" className="mt-12 bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-10 text-white shadow-2xl animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white border shadow-md"
                  style={{ backgroundColor: `${features[selectedFeature].themeColor}20`, borderColor: `${features[selectedFeature].themeColor}40` }}
                >
                  {features[selectedFeature].icon}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-md">
                    {features[selectedFeature].badge} • Live Interactive Simulator
                  </span>
                  <h3 className="text-2xl font-black text-white mt-0.5">{features[selectedFeature].title}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedFeature(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X size={14} /> Close Simulator
              </button>
            </div>

            {renderModalContent()}
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;
