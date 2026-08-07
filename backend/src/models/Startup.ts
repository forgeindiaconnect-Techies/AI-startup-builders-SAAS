import mongoose, { Document, Schema } from 'mongoose';

export interface IStartup extends Document {
  founderId?: mongoose.Types.ObjectId;
  startupName: string;
  startupIdea: string;
  status: 'pending_analysis' | 'generating' | 'generated' | 'failed';
  aiGenerated: {
    ideaAnalysis?: any;
    businessPlan?: any;
    pitchDeck?: any[];
    marketResearch?: any;
    aiReport?: any;
    logo?: any;
  };
  logo?: any;
  isSavedToMyStartups: boolean;
  mentorFeedback?: string;
  mentorReview?: any;
  createdAt: Date;
  updatedAt: Date;
}

const StartupSchema: Schema = new Schema(
  {
    founderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Temporarily false for ease of testing, can be true if auth is fully integrated
    },
    startupName: {
      type: String,
      required: true,
    },
    startupIdea: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_analysis", "generating", "generated", "failed"],
      default: "pending_analysis"
    },
    aiGenerated: {
      ideaAnalysis: { type: Schema.Types.Mixed },
      businessPlan: { type: Schema.Types.Mixed },
      pitchDeck: [{ type: Schema.Types.Mixed }],
      marketResearch: { type: Schema.Types.Mixed },
      aiReport: { type: Schema.Types.Mixed },
      logo: { type: Schema.Types.Mixed, default: null }
    },
    logo: {
      type: Schema.Types.Mixed,
      default: null,
    },
    isSavedToMyStartups: {
      type: Boolean,
      default: false,
    },
    mentorFeedback: {
      type: String,
      default: null,
    },
    mentorReview: {
      type: Schema.Types.Mixed,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStartup>('Startup', StartupSchema);
