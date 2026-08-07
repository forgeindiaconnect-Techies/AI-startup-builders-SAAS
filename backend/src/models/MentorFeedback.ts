import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorFeedback extends Document {
  bookingId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startupId: mongoose.Types.ObjectId;
  feedback: string;
  recommendations: string;
  actionItems: string;
  improvementSuggestions: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const MentorFeedbackSchema: Schema = new Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorBooking',
      required: true,
      index: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
      index: true,
    },
    feedback: { type: String, default: '' },
    recommendations: { type: String, default: '' },
    actionItems: { type: String, default: '' },
    improvementSuggestions: { type: String, default: '' },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IMentorFeedback>('MentorFeedback', MentorFeedbackSchema);
