import mongoose, { Document } from 'mongoose';

export interface IMentorInvite extends Document {
  mentorName: string;
  mentorEmail: string;
  expertise?: string;
  inviteToken: string;
  inviteUrl: string;
  status: 'active' | 'used' | 'expired' | 'disabled';
  message?: string;
  expiresAt: any;
  usedAt?: any;
  emailedAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

// Mentor invite (sent by admin to onboard mentors via a unique link)
const mentorInviteSchema = new mongoose.Schema({
  mentorName: { type: String, required: true },
  mentorEmail: { type: String, required: true, lowercase: true, trim: true },
  expertise: { type: String, default: '' },
  inviteToken: { type: String, required: true, unique: true },
  inviteUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'disabled'],
    default: 'active',
  },
  message: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date },
  emailedAt: { type: Date },
}, { timestamps: true });

export const MentorInvite = mongoose.model<IMentorInvite>('MentorInvite', mentorInviteSchema);
