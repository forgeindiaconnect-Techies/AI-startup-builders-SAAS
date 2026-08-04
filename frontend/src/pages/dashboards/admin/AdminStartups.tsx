import React, { useState } from 'react';
import { Search, MoreVertical, Building2, X, ArrowLeft, FileText, Eye, Trash2, IndianRupee, Download } from 'lucide-react';
import SharedStartupDetailsTabs from '../../../components/shared/SharedStartupDetailsTabs';
import { useFunding } from '../../../context/FundingContext';
import type { FundingOffer } from '../../../context/FundingContext';
import { getDocuments } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const AdminStartups: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [startups, setStartups] = React.useState<any[]>([]);
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [selectedStartup, setSelectedStartup] = React.useState<any>(null);
  const [viewMode, setViewMode] = useState<'details' | 'documents' | 'funding'>('details');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const { getStartupOffers, markAsFunded, updateOfferAdminNote, verifyOffer } = useFunding();
  const startupOffers = selectedStartup ? getStartupOffers(selectedStartup.startupId, selectedStartup.startupName) : [];

  
  // Details Modal State
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<FundingOffer | null>(null);
  const [editableNote, setEditableNote] = useState('');

  const handleDelete = (startupId: string) => {
    if (window.confirm('Are you sure you want to delete this startup completely?')) {
      localStorage.removeItem(`startup_${startupId}`);
      localStorage.removeItem(startupId);
      localStorage.removeItem(startupId.replace(/^startup_/, ''));

      try {
        const rawStartups = localStorage.getItem('ai_startup_builder_startups');
        if (rawStartups) {
          let parsed = JSON.parse(rawStartups);
          parsed = parsed.filter((s: any) => s.startupId !== startupId && s.id !== startupId && `startup_${s.id}` !== startupId);
          localStorage.setItem('ai_startup_builder_startups', JSON.stringify(parsed));
        }
      } catch (e) {}

      try {
        const rawFunding = localStorage.getItem('ai_startup_builder_funding_offers');
        if (rawFunding) {
          let parsed = JSON.parse(rawFunding);
          parsed = parsed.filter((o: any) => o.startupId !== startupId);
          localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(parsed));
        }
      } catch (e) {}

      try {
        const rawPortfolio = localStorage.getItem('ai_startup_builder_portfolio');
        if (rawPortfolio) {
          let parsed = JSON.parse(rawPortfolio);
          parsed = parsed.filter((p: any) => p.startupId !== startupId);
          localStorage.setItem('ai_startup_builder_portfolio', JSON.stringify(parsed));
        }
      } catch (e) {}

      setStartups(prev => prev.filter(s => s.startupId !== startupId && s.id !== startupId && `startup_${s.id}` !== startupId));
      if (selectedStartup?.startupId === startupId || selectedStartup?.id === startupId) {
        setSelectedStartup(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (startups.length === 0) {
      window.alert("No startups data available to export.");
      return;
    }
    const headers = ["Startup ID", "Startup Name", "Founder ID", "Business Model", "Status", "Created Date"];
    const rows = startups.map(s => [
      s.startupId || s.id,
      s.startupName,
      s.founderId || '',
      s.aiGenerated?.ideaAnalysis?.businessModel || 'Tech',
      s.status,
      new Date(s.createdAt || Date.now()).toLocaleDateString()
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `platform_startups_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async (name: string, format?: string) => {
    const finalFormat = format ? format.toLowerCase() : name.split('.').pop()?.toLowerCase() || 'txt';
    const baseName = name.replace(/\.[^/.]+$/, "");
    const finalName = `${baseName}.${finalFormat}`;
    
    try {
      if (finalFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(`Startup Document: ${baseName.replace(/_/g, ' ')}`, 20, 20);
        doc.setFontSize(12);
        doc.text("This is an automatically generated document by AI Startup Builder.", 20, 30);
        doc.text("Contains full strategic planning, market analysis, and AI roadmap.", 20, 40);
        doc.save(finalName);
      } else if (finalFormat === 'word' || finalFormat === 'docx' || finalFormat === 'doc') {
        const docx = new DocxDocument({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Startup Document: ${baseName.replace(/_/g, ' ')}`, bold: true, size: 28 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "This is an automatically generated document by AI Startup Builder.", size: 24 }),
                ],
              }),
            ],
          }],
        });
        const blob = await Packer.toBlob(docx);
        saveAs(blob, `${baseName}.docx`);
      } else if (finalFormat === 'zip') {
        const zip = new JSZip();
        zip.file("readme.txt", "This ZIP contains the startup package documents.");
        zip.file(`${baseName}.txt`, `Startup Document: ${baseName.replace(/_/g, ' ')}\nThis is an automatically generated document.`);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, finalName);
      } else {
        const content = `Mock content for ${finalName}`;
        const blob = new Blob([content], { type: 'text/plain' });
        saveAs(blob, finalName);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      window.alert(`Failed to generate ${finalFormat.toUpperCase()} file.`);
    }
  };

  React.useEffect(() => {
    let keys = Object.keys(localStorage);
    let locals: any[] = [];
    keys.forEach(key => {
      if (key.startsWith('startup_')) {
        try {
          locals.push(JSON.parse(localStorage.getItem(key) || ''));
        } catch (e) {}
      }
    });

    if (locals.length === 0) {
      const mockStartups = [
        {
          id: 'startup_mock_1',
          startupId: 'startup_mock_1',
          founderId: 'founder_renu',
          startupName: 'GreenCup Cafe',
          startupIdea: 'A premium, aesthetic cafe offering specialty coffee, organic tea, and healthy snacks with a sustainable, zero-waste operation model.',
          status: 'generated',
          approvalStatus: 'approved',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          aiGenerated: {
            ideaAnalysis: {
              refinedIdea: 'GreenCup Cafe is a premium local specialty coffee and organic tea venue focusing on sustainability, zero-waste packaging, and community networking spaces.',
              problemStatement: 'Modern urban professionals lack premium, eco-friendly spaces that combine high-quality daily beverages with functional, productive work environments.',
              solution: 'A highly aesthetic workspace-cafe hybrid using 100% biodegradable packaging, serving organic, locally-sourced beverages and healthy curated snacks.',
              targetCustomers: ['Remote workers & freelancers', 'Eco-conscious consumers', 'Coffee connoisseurs', 'Local students'],
              uniqueValueProposition: 'Combining sustainable zero-waste daily consumption with a premium, design-forward community hub.',
              businessModel: 'Direct-to-Consumer (DTC) Retail & Subscriptions',
              revenueModel: 'Walk-in retail sales, workspace desk subscription passes, coffee bean retail, and catering events.',
              coreFeatures: ['Zero-waste serving bar', 'High-speed internet work desks', 'Curated organic menu', 'Loyalty App & subscription'],
              marketOpportunity: 'Surging demand for remote work hubs and eco-friendly premium dining spaces.',
              nextSteps: ['Finalize prime street-corner lease', 'Onboard organic coffee cooperative suppliers', 'Complete sustainable interior buildout']
            },
            branding: {
              brandNameSuggestions: ['GreenCup Cafe', 'Leaf & Bean', 'SustainBrew', 'EcoCup'],
              taglineSuggestions: ['Sip Sustainably.', 'Your Daily Green Escape.', 'Brewed for You and the Planet.'],
              logoConceptIdeas: 'A clean, green leaf sprouting from a minimalist coffee cup logo.',
              logoPrompt: 'Create a modern, minimal, premium logo for GreenCup Cafe featuring a green leaf and coffee cup.',
              logoStyle: 'Minimalist Eco-friendly',
              brandColorPalette: ['#1B4332 (Forest Green)', '#D8F3DC (Sage)', '#FFFFFF (Pure White)', '#000000 (Jet Black)'],
              fontStyleSuggestions: 'Playfair Display & Inter',
              brandPersonality: 'Warm, eco-conscious, aesthetic, reliable.',
              packagingStyleSuggestions: 'Unbleached kraft paper cups with water-based soy ink print logos.',
              socialMediaIdeas: 'Instagram reels showcasing local organic coffee farmers, eco-tips, and aesthetic workspace corners.',
              websiteHero: 'Welcome to GreenCup. Sip premium coffee, save the planet.',
              marketingCaptions: ['Start your morning green. 🌿☕', 'Your workspace, re-imagined.']
            },
            businessPlan: {
              executiveSummary: 'GreenCup Cafe will establish a network of premium, eco-friendly cafe workspaces catering to the modern remote workforce.',
              problemAndSolution: 'Provides high-quality specialty coffee and dedicated workspaces to solve the distraction of home offices and generic coffee shops.',
              productDetails: 'Single-origin specialty coffee, premium loose-leaf organic teas, clean ingredient pastries, and soundproof phone booths.',
              targetCustomers: 'Remote professionals, freelancers, and design-minded urban dwellers.',
              businessModel: 'DTC retail sales combined with a monthly workspace subscription model.',
              pricingStrategy: 'Premium pricing justified by certified organic ingredients and zero-waste sourcing.',
              goToMarketStrategy: 'Local influencer invites, geo-targeted Instagram ads, and free-workspace pre-launch day.',
              operationsPlan: 'Operating 7 AM to 8 PM daily, staffed by professional baristas and a dedicated cafe supervisor.',
              teamRequirement: ['General Manager', 'Head Barista', 'Assistant Barista', 'Part-time Cleaner'],
              financialProjection: 'First year target revenue of $180,000 with break-even by month 6 and a 22% net margin by Year 2.',
              fundingAsk: '$80,000 for equipment purchasing, lease deposits, and initial sustainable packaging inventory.'
            },
            pitchDeck: [
              { slide: 1, title: 'GreenCup Cafe', content: 'Premium Eco-Friendly Workspace Cafe' },
              { slide: 2, title: 'The Problem', content: 'Remote workers lack productive, professional, and sustainable daily environments.' },
              { slide: 3, title: 'The Solution', content: 'A beautiful workspace cafe hybrid operating under a 100% zero-waste model.' },
              { slide: 4, title: 'Market Opportunity', content: '$12B global co-working and specialty coffee market expansion.' },
              { slide: 5, title: 'Product Overview', content: 'Specialty coffee, quiet phone booths, organic menu, loyalty subscription.' },
              { slide: 6, title: 'Business Model', content: 'Retail sales + monthly workspace passes.' },
              { slide: 7, title: 'Competitor Landscape', content: 'Wins against Starbucks on sustainability, and against co-working spaces on cost and beverage quality.' },
              { slide: 8, title: 'Go-To-Market', content: 'Pre-launch workspace days, local SEO, Instagram marketing.' },
              { slide: 9, title: 'Our Team', content: 'Experienced hospitality operations manager and award-winning head barista.' },
              { slide: 10, title: 'The Ask', content: '$80k for space buildout, lease acquisition, and launch marketing.' }
            ],
            marketResearch: {
              tam: '₹25,00,00,000',
              sam: '₹5,00,00,000',
              som: '₹75,00,000',
              customerSegments: ['Remote workers', 'Students', 'Eco-conscious clients'],
              competitorAnalysis: 'Specialty cafes lack remote infrastructure; generic offices lack premium beverages.',
              marketTrends: ['Sustainability focus', 'Workspace convenience', 'Zero-waste dining'],
              opportunities: ['Corporate bulk ordering', 'Branded coffee product retailing'],
              risks: ['Real estate lease price volatility', 'Organic bean sourcing supply issues'],
              pricingSuggestions: 'Coffee: ₹180-280, Workspace Pass: ₹500/day or ₹6000/month.',
              locationSuggestions: 'Urban street-corners, near transit hubs and universities.'
            },
            aiReport: {
              investmentReadinessScore: 89,
              keyStrengths: ['Highly relevant sustainability focus', 'Clear combined revenue channels', 'Strong local community demand'],
              riskFactors: ['Lease overhead costs', 'Sourcing logistics for organic supply chains'],
              improvementSuggestions: ['Pre-sell 50 workspace memberships before opening', 'Establish long-term raw supply contracts'],
              scalabilityScore: 78,
              fundingReadiness: 'High readiness for local angel funding and small business setup grants.',
              mentorReviewSummary: 'GreenCup Cafe is a highly viable local business concept. Sourcing and lease terms will define the initial operational success.'
            }
          }
        },
        {
          id: 'startup_mock_2',
          startupId: 'startup_mock_2',
          founderId: 'founder_renu',
          startupName: 'SyncAI Tasks',
          startupIdea: 'An AI-powered task manager and workflow automation tool for teams, automatically generating follow-ups and synchronizing action items across Slack, email, and calendars.',
          status: 'generated',
          approvalStatus: 'approved',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          aiGenerated: {
            ideaAnalysis: {
              refinedIdea: 'SyncAI Tasks is a smart productivity SaaS platform that uses LLMs to automatically extract, assign, and track action items from team chat, email, and meetings.',
              problemStatement: 'Modern teams lose 30% of their productivity trying to manually log, update, and track tasks across fragmented tools.',
              solution: 'An AI productivity layer that integrates into Slack, Gmail, and Zoom to automatically populate and manage a centralized task board.',
              targetCustomers: ['Fast-growing tech startups', 'Remote agencies', 'Product management teams', 'Freelancers'],
              uniqueValueProposition: 'Zero manual data entry task management. Let AI capture the action items so you can focus on execution.',
              businessModel: 'B2B Software-as-a-Service (SaaS)',
              revenueModel: 'Per-seat monthly subscription ($12/user/month), Enterprise custom security plans.',
              coreFeatures: ['Slack/Teams auto-extractor', 'AI meeting transcription to tasks', 'Self-updating Kanban board', 'Smart automated email follow-ups'],
              marketOpportunity: 'Accelerating transition to remote/hybrid work and widespread adoption of enterprise AI productivity tools.',
              nextSteps: ['Complete Slack App directory certification', 'Launch public beta on Product Hunt', 'Secure SOC2 security compliance certification']
            },
            branding: {
              brandNameSuggestions: ['SyncAI Tasks', 'FlowState AI', 'NexusTask', 'AutoDone'],
              taglineSuggestions: ['Zero Entry. Infinite Productivity.', 'Work, Done Automatically.', 'The AI Project Manager for Modern Teams.'],
              logoConceptIdeas: 'A modern, geometric infinity loop logo with a clean checkmark integrated inside.',
              logoPrompt: 'Create a clean, futuristic indigo tech logo for SyncAI Tasks containing an infinity checkmark icon.',
              logoStyle: 'Modern Tech Geometric',
              brandColorPalette: ['#4F46E5 (Indigo)', '#1E1B4B (Deep Navy)', '#F3F4F6 (Ice White)', '#10B981 (Success Green)'],
              fontStyleSuggestions: 'Inter & Roboto Mono',
              brandPersonality: 'Innovative, professional, efficient, futuristic.',
              packagingStyleSuggestions: 'Sleek dark-mode dashboard UI with glassmorphic cards and glowing neon indigo gradients.',
              socialMediaIdeas: 'LinkedIn video walk-throughs of AI task extraction from chaotic Slack chats.',
              websiteHero: 'SyncAI Tasks - Let AI manage your projects.',
              marketingCaptions: ['Work smart. Let AI write your to-do lists. ⚡', 'Connect Slack, Gmail, and Zoom instantly.']
            },
            businessPlan: {
              executiveSummary: 'SyncAI Tasks is a next-generation task automation SaaS targeting the $18B project management software market.',
              problemAndSolution: 'Solves the fragmentation and manual overhead of tools like Jira/Asana using modern context-aware AI integrations.',
              productDetails: 'Cloud-based dashboard with real-time Slack/Zoom integrations, web hooks, automated dashboard sync, and native reminders.',
              targetCustomers: 'High-growth teams and technology organizations with extensive remote communications.',
              businessModel: 'Product-Led Growth (PLG) freemium SaaS model with corporate licensing.',
              pricingStrategy: 'Competitive seat-based pricing with a value-driven free tier for small teams.',
              goToMarketStrategy: 'Product Hunt launch, tech newsletters, organic SEO developer guides, and inbound marketing.',
              operationsPlan: 'Fully remote engineering and support teams, hosted on AWS with automated scalability.',
              teamRequirement: ['Co-founder & CTO', 'Co-founder & CEO (Growth)', 'Senior Fullstack Engineer', 'UI/UX Designer'],
              financialProjection: 'Targeting $500,000 ARR in Year 1 with an 85% gross margin, scaling to $2.5M ARR by Year 3.',
              fundingAsk: '$300,000 Seed round for product development, server infrastructure, and compliance certification.'
            },
            pitchDeck: [
              { slide: 1, title: 'SyncAI Tasks', content: 'AI-Powered Autonomous Project Management' },
              { slide: 2, title: 'The Problem', content: 'Modern employees spend 40% of their day organizing work instead of actually working.' },
              { slide: 3, title: 'The Solution', content: 'An autonomous task manager that extracts action items directly from team conversations.' },
              { slide: 4, title: 'Market Size', content: '$18B+ Project Management software market with a 15% CAGR.' },
              { slide: 5, title: 'The Product', content: 'Auto-syncing board, Slack app integration, smart follow-up assistant.' },
              { slide: 6, title: 'Business Model', content: '$12 per user/month premium SaaS subscription.' },
              { slide: 7, title: 'Traction', content: '1,200 waitlisted companies, 5 active pilot teams.' },
              { slide: 8, title: 'Competitive Advantage', content: 'Asana/Jira require manual inputs; SyncAI does it automatically via conversation parsing.' },
              { slide: 9, title: 'Team', content: 'Ex-FAANG senior engineers and repeat SaaS founders.' },
              { slide: 10, title: 'The Ask', content: '$300,000 pre-seed for 18 months of runway.' }
            ],
            marketResearch: {
              tam: '₹1,50,00,00,000',
              sam: '₹30,00,00,000',
              som: '₹2,00,00,000',
              customerSegments: ['Tech Startups', 'Design Agencies', 'Software Development Teams'],
              competitorAnalysis: 'Asana/Jira/Trello (Manual, complex), Zoom/Slack (Communication only). SyncAI bridges the gap.',
              marketTrends: ['Generative AI in SaaS', 'Autonomous agents', 'Unified work communication workspaces'],
              opportunities: ['Direct partnership integrations', 'White-labeled enterprise task hubs'],
              risks: ['Data privacy/security compliance concerns', 'API dependency on Slack/Zoom'],
              pricingSuggestions: 'Free for up to 5 seats; Pro: $12/user/month; Enterprise: custom.',
              locationSuggestions: 'Global SaaS delivery, cloud-hosted.'
            },
            aiReport: {
              investmentReadinessScore: 92,
              keyStrengths: ['Extremely scalable software architecture', 'Clear competitive edge via LLM automation', 'High willingness to pay in B2B market'],
              riskFactors: ['Customer churn if integrations break', 'Data security compliance barriers'],
              improvementSuggestions: ['Obtain SOC2 Type 1 certification early', 'Focus heavily on onboarding simplicity to drive viral growth'],
              scalabilityScore: 95,
              fundingReadiness: 'Very high readiness for venture capital and top-tier accelerator programs.',
              mentorReviewSummary: 'Excellent SaaS model. The key to success is building highly reliable integrations and maintaining user trust with data security.'
            }
          }
        }
      ];

      mockStartups.forEach(s => {
        localStorage.setItem(s.id, JSON.stringify(s));
      });
      locals = mockStartups;
    }

    locals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setStartups(locals);

    let docs = getDocuments();
    if (docs.length === 0) {
      const mockDocs = [
        {
          id: 'doc_cat_startup_mock_1_0',
          startupId: 'startup_mock_1',
          founderId: 'founder_renu',
          fileName: 'GreenCup_Cafe_FSSAI_License.pdf',
          fileType: 'PDF',
          fileSize: '1.2 MB',
          category: 'Founder Documents',
          documentType: 'FSSAI Registration / License',
          documentLabel: 'FSSAI License',
          status: 'verified',
          verificationStatus: 'verified',
          sharedWith: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'doc_cat_startup_mock_1_1',
          startupId: 'startup_mock_1',
          founderId: 'founder_renu',
          fileName: 'GreenCup_Cafe_GST_Certificate.pdf',
          fileType: 'PDF',
          fileSize: '850 KB',
          category: 'Founder Documents',
          documentType: 'GST Registration',
          documentLabel: 'GST Certificate',
          status: 'verified',
          verificationStatus: 'verified',
          sharedWith: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'doc_cat_startup_mock_2_0',
          startupId: 'startup_mock_2',
          founderId: 'founder_renu',
          fileName: 'SyncAI_Tasks_Incorporation_Certificate.pdf',
          fileType: 'PDF',
          fileSize: '2.1 MB',
          category: 'Founder Documents',
          documentType: 'Company Incorporation',
          documentLabel: 'Company Incorporation',
          status: 'verified',
          verificationStatus: 'verified',
          sharedWith: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('ai_startup_builder_documents', JSON.stringify(mockDocs));
      docs = mockDocs;
    }
    setDocuments(docs);

    const savedOffers = localStorage.getItem('ai_startup_builder_funding_offers');
    if (!savedOffers || JSON.parse(savedOffers).length === 0) {
      const mockOffers = [
        {
          id: 'offer_mock_1',
          startupId: 'startup_mock_1',
          startupName: 'GreenCup Cafe',
          founderId: 'founder_renu',
          founderName: 'Renu',
          investorId: 'investor_selva',
          investorName: 'Selva',
          investorCompany: 'Impact Ventures',
          investorEmail: 'selva@impactventures.com',
          investorAddress: 'Bangalore, India',
          offerAmount: 50000,
          currency: 'USD',
          equityPercentage: 8,
          valuationCap: 625000,
          instrument: 'SAFE',
          discount: 20,
          expiresInDays: 30,
          investorMessage: 'We love your sustainability model and the community hub approach. Looking forward to backing this!',
          founderResponse: '',
          counterOffer: { amount: null, equityPercentage: null, message: '' },
          adminNote: 'Documents verified by Admin.',
          status: 'offer_received',
          history: [
            {
              action: 'offer_received',
              performedBy: 'Impact Ventures',
              role: 'investor',
              message: 'Submitted investment offer of $50,000 for 8% equity.',
              createdAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(mockOffers));
      window.dispatchEvent(new Event('storage'));
    }
  }, []);

  const getDisplayStatus = (rawStatus: string) => {
    if (rawStatus === 'generated') return 'Active';
    return 'Pending';
  };

  const filtered = startups.filter(s => {
    if (!search.trim()) return statusFilter === 'All Statuses' || getDisplayStatus(s.status) === statusFilter;
    const q = search.toLowerCase();
    const matchFields = [
      s.startupName, s.name, s.startupIdea, s.description,
      s.founderId, s.id, s.startupId,
      s.aiGenerated?.ideaAnalysis?.businessModel
    ];
    const matchesSearch = matchFields.some(f => f && f.toString().toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'All Statuses' || getDisplayStatus(s.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Manage Startups</h1>
      <p className="text-gray-500 mt-1">View, edit, and moderate all startups on the platform.</p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search startups..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" 
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-lg border border-gray-200 text-sm transition-colors shadow-sm"
          >
            <Download size={15} className="mr-2 text-gray-600" /> Export CSV
          </button>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[#5B21B6] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6] font-semibold text-gray-700 cursor-pointer"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-48 min-h-[500px]">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Startup</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Founder</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400 text-sm">No startups match your search or filters.</td>
              </tr>
            ) : (
              filtered.map(s => (
                <tr key={s.startupId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" /> {s.startupName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.founderId || ''}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 line-clamp-1">{s.aiGenerated?.ideaAnalysis?.businessModel || 'Tech'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.status === 'generated' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {s.status === 'generated' ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => { setSelectedStartup(s); setViewMode('details'); }}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye size={14} /> View Details
                      </button>
                      <button 
                        onClick={() => { setSelectedStartup(s); setViewMode('funding'); }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        title="Funding Offers"
                      >
                        <IndianRupee size={14} /> Funding
                      </button>
                      <button 
                        onClick={() => handleDelete(s.startupId || s.id)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        title="Delete Startup"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <div className="inline-block text-left relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(dropdownOpen === s.startupId ? null : s.startupId);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center justify-center text-gray-500"
                          title="More Downloads & Reports"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {dropdownOpen === s.startupId && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[100] animate-fade-in-up text-left">
                            <button 
                              onClick={() => { handleDownload(`${s.startupName.replace(/\s+/g, '_')}_Report`, 'PDF'); setDropdownOpen(null); }} 
                              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                            >
                              Download PDF Report
                            </button>
                            <button 
                              onClick={() => { handleDownload(`${s.startupName.replace(/\s+/g, '_')}_Report`, 'WORD'); setDropdownOpen(null); }} 
                              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                            >
                              Download Word Report
                            </button>
                            <button 
                              onClick={() => { handleDownload(`${s.startupName.replace(/\s+/g, '_')}_Full_Package`, 'ZIP'); setDropdownOpen(null); }} 
                              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                            >
                              Download ZIP Package
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    
    {/* Modal Overlay */}
    {selectedStartup && (
      <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-[95%] lg:w-full max-w-[1200px] max-h-[90vh] flex flex-col rounded-[24px] shadow-xl animate-fade-in-up overflow-hidden">
          <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex items-center gap-4 shrink-0 z-10">
            <button 
              onClick={() => setSelectedStartup(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h2 className="text-[22px] font-bold text-gray-900">
                {viewMode === 'documents' ? 'Startup Documents' : viewMode === 'funding' ? 'Funding Offers' : 'Startup Details'}
              </h2>
              <p className="text-[15px] text-gray-500 mt-1">{selectedStartup.startupName}</p>
            </div>
            <button 
              onClick={() => setSelectedStartup(null)}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            {viewMode === 'details' ? (
              <SharedStartupDetailsTabs startupData={selectedStartup} />
            ) : viewMode === 'funding' ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Funding Offers & Term Sheets</h3>
                {startupOffers.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                    No funding offers have been made to this startup yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {startupOffers.map(offer => (
                      <div key={offer.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${offer.status === 'funded' ? 'bg-green-100 text-green-800' : offer.status === 'accepted' ? 'bg-purple-100 text-purple-800' : offer.status === 'counter_offer' ? 'bg-orange-100 text-orange-800' : offer.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                              {offer.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg">Offer from {offer.investorCompany}</h4>
                          <p className="text-xs text-gray-500 mt-1">Investor: {offer.investorName} • Instrument: {offer.instrument}</p>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-left md:text-right">
                            <p className="text-xl font-black text-gray-900">${offer.offerAmount.toLocaleString()} {offer.currency || 'USD'}</p>
                            <p className="text-xs text-gray-500 font-semibold">{offer.equityPercentage}% Equity</p>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedOfferForDetails(offer);
                              setEditableNote(offer.adminNote || '');
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">All Documents & Exports</h3>
                {documents.filter(d => d.startupId === selectedStartup.startupId).length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                    No documents found for this startup.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {documents.filter(d => d.startupId === selectedStartup.startupId).map((doc: any) => (
                      <div key={doc.id} className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{doc.fileName}</p>
                          <div className="flex gap-3 mt-1.5">
                            <span className="text-xs text-gray-500">{doc.category}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{doc.fileType}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{doc.fileSize}</span>
                          </div>
                          <div className="mt-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${doc.status === 'shared' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {doc.status}
                            </span>
                            {doc.status === 'shared' && doc.sharedWith?.length > 0 && (
                              <span className="text-xs text-gray-500 ml-2">Shared with: {doc.sharedWith.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => window.alert(`Previewing ${doc.fileName}...`)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors">
                            Preview
                          </button>
                          <button onClick={() => window.alert(`Downloading ${doc.fileName}...`)} className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg transition-colors">
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-start">
              <button 
                onClick={() => setSelectedStartup(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors flex items-center"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Startups
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Admin Offer Details Modal */}
      {selectedOfferForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <FileText size={20} className="text-[#5B21B6]" /> Offer details: {selectedOfferForDetails.startupName}
              </h3>
              <button 
                onClick={() => setSelectedOfferForDetails(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Startup Name</p>
                  <p className="font-semibold text-gray-900">{selectedOfferForDetails.startupName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Founder Name</p>
                  <p className="font-semibold text-gray-900">{selectedOfferForDetails.founderName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Investor Name</p>
                  <p className="font-semibold text-gray-900">{selectedOfferForDetails.investorName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Investor Company</p>
                  <p className="font-semibold text-gray-900">{selectedOfferForDetails.investorCompany}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Offer Amount</p>
                  <p className="font-bold text-gray-900">${selectedOfferForDetails.offerAmount.toLocaleString()} {selectedOfferForDetails.currency || 'USD'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Equity %</p>
                  <p className="font-bold text-gray-900">{selectedOfferForDetails.equityPercentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Investment Type</p>
                  <p className="font-bold text-gray-900">{selectedOfferForDetails.instrument}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Valuation Cap</p>
                  <p className="font-bold text-gray-900">${(selectedOfferForDetails.valuationCap / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Expiry Date</p>
                  <p className="font-bold text-gray-900">
                    {new Date(new Date(selectedOfferForDetails.createdAt).getTime() + selectedOfferForDetails.expiresInDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedOfferForDetails.status === 'funded' ? 'bg-green-100 text-green-800' : selectedOfferForDetails.status === 'accepted' ? 'bg-purple-100 text-purple-800' : selectedOfferForDetails.status === 'counter_offer' ? 'bg-orange-100 text-orange-800' : selectedOfferForDetails.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {selectedOfferForDetails.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {selectedOfferForDetails.investorMessage && (
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase mb-1">Investor Message</p>
                  <p className="text-sm text-gray-700 italic">"{selectedOfferForDetails.investorMessage}"</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Offer History & Timeline</p>
                <div className="space-y-4">
                  {selectedOfferForDetails.history.filter((h, index, self) => {
                    if (['accepted', 'funded', 'offer_received', 'rejected'].includes(h.action)) {
                      return index === self.findIndex(t => t.action === h.action);
                    }
                    return index === self.findIndex(t => t.action === h.action && t.createdAt === h.createdAt);
                  }).map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-1.5 bg-gray-200 rounded-full my-1"></div>
                      <div>
                        <p className="font-bold text-gray-800">{h.action.toUpperCase()} <span className="text-gray-400 font-medium text-xs ml-2">{new Date(h.createdAt).toLocaleString()}</span></p>
                        <p className="text-gray-600 mt-0.5">By {h.performedBy} ({h.role}) - {h.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Notes</label>
                <textarea 
                  value={editableNote}
                  onChange={(e) => setEditableNote(e.target.value)}
                  placeholder="Internal audit notes, document check confirmation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
                />
                <button 
                  onClick={() => {
                    updateOfferAdminNote(selectedOfferForDetails.id, editableNote);
                    window.alert("Admin note saved!");
                    // Sync modal state with localstorage changes
                    setSelectedOfferForDetails(prev => prev ? { ...prev, adminNote: editableNote } : null);
                  }}
                  className="mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setSelectedOfferForDetails(null)}
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg transition-colors"
              >
                Close
              </button>
              
              <button 
                onClick={() => {
                  verifyOffer(selectedOfferForDetails.id, "System Admin");
                  if (selectedStartup) {
                    setStartups(prev => prev.map(s => (s.startupId === selectedStartup.startupId || s.startupName === selectedStartup.startupName) ? { ...s, status: 'generated' } : s));
                    setSelectedStartup(prev => prev ? { ...prev, status: 'generated' } : null);
                  }
                  window.alert("Offer verified & startup marked Active! Notifications sent to Investor and Founder dashboards & bell icon.");
                  setSelectedOfferForDetails(null);
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors"
              >
                Verify Offer
              </button>

              {(selectedOfferForDetails.status === 'accepted' || (selectedOfferForDetails.status as string) === 'verified' || selectedOfferForDetails.status === 'offer_received') && (
                <button 
                  onClick={() => {
                    markAsFunded(selectedOfferForDetails.id, editableNote || "Verified by Admin", "System Admin");
                    if (selectedStartup) {
                      setStartups(prev => prev.map(s => (s.startupId === selectedStartup.startupId || s.startupName === selectedStartup.startupName) ? { ...s, status: 'generated' } : s));
                      setSelectedStartup(prev => prev ? { ...prev, status: 'generated' } : null);
                    }
                    window.alert("Offer verified & marked as Funded! Startup is now Active. Notifications sent to Investor and Founder dashboards & bell icon.");
                    setSelectedOfferForDetails(null);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Mark as Funded
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStartups;
