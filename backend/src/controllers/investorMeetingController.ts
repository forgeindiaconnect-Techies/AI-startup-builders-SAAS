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
    if (meetingData.id) {
      query = { $or: [{ id: meetingData.id }, { _id: meetingData.id }] };
    } else {
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

    const meeting = await InvestorMeeting.findByIdAndUpdate(id, updateData, { new: true });
    if (!meeting) {
      // Fallback: try searching by ID field in payload if it is custom
      const searchCustom = await InvestorMeeting.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        updateData,
        { new: true }
      );
      if (!searchCustom) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      return res.json({ success: true, data: searchCustom });
    }

    return res.json({ success: true, data: meeting });
  } catch (error: any) {
    console.error('Error updating investor meeting:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
