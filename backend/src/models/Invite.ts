import mongoose from 'mongoose';

export interface IMentorInvite extends mongoose.Document {
  mentorName: string;
  mentorEmail: string;
  expertise: string;
  inviteToken: string;
  inviteUrl: string;
  status: 'active' | 'used' | 'expired' | 'disabled';
  message: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  emailedAt?: Date;
}

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
