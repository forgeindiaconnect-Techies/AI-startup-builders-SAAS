import { API_URL } from '../config/api';

export interface IMatchingSource {
  title: string;
  similarityPercentage: number;
  matchingSnippet: string;
  sourceUrl?: string;
  explanation: string;
  domain?: string;
}

export interface IPossibleAISources {
  chatgptLikelihood?: number;
  geminiLikelihood?: number;
  claudeLikelihood?: number;
  otherLikelihood?: number;
  explanation?: string;
}

export interface IOriginalityReport {
  _id: string;
  userId: string;
  startupId?: string;
  content: string;
  declaredSource?: string;
  originalityScore: number;
  originalityLevel: 'High Originality' | 'Moderate Originality' | 'Low Originality';
  originalityExplanation: string;
  similarityScore: number;
  textSimilarityScore: number;
  conceptSimilarityScore: number;
  similarityRisk: 'Low' | 'Medium' | 'High';
  humanProbability: number;
  aiProbability: number;
  aiClassification: 'Likely Human-written' | 'Possibly AI-assisted' | 'Likely AI-generated' | 'Inconclusive';
  possibleAISources?: IPossibleAISources;
  aiSourceDetermined: boolean;
  aiSourceExplanation: string;
  copyrightRisk: 'Low' | 'Medium' | 'High';
  copyrightRiskReason: string;
  overallRisk: 'Low' | 'Medium' | 'High';
  overallClassification: string;
  matchingSources: IMatchingSource[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ai_startup_builder_jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function analyzeOriginalityContent(data: {
  content: string;
  declaredSource?: string;
  startupId?: string;
}): Promise<IOriginalityReport> {
  const res = await fetch(`${API_URL}/originality/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to analyze content.');
  }

  return resData.report;
}

export async function fetchOriginalityHistory(): Promise<IOriginalityReport[]> {
  const res = await fetch(`${API_URL}/originality/history`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to fetch analysis history.');
  }

  return resData.history || [];
}

export async function fetchOriginalityReportById(id: string): Promise<IOriginalityReport> {
  const res = await fetch(`${API_URL}/originality/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to fetch report details.');
  }

  return resData.report;
}

export async function deleteOriginalityReportById(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/originality/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to delete report.');
  }
}
