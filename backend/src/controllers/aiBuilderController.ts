import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import Startup from '../models/Startup.js';

let aiClient: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    console.warn("⚠️ GEMINI_API_KEY is not set in environment variables.");
  }
} catch (e) {
  console.error("Failed to initialize Google Generative AI", e);
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
  "businessPlan": {
    "executiveSummary": "",
    "problemAndSolution": "",
    "marketOpportunity": "",
    "productAndFeatures": [],
    "businessModel": "",
    "goToMarketStrategy": "",
    "competitiveAnalysis": "",
    "teamSuggestion": "",
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
    "competitors": [],
    "marketTrends": [],
    "opportunities": [],
    "risks": [],
    "pricingSuggestions": []
  },
  "aiReport": {
    "investmentReadinessScore": 0,
    "startupScoreReason": "",
    "keyStrengths": [],
    "riskFactors": [],
    "improvementSuggestions": [],
    "fundingReadiness": "",
    "mentorReviewSummary": ""
  }
}`;

async function callAI(startupName: string, startupIdea: string) {
  if (!aiClient) {
    throw new Error("AI Client is not configured. Missing API key.");
  }

  const prompt = `${SYSTEM_PROMPT}\n\nStartup Name: ${startupName}\nStartup Idea: ${startupIdea}\n\nReturn ONLY the JSON object.`;
  
  const response = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response");
  
  let cleanText = text.trim();
  if (cleanText.startsWith('\`\`\`json')) cleanText = cleanText.substring(7);
  if (cleanText.startsWith('\`\`\`')) cleanText = cleanText.substring(3);
  if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.substring(0, cleanText.length - 3);

  return JSON.parse(cleanText);
}

export const createDraft = async (req: Request, res: Response) => {
  try {
    const { startupName, startupIdea } = req.body;

    if (!startupName || !startupIdea) {
      return res.status(400).json({ success: false, message: 'Startup name and idea are required.' });
    }

    const newStartup = new Startup({
      startupName,
      startupIdea,
      status: 'pending_analysis',
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

    if (!startupName || !startupIdea) {
      return res.status(400).json({ success: false, message: 'Startup name and idea are required.' });
    }

    const aiData = await callAI(startupName, startupIdea);

    res.status(200).json({
      success: true,
      message: 'Startup analyzed and generated successfully',
      data: {
        aiGenerated: aiData,
      }
    });

  } catch (error: any) {
    console.error('Error generating startup statelessly:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate startup.' });
  }
};

export const getStartup = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const startup = await Startup.findById(startupId);

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    res.status(200).json({ success: true, data: startup });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching startup' });
  }
};

export const getAllStartups = async (req: Request, res: Response) => {
  try {
    // Optionally filter by founderId if passed in query
    const filter: any = {};
    if (req.query.founderId) {
      filter.founderId = req.query.founderId;
    }
    const startups = await Startup.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: startups });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching startups' });
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

    const aiData = await callAI(startup.startupName, startup.startupIdea);

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
  if (!aiClient) {
    throw new Error("AI Client is not configured. Missing API key.");
  }

  const prompt = `${LEGAL_DOCS_PROMPT}\n\nStartup Name: ${startupName}\nStartup Idea: ${startupIdea}\nLocation: ${location}\n\nReturn ONLY the JSON object.`;

  const response = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response");

  let cleanText = text.trim();
  if (cleanText.startsWith('\`\`\`json')) cleanText = cleanText.substring(7);
  if (cleanText.startsWith('\`\`\`')) cleanText = cleanText.substring(3);
  if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.substring(0, cleanText.length - 3);

  return JSON.parse(cleanText);
}

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

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!aiClient) throw new Error('Gemini AI client not configured');
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = response.text?.trim();
      if (text) return text;
    } catch (err: any) {
      const is429 = err.status === 'RESOURCE_EXHAUSTED' || 
                    err.message?.includes('429') || 
                    err.message?.includes('Quota exceeded') ||
                    err.message?.includes('RESOURCE_EXHAUSTED');

      if (is429) {
        let waitMs = attempt === 1 ? 5000 : attempt === 2 ? 15000 : 35000;
        const match = err.message?.match(/retry in ([0-9.]+)s/i);
        if (match && match[1]) {
          waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
        }
        console.warn(`⚠️ Gemini Chat API 429 quota error (attempt ${attempt}/${retries}). Retrying in ${Math.round(waitMs / 1000)}s...`);
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.min(waitMs, 5000)));
          continue;
        }
      } else {
        console.error(`❌ Gemini generation error (attempt ${attempt}):`, err?.message || err);
        if (attempt < retries) continue;
      }
    }
  }

  // Automatic Failover to Groq API
  console.log('🔄 Failing over to Groq API (llama-3.3-70b-versatile)...');
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_kEY;
  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });
      const data: any = await response.json();
      const groqText = data?.choices?.[0]?.message?.content?.trim();
      if (groqText) {
        console.log('✅ Groq API response successfully generated!');
        return groqText;
      }
    } catch (groqErr: any) {
      console.error('❌ Groq API failover error:', groqErr?.message || groqErr);
    }
  }

  throw new Error('AI usage limit reached. Please wait a moment and try again.');
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
