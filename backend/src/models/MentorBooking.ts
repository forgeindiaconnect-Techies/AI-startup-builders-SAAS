import mongoose, { Document, Schema } from 'mongoose';

export type MentorBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export interface IMentorBooking extends Document {
  userId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  startupId: mongoose.Types.ObjectId;
  topic: string;
  date: string;
  time: string;
  duration: number;
  status: MentorBookingStatus;
  meetingLink: string;
  paymentStatus: 'not_required' | 'unpaid' | 'pending' | 'paid' | 'refunded';
  sessionFee: number;
  paymentMethod?: string;
  paymentTransactionId?: string;
  feedbackGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MentorBookingSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
      index: true,
    },
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
  },
  { timestamps: true }
);

export default mongoose.model<IMentorBooking>('MentorBooking', MentorBookingSchema);
