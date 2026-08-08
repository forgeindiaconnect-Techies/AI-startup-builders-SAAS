import mongoose, { Document, Schema } from 'mongoose';

export interface IPlagiarismMatch {
  sourceTitle: string;
  sourceUrl: string;
  domain: string;
  similarity: number;
  matchType: 'EXACT' | 'PARAPHRASED' | 'SIMILAR';
  matchedText: string;
}

export interface IPlagiarismReport extends Document {
  startupId: string;
  userId?: string;
  contentType: string;
  content: string;
  originalityScore: number;
  similarityScore: number;
  copyrightRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  contentStatus: 'HIGHLY_ORIGINAL' | 'MOSTLY_ORIGINAL' | 'POTENTIALLY_SIMILAR' | 'HIGH_SIMILARITY_DETECTED';
  aiContentIndication: {
    status: 'DETECTED' | 'NOT_DETECTED' | 'UNABLE_TO_DETERMINE';
    confidence: number;
  };
  similarityBreakdown: {
    webContent: number;
    startupIdea: number;
    internalPlatform: number;
    exactMatch: number;
    paraphrased: number;
  };
  startupIdeaSimilarity: {
    problem: 'Low' | 'Medium' | 'High';
    solution: 'Low' | 'Medium' | 'High';
    targetMarket: 'Low' | 'Medium' | 'High';
    businessModel: 'Low' | 'Medium' | 'High';
    overallScore: number;
  };
  matches: IPlagiarismMatch[];
  checkedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlagiarismReportSchema: Schema = new Schema(
  {
    startupId: { type: String, required: true, index: true },
    userId: { type: String, required: false },
    contentType: { type: String, required: true },
    content: { type: String, required: true },
    originalityScore: { type: Number, required: true, min: 0, max: 100 },
    similarityScore: { type: Number, required: true, min: 0, max: 100 },
    copyrightRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    contentStatus: {
      type: String,
      enum: ['HIGHLY_ORIGINAL', 'MOSTLY_ORIGINAL', 'POTENTIALLY_SIMILAR', 'HIGH_SIMILARITY_DETECTED'],
      default: 'HIGHLY_ORIGINAL',
    },
    aiContentIndication: {
      status: { type: String, enum: ['DETECTED', 'NOT_DETECTED', 'UNABLE_TO_DETERMINE'], default: 'DETECTED' },
      confidence: { type: Number, default: 0.9 },
    },
    similarityBreakdown: {
      webContent: { type: Number, default: 0 },
      startupIdea: { type: Number, default: 0 },
      internalPlatform: { type: Number, default: 0 },
      exactMatch: { type: Number, default: 0 },
      paraphrased: { type: Number, default: 0 },
    },
    startupIdeaSimilarity: {
      problem: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      solution: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      targetMarket: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      businessModel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      overallScore: { type: Number, default: 0 },
    },
    matches: [
      {
        sourceTitle: { type: String, required: true },
        sourceUrl: { type: String, required: true },
        domain: { type: String, required: true },
        similarity: { type: Number, required: true },
        matchType: { type: String, enum: ['EXACT', 'PARAPHRASED', 'SIMILAR'], default: 'SIMILAR' },
        matchedText: { type: String, required: true },
      },
    ],
    checkedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPlagiarismReport>('PlagiarismReport', PlagiarismReportSchema);
