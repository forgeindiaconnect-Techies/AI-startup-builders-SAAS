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
  status: 'offer_received' | 'accepted' | 'counter_offer' | 'rejected' | 'funded' | 'payment_pending' | 'payment_submitted' | 'under_verification' | 'completed' | 'failed';
  history: Array<{
    action: string;
    performedBy: string;
    role: string;
    message: string;
    createdAt: string;
  }>;
  fundingStage?: string;
  agreementStatus?: string;
  dueDiligenceStatus?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentProof?: string;
  paymentDate?: Date;
  paymentNotes?: string;
  senderDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
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
      enum: ['offer_received', 'accepted', 'counter_offer', 'rejected', 'funded', 'payment_pending', 'payment_submitted', 'under_verification', 'completed', 'failed'],
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
    fundingStage: { type: String, default: 'Seed' },
    agreementStatus: { type: String, default: 'Pending' },
    dueDiligenceStatus: { type: String, default: 'Pending' },
    paymentMethod: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    paymentProof: { type: String, default: '' },
    paymentDate: { type: Date },
    paymentNotes: { type: String, default: '' },
    senderDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFundingOffer>('FundingOffer', FundingOfferSchema);
