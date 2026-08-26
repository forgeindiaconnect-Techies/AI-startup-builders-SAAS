import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorAvailability {
  date: string;
  slots: string[];
}

export interface IMentorProfile extends Document {
  mentorId: mongoose.Types.ObjectId;
  title: string;
  expertise: string[];
  industry: string;
  categories: string[];
  bio: string;
  experienceYears: number;
  linkedin: string;
  photoUrl: string;
  location: string;
  rating: number;
  reviewsCount: number;
  sessionDuration: number;
  sessionFee: number;
  mentorSharePercentage: number;
  platformCommissionPercentage: number;
  paymentModel: string;
  isActive: boolean;
  availability: IMentorAvailability[];
}

const MentorProfileSchema: Schema = new Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, default: '' },
    expertise: [{ type: String }],
    industry: { type: String, default: '' },
    categories: [{ type: String }],
    bio: { type: String, default: '' },
    experienceYears: { type: Number, default: 8 },
    linkedin: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 45 },
    sessionFee: { type: Number, default: 0 },
    mentorSharePercentage: { type: Number, default: 80, min: 0, max: 100 },
    platformCommissionPercentage: { type: Number, default: 20, min: 0, max: 100 },
    paymentModel: { type: String, default: 'per_session' },
    isActive: { type: Boolean, default: true },
    availability: [
      {
        date: { type: String },
        slots: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IMentorProfile>('MentorProfile', MentorProfileSchema);
