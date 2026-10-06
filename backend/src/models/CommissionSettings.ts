import mongoose, { Schema, Document } from 'mongoose';

export interface ICommissionSettings extends Document {
  mentorCommission: number;
  investorCommission: number;
  investorCommissionPayer: 'investor' | 'founder';
  createdAt?: Date;
  updatedAt?: Date;
}

const CommissionSettingsSchema = new Schema({
  mentorCommission: { type: Number, required: true, default: 20 },
  investorCommission: { type: Number, required: true, default: 2 },
  investorCommissionPayer: {
    type: String,
    enum: ['investor', 'founder'],
    required: true,
    default: 'investor',
  },
}, { timestamps: true });

export default mongoose.model<ICommissionSettings>('CommissionSettings', CommissionSettingsSchema);
