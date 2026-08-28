import { Request, Response } from 'express';
import InvestorMeeting from '../models/InvestorMeeting.js';

export const getMeetings = async (req: Request, res: Response) => {
  try {
    const { founderEmail, investorEmail } = req.query;
    const filter: any = {};

    if (founderEmail) {
      filter.founderEmail = founderEmail;
    }
    if (investorEmail) {
      filter.investorEmail = investorEmail;
    }

    const meetings = await InvestorMeeting.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: meetings });
  } catch (error: any) {
    console.error('Error fetching investor meetings:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const meetingData = req.body;
    
    let query: any = {};
    if (meetingData.id && /^[0-9a-fA-F]{24}$/.test(meetingData.id)) {
      query = { _id: meetingData.id };
    } else {
      // Fallback to searching by investor email and proposed date for custom/temporary IDs
      query = { investorEmail: meetingData.investorEmail, proposedDate: meetingData.proposedDate };
    }

    const meeting = await InvestorMeeting.findOneAndUpdate(
      query,
      meetingData,
      { new: true, upsert: true }
    );
    return res.status(201).json({ success: true, data: meeting });
  } catch (error: any) {
    console.error('Error creating/updating investor meeting:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let meeting = null;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      meeting = await InvestorMeeting.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (!meeting) {
      // Fallback: try searching by matching email and date for temporary IDs
      meeting = await InvestorMeeting.findOneAndUpdate(
        { investorEmail: updateData.investorEmail || req.body.investorEmail, proposedDate: updateData.proposedDate || req.body.proposedDate },
        updateData,
        { new: true }
      );
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
    }

    return res.json({ success: true, data: meeting });
  } catch (error: any) {
    console.error('Error updating investor meeting:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
