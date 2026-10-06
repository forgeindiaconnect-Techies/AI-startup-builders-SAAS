import mongoose, { Schema, Document } from 'mongoose';

export interface IFounderWithdrawal extends Document {
  founderId: string;
  founderName: string;
  founderEmail?: string;
  startupId?: string;
  startupName?: string;
  amount: number;
  withdrawalMethod: 'bank_account' | 'upi';
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  upiDetails?: {
    upiId?: string;
  };
  status: 'Pending' | 'Under Review' | 'Approved' | 'Processing' | 'Completed' | 'Rejected';
  utrNumber?: string;
  payoutReference?: string;
  payoutProof?: string;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const FounderWithdrawalSchema = new Schema({
  founderId: { type: String, required: true, index: true },
  founderName: { type: String, required: true },
  founderEmail: { type: String, default: '' },
  startupId: { type: String, default: '' },
  startupName: { type: String, default: '' },
  amount: { type: Number, required: true, min: 1 },
  withdrawalMethod: {
    type: String,
    enum: ['bank_account', 'upi'],
    required: true,
  },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
  },
  upiDetails: {
    upiId: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Processing', 'Completed', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  utrNumber: { type: String, default: '' },
  payoutReference: { type: String, default: '' },
  payoutProof: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  processedBy: { type: String, default: '' },
  processedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IFounderWithdrawal>('FounderWithdrawal', FounderWithdrawalSchema);
