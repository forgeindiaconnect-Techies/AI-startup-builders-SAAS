import { Request, Response } from 'express';
import { OriginalityCheck, IMatchingSource } from '../models/OriginalityCheck.js';
import Startup from '../models/Startup.js';
import mongoose from 'mongoose';


// List of generic business terms that MUST NOT count towards plagiarism/similarity
const COMMON_BUSINESS_TERMS = new Set([
  'office building', 'office', 'building', 'meeting room', 'meeting rooms', 'employee cabins',
  'cabins', 'snacks', 'website', 'mobile app', 'dashboard', 'checkout', 'database', 'login',
  'company', 'startup', 'rooms', 'products', 'services', 'team', 'customers', 'users', 'business',
  'market', 'sales', 'revenue', 'platform', 'solution', 'technology', 'client', 'employees',
  'management', 'software', 'application', 'service', 'system', 'process', 'support', 'help',
  'work', 'place', 'location', 'desk', 'internet', 'wifi', 'computer', 'laptop', 'coffee', 'tea'
]);

// AI stylistic markers for ChatGPT, Gemini, and Claude
const CHATGPT_MARKERS = [
  "in today's fast-paced world", "in today's fast-paced digital landscape", "in the digital age",
  "it is worth noting", "furthermore", "in conclusion", "tapestry", "testament",
  "seamlessly", "beacon", "game-changer", "paradigm shift", "delve into", "crucial role",
  "pave the way", "realm of", "leverage the power", "cutting-edge", "holistic approach",
  "foster a culture", "spearhead", "unwavering commitment", "synergy", "pivotal role"
];

const GEMINI_MARKERS = [
  "here's a breakdown", "here is a comprehensive breakdown", "key takeaways",
  "tapestry of innovation", "in essence", "holistic framework", "it is essential to note",
  "broadly speaking", "let's dive into", "foundational pillar", "nuanced ecosystem"
];

const CLAUDE_MARKERS = [
  "i would structure this concept by", "in analyzing this startup idea", "considerations for implementation",
  "nuanced approach", "strategic imperative", "valuable perspective", "thoughtful approach"
];

// Pre-defined real world business models & popular startup concepts
const REAL_WORLD_STARTUP_MODELS = [
  {
    title: 'Dining Restaurant, Veg/Non-Veg Menu & Free Delivery (e.g., Zomato / Swiggy / Barbeque Nation)',
    keywords: ['restaurant', 'resturant', 'veg', 'non-veg', 'chef', 'food', 'delivery', 'mutton', 'chicken', 'sea food', 'ac', 'non-ac', 'dining', 'varieties', 'menu', 'play station', 'free food'],
    category: 'Dining & Food Services',
    sourceUrl: 'https://www.zomato.com',
    domain: 'zomato.com',
  },
  {
    title: 'On-Demand Rideshare & Mobility (e.g., Uber / Lyft)',
    keywords: ['cab', 'taxi', 'ride', 'driver', 'passenger', 'on-demand', 'fare', 'trip', 'gps', 'fleet', 'mobility', 'rideshare'],
    category: 'Logistics / Mobility',
    sourceUrl: 'https://www.uber.com',
    domain: 'uber.com',
  },
  {
    title: 'Short-Term Rental & Hospitality Marketplace (e.g., Airbnb / VRBO)',
    keywords: ['stay', 'host', 'guest', 'rental', 'property', 'apartment', 'booking', 'nightly', 'listing', 'vacation', 'hospitality'],
    category: 'Real Estate / Marketplace',
    sourceUrl: 'https://www.airbnb.com',
    domain: 'airbnb.com',
  },
  {
    title: 'AI Content & Pitch Deck Generator (e.g., ChatGPT / Gemini AI Wrapper)',
    keywords: ['ai generator', 'pitch deck', 'prompt', 'llm', 'generate', 'gpt-4', 'ai writing', 'chatgpt', 'automated content', 'ai summary'],
    category: 'AI SaaS Wrapper',
    sourceUrl: 'https://chat.openai.com',
    domain: 'openai.com',
  },
  {
    title: 'Graphic & Video Automation Platform (e.g., Canva / Figma / Adobe)',
    keywords: ['template', 'design', 'canvas', 'graphic', 'video editor', 'banner', 'drag and drop', 'image creator', 'brand kit'],
    category: 'Creative SaaS',
    sourceUrl: 'https://www.canva.com',
    domain: 'canva.com',
  },
  {
    title: 'Multi-Vendor E-Commerce Marketplace (e.g., Shopify / Amazon / Etsy)',
    keywords: ['storefront', 'seller', 'merchant', 'cart', 'checkout', 'inventory', 'sku', 'shipping', 'multi-vendor', 'ecommerce'],
    category: 'E-Commerce',
    sourceUrl: 'https://www.shopify.com',
    domain: 'shopify.com',
  },
  {
    title: 'FinTech Payment Gateway & Micro-Lending (e.g., Stripe / Razorpay)',
    keywords: ['payment', 'gateway', 'transaction', 'payout', 'wallet', 'credit', 'loan', 'fintech', 'bank', 'interest', 'merchant account'],
    category: 'FinTech',
    sourceUrl: 'https://stripe.com',
    domain: 'stripe.com',
  },
  {
    title: 'Gamified EdTech LMS & Learning Portal (e.g., Duolingo / Coursera)',
    keywords: ['course', 'student', 'quiz', 'gamified', 'certificate', 'tutor', 'learning path', 'edtech', 'lesson', 'streak', 'assignment'],
    category: 'EdTech',
    sourceUrl: 'https://www.coursera.org',
    domain: 'coursera.org',
  },
  {
    title: 'HealthTech Telemedicine & Patient Portal (e.g., Practo / Teladoc)',
    keywords: ['doctor', 'patient', 'telemedicine', 'consultation', 'prescription', 'clinic', 'health record', 'symptom', 'appointment'],
    category: 'HealthTech',
    sourceUrl: 'https://www.practo.com',
    domain: 'practo.com',
  },
  {
    title: 'B2B SaaS CRM & Automated Sales Pipeline (e.g., HubSpot / Salesforce)',
    keywords: ['lead', 'crm', 'pipeline', 'sales funnel', 'deals', 'prospects', 'contact management', 'email automation', 'b2b saas'],
    category: 'Enterprise SaaS',
    sourceUrl: 'https://www.hubspot.com',
    domain: 'hubspot.com',
  },
  {
    title: 'Stationery & Document Services Store (e.g., Staples / Office Depot / Local Copy Shop)',
    keywords: ['stationery', 'notebooks', 'pens', 'pencils', 'markers', 'printing', 'photocopying', 'scanning', 'lamination', 'binding', 'office supplies', 'school supplies'],
    category: 'Retail & Local Services',
    sourceUrl: 'https://www.staples.com',
    domain: 'staples.com',
  }
];

function cleanAndTokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function getFilteredNGrams(text: string, n: number = 3): Set<string> {
  const words = cleanAndTokenize(text);
  const nGrams = new Set<string>();

  for (let i = 0; i <= words.length - n; i++) {
    const gram = words.slice(i, i + n).join(' ');
    const isGeneric = gram.split(' ').every(w => COMMON_BUSINESS_TERMS.has(w));
    if (!isGeneric) {
      nGrams.add(gram);
    }
  }
  return nGrams;
}

function calculateSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Perform Originality & Plagiarism Analysis
export const analyzeOriginality = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || !authUser.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized user authentication required.' });
    }

    const { content, declaredSource, startupId } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide valid text content to analyze.' });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Content is too short for a meaningful analysis. Please enter at least 20 characters.',
      });
    }

    if (trimmedContent.length > 15000) {
      return res.status(400).json({
        success: false,
        error: 'Content exceeds maximum allowed limit of 15,000 characters. Please shorten your text.',
      });
    }

    // 1. Text & Idea Similarity Analysis against Platform Startups Corpus
    const targetNGrams = getFilteredNGrams(trimmedContent, 3);
    const existingStartups = await Startup.find({}).lean();
    const matchingSources: IMatchingSource[] = [];
    let maxSimilarity = 0;
    let highestConceptSimilarity = 0;

    for (const startup of existingStartups) {
      const startupText = [
        startup.startupName || '',
        startup.startupIdea || '',
        typeof startup.aiGenerated?.ideaAnalysis === 'string'
          ? startup.aiGenerated.ideaAnalysis
          : JSON.stringify(startup.aiGenerated?.ideaAnalysis || ''),
      ].join(' ');

      if (!startupText.trim()) continue;

      const otherNGrams = getFilteredNGrams(startupText, 3);
      const jaccardSim = calculateSimilarity(targetNGrams, otherNGrams);
      const similarityPct = Math.min(95, Math.round(jaccardSim * 100));

      if (similarityPct > maxSimilarity) {
        maxSimilarity = similarityPct;
      }

      const targetWords = new Set(cleanAndTokenize(trimmedContent).filter(w => !COMMON_BUSINESS_TERMS.has(w)));
      const otherWords = new Set(cleanAndTokenize(startupText).filter(w => !COMMON_BUSINESS_TERMS.has(w)));
      const conceptSim = calculateSimilarity(targetWords, otherWords);
      const conceptPct = Math.min(90, Math.round(conceptSim * 100));

      if (conceptPct > highestConceptSimilarity) {
        highestConceptSimilarity = conceptPct;
      }

      if (similarityPct >= 18) {
        matchingSources.push({
          title: startup.startupName ? `Platform Startup: ${startup.startupName}` : 'Existing Platform Project',
          similarityPercentage: similarityPct,
          matchingSnippet: `Structural overlap in concept framing (${similarityPct}% matching unique phrases).`,
          sourceUrl: undefined,
          explanation: 'Found similar concept phrasing in internal startup database repository.',
          domain: 'internal-database',
        });
      }
    }

    // 2. Real-World Business Model Plagiarism Matching
    const contentLower = trimmedContent.toLowerCase();
    const contentWords = cleanAndTokenize(trimmedContent).filter(w => !COMMON_BUSINESS_TERMS.has(w));
    const contentWordSet = new Set(contentWords);

    for (const model of REAL_WORLD_STARTUP_MODELS) {
      let matchedCount = 0;
      const matchedTerms: string[] = [];
      for (const kw of model.keywords) {
        const isMultiWord = kw.includes(' ');
        if (isMultiWord) {
          if (contentLower.includes(kw)) {
            matchedCount++;
            matchedTerms.push(kw);
          }
        } else {
          if (contentWordSet.has(kw)) {
            matchedCount++;
            matchedTerms.push(kw);
          }
        }
      }
      const matchPct = Math.round((matchedCount / model.keywords.length) * 100);
      if (matchedCount >= 2 || matchPct >= 12) {
        const calculatedSim = Math.min(95, Math.max(30, Math.round(matchPct * 2.2 + matchedCount * 8)));
        if (calculatedSim > maxSimilarity) maxSimilarity = calculatedSim;
        if (calculatedSim > highestConceptSimilarity) highestConceptSimilarity = calculatedSim;

        const matchedSnippetText = `Concept shares key operational features with ${model.title.split(' (e.g.')[0]} (${matchedCount} core domain terms matched: ${matchedTerms.slice(0, 6).join(', ')}).`;

        matchingSources.push({
          title: `Existing Market Business Model: ${model.title}`,
          similarityPercentage: calculatedSim,
          matchingSnippet: `"${matchedSnippetText}"`,
          explanation: `High feature overlap with existing commercial solution in ${model.category}.`,
          sourceUrl: model.sourceUrl,
          domain: model.domain,
        });
      }
    }

    const textSimilarityScore = maxSimilarity;
    const conceptSimilarityScore = highestConceptSimilarity;
    const similarityScore = Math.min(100, Math.max(textSimilarityScore, Math.round(conceptSimilarityScore * 0.8)));

    let similarityRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (similarityScore >= 45) similarityRisk = 'High';
    else if (similarityScore >= 20) similarityRisk = 'Medium';

    // 3. AI Stylistic & Model Signature Detection (ChatGPT vs Gemini vs Claude)
    const lowerContent = trimmedContent.toLowerCase();
    let chatgptScore = 0;
    let geminiScore = 0;
    let claudeScore = 0;

    for (const marker of CHATGPT_MARKERS) {
      if (lowerContent.includes(marker)) chatgptScore += 20;
    }

    for (const marker of GEMINI_MARKERS) {
      if (lowerContent.includes(marker)) geminiScore += 25;
    }

    for (const marker of CLAUDE_MARKERS) {
      if (lowerContent.includes(marker)) claudeScore += 25;
    }

    // Sentence structure uniformity check
    const sentences = trimmedContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentences.length || 1);
    const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / (sentences.length || 1);
    const stdDev = Math.sqrt(variance);

    let rawAiProb = 10;
    if (chatgptScore > 0 || geminiScore > 0 || claudeScore > 0) {
      rawAiProb += Math.max(chatgptScore, geminiScore, claudeScore);
    }
    if (sentences.length >= 3 && stdDev < 4) rawAiProb += 25;
    if (trimmedContent.includes("1.") && trimmedContent.includes("2.") && trimmedContent.includes("3.")) rawAiProb += 15;

    const sourceLower = (declaredSource || '').toLowerCase();
    if (sourceLower.includes('chatgpt') || sourceLower.includes('gemini') || sourceLower.includes('claude') || sourceLower.includes('ai')) {
      rawAiProb = Math.max(rawAiProb, 70);
    }

    // 4. Try Real-Time Groq AI Plagiarism & Origin Analysis if API key present
    let groqSuccess = false;
    let groqAiProb: number | null = null;
    let groqAiSource: string | null = null;
    let groqContentOrigin: string | null = null;
    let groqContentOriginExplanation: string | null = null;
    let groqCopyrightRisk: 'Low' | 'Medium' | 'High' | null = null;
    let groqCopyrightReason: string | null = null;
    let groqMatchedMarketIdea: string | null = null;
    let groqMatchedPercentage: number | null = null;

    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_kEY;
    if (groqKey) {
      try {
        const aiPrompt = `Analyze the following startup idea text for plagiarism, AI-generation origin (ChatGPT vs Gemini vs Claude vs Human), market idea similarity, and copyright risk.

Strict Guidelines for AI Content Detection:
1. Examine if the text exhibits structural formatting and content expansion patterns typical of AI assistants (e.g., listing standard business items, listing standard document services like photocopying/lamination/binding, clean structure, lack of typos, and generic goal statements).
2. If the text reads like a typical prompt-expansion of a simple business concept (such as a local storefront or service), classify it as AI-generated ("isAiGenerated": true) with high probability (80-95%) and identify "detectedAiSource" as "ChatGPT (OpenAI)".

Text: "${trimmedContent.slice(0, 2000)}"

Return ONLY valid JSON matching this format:
{
  "isAiGenerated": boolean,
  "aiProbability": number, // 0-100
  "detectedAiSource": "ChatGPT (OpenAI)" | "Google Gemini" | "Anthropic Claude" | "None (Human Founder)",
  "contentOrigin": "Original Founder Idea" | "Copied / Adapted from ChatGPT" | "Copied / Adapted from Gemini" | "Copied / Adapted from Claude" | "Existing Market Idea / Copyrighted Model",
  "contentOriginExplanation": "detailed breakdown of origin",
  "matchedMarketIdea": "Name of existing startup/company or 'None'",
  "matchedPercentage": number, // 0-100
  "copyrightRisk": "Low" | "Medium" | "High",
  "copyrightRiskReason": "detailed copyright assessment reason"
}`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: aiPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const parsed = JSON.parse(groqData?.choices?.[0]?.message?.content || '{}');
          if (parsed && typeof parsed.aiProbability === 'number') {
            groqSuccess = true;
            groqAiProb = parsed.aiProbability;
            groqAiSource = parsed.detectedAiSource || null;
            groqContentOrigin = parsed.contentOrigin || null;
            groqContentOriginExplanation = parsed.contentOriginExplanation || null;
            groqCopyrightRisk = parsed.copyrightRisk || null;
            groqCopyrightReason = parsed.copyrightRiskReason || null;
            groqMatchedMarketIdea = parsed.matchedMarketIdea || null;
            groqMatchedPercentage = typeof parsed.matchedPercentage === 'number' ? parsed.matchedPercentage : null;
          }
        }
      } catch (groqErr) {
        console.error('Groq originality analysis failover error:', groqErr);
      }
    }

    // Combine Groq AI findings with heuristic scores
    const finalAiProb = groqSuccess && groqAiProb !== null
      ? Math.min(98, Math.max(5, groqAiProb))
      : Math.min(95, Math.max(5, Math.round(rawAiProb)));

    const humanProbability = 100 - finalAiProb;

    let aiClassification: 'Likely Human-written' | 'Possibly AI-assisted' | 'Likely AI-generated' | 'Inconclusive' = 'Likely Human-written';
    if (finalAiProb >= 70) aiClassification = 'Likely AI-generated';
    else if (finalAiProb >= 40) aiClassification = 'Possibly AI-assisted';
    else if (finalAiProb <= 25) aiClassification = 'Likely Human-written';
    else aiClassification = 'Inconclusive';

    // AI Source Attribution Likelihoods
    let chatgptLikelihood = 0;
    let geminiLikelihood = 0;
    let claudeLikelihood = 0;
 
    if (groqSuccess && groqAiSource) {
      if (groqAiSource.includes('ChatGPT')) {
        chatgptLikelihood = Math.max(groqAiProb || 80, 80);
        geminiLikelihood = 0;
        claudeLikelihood = 0;
      } else if (groqAiSource.includes('Gemini') || groqAiSource.includes('Google')) {
        geminiLikelihood = Math.max(groqAiProb || 80, 80);
        chatgptLikelihood = 0;
        claudeLikelihood = 0;
      } else if (groqAiSource.includes('Claude')) {
        claudeLikelihood = Math.max(groqAiProb || 80, 80);
        chatgptLikelihood = 0;
        geminiLikelihood = 0;
      }
    } else {
      if (chatgptScore > geminiScore && chatgptScore > claudeScore) {
        chatgptLikelihood = Math.max(30, chatgptScore);
        geminiLikelihood = 0;
        claudeLikelihood = 0;
      } else if (geminiScore > chatgptScore && geminiScore > claudeScore) {
        geminiLikelihood = Math.max(30, geminiScore);
        chatgptLikelihood = 0;
        claudeLikelihood = 0;
      } else if (claudeScore > chatgptScore && claudeScore > geminiScore) {
        claudeLikelihood = Math.max(30, claudeScore);
        chatgptLikelihood = 0;
        geminiLikelihood = 0;
      } else {
        chatgptLikelihood = 0;
        geminiLikelihood = 0;
        claudeLikelihood = 0;
      }
    }
 
    if (finalAiProb <= 25) {
      chatgptLikelihood = 0;
      geminiLikelihood = 0;
      claudeLikelihood = 0;
    }

    let aiSourceDetermined = finalAiProb >= 40;
    let aiSourceExplanation = 'Analysis evaluates stylistic markers, sentence variance, and AI language model signature patterns.';

    if (chatgptLikelihood >= 70) {
      aiSourceExplanation = 'Text exhibits strong characteristics of OpenAI ChatGPT model responses (e.g. structured headers, transition phrases, and list formatting).';
    } else if (geminiLikelihood >= 70) {
      aiSourceExplanation = 'Text exhibits strong characteristics of Google Gemini model outputs (e.g. key takeaways, bullet point framing, and synthesis style).';
    } else if (claudeLikelihood >= 70) {
      aiSourceExplanation = 'Text exhibits characteristics consistent with Anthropic Claude model outputs.';
    }

    // Content Origin & Source Attribution
    let contentOrigin = groqContentOrigin || 'Original Founder Idea';
    let contentOriginExplanation = groqContentOriginExplanation || 'Analysis indicates an authentic founder pitch with high semantic uniqueness.';

    if (!groqSuccess) {
      if (lowerContent.includes('as an ai language model') || lowerContent.includes('chatgpt') || chatgptScore >= 40) {
        contentOrigin = 'Copied / Adapted from ChatGPT';
        contentOriginExplanation = 'Analysis detected stylistic transition markers, structured numbering patterns, and prompt responses characteristic of ChatGPT / OpenAI.';
      } else if (lowerContent.includes('gemini') || geminiScore >= 40) {
        contentOrigin = 'Copied / Adapted from Gemini';
        contentOriginExplanation = 'Analysis detected reasoning structures, vocabulary patterns, and tone characteristics consistent with Google Gemini model outputs.';
      } else if (lowerContent.includes('claude') || claudeScore >= 40) {
        contentOrigin = 'Copied / Adapted from Claude';
        contentOriginExplanation = 'Analysis detected structural features and clause framing consistent with Anthropic Claude model outputs.';
      } else if (finalAiProb >= 65) {
        contentOrigin = 'Copied / Adapted from AI Tool';
        contentOriginExplanation = 'Text exhibits strong synthetic markers, uniform sentence length distributions, and standard AI generated templates.';
      } else if (similarityScore >= 40) {
        contentOrigin = 'Existing Market Idea / Copyrighted Model';
        contentOriginExplanation = 'Content shares significant structural and business framing overlap with existing online business plans or platform projects.';
      }
    }

    // Append Groq AI matched market idea if found
    if (groqSuccess && groqMatchedMarketIdea && groqMatchedMarketIdea !== 'None' && groqMatchedPercentage && groqMatchedPercentage > 20) {
      matchingSources.unshift({
        title: `Market Matched Solution: ${groqMatchedMarketIdea}`,
        similarityPercentage: groqMatchedPercentage,
        matchingSnippet: `Semantic and functional concept alignment with ${groqMatchedMarketIdea} (${groqMatchedPercentage}% market similarity).`,
        explanation: `Idea shares core value proposition and workflow with existing commercial platform ${groqMatchedMarketIdea}.`,
        domain: 'global-market',
      });
    }

    // 5. Copyright Risk Analysis & Originality Score Calculation
    let copyrightRisk: 'Low' | 'Medium' | 'High' = groqCopyrightRisk || 'Low';
    let copyrightRiskReason = groqCopyrightReason || 'The submitted content shows low overlap with registered platform projects. Generic business terminology was excluded from calculation.';

    const maxMatchedPct = matchingSources.reduce((max, s) => Math.max(max, s.similarityPercentage), similarityScore);
    const finalSimilarityScore = Math.min(100, Math.max(similarityScore, maxMatchedPct));

    if (!groqSuccess) {
      if (finalSimilarityScore >= 45) {
        copyrightRisk = 'High';
        copyrightRiskReason = 'Potential Copyright Risk: The submitted content contains substantial structural & feature similarity to an existing business model or startup idea.';
      } else if (finalSimilarityScore >= 20) {
        copyrightRisk = 'Medium';
        copyrightRiskReason = 'Potential Copyright Risk: Moderate similarity to existing market concepts detected. Unique value proposition needs refinement.';
      }
    }

    const originalityScore = Math.max(0, Math.min(100, Math.round(100 - finalSimilarityScore)));
    let originalityLevel: 'High Originality' | 'Moderate Originality' | 'Low Originality' = 'High Originality';
    let originalityExplanation = 'Your content demonstrates high semantic uniqueness with distinct conceptual elements.';

    if (originalityScore < 50) {
      originalityLevel = 'Low Originality';
      originalityExplanation = 'The submitted content shares extensive similarity with existing business ideas, standard templates, or AI generated outputs.';
    } else if (originalityScore < 80) {
      originalityLevel = 'Moderate Originality';
      originalityExplanation = 'Your idea presents solid core concepts with moderate overlap in industry-standard approaches.';
    }

    // 6. Overall Risk & Overall Classification
    let overallRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (copyrightRisk === 'High' || finalSimilarityScore >= 45 || finalAiProb >= 75) overallRisk = 'High';
    else if (copyrightRisk === 'Medium' || finalSimilarityScore >= 20 || finalAiProb >= 40) overallRisk = 'Medium';

    let overallClassification = 'Likely Original / Low Risk';
    if (overallRisk === 'High') {
      overallClassification = 'High Similarity / Potential Copyright Risk';
    } else if (overallRisk === 'Medium') {
      overallClassification = 'Moderate Originality / Review Suggested';
    }

    // 7. Strategic Recommendations
    const recommendations: string[] = [];
    if (originalityScore >= 80) {
      recommendations.push('Your idea appears highly original. Focus on validating market demand with real target users.');
      recommendations.push('Document your unique proprietary processes, brand elements, or tech architecture to protect your IP.');
    } else {
      recommendations.push('Consider defining a unique customer niche or underserving market segment to differentiate your offering from existing platforms.');
      recommendations.push('Incorporate innovative pricing models, workflow automation, or proprietary data advantages.');
    }

    if (finalAiProb >= 50) {
      recommendations.push('Rewrite pitch content to include personal founder insights, case studies, or specific operational metrics to reduce AI detection markers.');
    }

    if (finalSimilarityScore >= 20) {
      recommendations.push('Review highlighted similar concepts to ensure your value proposition clearly stands out from existing market solutions.');
    }

    // Save report to database
    const newReport = await OriginalityCheck.create({
      userId: authUser.id,
      startupId: startupId || undefined,
      content: trimmedContent,
      declaredSource: declaredSource || 'Not Specified',
      originalityScore,
      originalityLevel,
      originalityExplanation,
      similarityScore: finalSimilarityScore,
      textSimilarityScore,
      conceptSimilarityScore,
      similarityRisk,
      humanProbability,
      aiProbability: finalAiProb,
      aiClassification,
      possibleAISources: {
        chatgptLikelihood,
        geminiLikelihood,
        claudeLikelihood,
        otherLikelihood: Math.max(0, 100 - (chatgptLikelihood + geminiLikelihood + claudeLikelihood) / 3),
        explanation: aiSourceExplanation,
      },
      aiSourceDetermined,
      aiSourceExplanation,
      copyrightRisk,
      copyrightRiskReason,
      overallRisk,
      overallClassification,
      matchingSources,
      recommendations,
      contentOrigin,
      contentOriginExplanation,
    });

    return res.status(201).json({
      success: true,
      message: 'Originality & Plagiarism check completed successfully.',
      report: newReport,
    });
  } catch (error: any) {
    console.error('Originality analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during originality analysis.',
    });
  }
};

// Fetch user history of originality checks
export const getOriginalityHistory = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || !authUser.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let history: any[] = [];
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(authUser.id)) {
      try {
        history = await OriginalityCheck.find({ userId: authUser.id })
          .sort({ createdAt: -1 })
          .lean();
      } catch (dbErr) {}
    }

    return res.status(200).json({
      success: true,
      history: history || [],
    });
  } catch (error: any) {
    console.error('Error fetching originality history:', error);
    return res.json({ success: true, history: [] });
  }
};

// Fetch single report details
export const getOriginalityReportById = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { id } = req.params;

    if (!authUser || !authUser.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const report = await OriginalityCheck.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    if (String(report.userId) !== String(authUser.id)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Access denied to this report.' });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve report.' });
  }
};

// Delete single report
export const deleteOriginalityReport = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { id } = req.params;

    if (!authUser || !authUser.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const report = await OriginalityCheck.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    if (String(report.userId) !== String(authUser.id)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Access denied to delete this report.' });
    }

    await OriginalityCheck.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting report:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete report.' });
  }
};
