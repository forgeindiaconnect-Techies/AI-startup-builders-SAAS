import mongoose, { Schema } from 'mongoose';

const MentorBookingSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
  topic: { type: String, required: true },
  date: { type: String, required: false, default: '' },
  time: { type: String, required: false, default: '' },
  duration: { type: Number, default: 45 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'accepted', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending',
  },
  meetingLink: { type: String, default: '' },
  sessionFee: { type: Number, default: 0 },
  paymentMethod: { type: String, default: '' },
  paymentTransactionId: { type: String, default: '' },
  paymentStatus: {
    type: String,
    enum: ['not_required', 'unpaid', 'pending', 'paid', 'refunded'],
    default: 'not_required',
  },
  feedbackGiven: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('MentorBooking', MentorBookingSchema);
