import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, default: '' },
  targetRole: { type: String, default: 'founder', index: true },
  title: { type: String, required: true },
  message: { type: String, default: 'Notification update' },
  type: { type: String, default: 'general' },
  actionUrl: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
