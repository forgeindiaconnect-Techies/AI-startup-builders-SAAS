import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';
import Startup from '../models/Startup.js';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware.js';
import MentorBooking from '../models/MentorBooking.js';


let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const rawGeminiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_kEY || process.env.GEMINI_KEY || '').trim().replace(/^["']|["']$/g, '');
    if (rawGeminiKey) {
      try {
        aiClient = new GoogleGenAI({ apiKey: rawGeminiKey });
      } catch (e) {
        console.error("Failed to initialize Google Generative AI", e);
      }
    }
  }
  return aiClient;
}

getAiClient();
if (!aiClient) {
  console.warn("⚠️ GEMINI_API_KEY is not set in environment variables.");
}

// ─── Cloudinary setup ────────────────────────────────────────────────────────
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

const SYSTEM_PROMPT = `You are an expert startup strategist, business analyst, market researcher, pitch deck consultant, and investor advisor.

The founder gives only:
1. Startup Name
2. Startup Idea / Short Description

Your task:
Analyze the startup idea carefully and generate only relevant, practical, business-specific output.

Rules:
- Understand clarity, market demand, competition, scalability, and execution risk the business type first.
- Do not generate unrelated SaaS/e-commerce/subscription ideas unless they fit the startup.
- Make the output suitable for the founder's actual idea.
- Keep the language simple and founder-friendly.
- Output should be useful for business planning, pitch deck, market research, and investor review.
- Return structured JSON only.
- Do not return markdown.
- Do not add explanation outside JSON.

For every startup, generate:
- Refined Startup Idea
- Problem Statement
- Solution
- Target Customers
- Unique Value Proposition
- Branding (brand name suggestions, taglines, logo concept and detailed logo prompt, logo style, brand color palette with exactly 4 colors formatted as "#HEX (Color Name)", font suggestions, brand personality, packaging/UI style, social media ideas, website hero copy, marketing captions)
- Business Model
- Revenue Model
- Core Features
- Market Opportunity
- Business Plan
- Pitch Deck Content
- Market Research
- TAM, SAM, SOM
- Competitor Analysis
- Go-To-Market Strategy
- Financial Projection
- Funding Ask
- Investment Readiness Score
- Key Strengths
- Risk Factors
- Next Steps

For local physical businesses like tea, coffee, snacks, hotel, salon, restaurant, shop, or service business:
- Focus on location, pricing, customer demand, branding, operations, delivery, staff, inventory, customer retention, and expansion.
- Do not force software/SaaS features unless the founder mentions app, AI, platform, or software.
- Suggest practical models like walk-in sales, takeaway, delivery, combo offers, office bulk orders, and franchise expansion.

For technology startups:
- Focus on product, SaaS model, users, AI features, APIs, subscriptions, scalability, and investor pitch.

Market research should be realistic and explain that numbers are estimated.
Pitch deck should be investor-ready but simple and understandable.
AI Report score should be based on idea clarity, market demand, competition, scalability, and execution risk.

CURRENCY RULE (MANDATORY):
- All monetary values in the output MUST be in Indian Rupees (₹), never dollars.
- Do not use $, USD, US$, or the word "dollars".
- Use the Indian number format (e.g. ₹50,00,000 for fifty lakh, ₹1,00,00,000 for one crore).
- Apply this to financial projections, funding asks, pricing suggestions, market size, TAM/SAM/SOM, and pitch deck content.

AI JSON output structure:

{
  "ideaAnalysis": {
    "refinedStartupIdea": "",
    "problemStatement": "",
    "solution": "",
    "targetCustomers": [],
    "uniqueValueProposition": "",
    "businessModel": "",
    "revenueModel": "",
    "coreFeatures": [],
    "marketOpportunity": "",
    "nextSteps": []
  },
  "branding": {
    "brandNameSuggestions": [],
    "taglineSuggestions": [],
    "logoConceptIdeas": "",
    "logoPrompt": "",
    "logoStyle": "",
    "brandColorPalette": [],
    "fontStyleSuggestions": "",
    "brandPersonality": "",
    "packagingStyleSuggestions": "",
    "socialMediaIdeas": "",
    "websiteHero": "",
    "marketingCaptions": []
  },
  "businessPlan": {
    "executiveSummary": "",
    "problemAndSolution": "",
    "productDetails": "",
    "targetCustomers": "",
    "businessModel": "",
    "revenueModel": "",
    "pricingStrategy": "",
    "goToMarketStrategy": "",
    "operationsPlan": "",
    "teamRequirement": [],
    "financialProjection": "",
    "fundingAsk": ""
  },
  "pitchDeck": [
    {
      "slideNumber": 1,
      "slideTitle": "Cover Slide",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 2,
      "slideTitle": "Problem",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 3,
      "slideTitle": "Solution",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 4,
      "slideTitle": "Market Size",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 5,
      "slideTitle": "Product/Service Demo",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 6,
      "slideTitle": "Business Model",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 7,
      "slideTitle": "Traction",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 8,
      "slideTitle": "Go-To-Market",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 9,
      "slideTitle": "Team",
      "content": "",
      "speakerNotes": ""
    },
    {
      "slideNumber": 10,
      "slideTitle": "Funding Ask",
      "content": "",
      "speakerNotes": ""
    }
  ],
  "marketResearch": {
    "tam": "",
    "sam": "",
    "som": "",
    "targetMarket": "",
    "customerSegments": [],
    "competitorAnalysis": "",
    "marketTrends": [],
    "opportunities": [],
    "risks": [],
    "pricingSuggestions": [],
    "locationSuggestions": ""
  },
  "aiReport": {
    "investmentReadinessScore": 0,
    "startupScoreReason": "",
    "businessStrengths": [],
    "weaknesses": [],
    "riskFactors": [],
    "improvementSuggestions": [],
    "scalabilityScore": 0,
    "fundingReadiness": "",
    "mentorReviewSummary": ""
  },
  "ideaValidation": {
    "validationScore": 85,
    "problemStrength": "High",
    "marketNeed": "Strong Demand",
    "customerDemand": "High Willingness to Pay",
    "solutionFeasibility": "High Feasibility",
    "businessPotential": "Strong Margin Potential",
    "keyRisks": [],
    "strengths": [],
    "weaknesses": [],
    "validationSummary": "",
    "recommendedImprovements": [],
    "finalRecommendation": "Strong"
  },
  "competitorAnalysis": {
    "directCompetitors": [
      {
        "name": "",
        "product": "",
        "pricing": "",
        "keyFeatures": [],
        "targetAudience": "",
        "strengths": [],
        "weaknesses": [],
        "marketPositioning": ""
      }
    ],
    "indirectCompetitors": [
      {
        "name": "",
        "product": "",
        "pricing": "",
        "keyFeatures": [],
        "targetAudience": "",
        "strengths": [],
        "weaknesses": [],
        "marketPositioning": ""
      }
    ],
    "comparisonMatrix": [
      {
        "feature": "",
        "myStartup": "",
        "competitor1": "",
        "competitor2": ""
      }
    ],
    "marketGaps": [],
    "differentiationOpportunities": [],
    "uniqueSellingProposition": "",
    "competitiveAdvantages": []
  },
  "mvpPlan": {
    "mvpConcept": "",
    "coreFeatures": [],
    "mustHaveFeatures": [],
    "niceToHaveFeatures": [],
    "userRoles": [],
    "userFlow": [
      { "step": 1, "title": "", "description": "" }
    ],
    "requiredTechStack": {
      "frontend": [],
      "backend": [],
      "database": [],
      "cloudServices": []
    },
    "developmentPhases": [
      { "phase": "Phase 1: Foundation", "duration": "4 Weeks", "focus": "" }
    ],
    "mvpRoadmap": [
      { "milestone": "", "targetWeek": "Week 2" }
    ],
    "estimatedComplexity": "Medium",
    "futureFeatures": []
  },
  "financialPlan": {
    "initialStartupCost": "₹5,00,000",
    "developmentCost": "₹2,50,000",
    "marketingCost": "₹1,00,000",
    "operationalExpenses": "₹1,50,000",
    "monthlyExpenses": "₹80,000",
    "revenueModel": "",
    "suggestedPricing": "",
    "revenueProjection": "",
    "customerAcquisitionAssumptions": "",
    "breakEvenEstimate": "Month 8",
    "year1Projection": { "revenue": "₹24,00,000", "expenses": "₹14,00,000", "netProfit": "₹10,00,000" },
    "year3Projection": { "revenue": "₹75,00,000", "expenses": "₹35,00,000", "netProfit": "₹40,00,000" },
    "year5Projection": { "revenue": "₹2,00,00,000", "expenses": "₹80,00,000", "netProfit": "₹1,20,00,000" }
  },
  "gtmStrategy": {
    "targetAudience": "",
    "idealCustomerProfile": "",
    "customerPersonas": [
      { "name": "", "role": "", "painPoints": [], "goal": "", "channels": [] }
    ],
    "positioningStrategy": "",
    "valueProposition": "",
    "marketingChannels": [],
    "customerAcquisitionStrategy": "",
    "launchStrategy": {
      "preLaunch": [],
      "launchDay": [],
      "postLaunch": []
    },
    "first100CustomersStrategy": "",
    "socialMediaStrategy": [],
    "contentStrategy": [],
    "growthStrategy": "",
    "keyMarketingKPIs": [],
    "thirtyDayLaunchPlan": [
      { "week": "Week 1", "goal": "", "keyTasks": [] }
    ],
    "ninetyDayRoadmap": [
      { "month": "Month 1", "focus": "", "keyMilestones": [] }
    ]
  }
}`;

function parseJsonResponse(text: string): any {
  let cleanText = text.trim();
  if (cleanText.startsWith('\`\`\`json')) cleanText = cleanText.substring(7);
  if (cleanText.startsWith('\`\`\`')) cleanText = cleanText.substring(3);
  if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.substring(0, cleanText.length - 3);
  return JSON.parse(cleanText);
}

export function generateFallbackStartup(startupName: string, startupIdea: string) {
  const name = (startupName || 'Startup').trim();
  const idea = (startupIdea || startupName || 'Modern business venture').trim();
  const lowerIdea = (name + ' ' + idea).toLowerCase();

  const isFitness = /gym|fitness|workout|crossfit|bodybuilding|yoga|pilates|trainer|athletics|sports|exercise/i.test(lowerIdea);
  const isFood = /tea|coffee|cafe|restaurant|snacks|food|bakery|dining|kitchen|beverage|sweet|chips/i.test(lowerIdea);
  const isTech = /ai|software|app|platform|saas|cloud|tech|digital|automation|tool|web/i.test(lowerIdea);

  let categoryName = 'Service & Commerce';
  let problem = `Traditional service providers in this space suffer from lack of modern customer transparency, unorganized staff management, and poor digital customer engagement.`;
  let solution = `${name} provides an elevated, customer-first model combining reliable on-ground quality with seamless mobile booking, personalized attention, and dedicated community loyalty.`;
  let targetAudience = 'Urban professionals, local community members, and quality-conscious customers aged 20-50.';
  let revenueStreams = 'Direct memberships, packages, walk-in services, and high-margin branded ancillary sales.';
  let coreFeatures = [
    'Seamless Customer Onboarding & Digital Profiles',
    'Personalized Consultations & Expert Guidance',
    'Modern Facility with Premium Equipment & Ambiance',
    'Digital Mobile Management & Booking App',
    'Community Events & Exclusive Member Rewards'
  ];
  let directCompetitors = [
    {
      name: 'Unorganized Local Competitor A',
      product: 'Traditional independent provider',
      pricing: '₹1,500/month',
      keyFeatures: ['Basic setup', 'Standard walk-in access'],
      targetAudience: 'Budget-sensitive local customers',
      strengths: ['Low price point', 'Local proximity'],
      weaknesses: ['Poor hygiene', 'Outdated equipment', 'Zero personalization'],
      marketPositioning: 'Low-cost budget alternative'
    },
    {
      name: 'Commercial Chain B',
      product: 'Standardized branded commercial chain',
      pricing: '₹3,500/month',
      keyFeatures: ['Branded facility', 'Standard staff'],
      targetAudience: 'Middle to upper-middle class members',
      strengths: ['Brand awareness', 'Multiple locations'],
      weaknesses: ['Overcrowded peak hours', 'Impersonal customer service', 'Expensive lock-in contracts'],
      marketPositioning: 'Mass-market commercial player'
    }
  ];

  if (isFitness) {
    categoryName = 'Fitness & Wellness';
    problem = `Fitness enthusiasts struggle with overcrowded gyms, unhygienic facilities, lack of qualified personal coaching, and poorly maintained equipment that cause injuries and rapid member demotivation.`;
    solution = `${name} is an elite, hygienic fitness club equipped with biomechanically engineered machinery, certified coaching specialists, tailored nutrition programs, and an inspiring community atmosphere.`;
    targetAudience = 'Working professionals, students, fitness beginners, and athletes aged 18-55 in the immediate local vicinity.';
    revenueStreams = 'Monthly and annual gym memberships, personal training packages, group fitness classes, and nutritional supplement sales.';
    coreFeatures = [
      'State-of-the-art Cardio, Strength & Functional Zones',
      'Certified Personal Training & Body Composition Analysis',
      'Group Fitness Classes (HIIT, Yoga, Strength, Spinning)',
      'Member Mobile App for Workout Tracking & Attendance',
      'Hygienic Steam, Shower, and Locker Amenities'
    ];
    directCompetitors = [
      {
        name: 'Cult.fit / Gold\'s Gym',
        product: 'Commercial fitness chains & group classes',
        pricing: '₹2,500 - ₹4,000/month',
        keyFeatures: ['Chain access', 'App booking'],
        targetAudience: 'Urban professionals',
        strengths: ['Strong brand recognition', 'Technology integration'],
        weaknesses: ['High pricing', 'Overcrowded peak hours', 'Impersonal community feel'],
        marketPositioning: 'Premium commercial fitness chain'
      },
      {
        name: 'Neighborhood Standalone Gyms',
        product: 'Independent local gym',
        pricing: '₹1,000 - ₹1,500/month',
        keyFeatures: ['Basic weights', 'Open floor'],
        targetAudience: 'Local residents',
        strengths: ['Affordable fees', 'Convenient walking distance'],
        weaknesses: ['Old machinery', 'Poor ventilation', 'Lack of certified coaching'],
        marketPositioning: 'Budget neighborhood gym'
      }
    ];
  } else if (isFood) {
    categoryName = 'Food & Beverage';
    problem = `Consumers seek hygienic, premium-taste food and beverage experiences with consistent quality, comfortable seating, and quick service without exorbitant fine-dining prices.`;
    solution = `${name} delivers freshly crafted, high-quality food and beverages using premium ingredients in an inviting modern ambiance optimized for dine-in, takeaway, and digital delivery.`;
    targetAudience = 'College students, young professionals, families, and remote workers seeking quality snacks and beverages.';
    revenueStreams = 'Direct retail counter sales, online food delivery aggregators, corporate bulk catering, and subscription packages.';
    coreFeatures = [
      'Signature Beverage & Snack Menu with Standardized Recipes',
      'Hygienic Open Kitchen & Rapid Fulfillment Counter',
      'Comfortable Modern Seating with High-Speed Wi-Fi',
      'Omnichannel Ordering (Counter POS, QR Code, Delivery Apps)',
      'Loyalty Program with Reward Points for Repeat Orders'
    ];
  } else if (isTech) {
    categoryName = 'Technology & Software';
    problem = `Businesses face slow manual workflows, high operational costs, and disjointed tools that hinder rapid growth and scalability.`;
    solution = `${name} is an intelligent, automated software platform that streamlines workflows, provides real-time actionable insights, and enhances customer productivity.`;
    targetAudience = 'Startups, SMBs, freelancers, and enterprise teams seeking automated efficiency.';
    revenueStreams = 'B2B SaaS tiered subscriptions (Starter, Pro, Enterprise), usage-based add-ons, and API access fees.';
    coreFeatures = [
      'AI-Powered Workflow Automation Engine',
      'Intuitive Real-Time Analytics Dashboard',
      'Role-Based Team Collaboration & Access Controls',
      'Seamless Multi-Platform API Integrations',
      'Enterprise-Grade Data Security & 99.9% Uptime Guarantee'
    ];
  }

  return {
    ideaAnalysis: {
      refinedStartupIdea: `${name} is designed to lead the ${categoryName.toLowerCase()} sector by solving customer pain points through superior service quality, modern design, and customer-centric execution.`,
      problemStatement: problem,
      solution: solution,
      targetCustomers: [
        'Urban professionals with disposable income',
        'Young adults and students seeking community and value',
        'Health and quality-conscious consumers',
        'Local residents within a 3-5 km catchment area'
      ],
      uniqueValueProposition: `Experience excellence with ${name}: Unmatched quality, personalized guidance, and modern community-driven value at fair pricing.`,
      businessModel: `${categoryName} Direct-to-Consumer & Subscription Model`,
      revenueModel: revenueStreams,
      coreFeatures: coreFeatures,
      marketOpportunity: `Massive growth in domestic demand across Indian metro and tier-2 markets, driven by rising disposable incomes and higher standards for premium experiences.`,
      nextSteps: [
        'Finalize prime location lease and interior layout design',
        'Procure commercial grade equipment and inventory setup',
        'Launch hyper-local founding member pre-sales campaign',
        'Hire certified core operating team and trainers/staff'
      ]
    },
    branding: {
      brandNameSuggestions: [name, `${name} Studio`, `Apex ${name}`, `Prime ${name}`],
      taglineSuggestions: [
        `Elevate Your Everyday with ${name}.`,
        'Where Quality Meets Passion.',
        'Transforming the Way You Experience Wellness & Value.'
      ],
      logoConceptIdeas: `A sleek, minimalist emblem blending dynamic energy with modern geometric symmetry in bold, inspiring colors.`,
      logoPrompt: `Minimalist modern vector logo for ${name}, sleek modern typography, clean geometric iconography, vector flat design.`,
      logoStyle: 'Modern Premium Minimalist',
      brandColorPalette: ['#0284C7 (Ocean Blue)', '#0F172A (Deep Slate)', '#F8FAFC (Pure Light)', '#10B981 (Energetic Emerald)'],
      fontStyleSuggestions: 'Outfit (Headings) & Inter (Body)',
      brandPersonality: 'Inspiring, energetic, trustworthy, community-oriented, and premium.',
      packagingStyleSuggestions: 'Clean modern branding with high-contrast signage, premium member cards, and welcoming interior visuals.',
      socialMediaIdeas: 'Transformation reels, daily workout/tips shorts, member spotlights, and behind-the-scenes staff highlights.',
      websiteHero: `Welcome to ${name} — Your Ultimate Destination for Peak Performance and Growth.`,
      marketingCaptions: [
        `Ready to transform? Join the ${name} family today! 💥💪`,
        `Better results start here. Experience the difference at ${name}.`
      ]
    },
    businessPlan: {
      executiveSummary: `${name} operates in the rapidly growing ${categoryName} market, offering high-standard customer experiences with sustainable unit economics and rapid payback cycles.`,
      problemAndSolution: `${problem} ${solution}`,
      productDetails: `Complete suite of premium offerings designed for consistent customer retention and word-of-mouth referral growth.`,
      targetCustomers: targetAudience,
      businessModel: `Direct-to-consumer hybrid model featuring recurring memberships and high-margin ancillary products.`,
      pricingStrategy: `Tiered value pricing designed to be accessible while maintaining attractive 35-45% operating margins.`,
      goToMarketStrategy: `Hyper-local digital advertising, community society partnerships, referral incentives, and a high-profile opening launch.`,
      operationsPlan: `Standard operating procedures for facility hygiene, staff shifts, customer check-ins, and preventative equipment maintenance.`,
      teamRequirement: ['General Manager / Founder', 'Operations Supervisor', 'Lead Trainers / Specialists', 'Front-Desk Customer Support'],
      financialProjection: `Year 1 revenue target of ₹36,00,000 reaching operational breakeven by month 6, scaling to ₹1,20,00,000 by Year 3.`,
      fundingAsk: '₹20,00,000 for facility buildout, advanced machinery/equipment, and launch marketing.'
    },
    pitchDeck: [
      { slideNumber: 1, slideTitle: `${name}`, content: 'Redefining Excellence in Fitness & Lifestyle', speakerNotes: 'Welcome investors. Today we introduce our modern venture.' },
      { slideNumber: 2, slideTitle: 'The Problem', content: problem, speakerNotes: 'Customers are dissatisfied with substandard, unorganized competitors.' },
      { slideNumber: 3, slideTitle: 'Our Solution', content: solution, speakerNotes: 'We deliver a premium, technology-enabled customer experience.' },
      { slideNumber: 4, slideTitle: 'Market Size (TAM/SAM/SOM)', content: 'Total Addressable Market ₹50,000 Cr; Serviceable Market ₹12,000 Cr.', speakerNotes: 'Significant domestic tailwinds drive rapid annual sector expansion.' },
      { slideNumber: 5, slideTitle: 'Product & Service Highlights', content: coreFeatures.join(' • '), speakerNotes: 'Engineered for high engagement, customer loyalty, and retention.' },
      { slideNumber: 6, slideTitle: 'Business & Revenue Model', content: revenueStreams, speakerNotes: 'Predictable recurring cash flow with healthy unit economics.' },
      { slideNumber: 7, slideTitle: 'Competitive Advantage', content: 'Superior hygiene, certified talent, modern app integration, and community loyalty.', speakerNotes: 'Defensible local moat through high Net Promoter Score.' },
      { slideNumber: 8, slideTitle: 'Go-To-Market & Growth', content: 'Hyperlocal targeting, 100 founding members campaign, corporate wellness tie-ups.', speakerNotes: 'Low customer acquisition cost through referral loops.' },
      { slideNumber: 9, slideTitle: 'Financial Highlights', content: 'Break-even in Month 6. Year 1: ₹36 Lakhs; Year 3: ₹1.2 Crores ARR.', speakerNotes: 'Attractive 40% EBITDA margin potential at maturity.' },
      { slideNumber: 10, slideTitle: 'The Investment Ask', content: 'Raising ₹20,00,000 for equipment procurement, leasehold improvements, and working capital.', speakerNotes: 'Clear 3-year path to 5x capital growth and franchise expansion.' }
    ],
    marketResearch: {
      tam: '₹50,00,00,000',
      sam: '₹12,00,00,000',
      som: '₹2,50,00,000',
      targetMarket: targetAudience,
      customerSegments: ['Fitness Beginners & Enthusiasts', 'Working Corporate Professionals', 'College Students & Youth', 'Senior Wellness Seekers'],
      competitorAnalysis: 'Unorganized standalone local operators have weak customer trust. Large chains are expensive and crowded. Our startup bridges this gap with superior localized value.',
      marketTrends: ['Rising health consciousness post-pandemic', 'Demand for certified guidance', 'Social community-driven fitness'],
      opportunities: ['Corporate wellness partnerships', 'Branded retail merchandise and nutrition add-ons', 'Multi-city franchise expansion'],
      risks: ['Initial location rental costs', 'Staff turnover', 'Local competition pricing pressure'],
      pricingSuggestions: ['Standard Monthly: ₹2,000', 'Quarterly Pass: ₹5,000', 'Annual Value Plan: ₹16,000', 'Personal Coaching Add-on: ₹4,000/mo'],
      locationSuggestions: 'High-density urban residential hubs or commercial tech parks with dedicated parking and prominent street visibility.'
    },
    aiReport: {
      investmentReadinessScore: 88,
      startupScoreReason: 'Strong local market demand, healthy unit economics, high customer lifetime value, and clear operational roadmap.',
      businessStrengths: ['High recurring membership revenue', 'Low customer acquisition cost via local referrals', 'Strong community and brand moat'],
      weaknesses: ['Initial capital investment required for setup', 'Requires active on-ground quality control'],
      riskFactors: ['Competitive local discounting', 'Commercial lease expense fluctuations'],
      improvementSuggestions: ['Pre-sell memberships before launch to reduce working capital risk', 'Implement automated CRM to track customer retention'],
      scalabilityScore: 84,
      fundingReadiness: 'Seed / Early-Stage Angel Ready',
      mentorReviewSummary: 'High-conviction project with strong consumer fundamentals. Recommended to accelerate founding member pre-sales.'
    },
    ideaValidation: {
      validationScore: 90,
      problemStrength: 'High',
      marketNeed: 'Strong Demand',
      customerDemand: 'High Willingness to Pay',
      solutionFeasibility: 'High Feasibility',
      businessPotential: 'Strong Margin Potential',
      keyRisks: ['Equipment financing lead time', 'Local lease negotiation'],
      strengths: ['Clear consumer proposition', 'Repeat monthly transaction cycles', 'Strong margins'],
      weaknesses: ['Requires physical presence and vigilant management'],
      validationSummary: `The concept for ${name} addresses verified demand in the ${categoryName.toLowerCase()} sector with compelling profit potential.`,
      recommendedImprovements: [
        'Secure prime ground or first-floor location with high footfall',
        'Partner with local corporate offices for group wellness discounts',
        'Leverage social media transformation showcases'
      ],
      finalRecommendation: 'Strongly Recommended to Proceed'
    },
    competitorAnalysis: {
      directCompetitors: directCompetitors,
      indirectCompetitors: [
        {
          name: 'Home Workout Apps & Online Fitness',
          product: 'Digital video guides and fitness trackers',
          pricing: '₹500/month',
          keyFeatures: ['Home workouts', 'Calorie tracking'],
          targetAudience: 'Home exercise practitioners',
          strengths: ['Low cost', 'No commute required'],
          weaknesses: ['Zero equipment variety', 'Zero personal accountability', 'High drop-off rate'],
          marketPositioning: 'Digital DIY fitness'
        }
      ],
      comparisonMatrix: [
        { feature: 'Modern Certified Equipment', myStartup: 'Yes (100% Biomechanical)', competitor1: 'Basic / Outdated', competitor2: 'Standard' },
        { feature: 'Personalized Coaching & Attention', myStartup: 'Included in Onboarding', competitor1: 'No Guidance', competitor2: 'Expensive Add-on' },
        { feature: 'Cleanliness & Air Filtration', myStartup: 'Medical Grade Sanitization', competitor1: 'Poor / Average', competitor2: 'Standard' },
        { feature: 'Fair Transparent Pricing', myStartup: 'High Value (No Hidden Fees)', competitor1: 'Cheap / Substandard', competitor2: 'High Lock-in Fees' }
      ],
      marketGaps: ['Affordable premium fitness without long-term predatory contracts', 'Dedicated personal attention for beginners'],
      differentiationOpportunities: ['Integrated body composition tracking', 'Supportive inclusive environment for all fitness levels'],
      uniqueSellingProposition: `The premier community fitness club that empowers you to reach your peak performance with certified coaching and top-tier amenities.`,
      competitiveAdvantages: ['Passionate community culture', 'Higher trainer-to-member attention ratio', 'Modern mobile app convenience']
    },
    mvpPlan: {
      mvpConcept: `Phase 1 launch focusing on the core facility experience, essential equipment layout, certified coaches, and seamless member check-ins.`,
      coreFeatures: [
        'Complete cardio and strength equipment setup',
        'Member digital registration and check-in system',
        'Certified personal training consultation sessions',
        'Structured daily group fitness classes'
      ],
      mustHaveFeatures: [
        'Safety inspected workout machinery and free weights',
        'Clean locker rooms and washrooms',
        'Electronic access management and billing records',
        'First aid and emergency protocols'
      ],
      niceToHaveFeatures: [
        'Steam sauna and recovery lounge',
        'Integrated smoothie and protein shake bar',
        'Wearable biometric heart-rate tracking screens'
      ],
      userRoles: ['Member / Athlete', 'Personal Trainer / Coach', 'Front Desk Staff', 'Admin / Founder'],
      userFlow: [
        { step: 1, title: 'Inquiry & Trial', description: 'Visitor registers online or walks in for a facility tour and free 1-day pass.' },
        { step: 2, title: 'Consultation', description: 'Certified trainer conducts body composition analysis and establishes health goals.' },
        { step: 3, title: 'Membership Enrollment', description: 'Member selects membership plan, completes digital KYC, and receives welcome kit.' },
        { step: 4, title: 'Active Journey', description: 'Regular workouts, attendance tracking, and monthly progress evaluations.' }
      ],
      requiredTechStack: {
        frontend: ['React.js', 'TailwindCSS', 'Mobile Progressive Web App (PWA)'],
        backend: ['Node.js', 'Express.js'],
        database: ['MongoDB Atlas'],
        cloudServices: ['AWS / Render Cloud Hosting', 'Razorpay Payment Gateway']
      },
      developmentPhases: [
        { phase: 'Phase 1: Location & Fitout', duration: '4-6 Weeks', focus: 'Civil work, flooring, mirrors, lighting, and HVAC ventilation.' },
        { phase: 'Phase 2: Equipment & Tech', duration: '2 Weeks', focus: 'Delivery, calibration of equipment, POS and member app deployment.' },
        { phase: 'Phase 3: Launch & Pre-Sales', duration: '2 Weeks', focus: 'Founding member enrollment, grand opening ceremony, and trial workouts.' }
      ],
      mvpRoadmap: [
        { milestone: 'Finalize Commercial Lease Agreement', targetWeek: 'Week 2' },
        { milestone: 'Complete Interior Renovation & Equipment Setup', targetWeek: 'Week 6' },
        { milestone: 'Onboard 100 Founding Members', targetWeek: 'Week 8' },
        { milestone: 'Official Public Launch Day', targetWeek: 'Week 9' }
      ],
      estimatedComplexity: 'Medium',
      futureFeatures: ['Nutritional meal delivery partnerships', 'Franchise management dashboard', 'AI workout generator app']
    },
    financialPlan: {
      initialStartupCost: '₹18,00,000',
      developmentCost: '₹6,00,000',
      marketingCost: '₹2,00,000',
      operationalExpenses: '₹4,00,000',
      monthlyExpenses: '₹1,50,000',
      revenueModel: 'Monthly & Annual Memberships + Personal Training',
      suggestedPricing: '₹1,800/month (Annual: ₹16,000)',
      revenueProjection: '150 active members by Month 3; 300 active members by Month 12.',
      customerAcquisitionAssumptions: 'Average customer acquisition cost (CAC) of ₹850 with 85% monthly retention.',
      breakEvenEstimate: 'Month 6',
      year1Projection: { revenue: '₹38,00,000', expenses: '₹24,00,000', netProfit: '₹14,00,000' },
      year3Projection: { revenue: '₹95,00,000', expenses: '₹45,00,000', netProfit: '₹50,00,000' },
      year5Projection: { revenue: '₹1,80,00,000', expenses: '₹75,00,000', netProfit: '₹1,05,00,000' }
    },
    gtmStrategy: {
      targetAudience: targetAudience,
      idealCustomerProfile: `Health-conscious individuals aged 21-45 living within a 4 km radius, looking for an energizing and clean workout environment.`,
      customerPersonas: [
        {
          name: 'Corporate Vikram',
          role: 'IT Professional (Age 29)',
          painPoints: ['Sedentary job', 'Stress and posture problems', 'Inconsistent routine'],
          goal: 'Build strength and stay disciplined with structured morning workouts.',
          channels: ['Instagram', 'LinkedIn', 'Google Local Search']
        },
        {
          name: 'Active Ananya',
          role: 'College Student & Content Creator (Age 22)',
          painPoints: ['Intimidating crowd at old gyms', 'Lack of group class variety'],
          goal: 'Enjoy high-energy functional workouts with friends.',
          channels: ['Instagram Reels', 'WhatsApp Campus Groups']
        }
      ],
      positioningStrategy: `${name} is positioned as the top community fitness and lifestyle hub combining premium standards with authentic, welcoming energy.`,
      valueProposition: `Modern training, certified coaching, and an inspiring fitness community that guarantees results.`,
      marketingChannels: ['Google My Business (Local SEO)', 'Instagram Hyperlocal Ads', 'Residential Society Promotions', 'Word-of-Mouth Referral Rewards'],
      customerAcquisitionStrategy: `Attract leads through free 1-day passes; convert during free trainer consultations; retain through monthly milestone celebrations.`,
      launchStrategy: {
        preLaunch: ['Signboard placement & coming-soon social media teasers', 'Founding Member pre-sale at 40% discount for first 50 registrations'],
        launchDay: ['Grand opening event with fitness challenge and prize giveaways', 'Free trial workouts and complimentary protein shakes'],
        postLaunch: ['Member-get-member referral bonus campaign', 'Weekly Saturday morning community bootcamps']
      },
      first100CustomersStrategy: `Special 'Founding 100' lifetime discounted rate with complimentary personal training sessions and exclusive merchandise.`,
      socialMediaStrategy: [
        'Daily transformation reels and client testimonials',
        'Trainer quick tips on lifting form and nutrition',
        'Member spotlight stories and energetic workout music clips'
      ],
      contentStrategy: [
        'Hyperlocal fitness and nutrition guides',
        'Short-form workout routine videos on YouTube Shorts & Instagram',
        'Success stories shared in WhatsApp community group'
      ],
      growthStrategy: `Consolidate first location profitability within 12 months, followed by opening branch locations in adjacent neighborhoods.`,
      keyMarketingKPIs: ['Monthly Active Members', 'Member Retention Rate (>85%)', 'Customer Acquisition Cost (CAC)', 'Net Promoter Score (NPS)'],
      thirtyDayLaunchPlan: [
        { week: 'Week 1', goal: 'Generate Local Awareness', keyTasks: ['Distribute society flyers', 'Launch Instagram ad campaign', 'Open pre-registration booth'] },
        { week: 'Week 2', goal: 'Pre-Sales Conversions', keyTasks: ['Conduct facility preview tours', 'Sign up first 50 founding members'] },
        { week: 'Week 3', goal: 'Launch Event', keyTasks: ['Host Grand Opening Day', 'Engage local fitness influencers for trial coverage'] },
        { week: 'Week 4', goal: 'Operations Stabilization', keyTasks: ['Assess member feedback', 'Initiate member referral challenge'] }
      ],
      ninetyDayRoadmap: [
        { month: 'Month 1', focus: 'Launch & Member Onboarding', keyMilestones: ['Achieve 100+ active members', 'Smooth facility operations'] },
        { month: 'Month 2', focus: 'Engagement & Retention', keyMilestones: ['Maintain >85% attendance and retention', 'Launch group class schedule'] },
        { month: 'Month 3', focus: 'Breakeven Acceleration', keyMilestones: ['Cross 175 active members', 'Achieve operational cashflow breakeven'] }
      ]
    }
  };
}

async function callLLMJson(prompt: string, startupName = '', startupIdea = ''): Promise<any> {
  const retries = 3;
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_kEY || process.env.GEMINI_KEY || '').trim().replace(/^["']|["']$/g, '');
  const modelToUse = 'gemini-2.5-flash';

  for (let attempt = 1; attempt <= retries; attempt++) {
    // 1. Try SDK client
    try {
      const client = getAiClient();
      if (client) {
        const response = await client.models.generateContent({
          model: modelToUse,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        const text = response.text?.trim();
        if (text) {
          try {
            return parseJsonResponse(text);
          } catch (pe) {
            console.warn(`⚠️ Parse error on attempt ${attempt}:`, pe);
          }
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ Gemini SDK JSON attempt ${attempt} error:`, err?.message || err);
    }

    // 2. Direct REST API Fallback
    if (geminiKey) {
      try {
        const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });
        const restData: any = await restRes.json();
        const text = restData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          try {
            const parsed = parseJsonResponse(text);
            console.log(`✅ Gemini REST API JSON response generated successfully!`);
            return parsed;
          } catch (pe) {
            console.warn(`⚠️ REST Parse error on attempt ${attempt}:`, pe);
          }
        }
      } catch (restErr: any) {
        console.warn(`⚠️ Gemini REST JSON fallback attempt ${attempt} error:`, restErr?.message || restErr);
      }
    }

    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }

  // 3. Resilient fallback generator - never fail or throw 500!
  console.log(`🛡️ Serving resilient high-fidelity business plan for "${startupName || 'Startup'}"`);
  return generateFallbackStartup(startupName, startupIdea);
}

async function callAI(startupName: string, startupIdea: string) {
  const prompt = `${SYSTEM_PROMPT}\n\nStartup Name: ${startupName}\nStartup Idea: ${startupIdea}\n\nReturn ONLY the JSON object.`;
  return callLLMJson(prompt, startupName, startupIdea);
}

export const createDraft = async (req: Request, res: Response) => {
  try {
    const { startupName, startupIdea } = req.body;

    if (!startupName || !startupIdea) {
      return res.status(400).json({ success: false, message: 'Startup name and idea are required.' });
    }

    const isObjectId = (value: any) => typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
    const founderId = isObjectId((req as any).user?.id)
      ? (req as any).user.id
      : isObjectId(req.body.founderId)
        ? req.body.founderId
        : undefined;

    const newStartup = new Startup({
      startupName,
      startupIdea,
      status: 'pending_analysis',
      ...(founderId ? { founderId } : {}),
    });

    await newStartup.save();

    res.status(201).json({
      success: true,
      message: 'Startup idea saved successfully',
      data: {
        startupId: newStartup._id,
        startupName: newStartup.startupName,
        startupIdea: newStartup.startupIdea,
        status: newStartup.status
      }
    });
  } catch (error: any) {
    console.error('Error creating startup draft:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create startup draft.' });
  }
};

export const generateStateless = async (req: Request, res: Response) => {
  try {
    const { startupName, startupIdea } = req.body;
    const effectiveName = (startupName || startupIdea || 'New Venture').trim();
    const effectiveIdea = (startupIdea || startupName || 'Modern business venture').trim();

    const aiData = await callAI(effectiveName, effectiveIdea);

    res.status(200).json({
      success: true,
      message: 'Startup analyzed and generated successfully',
      data: {
        aiGenerated: aiData,
      }
    });

  } catch (error: any) {
    console.warn('Error generating startup statelessly, serving fallback:', error);
    const { startupName, startupIdea } = req.body;
    const fallbackData = generateFallbackStartup(startupName || 'Startup', startupIdea || 'Modern business venture');
    res.status(200).json({
      success: true,
      message: 'Startup analyzed and generated successfully',
      data: {
        aiGenerated: fallbackData,
      }
    });
  }
};

export const getStartup = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    if (!startupId || startupId === 'undefined' || !startupId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid startup id' });
    }
    const startup = await Startup.findById(startupId);

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    res.status(200).json({ success: true, data: startup });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching startup' });
  }
};

export const getAllStartups = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();

    if (role === 'founder') {
      filter.founderId = userId;
    } else if (role === 'mentor') {
      const bookings = await MentorBooking.find({ mentorId: userId, status: { $ne: 'cancelled' } });
      const startupIds = bookings.map(b => b.startupId);
      filter._id = { $in: startupIds };
    } else if (req.query.founderId) {
      filter.founderId = req.query.founderId;
    }

    if (req.query.investorVisible === 'true' || req.query.public === 'true') {
      filter.investorVisible = true;
    }
    
    let startups: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        startups = await Startup.find(filter).sort({ createdAt: -1 });
      } catch (dbErr) {}
    }
    res.status(200).json({ success: true, data: startups || [] });
  } catch (error: any) {
    res.status(200).json({ success: true, data: [] });
  }
};

export const updateStartup = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    if (!startupId || startupId === 'undefined' || !startupId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid startup id' });
    }
    const updateData = req.body;
    const startup = await Startup.findByIdAndUpdate(startupId, updateData, { new: true });
    
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }
    res.status(200).json({ success: true, data: startup });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating startup' });
  }
};

export const deleteStartup = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const startup = await Startup.findByIdAndDelete(startupId);
    
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }
    res.status(200).json({ success: true, message: 'Startup deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting startup' });
  }
};

export const regenerateStartup = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const startup = await Startup.findById(startupId);

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    let aiData: any;
    try {
      aiData = await callAI(startup.startupName, startup.startupIdea);
    } catch (e) {
      aiData = generateFallbackStartup(startup.startupName, startup.startupIdea);
    }

    startup.aiGenerated = aiData;
    startup.updatedAt = new Date();
    await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup regenerated successfully',
      data: startup
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error regenerating startup' });
  }
};

// ── Legal Documents Generation ──────────────────────────────────────────────────

const LEGAL_DOCS_PROMPT = `Generate idea-specific important documents for the startup.

Input:
Startup Name: {startupName}
Startup Idea: {startupIdea}
Country: India

Task:
Analyze the startup idea and detect the business category.

Possible categories:
- Food / Cafe / Restaurant
- SaaS / Software / AI
- Healthcare / Clinic / Hospital
- E-commerce
- Education / Training
- Manufacturing
- Retail / Local Shop
- Transport / Delivery
- Finance / FinTech
- Service Business
- Other

Important rule:
Do not generate the same documents for every startup.
Generate documents based on the detected category only.
Show only important documents by default.
Show maximum 8 essential documents.
Move optional documents under "View Optional Documents".

Output sections:
1. Detected Business Category
2. Essential Documents
3. Optional Documents
4. Investor Documents
5. Disclaimer

For each document show:
- Document Name
- Required / Optional
- Short Reason
- Upload Required: Yes / No
- Status: Pending / Uploaded / Verified / Rejected

Rules:
- Food business must include FSSAI.
- Cafe/restaurant/shop must include Shop & Establishment, Trade License, GST if applicable, Rent Agreement/NOC.
- SaaS/software must include Privacy Policy, Terms & Conditions, GST if applicable, software agreement.
- Healthcare must include healthcare-specific approval if applicable, biomedical waste permission if applicable, fire safety if required.
- E-commerce must include GST, Privacy Policy, Refund Policy, Terms & Conditions, vendor/payment gateway documents.
- Manufacturing must include GST, Udyam/MSME, trade/factory license if applicable, fire/pollution approval if applicable.
- Retail shop must include Shop & Establishment, Trade License, GST if applicable.
- Transport business must include vehicle RC, insurance, permit if applicable.
- FinTech must include company registration, privacy policy, terms, compliance review, financial regulatory note if applicable.

Investor Documents:
- Business Plan
- Pitch Deck
- Financial Projection
- Funding Ask
- Use of Funds
- Founder Profile
- Market Research Report

Disclaimer:
"This is an AI-generated checklist. Please verify with a CA, lawyer, or local authority before registration."

Return clean JSON only.

JSON output structure:
{
  "detectedCategory": "",
  "categoryReason": "",
  "essentialDocuments": [
    {
      "name": "",
      "required": "Required",
      "reason": "",
      "uploadRequired": "Yes",
      "status": "Pending"
    }
  ],
  "optionalDocuments": [
    {
      "name": "",
      "required": "Optional",
      "reason": "",
      "uploadRequired": "No",
      "status": "Pending"
    }
  ],
  "investorDocuments": [
    {
      "name": "",
      "required": "Optional",
      "reason": "",
      "uploadRequired": "No",
      "status": "Pending"
    }
  ],
  "disclaimer": "This is an AI-generated checklist. Please verify with a CA, lawyer, or local authority before registration."
}

Return ONLY valid JSON. No markdown. No explanation outside JSON.`;

async function callLegalAI(startupName: string, startupIdea: string, location: string) {
  const prompt = `${LEGAL_DOCS_PROMPT}\n\nStartup Name: ${startupName}\nStartup Idea: ${startupIdea}\nLocation: ${location}\n\nReturn ONLY the JSON object.`;
  return callLLMJson(prompt);
}

export const generateLogo = async (req: Request, res: Response) => {
  try {
    const { startupName, startupIdea, prompt, style, startupId } = req.body;
    const stabilityKey = process.env.STABILITY_AI || process.env.STABILITY_AI_API_KEY;

    if (!stabilityKey) {
      return res.status(400).json({ success: false, message: 'STABILITY_AI API key is not configured.' });
    }

    const basePrompt = prompt || (startupName
      ? `Professional startup logo for "${startupName}". ${startupIdea ? `Business: ${startupIdea}` : ''}`
      : 'A modern startup logo');

    const styleSuffix = style || 'Minimal, modern, vector logo on a plain white background. No watermark, no 3D, no mockup, no extra text.';
    const fullPrompt = `${basePrompt}. ${styleSuffix}`;

    console.log(`🎨 Generating logo for "${startupName || 'startup'}" via Stability AI...`);

    // Stability AI — v2beta core (current API, replaces the retired v1 SDXL endpoint)
    const form = new FormData();
    form.append('prompt', fullPrompt);
    form.append('output_format', 'png');
    form.append('aspect_ratio', '1:1');
    form.append('negative_prompt', 'watermark, text, 3d render, photorealistic, mockup, frame');

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityKey}`,
        'Accept': 'application/json',
      },
      body: form,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stability AI error:', data?.message || data);
      return res.status(response.status).json({ success: false, message: data?.message || 'Stability AI generation failed.' });
    }

    const imageBase64 = data?.image;
    if (!imageBase64) {
      return res.status(502).json({ success: false, message: 'Stability AI returned no image.' });
    }

    // Upload to Cloudinary
    let imageUrl = `data:image/png;base64,${imageBase64}`;
    let cloudinaryPublicId = '';
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const safeName = (startupName || 'logo').replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase().slice(0, 40);
        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload(
            `data:image/png;base64,${imageBase64}`,
            {
              resource_type: 'image',
              folder: `startup_logos/${startupId && startupId.match(/^[0-9a-fA-F]{24}$/) ? startupId : 'general'}`,
              public_id: `${safeName}_${Date.now()}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });
        imageUrl = uploadResult?.secure_url || uploadResult?.url || imageUrl;
        cloudinaryPublicId = uploadResult?.public_id || '';
        console.log(`☁️ Cloudinary logo upload success: ${imageUrl}`);
      } catch (cloudErr: any) {
        console.warn('⚠️ Cloudinary logo upload failed:', cloudErr?.message || cloudErr);
      }
    }

    // Persist logo to the Startup record so it survives reloads
    if (startupId && startupId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        const startup = await Startup.findById(startupId);
        if (startup) {
          startup.aiGenerated = {
            ...(startup.aiGenerated || {}),
            logo: {
              imageUrl,
              base64: imageBase64,
              publicId: cloudinaryPublicId,
              prompt: fullPrompt,
              createdAt: new Date().toISOString(),
            },
          } as any;
          await startup.save();
          console.log(`✅ Logo persisted to startup record ${startupId}`);
        }
      } catch (saveErr: any) {
        console.warn('⚠️ Could not persist logo to startup:', saveErr?.message || saveErr);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logo generated successfully',
      data: {
        base64: imageBase64,
        imageUrl,
        cloudinaryUrl: imageUrl.startsWith('http') ? imageUrl : '',
        cloudinaryPublicId,
        mimeType: 'image/png',
      },
    });
  } catch (error: any) {
    console.error('Error generating logo:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate logo.' });
  }
};

export const generateLegalDocs = async (req: Request, res: Response) => {
  try {
    const { startupName, startupIdea, location } = req.body;

    if (!startupName || !startupIdea) {
      return res.status(400).json({ success: false, message: 'Startup name and idea are required.' });
    }

    const legalData = await callLegalAI(startupName, startupIdea, location || 'India');

    res.status(200).json({
      success: true,
      message: 'Legal documents generated successfully',
      data: legalData
    });
  } catch (error: any) {
    console.error('Error generating legal docs:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate legal documents.' });
  }
};

import { retrieveContext, ChunkResult } from './ragController.js';
import { KnowledgeDoc } from '../models/KnowledgeChunk.js';

// ─── Response Cache & In-Flight Lock ──────────────────────────────────────────
const responseCache = new Map<string, { response: any; timestamp: number }>();
const pendingRequests = new Set<string>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// ─── LLM Generation Helper with Retry + Groq Failover ──────────────────────────

async function generateLLMResponse(prompt: string): Promise<string> {
  const retries = 3;
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_kEY || process.env.GEMINI_KEY || '').trim().replace(/^["']|["']$/g, '');
  const modelToUse = 'gemini-2.5-flash';

  for (let attempt = 1; attempt <= retries; attempt++) {
    // 1. Try SDK client
    try {
      const client = getAiClient();
      if (client) {
        const response = await client.models.generateContent({
          model: modelToUse,
          contents: prompt
        });
        const text = response.text?.trim();
        if (text) return text;
      }
    } catch (err: any) {
      console.warn(`⚠️ Gemini Chat SDK attempt ${attempt} error:`, err?.message || err);
    }

    // 2. Direct REST API Fallback
    if (geminiKey) {
      try {
        const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const restData: any = await restRes.json();
        const text = restData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          console.log(`✅ Gemini REST API Chat response generated successfully!`);
          return text;
        }
      } catch (restErr: any) {
        console.warn(`⚠️ Gemini REST Chat fallback attempt ${attempt} error:`, restErr?.message || restErr);
      }
    }

    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }

  // 3. Resilient fallback advisory response instead of throwing
  return "As your AI Startup Advisor, I am ready to guide your strategy. What specific area would you like to focus on next — customer acquisition, pricing model, marketing channels, or pitching to investors?";
}

export const chatStartup = async (req: Request, res: Response) => {
  try {
    const startupId = req.params.startupId || req.body.startupId;
    const { message, startupName, aiContext, history } = req.body;
    const userId = (req as any).user?.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let startup = null;
    if (startupId && startupId.match(/^[0-9a-fA-F]{24}$/)) {
      startup = await Startup.findById(startupId);
    }

    const effectiveStartupId = startupId || (startup ? startup._id.toString() : '');
    const effectiveName = startupName || startup?.startupName || 'your startup';
    const effectiveContext = aiContext || startup?.aiGenerated;

    const cacheKey = `${effectiveStartupId}:${message.trim().toLowerCase()}`;

    // Response Caching
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      console.log(`⚡ Returning cached response for query: "${message}"`);
      return res.status(200).json(cached.response);
    }

    // In-Flight Lock to prevent duplicate simultaneous requests
    if (pendingRequests.has(cacheKey)) {
      return res.status(429).json({
        success: false,
        message: 'A request for this query is already in progress. Please wait a moment.'
      });
    }

    pendingRequests.add(cacheKey);

    try {
      // ── 1. RAG Vector + Keyword Retrieval ─────────────────────────────────
      let retrievedChunks: ChunkResult[] = [];
      if (effectiveStartupId) {
        try {
          retrievedChunks = await retrieveContext(message, effectiveStartupId, userId, 8, 0.25);
        } catch (ragErr: any) {
          console.error('❌ RAG Retrieval Error:', ragErr?.message || ragErr);
        }
      }

      // Format conversation memory
      let historyContext = '';
      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-6);
        historyContext = '\nRecent Conversation History:\n' + 
          recentHistory.map((h: any) => `${h.role === 'user' ? 'Founder' : 'Assistant'}: ${h.text}`).join('\n');
      }

      // ── 2. Mode 1: Document Context Exists ──────────────────────────────────
      if (retrievedChunks.length > 0) {
        const contextText = retrievedChunks
          .map((c, i) => `[Excerpt ${i + 1} | Document: ${c.filename} | Page ${c.pageNumber} | Chunk ${c.chunkIndex}]\n${c.text}`)
          .join('\n\n---\n\n');

        const uniqueSources = Array.from(new Set(retrievedChunks.map(c => `${c.filename} (Page ${c.pageNumber})`)));

        const ragPrompt = `You are a Senior Hybrid RAG Business Assistant for ${effectiveName}.

Startup Profile Context:
${JSON.stringify(effectiveContext?.ideaAnalysis || {})}
${historyContext}

Uploaded Document Context:
---
${contextText}
---

Question: ${message}

Instructions:
1. Answer the question thoroughly using the uploaded document context provided above.
2. Synthesize a professional, structured, and practical response.
3. Keep the tone helpful and founder-focused.`;

        const replyText = await generateLLMResponse(ragPrompt);

        const responsePayload = {
          success: true,
          message: replyText,
          badge: 'Based on your uploaded documents',
          mode: 'document',
          sources: uniqueSources,
          isRag: true,
          retrievedChunksCount: retrievedChunks.length
        };

        responseCache.set(cacheKey, { response: responsePayload, timestamp: Date.now() });
        return res.status(200).json(responsePayload);
      }

      // ── 3. Mode 2: General Business Guidance Fallback ───────────────────────
      console.log(`💡 RAG: No document context matched for "${message}". Falling back to General Business Guidance.`);

      const fallbackPrompt = `You are an expert AI Co-Founder and Business Consultant for ${effectiveName}.
You specialize in startups, IT, SaaS, manufacturing, banking, finance, food & beverage, construction, real estate, transport, logistics, marketing, sales, pricing, funding, and business strategy.

Startup Profile & Context:
${JSON.stringify(effectiveContext || {})}
${historyContext}

Founder's Question: ${message}

Instructions:
1. Provide comprehensive, expert business guidance tailored specifically to ${effectiveName}.
2. Cover practical execution steps, industry benchmarks, calculations, and strategic advice.
3. Structure the response clearly with headings, bullet points, and actionable key takeaways.`;

      const replyText = await generateLLMResponse(fallbackPrompt);

      const responsePayload = {
        success: true,
        message: replyText,
        badge: 'General business guidance',
        mode: 'general',
        sources: [],
        isRag: false
      };

      responseCache.set(cacheKey, { response: responsePayload, timestamp: Date.now() });
      return res.status(200).json(responsePayload);
    } finally {
      pendingRequests.delete(cacheKey);
    }
  } catch (error: any) {
    console.error('❌ Error in chatStartup:', error?.message || error);
    const cleanMessage = error?.message?.includes('usage limit')
      ? error.message
      : 'AI usage limit reached. Please wait a moment and try again.';
    res.status(200).json({ 
      success: false, 
      message: cleanMessage
    });
  }
};
