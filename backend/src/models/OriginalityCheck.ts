import mongoose, { Schema } from 'mongoose';

export interface IMatchingSource {
  title: string;
  similarityPercentage: number;
  matchingSnippet: string;
  sourceUrl?: string;
  explanation: string;
  domain?: string;
}

const MatchingSourceSchema = new Schema({
  title: { type: String, required: true },
  similarityPercentage: { type: Number, required: true },
  matchingSnippet: { type: String, required: true },
  sourceUrl: { type: String },
  explanation: { type: String, required: true },
  domain: { type: String },
});

const OriginalityCheckSchema = new Schema({
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
  contentOrigin: { type: String, default: 'Original Founder Idea' },
  contentOriginExplanation: {
    type: String,
    default: 'The submitted idea shows characteristics of an authentic founder pitch.',
  },
}, { timestamps: true });

export const OriginalityCheck = mongoose.model('OriginalityCheck', OriginalityCheckSchema);
