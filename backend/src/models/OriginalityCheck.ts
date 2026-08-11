import mongoose, { Document, Schema } from 'mongoose';

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

export interface IOriginalityCheck extends Document {
  userId: mongoose.Types.ObjectId;
  startupId?: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const MatchingSourceSchema = new Schema<IMatchingSource>({
  title: { type: String, required: true },
  similarityPercentage: { type: Number, required: true },
  matchingSnippet: { type: String, required: true },
  sourceUrl: { type: String },
  explanation: { type: String, required: true },
  domain: { type: String },
});

const OriginalityCheckSchema = new Schema<IOriginalityCheck>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup' },
    content: { type: String, required: true },
    declaredSource: { type: String, default: 'Not Specified' },
    originalityScore: { type: Number, required: true, min: 0, max: 100 },
    originalityLevel: {
      type: String,
      enum: ['High Originality', 'Moderate Originality', 'Low Originality'],
      required: true,
    },
    originalityExplanation: { type: String, required: true },
    similarityScore: { type: Number, required: true, min: 0, max: 100 },
    textSimilarityScore: { type: Number, required: true, min: 0, max: 100 },
    conceptSimilarityScore: { type: Number, required: true, min: 0, max: 100 },
    similarityRisk: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    humanProbability: { type: Number, required: true, min: 0, max: 100 },
    aiProbability: { type: Number, required: true, min: 0, max: 100 },
    aiClassification: {
      type: String,
      enum: ['Likely Human-written', 'Possibly AI-assisted', 'Likely AI-generated', 'Inconclusive'],
      required: true,
    },
    possibleAISources: {
      chatgptLikelihood: { type: Number },
      geminiLikelihood: { type: Number },
      claudeLikelihood: { type: Number },
      otherLikelihood: { type: Number },
      explanation: { type: String },
    },
    aiSourceDetermined: { type: Boolean, default: false },
    aiSourceExplanation: { type: String, default: 'AI source cannot be reliably determined.' },
    copyrightRisk: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    copyrightRiskReason: { type: String, required: true },
    overallRisk: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    overallClassification: { type: String, required: true },
    matchingSources: [MatchingSourceSchema],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

export const OriginalityCheck = mongoose.model<IOriginalityCheck>(
  'OriginalityCheck',
  OriginalityCheckSchema
);
