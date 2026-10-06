import mongoose, { Schema } from 'mongoose';

const MentorFeedbackSchema = new Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MentorBooking', required: true, index: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
  feedback: { type: String, default: '' },
  recommendations: { type: String, default: '' },
  actionItems: { type: String, default: '' },
  improvementSuggestions: { type: String, default: '' },
  rating: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('MentorFeedback', MentorFeedbackSchema);
