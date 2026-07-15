import mongoose from 'mongoose';

export interface ISubscription extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  planType: 'free_trial' | 'monthly' | 'yearly' | 'none';
  trialUsed: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'none';
}

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  planType: { type: String, enum: ['free_trial', 'monthly', 'yearly', 'none'], default: 'none' },
  trialUsed: { type: Boolean, default: false },
  trialStart: { type: Date },
  trialEnd: { type: Date },
  subscriptionStart: { type: Date },
  subscriptionEnd: { type: Date },
  subscriptionStatus: { type: String, enum: ['active', 'expired', 'trial', 'none'], default: 'none' }
}, { timestamps: true });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
