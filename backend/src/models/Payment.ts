import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  founderName: { type: String, required: true },
  planName: { type: String, enum: ['pro', 'premium_startup_builder'], required: true },
  amount: { type: Number, required: true },
  billingPeriod: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  paymentMethod: { type: String, enum: ['UPI', 'Bank Transfer', 'Google Pay', 'PhonePe', 'Paytm'], required: true },
  transactionId: { type: String, required: true },
  screenshot: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending_verification', 'approved', 'rejected'],
    default: 'pending_verification',
  },
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
