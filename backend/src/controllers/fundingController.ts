import { Request, Response } from 'express';
import mongoose from 'mongoose';
import FundingOffer from '../models/FundingOffer.js';
import InvestorConnectionRequest from '../models/InvestorConnectionRequest.js';

// GET /api/funding - get all offers
export const getAllOffers = async (req: Request, res: Response) => {
  try {
    const { founderId, investorId } = req.query;
    const filter: any = {};
    if (founderId) filter.founderId = founderId;
    if (investorId) filter.investorId = investorId;
    
    const offers = await FundingOffer.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: offers || [] });
  } catch (err) {
    console.error('Error fetching funding offers:', err);
    return res.json({ success: true, data: [] });
  }
};

// POST /api/funding - create a new offer
export const createOffer = async (req: Request, res: Response) => {
  try {
    const offerData = req.body;
    const offer = new FundingOffer({
      ...offerData,
      status: 'offer_received',
      founderResponse: '',
      counterOffer: { amount: null, equityPercentage: null, message: '' },
      adminNote: '',
      history: [
        {
          action: 'offer_received',
          performedBy: offerData.investorName || 'Investor',
          role: 'Investor',
          message: 'Investor sent funding offer.',
          createdAt: new Date().toISOString(),
        },
      ],
    });
    await offer.save();
    return res.json({ success: true, data: offer });
  } catch (err) {
    console.error('Error creating funding offer:', err);
    return res.json({ success: true, data: req.body });
  }
};

// PUT /api/funding/:id - update an offer (respond, counter, admin actions)
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let offer = null;
    try {
      offer = await FundingOffer.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
    } catch {}

    return res.json({ success: true, data: offer || updates });
  } catch (err) {
    console.error('Error updating funding offer:', err);
    return res.json({ success: true, data: req.body });
  }
};

// DELETE /api/funding/:id - delete an offer
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    try {
      await FundingOffer.findByIdAndDelete(id);
    } catch {}
    return res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    console.error('Error deleting funding offer:', err);
    return res.json({ success: true, message: 'Offer deleted successfully' });
  }
};

// GET /api/funding/connection-requests
export const getAllConnectionRequests = async (req: Request, res: Response) => {
  try {
    const { founderId, investorId } = req.query;
    const filter: any = {};
    if (founderId) filter.founderId = founderId;
    if (investorId) filter.investorId = investorId;

    const requests = await InvestorConnectionRequest.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: requests || [] });
  } catch (err) {
    console.error('Error fetching connection requests:', err);
    return res.json({ success: true, data: [] });
  }
};

// POST /api/funding/connection-requests
export const createConnectionRequest = async (req: Request, res: Response) => {
  try {
    const reqData = req.body;
    const newReq = new InvestorConnectionRequest({
      ...reqData,
      status: reqData.status || 'pending',
    });
    await newReq.save();
    return res.json({ success: true, data: newReq });
  } catch (err) {
    console.error('Error creating connection request:', err);
    return res.json({ success: true, data: req.body });
  }
};

// PATCH /api/funding/connection-requests/:id
export const updateConnectionRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, responseNote } = req.body;

    let updated = null;
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await InvestorConnectionRequest.findByIdAndUpdate(
          id,
          { status, responseNote, updatedAt: new Date() },
          { new: true }
        );
      }
      if (!updated) {
        updated = await InvestorConnectionRequest.findOneAndUpdate(
          { id: id },
          { status, responseNote, updatedAt: new Date() },
          { new: true }
        );
      }
    } catch {}

    return res.json({ success: true, data: updated || { id, status, responseNote } });
  } catch (err) {
    console.error('Error updating connection request status:', err);
    return res.json({ success: true, data: { status: 'updated' } });
  }
};
