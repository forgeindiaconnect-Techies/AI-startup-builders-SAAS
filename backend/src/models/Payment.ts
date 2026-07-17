import mongoose from 'mongoose';

export interface IPayment extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  founderName: string;
  planName: 'pro' | 'premium_startup_builder';
  amount: number;
  paymentMethod: 'UPI' | 'Google Pay' | 'PhonePe' | 'Paytm';
  transactionId: string;
  screenshot: string; // Base64 or URL
  status: 'pending_verification' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  founderName: { type: String, required: true },
  planName: { type: String, enum: ['pro', 'premium_startup_builder'], required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Google Pay', 'PhonePe', 'Paytm'], required: true },
  transactionId: { type: String, required: true },
  screenshot: { type: String, required: true },
  status: { type: String, enum: ['pending_verification', 'approved', 'rejected'], default: 'pending_verification' },
}, { timestamps: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
