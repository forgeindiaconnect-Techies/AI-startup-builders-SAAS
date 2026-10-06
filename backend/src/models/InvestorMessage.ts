import mongoose, { Schema } from 'mongoose';

const InvestorMessageSchema = new Schema({
  id: { type: String },
  reqId: { type: String, default: '' },
  senderEmail: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true, enum: ['founder', 'investor'] },
  receiverEmail: { type: String, required: true },
  receiverName: { type: String, required: true },
  startupName: { type: String, required: true },
  text: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },
  attachmentName: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('InvestorMessage', InvestorMessageSchema);
