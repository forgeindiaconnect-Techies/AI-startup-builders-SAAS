import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  founderId: mongoose.Types.ObjectId;
  startupId: mongoose.Types.ObjectId;
  startupName: string;
  topic: string;
  rating: number;
  reviewText: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorReviewSchema: Schema = new Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorBooking',
      required: true,
      unique: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    founderId: {
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
    startupName: { type: String, default: '' },
    topic: { type: String, default: 'Mentoring Session' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    reviewText: { type: String, default: '' },
    date: { type: String, default: '' },
  },
  { timestamps: true }
);

// A founder can review a given completed session only once
export default mongoose.model<IMentorReview>('MentorReview', MentorReviewSchema);
