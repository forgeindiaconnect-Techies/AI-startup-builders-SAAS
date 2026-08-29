import mongoose, { Schema } from 'mongoose';

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

export default mongoose.model('CommissionSettings', CommissionSettingsSchema);
