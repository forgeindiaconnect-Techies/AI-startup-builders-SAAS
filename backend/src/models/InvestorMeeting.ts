import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestorMeeting extends Document {
  founderEmail: string;
  founderName: string;
  investorEmail: string;
  investorName: string;
  investorFirm: string;
  startupId: string;
  startupName: string;
  proposedDate: string;
  proposedTime: string;
  agenda: string;
  status: string;
  meetingLink?: string;
  passcode?: string;
  timezone?: string;
  duration?: string;
  investorId?: string;
  investorType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestorMeetingSchema: Schema = new Schema(
  {
    founderEmail: { type: String, required: true, index: true },
    founderName: { type: String, default: '' },
    investorEmail: { type: String, required: true, index: true },
    investorName: { type: String, default: '' },
    investorFirm: { type: String, default: '' },
    startupId: { type: String, default: '' },
    startupName: { type: String, default: '' },
    proposedDate: { type: String, default: '' },
    proposedTime: { type: String, default: '' },
    agenda: { type: String, default: '' },
    status: { type: String, default: 'Scheduled' },
    meetingLink: { type: String, default: '' },
    passcode: { type: String, default: '' },
    timezone: { type: String, default: '' },
    duration: { type: String, default: '' },
    investorId: { type: String, default: '' },
    investorType: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IInvestorMeeting>('InvestorMeeting', InvestorMeetingSchema);
