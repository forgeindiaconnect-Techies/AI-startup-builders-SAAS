import mongoose, { Document, Schema } from 'mongoose';

export interface IFundingOffer extends Document {
  startupId: string;
  startupName: string;
  founderId: string;
  founderName: string;
  investorId: string;
  investorName: string;
  investorCompany: string;
  investorEmail?: string;
  investorAddress?: string;
  offerAmount: number;
  currency: string;
  equityPercentage: number;
  valuationCap: number;
  instrument: string;
  discount: number;
  expiresInDays: number;
  investorMessage: string;
  founderResponse: string;
  counterOffer: {
    amount: number | null;
    equityPercentage: number | null;
    message: string;
  };
  adminNote: string;
  status: 'offer_received' | 'accepted' | 'counter_offer' | 'rejected' | 'funded';
  history: Array<{
    action: string;
    performedBy: string;
    role: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const FundingOfferSchema: Schema = new Schema(
  {
    startupId: { type: String, required: true },
    startupName: { type: String, required: true },
    founderId: { type: String, required: true },
    founderName: { type: String, required: true },
    investorId: { type: String, required: true },
    investorName: { type: String, required: true },
    investorCompany: { type: String, required: true },
    investorEmail: { type: String },
    investorAddress: { type: String },
    offerAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    equityPercentage: { type: Number, required: true },
    valuationCap: { type: Number, default: 0 },
    instrument: { type: String, default: 'SAFE' },
    discount: { type: Number, default: 0 },
    expiresInDays: { type: Number, default: 30 },
    investorMessage: { type: String, default: '' },
    founderResponse: { type: String, default: '' },
    counterOffer: {
      amount: { type: Number, default: null },
      equityPercentage: { type: Number, default: null },
      message: { type: String, default: '' },
    },
    adminNote: { type: String, default: '' },
    status: {
      type: String,
      enum: ['offer_received', 'accepted', 'counter_offer', 'rejected', 'funded'],
      default: 'offer_received',
    },
    history: [
      {
        action: { type: String },
        performedBy: { type: String },
        role: { type: String },
        message: { type: String },
        createdAt: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IFundingOffer>('FundingOffer', FundingOfferSchema);
