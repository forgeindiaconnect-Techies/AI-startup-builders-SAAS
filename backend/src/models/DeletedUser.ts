import mongoose from 'mongoose';

export interface IDeletedUser extends mongoose.Document {
  originalId: string;
  fullName: string;
  email: string;
  role: string;
  mobile?: string;
  location?: string;
  signupDate?: Date;
  deletedAt: Date;
}

const deletedUserSchema = new mongoose.Schema({
  originalId: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  mobile: { type: String },
  location: { type: String },
  signupDate: { type: Date },
  deletedAt: { type: Date, default: Date.now }
});

export const DeletedUser = mongoose.model<IDeletedUser>('DeletedUser', deletedUserSchema);
