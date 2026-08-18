import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestorConnectionRequest extends Document {
  founderId: string;
  founderName: string;
  founderEmail: string;
  investorId: string;
  investorName: string;
  investorEmail: string;
  investorFirm?: string;
  startupId: string;
  startupName: string;
  fundingAmount: string;
  fundingStage: string;
  shortIntro: string;
  whySeeking: string;
  optionalMessage?: string;
  form_data: Record<string, any>;
  status: string;
  responseNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestorConnectionRequestSchema = new Schema<IInvestorConnectionRequest>(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model<IInvestorConnectionRequest>('InvestorConnectionRequest', InvestorConnectionRequestSchema);
