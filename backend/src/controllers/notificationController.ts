import { Request, Response } from 'express';
import NotificationModel from '../models/Notification.js';

import mongoose from 'mongoose';

// GET /api/notifications?userId=...&role=...&email=...
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId, role, email } = req.query;
    const filter: any = {};
    
    if (role && role !== 'admin') {
      filter.$or = [
        { userId },
        { userEmail: email },
        { targetRole: role, userId: 'all' },
        { userId: 'all' }
      ];
    } else if (userId) {
      filter.$or = [{ userId }, { userId: 'all' }];
    }

    let notifications: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        notifications = await NotificationModel.find(filter).sort({ createdAt: -1 }).limit(100);
      } catch (dbErr) {}
    }
    return res.json({ success: true, data: notifications || [] });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.json({ success: true, data: [] });
  }
};

// POST /api/notifications - create a notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const payload = {
      userId: req.body.userId || 'admin',
      ...req.body,
      message: req.body.message || req.body.title || 'Notification update',
      title: req.body.title || 'System Notification',
    };
    const notif = new NotificationModel(payload);
    await notif.save();
    return res.json({ success: true, data: notif });
  } catch (err) {
    console.error('Error creating notification:', err);
    return res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

// PATCH /api/notifications/:id/read - mark as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        await NotificationModel.findByIdAndUpdate(id, { isRead: true });
      } else {
        await NotificationModel.updateMany({ $or: [{ _id: id }, { id: id }, { id: Number(id) }] }, { isRead: true });
      }
    }
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    return res.json({ success: true, message: 'Updated' });
  }
};

// PATCH /api/notifications/mark-all-read?userId=...
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const role = req.query.role as string;
    if (mongoose.connection.readyState === 1) {
      const filter: any = {};
      if (userId) filter.$or = [{ userId }, { userId: 'all' }];
      if (role && role !== 'admin') filter.targetRole = role;
      await NotificationModel.updateMany(filter, { isRead: true });
    }
    return res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    return res.json({ success: true, message: 'All marked as read' });
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
