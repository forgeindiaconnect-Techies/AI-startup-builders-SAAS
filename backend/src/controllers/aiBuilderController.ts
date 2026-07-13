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

export const chatStartup = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const startup = await Startup.findById(startupId);

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    if (!aiClient) {
      return res.status(500).json({ success: false, message: 'AI Client not configured' });
    }

    const prompt = `You are an AI assistant for a startup founder. They are asking a question about their generated startup.
Startup Name: ${startup.startupName}
Startup Context: ${JSON.stringify(startup.aiGenerated)}

Founder's Question: ${message}

Provide a helpful, insightful response based ONLY on the context provided.`;

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    res.status(200).json({
      success: true,
      message: response.text
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error chatting with AI' });
  }
};
