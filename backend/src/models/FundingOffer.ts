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
  status: 'offer_received' | 'accepted' | 'counter_offer' | 'rejected' | 'funded' | 'funding_pending' | 'payment_pending' | 'payment_submitted' | 'under_verification' | 'completed' | 'failed';
  agreementStatus: string;
  dueDiligenceStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference: string;
  paymentProof: string;
  paymentDate: string;
  verificationStatus: string;
  stage: string;
  commitmentId?: string;
  transactionId?: string;
  fundingRound?: string;
  expectedInvestmentDate?: string;
  commitmentNotes?: string;
  agreementAcknowledged?: boolean;
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
    currency: { type: String, default: 'INR' },
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
      enum: ['offer_received', 'accepted', 'counter_offer', 'rejected', 'funded', 'funding_pending', 'payment_pending', 'payment_submitted', 'under_verification', 'completed', 'failed'],
      default: 'offer_received',
    },
    agreementStatus: { type: String, default: 'Drafted' },
    dueDiligenceStatus: { type: String, default: 'Pending' },
    paymentStatus: { type: String, default: 'Pending' },
    paymentMethod: { type: String, default: '' },
    paymentReference: { type: String, default: '' },
    paymentProof: { type: String, default: '' },
    paymentDate: { type: String, default: '' },
    verificationStatus: { type: String, default: 'Pending' },
    stage: { type: String, default: 'Seed' },
    commitmentId: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    fundingRound: { type: String, default: 'Seed' },
    expectedInvestmentDate: { type: String, default: '' },
    commitmentNotes: { type: String, default: '' },
    agreementAcknowledged: { type: Boolean, default: false },
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
