import mongoose, { Schema } from 'mongoose';

const MentorTransactionSchema = new Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorBooking',
    required: true,
    unique: true,
    index: true,
  },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  founderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: false },
  // Immutable payment snapshot
  sessionFee: { type: Number, required: true, default: 0 },
  mentorSharePercentage: { type: Number, required: true, default: 80 },
  platformCommissionPercentage: { type: Number, required: true, default: 20 },
  mentorEarnings: { type: Number, required: true, default: 0 },
  platformCommission: { type: Number, required: true, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending',
  },
  // Denormalized display fields
  mentorName: { type: String, default: '' },
  founderName: { type: String, default: '' },
  startupName: { type: String, default: '' },
  topic: { type: String, default: '' },
  sessionDate: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('MentorTransaction', MentorTransactionSchema);
