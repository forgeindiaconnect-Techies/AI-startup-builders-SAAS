import mongoose, { Schema } from 'mongoose';

const InvestorMeetingSchema = new Schema({
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
}, { timestamps: true });

export default mongoose.model('InvestorMeeting', InvestorMeetingSchema);
