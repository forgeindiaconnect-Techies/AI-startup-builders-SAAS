import { Request, Response } from 'express';
import NotificationModel from '../models/Notification.js';

// GET /api/notifications?userId=...
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const filter: any = {};
    if (userId) {
      filter.$or = [{ userId }, { userId: 'all' }];
    }
    const notifications = await NotificationModel.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, data: notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/notifications - create a notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const notif = new NotificationModel(req.body);
    await notif.save();
    return res.json({ success: true, data: notif });
  } catch (err) {
    console.error('Error creating notification:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/:id/read - mark as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notif = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: notif });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/mark-all-read?userId=...
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    await NotificationModel.updateMany({ $or: [{ userId }, { userId: 'all' }] }, { isRead: true });
    return res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    await NotificationModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
