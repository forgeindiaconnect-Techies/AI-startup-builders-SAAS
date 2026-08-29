import mongoose, { Schema } from 'mongoose';

const AdminWithdrawalSchema = new Schema({
  amount: { type: Number, required: true, min: 1 },
  withdrawalMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'other'],
    required: true,
  },
  payoutSource: {
    type: String,
    enum: ['all', 'mentor', 'investor'],
    default: 'all',
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
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  processedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('AdminWithdrawal', AdminWithdrawalSchema);
