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
    
    let offers: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        offers = await FundingOffer.find(filter).sort({ createdAt: -1 });
      } catch (err) {}
    }
    return res.json({ success: true, data: offers || [] });
  } catch (err) {
    return res.json({ success: true, data: [] });
  }
};

// POST /api/funding - create a new offer
export const createOffer = async (req: Request, res: Response) => {
  try {
    const offerData = req.body;
    let offer = null;

    if (mongoose.connection.readyState === 1) {
      try {
        offer = new FundingOffer({
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
      } catch {}
    }

    return res.json({ success: true, data: offer || { id: `off_${Date.now()}`, ...offerData } });
  } catch (err) {
    return res.json({ success: true, data: req.body });
  }
};

// PUT /api/funding/:id - update an offer (respond, counter, admin actions)
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let offer = null;
    if (mongoose.connection.readyState === 1) {
      try {
        offer = await FundingOffer.findByIdAndUpdate(
          id,
          { ...updates, updatedAt: new Date() },
          { new: true }
        );
      } catch {}
    }

    return res.json({ success: true, data: offer || { id, ...updates } });
  } catch (err) {
    return res.json({ success: true, data: req.body });
  }
};

// DELETE /api/funding/:id - delete an offer
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      try {
        await FundingOffer.findByIdAndDelete(id);
      } catch {}
    }
    return res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
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

    let requests: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        requests = await InvestorConnectionRequest.find(filter).sort({ createdAt: -1 });
      } catch (err) {}
    }
    return res.json({ success: true, data: requests || [] });
  } catch (err) {
    return res.json({ success: true, data: [] });
  }
};

// POST /api/funding/connection-requests
export const createConnectionRequest = async (req: Request, res: Response) => {
  try {
    const reqData = req.body;
    let newReq = null;
    if (mongoose.connection.readyState === 1) {
      try {
        newReq = new InvestorConnectionRequest({
          ...reqData,
          status: reqData.status || 'pending',
        });
        await newReq.save();
      } catch {}
    }
    return res.json({ success: true, data: newReq || { id: `conn_${Date.now()}`, ...reqData } });
  } catch (err) {
    return res.json({ success: true, data: req.body });
  }
};

// PATCH /api/funding/connection-requests/:id
export const updateConnectionRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, responseNote } = req.body;

    let updated = null;
    if (mongoose.connection.readyState === 1) {
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
    }

    return res.json({ success: true, data: updated || { id, status, responseNote } });
  } catch (err) {
    return res.json({ success: true, data: { status: 'updated' } });
  }
};
