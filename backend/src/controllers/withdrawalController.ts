import { Request, Response } from 'express';
import mongoose from 'mongoose';
import FounderWithdrawal from '../models/FounderWithdrawal.js';
import FundingOffer from '../models/FundingOffer.js';
import { User } from '../models/User.js';

// Helper function to calculate Founder's financial summary and available balance
export const calculateFounderBalance = async (founderId: string) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      totalFundedCapital: 0,
      totalCommissionFee: 0,
      netFundedCapital: 0,
      pendingWithdrawal: 0,
      completedWithdrawal: 0,
      availableBalance: 0,
    };
  }

  // 1. Find founder user details if possible
  const user = await User.findById(founderId).catch(() => null) || await User.findOne({ email: founderId }).catch(() => null);

  const queryOr: any[] = [{ founderId: String(founderId) }];
  if (user) {
    if (user._id) queryOr.push({ founderId: String(user._id) });
    if (user.email) queryOr.push({ founderEmail: user.email });
    if (user.fullName) queryOr.push({ founderName: user.fullName });
  }

  // Find all verified funded offers for this founder
  const offers = await FundingOffer.find({
    $or: queryOr,
    status: { $in: ['funded', 'completed'] },
  });

  let totalFundedCapital = 0;
  let totalCommissionFee = 0;

  offers.forEach((o) => {
    const amount = Number(o.offerAmount || 0);
    const rate = Number(o.commissionRate ?? 2);
    const comm = o.commissionAmount !== undefined && o.commissionAmount !== null
      ? Number(o.commissionAmount)
      : Math.round(amount * (rate / 100));

    totalFundedCapital += amount;
    totalCommissionFee += comm;
  });

  const netFundedCapital = totalFundedCapital - totalCommissionFee;

  // 2. Find all withdrawal requests for this founder
  const withdrawalQueryOr: any[] = [{ founderId: String(founderId) }];
  if (user) {
    if (user._id) withdrawalQueryOr.push({ founderId: String(user._id) });
    if (user.email) withdrawalQueryOr.push({ founderEmail: user.email });
  }

  const withdrawals = await FounderWithdrawal.find({ $or: withdrawalQueryOr });

  let pendingWithdrawal = 0;
  let completedWithdrawal = 0;

  withdrawals.forEach((w) => {
    const amt = Number(w.amount || 0);
    if (['Pending', 'Under Review', 'Approved', 'Processing'].includes(w.status)) {
      pendingWithdrawal += amt;
    } else if (w.status === 'Completed') {
      completedWithdrawal += amt;
    }
  });

  const availableBalance = Math.max(0, netFundedCapital - (completedWithdrawal + pendingWithdrawal));

  // Sync to User model if user document exists
  try {
    if (user && user._id) {
      await User.findByIdAndUpdate(user._id, { withdrawableBalance: availableBalance });
    }
  } catch (err) {}

  return {
    totalFundedCapital,
    totalCommissionFee,
    netFundedCapital,
    pendingWithdrawal,
    completedWithdrawal,
    availableBalance,
  };
};

// GET /api/withdrawals/founder - Get founder balance and withdrawal requests
export const getFounderWithdrawals = async (req: Request, res: Response) => {
  try {
    const founderId = (req as any).user?.id || (req as any).user?._id || req.query.founderId;

    if (!founderId) {
      return res.status(400).json({ success: false, message: 'Founder ID is required' });
    }

    const summary = await calculateFounderBalance(String(founderId));
    let withdrawals: any[] = [];

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(founderId).catch(() => null) || await User.findOne({ email: founderId }).catch(() => null);
      const queryOr: any[] = [{ founderId: String(founderId) }];
      if (user) {
        if (user._id) queryOr.push({ founderId: String(user._id) });
        if (user.email) queryOr.push({ founderEmail: user.email });
      }

      withdrawals = await FounderWithdrawal.find({ $or: queryOr }).sort({ createdAt: -1 });
    }

    return res.json({
      success: true,
      data: {
        summary,
        withdrawals,
      },
    });
  } catch (err: any) {
    console.error('Error fetching founder withdrawals:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch withdrawals' });
  }
};

// POST /api/withdrawals/founder/request - Submit a new withdrawal request
export const requestFounderWithdrawal = async (req: Request, res: Response) => {
  try {
    const founderId = (req as any).user?.id || (req as any).user?._id || req.body.founderId;
    const founderName = (req as any).user?.fullName || req.body.founderName || 'Founder';
    const founderEmail = (req as any).user?.email || req.body.founderEmail || '';

    const { amount, withdrawalMethod, bankDetails, upiDetails, startupId, startupName } = req.body;

    if (!founderId) {
      return res.status(400).json({ success: false, message: 'Founder ID is required' });
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }

    if (!['bank_account', 'upi'].includes(withdrawalMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal method' });
    }

    if (withdrawalMethod === 'bank_account') {
      if (!bankDetails?.accountHolderName || !bankDetails?.bankName || !bankDetails?.accountNumber || !bankDetails?.ifscCode) {
        return res.status(400).json({ success: false, message: 'Please provide all bank account details' });
      }
    } else if (withdrawalMethod === 'upi') {
      if (!upiDetails?.upiId || !upiDetails.upiId.trim()) {
        return res.status(400).json({ success: false, message: 'Please provide a valid UPI ID' });
      }
    }

    let withdrawal = null;
    if (mongoose.connection.readyState === 1) {
      withdrawal = new FounderWithdrawal({
        founderId: String(founderId),
        founderName,
        founderEmail,
        startupId: startupId || '',
        startupName: startupName || '',
        amount: numAmount,
        withdrawalMethod,
        bankDetails: withdrawalMethod === 'bank_account' ? bankDetails : undefined,
        upiDetails: withdrawalMethod === 'upi' ? upiDetails : undefined,
        status: 'Pending',
      });
      await withdrawal.save();
    }

    const updatedSummary = await calculateFounderBalance(String(founderId));

    return res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        withdrawal: withdrawal || { id: `wd_${Date.now()}`, _id: `wd_${Date.now()}`, founderId, founderName, founderEmail, startupName, amount: numAmount, status: 'Pending', withdrawalMethod, createdAt: new Date().toISOString() },
        summary: updatedSummary,
      },
    });
  } catch (err: any) {
    console.error('Error creating withdrawal request:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to request withdrawal' });
  }
};

// GET /api/withdrawals/admin - Admin view of all founder withdrawal requests
export const getAdminWithdrawals = async (req: Request, res: Response) => {
  try {
    let withdrawals: any[] = [];
    if (mongoose.connection.readyState === 1) {
      withdrawals = await FounderWithdrawal.find({}).sort({ createdAt: -1 });
    }
    return res.json({ success: true, data: withdrawals });
  } catch (err: any) {
    console.error('Error fetching admin withdrawals:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch admin withdrawals' });
  }
};

// PATCH /api/withdrawals/admin/:id/status - Update withdrawal status (Pending → Under Review → Approved → Processing → Completed/Rejected) and record UTR
export const updateWithdrawalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, utrNumber, payoutReference, adminNotes, payoutProof } = req.body;
    const adminName = (req as any).user?.fullName || 'Admin';

    if (!['Pending', 'Under Review', 'Approved', 'Processing', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status transition' });
    }

    let withdrawal = null;
    if (mongoose.connection.readyState === 1) {
      const existing = await FounderWithdrawal.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
      }

      const updates: any = {
        status,
        updatedAt: new Date(),
      };

      if (utrNumber !== undefined) updates.utrNumber = utrNumber;
      if (payoutReference !== undefined) updates.payoutReference = payoutReference;
      if (adminNotes !== undefined) updates.adminNotes = adminNotes;
      if (payoutProof !== undefined) updates.payoutProof = payoutProof;

      if (['Approved', 'Processing', 'Completed', 'Rejected'].includes(status)) {
        updates.processedBy = adminName;
        updates.processedAt = new Date();
      }

      withdrawal = await FounderWithdrawal.findByIdAndUpdate(id, updates, { new: true });

      // Recalculate founder balance
      if (withdrawal && withdrawal.founderId) {
        await calculateFounderBalance(withdrawal.founderId);
      }
    }

    return res.json({
      success: true,
      message: `Withdrawal status updated to ${status}`,
      data: withdrawal || { id, status, utrNumber, adminNotes },
    });
  } catch (err: any) {
    console.error('Error updating withdrawal status:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update withdrawal status' });
  }
};
