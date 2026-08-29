import { Schema, model, Document } from 'mongoose';

export interface IUser {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'founder' | 'mentor' | 'investor' | 'admin';
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  mobile?: string;
  currentRole?: string;
  startupName?: string;
  startupStage?: string;
  industry?: string;
  agreedToTerms?: boolean;
  profileCompleted?: boolean;
  location?: string;
  expertise?: string;
  experienceYears?: string;
  linkedin?: string;
  bio?: string;
  aadharNumber?: string;
  aadharDocUrl?: string;
  panNumber?: string;
  panDocUrl?: string;
  otherDocType?: string;
  otherDocNumber?: string;
  otherDocUrl?: string;
  resumeUrl?: string;
  companyName?: string;
  investorType?: string;
  preferredIndustry?: string;
  minInvestment?: string;
  maxInvestment?: string;
  designation?: string;
  website?: string;
  profilePhotoUrl?: string;
  preferredIndustries?: string[];
  investmentStages?: string[];
  investmentRange?: string;
  preferredLocation?: string;
  investmentFocus?: string;
  previousExperience?: string;
  startupsInvestedCount?: string;
  portfolioCompanies?: string;
  notableInvestments?: string;
  areasOfExpertise?: string;
  investmentThesis?: string;
  kycDocUrl?: string;
  kycDocName?: string;
  panTaxDocUrl?: string;
  panTaxDocName?: string;
  orgProofUrl?: string;
  orgProofName?: string;
  repProofUrl?: string;
  repProofName?: string;
  supportingDocUrl?: string;
  supportingDocName?: string;
  additionalDocUrl?: string;
  additionalDocName?: string;
  rejectionReason?: string;
  lastLoginAt?: Date;
  loginCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserDocument = IUser & Document;

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['founder', 'mentor', 'investor', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'], default: 'approved' },
  // Founder fields
  mobile: { type: String },
  currentRole: { type: String },
  startupName: { type: String },
  startupStage: { type: String },
  industry: { type: String },
  agreedToTerms: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },
  // Mentor fields
  location: { type: String },
  expertise: { type: String },
  experienceYears: { type: String },
  linkedin: { type: String },
  bio: { type: String },
  aadharNumber: { type: String },
  aadharDocUrl: { type: String },
  panNumber: { type: String },
  panDocUrl: { type: String },
  otherDocType: { type: String },
  otherDocNumber: { type: String },
  otherDocUrl: { type: String },
  resumeUrl: { type: String },
  // Investor fields
  companyName: { type: String },
  investorType: { type: String },
  preferredIndustry: { type: String },
  minInvestment: { type: String },
  maxInvestment: { type: String },
  designation: { type: String },
  website: { type: String },
  profilePhotoUrl: { type: String },
  preferredIndustries: [{ type: String }],
  investmentStages: [{ type: String }],
  investmentRange: { type: String },
  preferredLocation: { type: String },
  investmentFocus: { type: String },
  previousExperience: { type: String },
  startupsInvestedCount: { type: String },
  portfolioCompanies: { type: String },
  notableInvestments: { type: String },
  areasOfExpertise: { type: String },
  investmentThesis: { type: String },
  kycDocUrl: { type: String },
  kycDocName: { type: String },
  panTaxDocUrl: { type: String },
  panTaxDocName: { type: String },
  orgProofUrl: { type: String },
  orgProofName: { type: String },
  repProofUrl: { type: String },
  repProofName: { type: String },
  supportingDocUrl: { type: String },
  supportingDocName: { type: String },
  additionalDocUrl: { type: String },
  additionalDocName: { type: String },
  rejectionReason: { type: String },
  lastLoginAt: { type: Date },
  loginCount: { type: Number, default: 0 },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
