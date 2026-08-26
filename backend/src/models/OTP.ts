import mongoose from 'mongoose';

export interface IOTP extends mongoose.Document {
  email: string;
  phone: string;
  type: 'email' | 'phone';
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const otpSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  type: { type: String, enum: ['email', 'phone'], default: 'email' },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// Automatically delete OTP document after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);
