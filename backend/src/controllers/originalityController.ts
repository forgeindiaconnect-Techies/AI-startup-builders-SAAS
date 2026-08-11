import { Request, Response } from 'express';
import { OriginalityCheck, IMatchingSource } from '../models/OriginalityCheck.js';
import Startup from '../models/Startup.js';

// List of generic business terms that MUST NOT count towards plagiarism/similarity
const COMMON_BUSINESS_TERMS = new Set([
  'office building', 'office', 'building', 'meeting room', 'meeting rooms', 'employee cabins',
  'cabins', 'snacks', 'website', 'mobile app', 'dashboard', 'checkout', 'database', 'login',
  'company', 'startup', 'rooms', 'products', 'services', 'team', 'customers', 'users', 'business',
  'market', 'sales', 'revenue', 'platform', 'solution', 'technology', 'client', 'employees',
  'management', 'software', 'application', 'service', 'system', 'process', 'support', 'help',
  'work', 'place', 'location', 'desk', 'internet', 'wifi', 'computer', 'laptop', 'coffee', 'tea'
]);

// AI stylistic markers
const AI_MARKERS = [
  "in today's fast-paced world",
  "in the digital age",
  "it is worth noting",
  "furthermore",
  "in conclusion",
  "tapestry",
  "testament",
  "seamlessly",
  "beacon",
  "game-changer",
  "paradigm shift",
  "delve into",
  "crucial role",
  "pave the way",
  "realm of",
  "leverage the power",
  "cutting-edge",
  "holistic approach",
  "foster a culture"
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
    // Exclude n-grams that consist purely of common generic business terms
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

      // Concept-level keyword overlap
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

    const textSimilarityScore = maxSimilarity;
    const conceptSimilarityScore = highestConceptSimilarity;
    const similarityScore = Math.min(100, Math.max(textSimilarityScore, Math.round(conceptSimilarityScore * 0.7)));

    let similarityRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (similarityScore >= 45) similarityRisk = 'High';
    else if (similarityScore >= 20) similarityRisk = 'Medium';

    // 2. AI Content Detection
    const lowerContent = trimmedContent.toLowerCase();
    let aiMarkerCount = 0;
    for (const marker of AI_MARKERS) {
      if (lowerContent.includes(marker)) {
        aiMarkerCount++;
      }
    }

    // Sentence structure uniformity check
    const sentences = trimmedContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentences.length || 1);
    const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / (sentences.length || 1);
    const stdDev = Math.sqrt(variance);

    // AI probability heuristic calculation based on markers & sentence variance
    let rawAiProb = 15;
    if (aiMarkerCount > 0) rawAiProb += aiMarkerCount * 18;
    if (sentences.length >= 3 && stdDev < 4) rawAiProb += 25; // uniform sentence length
    if (trimmedContent.includes("1.") && trimmedContent.includes("2.") && trimmedContent.includes("3.")) rawAiProb += 15;

    // Adjust according to user declared source if provided
    const sourceLower = (declaredSource || '').toLowerCase();
    if (sourceLower.includes('chatgpt') || sourceLower.includes('gemini') || sourceLower.includes('claude') || sourceLower.includes('ai')) {
      rawAiProb = Math.max(rawAiProb, 65);
    }

    const aiProbability = Math.min(95, Math.max(5, Math.round(rawAiProb)));
    const humanProbability = 100 - aiProbability;

    let aiClassification: 'Likely Human-written' | 'Possibly AI-assisted' | 'Likely AI-generated' | 'Inconclusive' = 'Likely Human-written';
    if (aiProbability >= 70) aiClassification = 'Likely AI-generated';
    else if (aiProbability >= 40) aiClassification = 'Possibly AI-assisted';
    else if (aiProbability <= 25) aiClassification = 'Likely Human-written';
    else aiClassification = 'Inconclusive';

    // 3. Possible AI Source Analysis (Non-conclusive probabilistic indicators)
    let aiSourceDetermined = false;
    let aiSourceExplanation = 'AI source cannot be reliably determined.';
    let possibleAISources: any = undefined;

    if (sourceLower.includes('chatgpt') || lowerContent.includes('as an ai language model') || lowerContent.includes('chatgpt')) {
      aiSourceDetermined = true;
      aiSourceExplanation = 'Text contains characteristics consistent with OpenAI model outputs. Source attribution is not conclusive from text alone.';
      possibleAISources = { chatgptLikelihood: 75, geminiLikelihood: 15, claudeLikelihood: 10, otherLikelihood: 0, explanation: 'Possible AI source characteristics.' };
    } else if (sourceLower.includes('gemini') || lowerContent.includes('gemini')) {
      aiSourceDetermined = true;
      aiSourceExplanation = 'Text contains characteristics consistent with Google Gemini model outputs. Source attribution is not conclusive from text alone.';
      possibleAISources = { chatgptLikelihood: 20, geminiLikelihood: 70, claudeLikelihood: 10, otherLikelihood: 0, explanation: 'Possible AI source characteristics.' };
    } else if (sourceLower.includes('claude') || lowerContent.includes('claude')) {
      aiSourceDetermined = true;
      aiSourceExplanation = 'Text contains characteristics consistent with Anthropic Claude model outputs. Source attribution is not conclusive from text alone.';
      possibleAISources = { chatgptLikelihood: 15, geminiLikelihood: 15, claudeLikelihood: 70, otherLikelihood: 0, explanation: 'Possible AI source characteristics.' };
    } else if (aiProbability >= 50) {
      aiSourceExplanation = 'General AI characteristics detected, but specific AI source cannot be reliably determined. Source attribution is not conclusive from text alone.';
    }

    // 4. Copyright Risk Analysis
    let copyrightRisk: 'Low' | 'Medium' | 'High' = 'Low';
    let copyrightRiskReason = 'The submitted content shows low overlap with registered platform projects. Common business terminology was excluded from calculation.';

    if (similarityScore >= 45) {
      copyrightRisk = 'High';
      copyrightRiskReason = 'Potential Copyright Risk: The submitted content contains substantial similarity to an existing source and should be manually reviewed.';
    } else if (similarityScore >= 20) {
      copyrightRisk = 'Medium';
      copyrightRiskReason = 'Potential Copyright Risk: Moderate similarity to existing concepts detected. Review specific unique value propositions.';
    }

    // 5. Originality Score & Explanation
    const originalityScore = Math.max(0, Math.min(100, Math.round(100 - similarityScore)));
    let originalityLevel: 'High Originality' | 'Moderate Originality' | 'Low Originality' = 'High Originality';
    let originalityExplanation = 'Your content demonstrates high semantic uniqueness with distinct conceptual elements.';

    if (originalityScore < 50) {
      originalityLevel = 'Low Originality';
      originalityExplanation = 'The submitted content shares extensive similarity with existing business ideas or standard frameworks.';
    } else if (originalityScore < 80) {
      originalityLevel = 'Moderate Originality';
      originalityExplanation = 'Your idea presents solid core concepts with moderate overlap in industry-standard approaches.';
    }

    // 6. Overall Risk & Overall Classification
    let overallRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (copyrightRisk === 'High' || similarityScore >= 45) overallRisk = 'High';
    else if (copyrightRisk === 'Medium' || similarityScore >= 20) overallRisk = 'Medium';

    let overallClassification = 'Likely Original / Low Risk';
    if (overallRisk === 'High') {
      overallClassification = 'High Similarity / Potential Copyright Risk';
    } else if (overallRisk === 'Medium') {
      overallClassification = 'Moderate Originality / Review Suggested';
    }

    // 7. Actionable Recommendations
    const recommendations: string[] = [];
    if (originalityScore >= 80) {
      recommendations.push('Your idea appears highly original. Focus on validating market demand with real target users.');
      recommendations.push('Document your unique proprietary processes, brand elements, or tech architecture to protect your IP.');
    } else {
      recommendations.push('Consider defining a unique customer niche or underserving market segment to differentiate your offering.');
      recommendations.push('Incorporate innovative pricing models, workflow automation, or proprietary data advantages.');
    }

    if (aiProbability >= 50) {
      recommendations.push('Add personal founder insights, case studies, or specific operational details to make your pitch more human and authentic.');
    }

    if (similarityScore >= 20) {
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
      similarityScore,
      textSimilarityScore,
      conceptSimilarityScore,
      similarityRisk,
      humanProbability,
      aiProbability,
      aiClassification,
      possibleAISources,
      aiSourceDetermined,
      aiSourceExplanation,
      copyrightRisk,
      copyrightRiskReason,
      overallRisk,
      overallClassification,
      matchingSources,
      recommendations,
    });

    return res.status(201).json({
      success: true,
      report: newReport,
    });
  } catch (error: any) {
    console.error('Error analyzing originality:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your request. Please try again.',
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

    const history = await OriginalityCheck.find({ userId: authUser.id })
      .sort({ createdAt: -1 })
      .select('-content') // exclude heavy full content for fast list fetch
      .lean();

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error: any) {
    console.error('Error fetching originality history:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve analysis history.' });
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
