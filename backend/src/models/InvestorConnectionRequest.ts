import mongoose, { Schema } from 'mongoose';

const InvestorConnectionRequestSchema = new Schema({
  id: { type: String },
  founderId: { type: String, required: true },
  founderName: { type: String, required: true },
  founderEmail: { type: String, required: true },
  investorId: { type: String, required: true },
  investorName: { type: String, required: true },
  investorEmail: { type: String, required: true },
  investorFirm: { type: String, default: '' },
  startupId: { type: String, required: true },
  startupName: { type: String, required: true },
  fundingAmount: { type: String, required: true },
  fundingStage: { type: String, required: true },
  shortIntro: { type: String, required: true },
  whySeeking: { type: String, required: true },
  optionalMessage: { type: String, default: '' },
  form_data: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'pending' },
  responseNote: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('InvestorConnectionRequest', InvestorConnectionRequestSchema);
