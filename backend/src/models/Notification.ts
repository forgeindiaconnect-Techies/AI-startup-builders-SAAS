import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  userEmail?: string;
  targetRole?: string;
  title: string;
  message: string;
  type: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, default: '' },
    targetRole: { type: String, default: 'founder', index: true },
    title: { type: String, required: true },
    message: { type: String, default: 'Notification update' },
    type: { type: String, default: 'general' },
    actionUrl: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
