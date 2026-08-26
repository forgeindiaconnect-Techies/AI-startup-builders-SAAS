import mongoose, { Document, Schema } from 'mongoose';

export interface IAgreementDetails {
  startupName: string;
  founderName: string;
  investorName: string;
  dealId: string;
  agreementDate: string;
  agreementExpiryDate: string;
  offerAmount: number;
  currency: string;
  equityPercentage: number;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  fundingType?: string;
  investmentType?: string;
  expectedFundingDate?: string;
  investmentTerms?: string;
  equityTerms?: string;
  investorRights?: string;
  founderObligations?: string;
  useOfFunds?: string;
  milestones?: string;
  exitTerms?: string;
  confidentialityTerms?: string;
  additionalConditions?: string;
  uploadedDocument?: string;
  uploadedDocumentName?: string;
  supportingDocuments?: string;
  supportingDocumentsName?: string;
  specialClauses?: string;
  version: string;
  createdAt: string;
  createdBy: string;
}

export interface IAgreementAuditTrail {
  action: string;
  performedBy: string;
  role: string;
  notes?: string;
  timestamp: string;
}

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
  commissionRate?: number;
  commissionAmount?: number;
  commissionStatus?: 'Pending' | 'Fixed' | 'Sent to Admin' | 'Collected';
  commissionNotes?: string;
  commissionUpdatedAt?: string;
  commissionPayer?: 'investor' | 'founder';
  agreementAcknowledged?: boolean;
  agreementId?: string;
  agreementVersion?: string;
  investorSignedAt?: string;
  investorSignatureName?: string;
  investorSignatureFontIndex?: number;
  founderSignedAt?: string;
  founderSignatureName?: string;
  founderSignatureFontIndex?: number;
  agreementDetails?: IAgreementDetails;
  agreementVersions?: IAgreementDetails[];
  agreementAuditTrail?: IAgreementAuditTrail[];
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
    commissionRate: { type: Number, default: 2 },
    commissionAmount: { type: Number, default: 0 },
    commissionStatus: { type: String, default: 'Pending' },
    commissionNotes: { type: String, default: '' },
    commissionUpdatedAt: { type: String, default: '' },
    commissionPayer: { type: String, enum: ['investor', 'founder'], default: 'investor' },
    agreementAcknowledged: { type: Boolean, default: false },
    agreementId: { type: String, default: '' },
    agreementVersion: { type: String, default: 'v1.0' },
    investorSignedAt: { type: String, default: '' },
    investorSignatureName: { type: String, default: '' },
    investorSignatureFontIndex: { type: Number, default: 0 },
    founderSignedAt: { type: String, default: '' },
    founderSignatureName: { type: String, default: '' },
    founderSignatureFontIndex: { type: Number, default: 0 },
    agreementDetails: {
      startupName: { type: String, default: '' },
      founderName: { type: String, default: '' },
      investorName: { type: String, default: '' },
      dealId: { type: String, default: '' },
      agreementDate: { type: String, default: '' },
      agreementExpiryDate: { type: String, default: '' },
      offerAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      equityPercentage: { type: Number, default: 0 },
      preMoneyValuation: { type: Number, default: 0 },
      postMoneyValuation: { type: Number, default: 0 },
      fundingType: { type: String, default: '' },
      investmentType: { type: String, default: '' },
      expectedFundingDate: { type: String, default: '' },
      investmentTerms: { type: String, default: '' },
      equityTerms: { type: String, default: '' },
      investorRights: { type: String, default: '' },
      founderObligations: { type: String, default: '' },
      useOfFunds: { type: String, default: '' },
      milestones: { type: String, default: '' },
      exitTerms: { type: String, default: '' },
      confidentialityTerms: { type: String, default: '' },
      additionalConditions: { type: String, default: '' },
      uploadedDocument: { type: String, default: '' },
      uploadedDocumentName: { type: String, default: '' },
      supportingDocuments: { type: String, default: '' },
      supportingDocumentsName: { type: String, default: '' },
      specialClauses: { type: String, default: '' },
      version: { type: String, default: 'v1.0' },
      createdAt: { type: String, default: '' },
      createdBy: { type: String, default: '' }
    },
    agreementVersions: { type: Array, default: [] },
    agreementAuditTrail: [
      {
        action: { type: String },
        performedBy: { type: String },
        role: { type: String },
        notes: { type: String },
        timestamp: { type: String }
      }
    ],
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
