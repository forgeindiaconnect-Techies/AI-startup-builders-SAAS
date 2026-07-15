import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'founder' | 'mentor' | 'investor' | 'admin';
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  approvalStatus: 'pending' | 'approved' | 'rejected';

  // Founder specific fields
  mobile?: string;
  currentRole?: string;
  startupName?: string;
  startupStage?: string;
  industry?: string;
  agreedToTerms?: boolean;
  profileCompleted?: boolean;

  // Mentor fields
  expertise?: string;
  experienceYears?: string;
  linkedin?: string;
  bio?: string;

  // Investor fields
  companyName?: string;
  typicalCheckSize?: string;
  sectorsOfInterest?: string;
  investmentThesis?: string;

  lastLoginAt?: Date;
  loginCount: number;
}

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['founder', 'mentor', 'investor', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

  // Founder fields
  mobile: { type: String },
  currentRole: { type: String },
  startupName: { type: String },
  startupStage: { type: String },
  industry: { type: String },
  agreedToTerms: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },

  // Mentor fields
  expertise: { type: String },
  experienceYears: { type: String },
  linkedin: { type: String },
  bio: { type: String },

  // Investor fields
  companyName: { type: String },
  typicalCheckSize: { type: String },
  sectorsOfInterest: { type: String },
  investmentThesis: { type: String },

  lastLoginAt: { type: Date },
  loginCount: { type: Number, default: 0 },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
