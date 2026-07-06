import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/genai';
import Startup from '../models/Startup.js';

let aiClient: GoogleGenerativeAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    console.warn("⚠️ GEMINI_API_KEY is not set in environment variables.");
  }
} catch (e) {
  console.error("Failed to initialize Google Generative AI", e);
}

const SYSTEM_PROMPT = `You are an expert startup strategist, business analyst, market researcher, pitch deck consultant, and investor advisor.

The founder will provide only:
- Startup Name
- Startup Idea / Short Description

Your task:
Analyze the idea deeply and generate a complete startup strategy.

Return only valid JSON.
Do not return markdown.
Do not return explanation outside JSON.
Make the output detailed, practical, investor-ready, and suitable for a SaaS startup platform.

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
      "slideTitle": "Product Demo",
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

export const generateStartup = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;

    if (!startupId) {
      return res.status(400).json({ success: false, message: 'Startup ID is required.' });
    }

    const startup = await Startup.findById(startupId);

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found.' });
    }

    startup.status = 'generating';
    await startup.save();

    const aiData = await callAI(startup.startupName, startup.startupIdea);

    startup.aiGenerated = aiData;
    startup.status = 'generated';
    await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup analyzed and generated successfully',
      data: {
        startupId: startup._id,
        status: startup.status,
        aiGenerated: startup.aiGenerated,
      }
    });

  } catch (error: any) {
    console.error('Error generating startup:', error);
    try {
      const { startupId } = req.params;
      if (startupId) {
        await Startup.findByIdAndUpdate(startupId, { status: 'failed' });
      }
    } catch (e) {
      console.error('Failed to update status to failed', e);
    }
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
