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

  const handleDownload = async (startup: any, format: string) => {
    const cleanName = startup.startupName.replace(/\s+/g, '_');
    const finalFormat = format.toLowerCase();
    const finalName = `${cleanName}_Report.${finalFormat}`;
    
    const ai = startup.aiGenerated || {};
    const idea = ai.ideaAnalysis || {};
    const plan = ai.businessPlan || {};
    const market = ai.marketResearch || {};
    const report = ai.aiReport || {};

    try {
      if (finalFormat === 'pdf') {
        const doc = new jsPDF();
        let y = 20;

        const addTextLine = (text: string, fontSize = 12, isBold = false, color = '#111827') => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          doc.setTextColor(color);
          const lines = doc.splitTextToSize(text, 170);
          lines.forEach((line: string) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
              doc.setFontSize(fontSize);
              doc.setFont('helvetica', isBold ? 'bold' : 'normal');
              doc.setTextColor(color);
            }
            doc.text(line, 20, y);
            y += fontSize * 0.5 + 4;
          });
        };

        addTextLine(`Startup Report: ${startup.startupName}`, 22, true, '#5B21B6');
        y += 6;
        addTextLine(`Concept: ${startup.startupIdea}`, 11, false, '#4B5563');
        y += 10;

        addTextLine('1. AI Idea Analysis', 16, true, '#1E1B4B');
        y += 2;
        addTextLine(`Refined Idea: ${idea.refinedIdea || idea.refinedStartupIdea || 'N/A'}`, 11, false);
        addTextLine(`Problem Statement: ${idea.problemStatement || 'N/A'}`, 11, false);
        addTextLine(`Solution: ${idea.solution || 'N/A'}`, 11, false);
        addTextLine(`Target Customers: ${Array.isArray(idea.targetCustomers) ? idea.targetCustomers.join(', ') : idea.targetCustomers || 'N/A'}`, 11, false);
        addTextLine(`Business Model: ${idea.businessModel || 'N/A'}`, 11, false);
        addTextLine(`Revenue Model: ${idea.revenueModel || 'N/A'}`, 11, false);
        addTextLine(`Core Features: ${Array.isArray(idea.coreFeatures) ? idea.coreFeatures.join(', ') : idea.coreFeatures || 'N/A'}`, 11, false);
        y += 6;

        addTextLine('2. Business Plan', 16, true, '#1E1B4B');
        y += 2;
        addTextLine(`Executive Summary: ${plan.executiveSummary || 'N/A'}`, 11, false);
        addTextLine(`Pricing Strategy: ${plan.pricingStrategy || 'N/A'}`, 11, false);
        addTextLine(`Go-To-Market Strategy: ${plan.goToMarketStrategy || 'N/A'}`, 11, false);
        addTextLine(`Operations Plan: ${plan.operationsPlan || 'N/A'}`, 11, false);
        addTextLine(`Financial Projection: ${plan.financialProjection || 'N/A'}`, 11, false);
        addTextLine(`Funding Ask: ${plan.fundingAsk || 'N/A'}`, 11, false);
        y += 6;

        addTextLine('3. Market Research', 16, true, '#1E1B4B');
        y += 2;
        addTextLine(`TAM: ${market.tam || 'N/A'} | SAM: ${market.sam || 'N/A'} | SOM: ${market.som || 'N/A'}`, 11, true);
        addTextLine(`Competitor Analysis: ${Array.isArray(market.competitors) ? market.competitors.join(', ') : market.competitors || market.competitorAnalysis || 'N/A'}`, 11, false);
        addTextLine(`Pricing Suggestions: ${market.pricingSuggestions || 'N/A'}`, 11, false);
        addTextLine(`Location/Distribution Suggestions: ${market.locationSuggestions || 'N/A'}`, 11, false);
        y += 6;

        addTextLine('4. AI Report & Metrics', 16, true, '#1E1B4B');
        y += 2;
        addTextLine(`Investment Readiness Score: ${report.investmentReadinessScore || 'N/A'}/100`, 11, true, '#10B981');
        addTextLine(`Scalability Score: ${report.scalabilityScore || 'N/A'}/100`, 11, true, '#10B981');
        addTextLine(`Key Strengths: ${Array.isArray(report.keyStrengths) ? report.keyStrengths.join(', ') : report.businessStrengths || 'N/A'}`, 11, false);
        addTextLine(`Risk Factors: ${Array.isArray(report.riskFactors) ? report.riskFactors.join(', ') : report.weaknesses || 'N/A'}`, 11, false);
        addTextLine(`Mentor Review Summary: ${report.mentorReviewSummary || 'N/A'}`, 11, false);

        doc.save(finalName);
      } else if (finalFormat === 'word' || finalFormat === 'docx' || finalFormat === 'doc') {
        const docx = new DocxDocument({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Startup Report: ${startup.startupName}`, bold: true, size: 36, color: '5B21B6' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Original Concept: ${startup.startupIdea}`, italics: true, size: 24 }),
                ],
              }),
              new Paragraph({ text: '' }),

              new Paragraph({ children: [new TextRun({ text: '1. AI Idea Analysis', bold: true, size: 28, color: '1E1B4B' })] }),
              new Paragraph({ text: `Refined Idea: ${idea.refinedIdea || idea.refinedStartupIdea || 'N/A'}` }),
              new Paragraph({ text: `Problem Statement: ${idea.problemStatement || 'N/A'}` }),
              new Paragraph({ text: `Solution: ${idea.solution || 'N/A'}` }),
              new Paragraph({ text: `Target Customers: ${Array.isArray(idea.targetCustomers) ? idea.targetCustomers.join(', ') : idea.targetCustomers || 'N/A'}` }),
              new Paragraph({ text: `Business Model: ${idea.businessModel || 'N/A'}` }),
              new Paragraph({ text: `Revenue Model: ${idea.revenueModel || 'N/A'}` }),
              new Paragraph({ text: `Core Features: ${Array.isArray(idea.coreFeatures) ? idea.coreFeatures.join(', ') : idea.coreFeatures || 'N/A'}` }),
              new Paragraph({ text: '' }),

              new Paragraph({ children: [new TextRun({ text: '2. Business Plan', bold: true, size: 28, color: '1E1B4B' })] }),
              new Paragraph({ text: `Executive Summary: ${plan.executiveSummary || 'N/A'}` }),
              new Paragraph({ text: `Pricing Strategy: ${plan.pricingStrategy || 'N/A'}` }),
              new Paragraph({ text: `Go-To-Market Strategy: ${plan.goToMarketStrategy || 'N/A'}` }),
              new Paragraph({ text: `Operations Plan: ${plan.operationsPlan || 'N/A'}` }),
              new Paragraph({ text: `Financial Projection: ${plan.financialProjection || 'N/A'}` }),
              new Paragraph({ text: `Funding Ask: ${plan.fundingAsk || 'N/A'}` }),
              new Paragraph({ text: '' }),

              new Paragraph({ children: [new TextRun({ text: '3. Market Research', bold: true, size: 28, color: '1E1B4B' })] }),
              new Paragraph({ text: `TAM: ${market.tam || 'N/A'} | SAM: ${market.sam || 'N/A'} | SOM: ${market.som || 'N/A'}` }),
              new Paragraph({ text: `Competitor Analysis: ${Array.isArray(market.competitors) ? market.competitors.join(', ') : market.competitors || market.competitorAnalysis || 'N/A'}` }),
              new Paragraph({ text: `Pricing Suggestions: ${market.pricingSuggestions || 'N/A'}` }),
              new Paragraph({ text: `Location Suggestions: ${market.locationSuggestions || 'N/A'}` }),
              new Paragraph({ text: '' }),

              new Paragraph({ children: [new TextRun({ text: '4. AI Report & Metrics', bold: true, size: 28, color: '1E1B4B' })] }),
              new Paragraph({ text: `Investment Readiness Score: ${report.investmentReadinessScore || 'N/A'}/100` }),
              new Paragraph({ text: `Scalability Score: ${report.scalabilityScore || 'N/A'}/100` }),
              new Paragraph({ text: `Key Strengths: ${Array.isArray(report.keyStrengths) ? report.keyStrengths.join(', ') : report.businessStrengths || 'N/A'}` }),
              new Paragraph({ text: `Risk Factors: ${Array.isArray(report.riskFactors) ? report.riskFactors.join(', ') : report.weaknesses || 'N/A'}` }),
              new Paragraph({ text: `Mentor Review Summary: ${report.mentorReviewSummary || 'N/A'}` }),
            ],
          }],
        });
        const blob = await Packer.toBlob(docx);
        saveAs(blob, `${cleanName}_Report.docx`);
      } else if (finalFormat === 'zip') {
        const zip = new JSZip();
        zip.file("README.txt", `Report package for ${startup.startupName}.\nGenerated automatically by AI Startup Builder.`);
        zip.file("Idea_Analysis.txt", `Refined Idea: ${idea.refinedIdea || idea.refinedStartupIdea || 'N/A'}\n\nProblem Statement: ${idea.problemStatement || 'N/A'}\n\nSolution: ${idea.solution || 'N/A'}\n\nTarget Customers: ${Array.isArray(idea.targetCustomers) ? idea.targetCustomers.join(', ') : idea.targetCustomers || 'N/A'}\n\nBusiness Model: ${idea.businessModel || 'N/A'}\n\nRevenue Model: ${idea.revenueModel || 'N/A'}\n\nCore Features: ${Array.isArray(idea.coreFeatures) ? idea.coreFeatures.join(', ') : idea.coreFeatures || 'N/A'}`);
        zip.file("Business_Plan.txt", `Executive Summary: ${plan.executiveSummary || 'N/A'}\n\nPricing Strategy: ${plan.pricingStrategy || 'N/A'}\n\nGo-To-Market Strategy: ${plan.goToMarketStrategy || 'N/A'}\n\nOperations Plan: ${plan.operationsPlan || 'N/A'}\n\nFinancial Projection: ${plan.financialProjection || 'N/A'}\n\nFunding Ask: ${plan.fundingAsk || 'N/A'}`);
        zip.file("Market_Research.txt", `TAM: ${market.tam || 'N/A'}\nSAM: ${market.sam || 'N/A'}\nSOM: ${market.som || 'N/A'}\n\nCompetitor Analysis: ${Array.isArray(market.competitors) ? market.competitors.join(', ') : market.competitors || market.competitorAnalysis || 'N/A'}\n\nPricing Suggestions: ${market.pricingSuggestions || 'N/A'}\n\nLocation Suggestions: ${market.locationSuggestions || 'N/A'}`);
        zip.file("AI_Metrics.txt", `Investment Readiness Score: ${report.investmentReadinessScore || 'N/A'}/100\n\nScalability Score: ${report.scalabilityScore || 'N/A'}/100\n\nKey Strengths: ${Array.isArray(report.keyStrengths) ? report.keyStrengths.join(', ') : report.businessStrengths || 'N/A'}\n\nRisk Factors: ${Array.isArray(report.riskFactors) ? report.riskFactors.join(', ') : report.weaknesses || 'N/A'}\n\nMentor Review Summary: ${report.mentorReviewSummary || 'N/A'}`);
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, finalName);
      } else {
        const content = `Startup Report: ${startup.startupName}\nConcept: ${startup.startupIdea}`;
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

    const hasLegacyMock = locals.some(s => s.startupName === 'GreenCup Cafe' || s.startupName === 'SyncAI Tasks');
    if (locals.length === 0 || hasLegacyMock) {
      if (hasLegacyMock) {
        localStorage.removeItem('startup_mock_1');
        localStorage.removeItem('startup_mock_2');
        locals = [];
      }
      const mockStartups = [
        {
          id: 'startup_mock_1',
          startupId: 'startup_mock_1',
          founderId: 'founder_renu',
          startupName: 'Tourists',
          startupIdea: 'I want to start the tourists platform.',
          status: 'generated',
          approvalStatus: 'approved',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          aiGenerated: {
            ideaAnalysis: {
              refinedIdea: 'Tourists is a next-generation travel platform connecting international travelers with local guides, customized off-beat itineraries, and experiential tourism options.',
              problemStatement: 'Travelers struggle to find authentic local experiences and reliable local guides, relying instead on crowded commercial tour packages.',
              solution: 'An intuitive platform that matches travelers with vetted local experts for personalized, safe, and unique cultural explorations.',
              targetCustomers: ['Solo travelers & backpackers', 'Adventure seekers', 'Cultural tourists', 'Family vacationers'],
              uniqueValueProposition: 'Live like a local: Safe, verified, and completely customized micro-tourism experiences at your fingertips.',
              businessModel: 'Commission-based Marketplace Model',
              revenueModel: '15% booking fee from guides, premium itinerary planner subscription, and travel insurance partnerships.',
              coreFeatures: ['Verified Local Guide Profiles', 'Live Itinerary Planner', 'Safe Escrow Payments', '24/7 Emergency Support'],
              marketOpportunity: 'Surging post-pandemic demand for authentic, experiential, and outdoor-centric tourism.',
              nextSteps: ['Complete Android/iOS app beta testing', 'Onboard initial 50 local guides in pilot cities', 'Launch tourism board partnership campaigns']
            },
            branding: {
              brandNameSuggestions: ['Tourists', 'LocalQuest', 'WanderLocal', 'GuideGo'],
              taglineSuggestions: ['Live the destination.', 'Your local travel co-pilot.', 'Authentic journeys start here.'],
              logoConceptIdeas: 'A minimal compass combined with a location pin in vibrant sky blue.',
              logoPrompt: 'Create a clean, modern, premium travel logo for Tourists featuring a compass location pin.',
              logoStyle: 'Modern Travel Minimalist',
              brandColorPalette: ['#0284C7 (Sky Blue)', '#F0F9FF (Ice)', '#FFFFFF (Pure White)', '#0F172A (Slate)'],
              fontStyleSuggestions: 'Outfit & Inter',
              brandPersonality: 'Adventurous, trustworthy, friendly, native.',
              packagingStyleSuggestions: 'Premium digital UI with stunning high-resolution local photography and smooth card transitions.',
              socialMediaIdeas: 'Short guide spotlight videos, traveler testimonial reels, and off-beat destination guides.',
              websiteHero: 'Wander like a local. Discover authentic adventures with Tourists.',
              marketingCaptions: ['Skip the tourist traps. 🗺️✈️', 'Meet your new local best friend.']
            },
            businessPlan: {
              executiveSummary: 'Tourists connects travelers with verified local hosts to deliver authentic micro-tours and experiential stays.',
              problemAndSolution: 'Solves the lack of authenticity and trust in traditional booking systems by offering peer-reviewed local matches.',
              productDetails: 'Mobile-first platform with video-profile matching, instant messaging, geolocation guide tracking, and automated translation.',
              targetCustomers: 'Millennial and Gen-Z travelers looking for unique cultural immersion.',
              businessModel: 'Two-sided marketplace taking a transaction fee on bookings.',
              pricingStrategy: 'Guides set their own rates; Tourists platform charges a flat 15% service fee.',
              goToMarketStrategy: 'Travel influencer sponsorships, destination-based SEO content, and local hostel partnerships.',
              operationsPlan: 'Customer support teams handling safety and dispute resolution, alongside automated host verification checklists.',
              teamRequirement: ['Co-founder & CTO', 'Operations Lead', 'Guide Acquisition Manager', 'Marketing Designer'],
              financialProjection: 'First year target of $240,000 gross merchandise value (GMV) with 30% month-over-month guide acquisition growth.',
              fundingAsk: '$100,000 for guide onboarding operations, marketing launch, and regional scaling.'
            },
            pitchDeck: [
              { slide: 1, title: 'Tourists', content: 'Authentic Local Tourism Marketplace' },
              { slide: 2, title: 'The Problem', content: 'Commercial tour packages are generic, overcrowded, and isolate travelers from authentic culture.' },
              { slide: 3, title: 'The Solution', content: 'A peer-to-peer marketplace matching travelers with vetted local experts for custom experiences.' },
              { slide: 4, title: 'Market Size', content: '$800B+ global experiential and adventure travel market.' },
              { slide: 5, title: 'Product Overview', content: 'Custom itinerary builder, interactive mapping, safety tracking, video profiles.' },
              { slide: 6, title: 'Business Model', content: '15% booking commission on all transactions.' },
              { slide: 7, title: 'Competitor Landscape', content: 'More localized and flexible than Airbnb Experiences, more affordable than traditional agencies.' },
              { slide: 8, title: 'Go-To-Market', content: 'Travel vlogger partnerships, localized SEO guides, digital ads.' },
              { slide: 9, title: 'Our Team', content: 'Ex-Booking.com product managers and local travel organizers.' },
              { slide: 10, title: 'The Ask', content: '$100k for engineering, host acquisition, and pilot marketing.' }
            ],
            marketResearch: {
              tam: '₹50,00,00,000',
              sam: '₹12,00,00,000',
              som: '₹2,50,00,000',
              customerSegments: ['Solo backpackers', 'Cultural explorers', 'Experiential group travelers'],
              competitorAnalysis: 'Airbnb Experiences has high overhead; TripAdvisor is outdated. Tourists offers direct customization.',
              marketTrends: ['Experiential travel growth', 'Local guide demand', 'Eco-friendly/sustainable tourism'],
              opportunities: ['Partnerships with state tourism departments', 'Corporate team-building tours'],
              risks: ['Safety compliance verification', 'Seasonal travel fluctuations'],
              pricingSuggestions: 'Average guide tour: ₹1500-4000 per day. Platform commission: 15%.',
              locationSuggestions: 'Launch pilots in major historical/adventure hubs like Rajasthan, Kerala, and Himachal.'
            },
            aiReport: {
              investmentReadinessScore: 88,
              keyStrengths: ['Highly relevant tourism shift', 'Scalable P2P model', 'High-margin transaction fee structure'],
              riskFactors: ['Guide verification overhead', 'Geographical regulatory compliance'],
              improvementSuggestions: ['Standardize guide background checks', 'Create safety buttons and active tracking in app'],
              scalabilityScore: 85,
              fundingReadiness: 'Strong potential for seed-stage venture capital or startup accelerator backing.',
              mentorReviewSummary: 'Tourists is a highly scalable travel tech concept. Prioritize user safety features and guide quality control in the pilot phase.'
            }
          }
        },
        {
          id: 'startup_mock_2',
          startupId: 'startup_mock_2',
          founderId: 'founder_renu',
          startupName: 'Bakery',
          startupIdea: 'i want to start bakery shop, in the bakery shop add snacks, sweet, chips etc..',
          status: 'generated',
          approvalStatus: 'approved',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          aiGenerated: {
            ideaAnalysis: {
              refinedIdea: 'Bakery is a modern retail and café concept offering premium freshly baked breads, custom cakes, healthy tea-time snacks, sweets, and gourmet potato chips.',
              problemStatement: 'Local consumers lack access to premium, hygienic, and fresh baked goods that combine traditional bakery comfort with modern healthy snack alternatives.',
              solution: 'A hybrid neighborhood bakery & café focusing on clean, premium ingredients, fresh daily baking, and a curated assortment of snacks and sweets.',
              targetCustomers: ['Neighborhood families', 'Office professionals', 'Evening snack lovers', 'Event/Birthday party organizers'],
              uniqueValueProposition: 'Freshly baked daily comfort foods, custom designs, and healthy organic snack options under one roof.',
              businessModel: 'Brick-and-Mortar Retail & Local Delivery',
              revenueModel: 'Direct over-the-counter sales, custom party orders, subscription-based daily bread delivery, and snack packaging retail.',
              coreFeatures: ['Open-view live kitchen', 'Self-service snack shelves', 'Custom cake studio', 'Loyalty app & home delivery'],
              marketOpportunity: 'High growth in premium bakery products and the rising demand for packaged premium snack assortments.',
              nextSteps: ['Finalize local commercial space lease', 'Acquire commercial ovens and display counters', 'Source high-quality dairy and flour suppliers']
            },
            branding: {
              brandNameSuggestions: ['The Crumb Bakery', 'Golden Crust', 'Sweet & Savory', 'Daily Bake'],
              taglineSuggestions: ['Baked fresh, every single day.', 'Your neighborhood sweet spot.', 'Fresh crusts, happy hearts.'],
              logoConceptIdeas: 'A warm golden rolling pin combined with a wheat stalk and a heart icon.',
              logoPrompt: 'Create a warm, premium bakery logo with a rolling pin and wheat stalk design.',
              logoStyle: 'Charming Vintage Modern',
              brandColorPalette: ['#D97706 (Warm Amber)', '#FEF3C7 (Cream)', '#374151 (Charcoal)', '#FFFFFF (White)'],
              fontStyleSuggestions: 'Lora & Montserrat',
              brandPersonality: 'Warm, cozy, premium, delicious.',
              packagingStyleSuggestions: 'Recyclable brown paper boxes with transparent windows and custom branded wax paper.',
              socialMediaIdeas: 'Hypnotic bread-rising time lapses, custom cake decorating reels, and weekend recipe shares.',
              websiteHero: 'Freshly baked daily with love. Taste the warmth at Bakery.',
              marketingCaptions: ['Warm bread cures everything. 🍞❤️', 'Custom cakes made just for you.']
            },
            businessPlan: {
              executiveSummary: 'Bakery is a local culinary brand providing freshly baked goods, high-quality sweets, and packaged snacks to families and events.',
              problemAndSolution: 'Combines fresh baking with snack accessibility, eliminating stale shelf products.',
              productDetails: 'Artisan sourdough, traditional sweets, custom cakes, and low-sodium crispy vegetable chips.',
              targetCustomers: 'Local residents seeking high-quality evening snacks and premium celebration cakes.',
              businessModel: 'Direct retail sales, takeaway, and local hyper-local delivery apps.',
              pricingStrategy: 'Competitive mid-premium pricing justified by raw ingredient quality and freshness.',
              goToMarketStrategy: 'Free tasting boxes to local housing societies, grand opening discount, and Google Maps local SEO.',
              operationsPlan: 'Kitchen opens at 4 AM for morning baking, retail operational from 8 AM to 9 PM, managed by a head pastry chef.',
              teamRequirement: ['Head Baker / Pastry Chef', 'Kitchen Assistant', 'Counter Sales Representative', 'Delivery Executive'],
              financialProjection: 'First year sales target of $150,000 with steady monthly margins of 25% from recurring customers.',
              fundingAsk: '$50,000 for commercial baking equipment, shop renovation, and initial raw ingredients.'
            },
            pitchDeck: [
              { slide: 1, title: 'Bakery', content: 'Fresh Neighborhood Bakery & Curated Snacks' },
              { slide: 2, title: 'The Problem', content: 'Mass-manufactured baked goods lack taste, contain preservatives, and local shops lack hygiene.' },
              { slide: 3, title: 'The Solution', content: 'A transparent, hygienic live bakery offering fresh artisan items alongside high-quality sweets and chips.' },
              { slide: 4, title: 'Market Size', content: '$8B rising domestic bakery and snack food market.' },
              { slide: 5, title: 'Product Line', content: 'Breads, celebration cakes, traditional sweets, packaged premium chips, healthy cookies.' },
              { slide: 6, title: 'Business Model', content: 'DTC Retail, custom event orders, subscription packages.' },
              { slide: 7, title: 'Traction', content: 'Pre-launch social media interest, partnerships with 3 local event planners.' },
              { slide: 8, title: 'Go-To-Market', content: 'Neighborhood tastings, active local SEO, geo-targeted social media.' },
              { slide: 9, title: 'Our Team', content: 'Experienced baker with 10 years of hotel pastry experience.' },
              { slide: 10, title: 'The Ask', content: '$50k for machinery, interior setup, and initial marketing.' }
            ],
            marketResearch: {
              tam: '₹12,00,00,000',
              sam: '₹3,00,00,000',
              som: '₹45,00,000',
              customerSegments: ['Families', 'Event managers', 'Local tea-time snackers'],
              competitorAnalysis: 'Chain bakeries are factory-produced; local sweet shops lack baked assortments. We win on variety and fresh kitchen.',
              marketTrends: ['Clean label products', 'Gourmet tea-time snacks', 'Custom celebration orders'],
              opportunities: ['Monthly subscription breakfast baskets', 'B2B supply to local cafes'],
              risks: ['High perishability of fresh products', 'Ingredient price inflation (butter/sugar)'],
              pricingSuggestions: 'Breads: ₹60-120, Cakes: ₹600-1200/kg, Snacks: ₹80-180/box.',
              locationSuggestions: 'High-density residential complexes, neighborhood high street with parking.'
            },
            aiReport: {
              investmentReadinessScore: 82,
              keyStrengths: ['High daily repeat transactions', 'Strong margin on custom orders', 'Diverse snack catalog'],
              riskFactors: ['High waste management/perishables', 'Staff retention in baking operations'],
              improvementSuggestions: ['Implement real-time inventory management software', 'Pre-sell custom event packages to local corporate offices'],
              scalabilityScore: 70,
              fundingReadiness: 'Excellent match for local banks, MSME loans, and small business partners.',
              mentorReviewSummary: 'Bakery is a solid neighborhood business. Focus heavily on waste control, recipe consistency, and local high-street foot traffic.'
            }
          }
        },
        {
          id: 'startup_mock_3',
          startupId: 'startup_mock_3',
          founderId: 'founder_renu',
          startupName: 'RESTURANT',
          startupIdea: 'I want to start the startup business but i have no idea about that tell me how to start the business',
          status: 'generated',
          approvalStatus: 'approved',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          aiGenerated: {
            ideaAnalysis: {
              refinedIdea: 'RESTURANT is a premium casual dining restaurant startup featuring a modern multi-cuisine menu, interactive digital ordering, and a design-forward dine-in experience.',
              problemStatement: 'Aspiring restaurant founders struggle to plan, license, and structure a restaurant concept from scratch without industry experience, leading to high failure rates.',
              solution: 'A step-by-step optimized restaurant model starting with a highly curated flagship menu, pre-integrated POS system, and detailed setup guidance.',
              targetCustomers: ['Families & group diners', 'Young professionals', 'Food enthusiasts', 'Event organizers'],
              uniqueValueProposition: 'Delivering exceptional flavor profiles and interactive customer service in an upscale, aesthetic environment.',
              businessModel: 'Full-Service Dine-in & Delivery Model',
              revenueModel: 'Dine-in menu sales, online food delivery channels, private event hosting, and catering packages.',
              coreFeatures: ['Interactive QR-code ordering', 'Curated chef specialties', 'Aesthetic dine-in layout', 'Integrated food delivery logistics'],
              marketOpportunity: 'Growing urban culture of dining out, weekend experiential dining, and high online delivery order volume.',
              nextSteps: ['Create a solid kitchen recipe menu card', 'Acquire municipal health and trade licenses', 'Hire kitchen manager & floor supervisor']
            },
            branding: {
              brandNameSuggestions: ['RESTURANT', 'The Table', 'Urban Feast', 'Palate Central'],
              taglineSuggestions: ['Experience fine dining.', 'Good food, great memories.', 'A taste of luxury.'],
              logoConceptIdeas: 'A minimal fork and knife icon forming an abstract crown in gold color.',
              logoPrompt: 'Create a luxurious gold restaurant logo with a clean serif font.',
              logoStyle: 'Upscale Modern Casual',
              brandColorPalette: ['#B45309 (Warm Gold)', '#1E293B (Slate)', '#F8FAFC (Off-White)', '#FFFFFF (Pure White)'],
              fontStyleSuggestions: 'Lora & Inter',
              brandPersonality: 'Luxurious, welcoming, professional, delicious.',
              packagingStyleSuggestions: 'Sturdy, branded paper board boxes with gold foil embossing and heat-retaining technology.',
              socialMediaIdeas: 'Chef introduction videos, recipe sneak peeks, aesthetic restaurant dining reviews.',
              websiteHero: 'Welcome to RESTURANT. Where every meal is an experience.',
              marketingCaptions: ['Savor the flavor. 🍽️✨', 'Reserve your table today.']
            },
            businessPlan: {
              executiveSummary: 'RESTURANT is a premium dine-in and casual dining concept bringing high-quality multi-cuisine items to urban food lovers.',
              problemAndSolution: 'Eliminates the complexity of traditional restaurant setup by using modern standardized kitchen operations.',
              productDetails: 'Multi-cuisine premium menu, local specialty drinks, custom cocktails, and seasonal chef items.',
              targetCustomers: 'Urban families and corporate diners looking for high-quality food and ambient service.',
              businessModel: 'Dine-in services coupled with hyper-local delivery apps.',
              pricingStrategy: 'Premium value pricing matching mid-high tier local averages.',
              goToMarketStrategy: 'Pre-launch tasting event, local food blogger reviews, social media launch offers.',
              operationsPlan: 'Open 11 AM to 11 PM daily. High kitchen hygiene standards with automated temperature-control storages.',
              teamRequirement: ['Head Chef', 'Sous Chef', 'F&B Manager', 'Waitstaff (4x)', 'Cleaning Assistant'],
              financialProjection: 'First year target sales of $320,000 with a projected net profit margin of 18% in Year 1.',
              fundingAsk: '$120,000 for space lease deposit, interior buildout, commercial kitchen prep systems, and launch marketing.'
            },
            pitchDeck: [
              { slide: 1, title: 'RESTURANT', content: 'Modern Dine-in Experience & Fine Flavors' },
              { slide: 2, title: 'The Problem', content: 'Lack of premium, high-hygiene multi-cuisine dining options with family-friendly ambiance.' },
              { slide: 3, title: 'The Solution', content: 'A beautifully designed dine-in space with curated chef specialties and interactive digital order flows.' },
              { slide: 4, title: 'Market Size', content: '$30B+ rapidly growing urban dining and restaurant industry.' },
              { slide: 5, title: 'Our Menu', content: 'Appetizers, chef specials, artisanal beverages, curated desserts.' },
              { slide: 6, title: 'Business Model', content: 'Dine-in revenue (75%) + online deliveries & catering (25%).' },
              { slide: 7, title: 'Competitor Analysis', content: 'We win on ingredient sourcing transparency, premium dining service, and unique menu items.' },
              { slide: 8, title: 'Go-To-Market', content: 'Blogger reviews, grand launch night, corporate discount tie-ups.' },
              { slide: 9, title: 'Our Team', content: 'Led by an executive chef with 15 years of fine dining kitchen management.' },
              { slide: 10, title: 'The Ask', content: '$120k for space setup, equipment lease, and 3 months runway.' }
            ],
            marketResearch: {
              tam: '₹35,00,00,000',
              sam: '₹9,00,00,000',
              som: '₹1,20,00,000',
              customerSegments: ['Corporate teams', 'Families', 'Food bloggers & young couples'],
              competitorAnalysis: 'Chain diners lack personalized service; local eateries lack branding. RESTURANT bridges the gap.',
              marketTrends: ['Experiential casual dining', 'QR-code order adoption', 'Chef-driven menu specialization'],
              opportunities: ['Hosting private anniversary/corporate parties', 'Premium weekend buffet events'],
              risks: ['High initial location lease rates', 'Staff attrition in the kitchen'],
              pricingSuggestions: 'Average customer order value: ₹600-1200. Dine-in target.',
              locationSuggestions: 'Commercial malls, popular office park food arenas, or upscale residential avenues.'
            },
            aiReport: {
              investmentReadinessScore: 88,
              keyStrengths: ['Experienced executive chef', 'Scalable dining concept', 'Balanced dine-in/delivery revenue mix'],
              riskFactors: ['High upfront CapEx requirements', 'Employee retention challenges'],
              improvementSuggestions: ['Design pre-packaged catering menus for office parks', 'Offer a digital loyalty club membership on launch'],
              scalabilityScore: 75,
              fundingReadiness: 'Ready for retail franchise partners, angel backers, and commercial term loans.',
              mentorReviewSummary: 'RESTURANT has strong fundamentals. Prioritize a high-traffic prime location and keep kitchen inventory tightly managed to ensure early cash flow.'
            }
          }
        },
        {
          id: 'startup_mock_4',
          startupId: 'startup_mock_4',
          founderId: 'founder_renu',
          startupName: 'Breaktime',
          startupIdea: 'I have an idea to start the startup busniess like premium tea, coffee, and snacks brand.',
          status: 'generated',
          approvalStatus: 'approved',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          aiGenerated: {
            ideaAnalysis: {
              refinedIdea: 'Breaktime is a sophisticated, welcoming local premium tea, coffee, and snacks brand focusing on high-quality organic beverages and quick premium refreshments.',
              problemStatement: 'Urban professionals lack high-quality, quick-service tea and coffee options that are premium yet quickly accessible during their daily work breaks.',
              solution: 'A highly aesthetic, premium kiosk and cafe concept serving organic loose-leaf tea, single-origin coffee, and healthy snack assortments.',
              targetCustomers: ['Office workers', 'Students', 'Daily commuters', 'Premium shoppers'],
              uniqueValueProposition: 'Sophisticated aesthetics, premium ingredients, and exceptionally fast break-time service.',
              businessModel: 'Quick Service Restaurant (QSR) & Delivery',
              revenueModel: 'Counter sales, daily beverage subscriptions, event packages, and branded retail merchandise.',
              coreFeatures: ['Rapid-brew espresso systems', 'Artisanal snack pairings', 'Mobile pre-order app', 'Aesthetic packaging'],
              marketOpportunity: 'Surging demand for specialty coffee and high-end tea concepts among corporate workforces.',
              nextSteps: ['Establish supplier deals for single-origin beans', 'Design prototype modular QSR kiosk', 'Submit initial municipality health certifications']
            },
            branding: {
              brandNameSuggestions: ['Breaktime', 'Brew & Pause', 'Tea & Coffee Co.', 'The Breakroom'],
              taglineSuggestions: ['Your daily escape.', 'Premium brew, fast pause.', 'Taste the difference.'],
              logoConceptIdeas: 'An elegant clock icon with a steaming coffee cup inside.',
              logoPrompt: 'Create a clean, premium modern logo for Breaktime featuring a coffee cup clock design.',
              logoStyle: 'Minimalist Modern Premium',
              brandColorPalette: ['#4B2E1E (Coffee Brown)', '#F5E6C8 (Warm Cream)', '#D4AF37 (Gold)', '#111111 (Jet Black)'],
              fontStyleSuggestions: 'Playfair Display & Inter',
              brandPersonality: 'Welcoming, premium, cozy, fast.',
              packagingStyleSuggestions: 'Eco-friendly cardboard beverage holders and cups with minimal logo branding.',
              socialMediaIdeas: 'Aesthetic preparation clips, office break reels, seasonal drink announcements.',
              websiteHero: 'Elevate your daily break. Discover Breaktime.',
              marketingCaptions: ['Sip, relax, repeat. ☕🕒', 'Your workspace refreshment partner.']
            },
            businessPlan: {
              executiveSummary: 'Breaktime will launch a network of high-end, rapid-service beverage kiosks inside premium corporate hubs and shopping locations.',
              problemAndSolution: 'Solves the long wait times and poor beverage quality of corporate cafeterias.',
              productDetails: 'Organic specialty teas, single-origin espresso drinks, gluten-free cookies, and baked snacks.',
              targetCustomers: 'High-income office workers and transit commuters.',
              businessModel: 'Low-overhead kiosk retail and office delivery.',
              pricingStrategy: 'Value-premium pricing with customer loyalty card benefits.',
              goToMarketStrategy: 'Free tea/coffee cards for nearby office HR departments, social media ads.',
              operationsPlan: 'Open 8 AM to 7 PM. Fully automated brewers to ensure consistency and speed.',
              teamRequirement: ['Kiosk Manager', 'Lead Barista', 'Junior Server'],
              financialProjection: 'First year sales target of $95,000 per kiosk, with cash flow positive state by Month 3.',
              fundingAsk: '$35,000 for kiosk construction, espresso machines, and launch marketing.'
            },
            pitchDeck: [
              { slide: 1, title: 'Breaktime', content: 'Premium Tea, Coffee, and Snacks Kiosks' },
              { slide: 2, title: 'The Problem', content: 'Office workers waste time waiting in long cafe lines, or drink poor quality cafeteria beverages.' },
              { slide: 3, title: 'The Solution', content: 'High-end modular kiosks serving organic brews in under 90 seconds.' },
              { slide: 4, title: 'Market Opportunity', content: 'Growing Indian urban QSR and specialty beverage segments.' },
              { slide: 5, title: 'Product offering', content: 'Espressos, premium organic teas, custom pastries, healthy snack cups.' },
              { slide: 6, title: 'Low CapEx model', content: 'Modular kiosks allow cheap setup and quick launch.' },
              { slide: 7, title: 'Competitor Analysis', content: 'Faster than premium dine-in cafes; significantly higher quality than typical office tea stalls.' },
              { slide: 8, title: 'Go-To-Market', content: 'Corporate vouchers, office HR partnerships, local SEO.' },
              { slide: 9, title: 'Our Team', content: 'Experienced QSR operators and food supply coordinators.' },
              { slide: 10, title: 'The Ask', content: '$35k for the prototype kiosk construction and equipment.' }
            ],
            marketResearch: {
              tam: '₹8,00,00,000',
              sam: '₹2,00,00,000',
              som: '₹35,00,000',
              customerSegments: ['Corporate employees', 'Shoppers', 'Daily transit travelers'],
              competitorAnalysis: 'Local chai wallahs lack hygiene; Starbucks is too expensive and slow. Breaktime wins on speed and quality.',
              marketTrends: ['Rise of gourmet coffee habits', 'Preference for quick grab-and-go QSRs'],
              opportunities: ['In-office catering carts', 'Corporate monthly drink plans'],
              risks: ['High rentals in top commercial parks', 'Employee turnover'],
              pricingSuggestions: 'Teas: ₹60-120, Coffees: ₹120-220, Snacks: ₹50-150.',
              locationSuggestions: 'Corporate tech park lobbies, transit terminal gates, mall entrances.'
            },
            aiReport: {
              investmentReadinessScore: 85,
              keyStrengths: ['Low CapEx kiosk model', 'High gross margin on hot beverages', 'Strong customer repeat rate'],
              riskFactors: ['Location rent volatility', 'Raw ingredient quality sourcing consistency'],
              improvementSuggestions: ['Pre-onboard corporate clients for delivery subscriptions', 'Select modular structures that are easy to relocate'],
              scalabilityScore: 80,
              fundingReadiness: 'Ready for micro VC backing, private franchise partners, and local business development funds.',
              mentorReviewSummary: 'Breaktime is a highly efficient retail concept. Prioritize location scouting and fast service times to secure early repeat revenue.'
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
          fileName: 'Tourists_Plan_Overview.pdf',
          fileType: 'PDF',
          fileSize: '1.5 MB',
          category: 'Founder Documents',
          documentType: 'Business Plan',
          documentLabel: 'Business Plan',
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
          fileName: 'Bakery_GST_Certificate.pdf',
          fileType: 'PDF',
          fileSize: '820 KB',
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
          id: 'doc_cat_startup_mock_3_0',
          startupId: 'startup_mock_3',
          founderId: 'founder_renu',
          fileName: 'RESTURANT_FSSAI_License.pdf',
          fileType: 'PDF',
          fileSize: '2.4 MB',
          category: 'Founder Documents',
          documentType: 'FSSAI Registration / License',
          documentLabel: 'FSSAI License',
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
          startupName: 'Tourists',
          founderId: 'founder_renu',
          founderName: 'Renu',
          investorId: 'investor_selva',
          investorName: 'Selva',
          investorCompany: 'Impact Ventures',
          investorEmail: 'selva@impactventures.com',
          investorAddress: 'Bangalore, India',
          offerAmount: 100000,
          currency: 'USD',
          equityPercentage: 10,
          valuationCap: 1000000,
          instrument: 'SAFE',
          discount: 20,
          expiresInDays: 30,
          investorMessage: 'We love your platform concept and guide onboarding model. Looking forward to backing this!',
          founderResponse: '',
          counterOffer: { amount: null, equityPercentage: null, message: '' },
          adminNote: 'Documents verified by Admin.',
          status: 'offer_received',
          history: [
            {
              action: 'offer_received',
              performedBy: 'Impact Ventures',
              role: 'investor',
              message: 'Submitted investment offer of $100,000 for 10% equity.',
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
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[100] animate-fade-in-up text-left flex flex-col">
                            <button 
                              onClick={() => { handleDownload(s, 'PDF'); setDropdownOpen(null); }} 
                              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                            >
                              Download PDF Report
                            </button>
                            <button 
                              onClick={() => { handleDownload(s, 'WORD'); setDropdownOpen(null); }} 
                              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                            >
                              Download Word Report
                            </button>
                            <button 
                              onClick={() => { handleDownload(s, 'ZIP'); setDropdownOpen(null); }} 
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
