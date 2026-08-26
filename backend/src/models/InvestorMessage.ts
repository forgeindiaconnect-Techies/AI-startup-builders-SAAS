import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestorMessage extends Document {
  id?: string;
  reqId?: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'founder' | 'investor';
  receiverEmail: string;
  receiverName: string;
  startupName: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InvestorMessageSchema = new Schema<IInvestorMessage>(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model<IInvestorMessage>('InvestorMessage', InvestorMessageSchema);
