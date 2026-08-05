import { Request, Response } from 'express';
import FundingOffer from '../models/FundingOffer.js';

// GET /api/funding - get all offers
export const getAllOffers = async (req: Request, res: Response) => {
  try {
    const { founderId, investorId } = req.query;
    const filter: any = {};
    if (founderId) filter.founderId = founderId;
    if (investorId) filter.investorId = investorId;
    
    const offers = await FundingOffer.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: offers });
  } catch (err) {
    console.error('Error fetching funding offers:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching offers' });
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
          performedBy: offerData.investorName,
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
    return res.status(500).json({ success: false, message: 'Server error creating offer' });
  }
};

// PUT /api/funding/:id - update an offer (respond, counter, admin actions)
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const offer = await FundingOffer.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    return res.json({ success: true, data: offer });
  } catch (err) {
    console.error('Error updating funding offer:', err);
    return res.status(500).json({ success: false, message: 'Server error updating offer' });
  }
};

// DELETE /api/funding/:id - delete an offer
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await FundingOffer.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    console.error('Error deleting funding offer:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting offer' });
  }
};
