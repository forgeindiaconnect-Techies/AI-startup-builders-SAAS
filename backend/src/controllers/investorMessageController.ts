import { Request, Response } from 'express';
import InvestorMessage from '../models/InvestorMessage.js';

export const getInvestorMessages = async (req: Request, res: Response) => {
  try {
    const messages = await InvestorMessage.find().sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('Error fetching investor messages:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvestorMessage = async (req: Request, res: Response) => {
  try {
    const {
      reqId,
      senderEmail,
      senderName,
      senderRole,
      receiverEmail,
      receiverName,
      startupName,
      text,
      attachmentUrl,
      attachmentName,
    } = req.body;

    if (!senderEmail || !receiverEmail || !startupName) {
      return res.status(400).json({
        success: false,
        message: 'senderEmail, receiverEmail, and startupName are required',
      });
    }

    const newMessage = await InvestorMessage.create({
      reqId: reqId || '',
      senderEmail,
      senderName: senderName || 'User',
      senderRole: senderRole || 'founder',
      receiverEmail,
      receiverName: receiverName || 'User',
      startupName,
      text: text || '',
      attachmentUrl: attachmentUrl || '',
      attachmentName: attachmentName || '',
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error: any) {
    console.error('Error creating investor message:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
