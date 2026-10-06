import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  planName: {
    type: String,
    enum: ['free_trial', 'pro', 'premium_startup_builder', 'starter', 'growth', 'scale', 'enterprise', 'none'],
    default: 'none',
  },
  price: { type: Number, default: 0 },
  billingCycle: { type: String, enum: ['trial', 'monthly'], default: 'trial' },
  status: {
    type: String,
    enum: ['active', 'expired', 'pending_verification', 'cancelled', 'none'],
    default: 'none',
  },
  paymentStatus: {
    type: String,
    enum: ['not_required', 'pending', 'approved', 'rejected'],
    default: 'not_required',
  },
  startDate: { type: Date },
  endDate: { type: Date },
  trialUsed: { type: Boolean, default: false },
}, { timestamps: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
