import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminWithdrawal extends Document {
  amount: number;
  withdrawalMethod: 'bank_transfer' | 'upi' | 'other';
  upiId?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  otherDetails?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  transactionReference?: string;
  adminNotes?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminWithdrawalSchema: Schema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    withdrawalMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'other'],
      required: true,
    },
    upiId: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    otherDetails: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    transactionReference: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IAdminWithdrawal>('AdminWithdrawal', AdminWithdrawalSchema);
