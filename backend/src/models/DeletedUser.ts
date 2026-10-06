import mongoose from 'mongoose';

/**
 * Stores a snapshot of user data when a user account is deleted,
 * for audit/compliance purposes.
 */
const deletedUserSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fullName: { type: String },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String },
  mobile: { type: String },
  location: { type: String },
  signupDate: { type: Date },
  reason: { type: String, default: '' },
  deletedAt: { type: Date, default: Date.now },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const DeletedUser = mongoose.model('DeletedUser', deletedUserSchema);
