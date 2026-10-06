import mongoose, { Schema } from 'mongoose';

const StartupSchema = new Schema({
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  startupName: { type: String, required: true },
  startupIdea: { type: String, required: true },
  status: {
    type: String,
    enum: [
      'pending_analysis', 'generating', 'generated', 'failed',
      'active', 'inactive', 'pending', 'rejected',
      'Active', 'Inactive', 'Pending', 'Rejected',
    ],
    default: 'pending_analysis',
  },
  aiGenerated: {
    ideaAnalysis: { type: Schema.Types.Mixed },
    businessPlan: { type: Schema.Types.Mixed },
    pitchDeck: [{ type: Schema.Types.Mixed }],
    marketResearch: { type: Schema.Types.Mixed },
    aiReport: { type: Schema.Types.Mixed },
    logo: { type: Schema.Types.Mixed, default: null },
    ideaValidation: { type: Schema.Types.Mixed },
    competitorAnalysis: { type: Schema.Types.Mixed },
    mvpPlan: { type: Schema.Types.Mixed },
    financialPlan: { type: Schema.Types.Mixed },
    gtmStrategy: { type: Schema.Types.Mixed },
  },
  logo: { type: Schema.Types.Mixed, default: null },
  isSavedToMyStartups: { type: Boolean, default: false },
  investorVisible: { type: Boolean, default: false },
  mentorFeedback: { type: String, default: null },
  mentorReview: { type: Schema.Types.Mixed, default: null },
}, { timestamps: true });

export default mongoose.model('Startup', StartupSchema);
