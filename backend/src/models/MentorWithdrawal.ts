import mongoose, { Schema } from 'mongoose';

const MentorWithdrawalSchema = new Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  withdrawalMethod: {
    type: String,
    enum: ['upi', 'bank_account'],
    required: true,
  },
  upiId: { type: String, default: '' },
  accountHolderName: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending',
    index: true,
  },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  paidAt: { type: Date },
  transactionReference: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('MentorWithdrawal', MentorWithdrawalSchema);
