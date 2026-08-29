import { Schema, model } from 'mongoose';

const investorInviteSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String },
  companyName: { type: String },
  designation: { type: String },
  investorType: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  website: { type: String },
  location: { type: String },
  interestedIndustries: [{ type: String }],
  investmentStage: [{ type: String }],
  investmentRange: { type: String },
  adminNotes: { type: String },
  invitationToken: { type: String, required: true, unique: true },
  inviteUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['INVITED', 'ACCEPTED', 'EXPIRED', 'DISABLED'],
    default: 'INVITED',
  },
  expiresAt: { type: Date, required: true },
  acceptedAt: { type: Date },
}, { timestamps: true });

export const InvestorInvite = model('InvestorInvite', investorInviteSchema);
