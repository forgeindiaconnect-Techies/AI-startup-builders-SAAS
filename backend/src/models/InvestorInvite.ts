import mongoose, { Schema, model } from 'mongoose';

export interface IInvestorInvite {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  designation?: string;
  investorType: string;
  linkedinUrl: string;
  website?: string;
  location?: string;
  interestedIndustries?: string[];
  investmentStage?: string[];
  investmentRange?: string;
  adminNotes?: string;
  invitationToken: string;
  inviteUrl: string;
  status: 'INVITED' | 'ACCEPTED' | 'EXPIRED' | 'DISABLED';
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

const investorInviteSchema = new Schema<IInvestorInvite>({
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

export const InvestorInvite = model<IInvestorInvite>('InvestorInvite', investorInviteSchema);



