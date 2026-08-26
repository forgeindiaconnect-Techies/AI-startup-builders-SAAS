import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware.js';
import CommissionSettings from '../models/CommissionSettings.js';
import AdminWithdrawal from '../models/AdminWithdrawal.js';
import MentorTransaction from '../models/MentorTransaction.js';
import FundingOffer from '../models/FundingOffer.js';
import { User } from '../models/User.js';

// Helper to get active settings or default
const getActiveSettings = async () => {
  let settings = await CommissionSettings.findOne();
  if (!settings) {
    settings = new CommissionSettings({
      mentorCommission: 20,
      investorCommission: 2,
      investorCommissionPayer: 'investor',
    });
    await settings.save();
  }
  return settings;
};

// 1. GET /api/admin/commission-settings
export const getCommissionSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getActiveSettings();
    return res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching commission settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// 2. PUT /api/admin/commission-settings
export const updateCommissionSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { mentorCommission, investorCommission, investorCommissionPayer } = req.body;

    if (mentorCommission === undefined || investorCommission === undefined || !investorCommissionPayer) {
      return res.status(400).json({ success: false, message: 'All settings fields are required.' });
    }

    const mentorCommNum = Number(mentorCommission);
    const investorCommNum = Number(investorCommission);

    if (isNaN(mentorCommNum) || mentorCommNum < 0 || mentorCommNum > 100) {
      return res.status(400).json({ success: false, message: 'Mentor commission must be between 0 and 100%.' });
    }
    if (isNaN(investorCommNum) || investorCommNum < 0 || investorCommNum > 100) {
      return res.status(400).json({ success: false, message: 'Investor commission must be between 0 and 100%.' });
    }
    if (!['investor', 'founder'].includes(investorCommissionPayer)) {
      return res.status(400).json({ success: false, message: 'Invalid investor commission payer option.' });
    }

    let settings = await CommissionSettings.findOne();
    if (!settings) {
      settings = new CommissionSettings();
    }

    settings.mentorCommission = mentorCommNum;
    settings.investorCommission = investorCommNum;
    settings.investorCommissionPayer = investorCommissionPayer as 'investor' | 'founder';
    await settings.save();

    return res.json({ success: true, message: 'Platform settings updated successfully', data: settings });
  } catch (error) {
    console.error('Error updating commission settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

// 3. GET /api/admin/platform-revenue
export const getPlatformRevenueDashboard = async (req: AuthRequest, res: Response) => {
  try {
    // A. Mentor calculations
    const mentorTransactions = await MentorTransaction.find({ paymentStatus: 'paid' }).sort({ createdAt: -1 });
    let totalMentorTransactions = mentorTransactions.length;
    let totalMentorRevenue = 0;
    let totalMentorCommission = 0;

    mentorTransactions.forEach(t => {
      totalMentorRevenue += t.sessionFee || 0;
      totalMentorCommission += t.platformCommission || 0;
    });

    // B. Investor calculations
    const investorTransactions = await FundingOffer.find({ status: { $in: ['funded', 'completed'] } }).sort({ createdAt: -1 });
    let totalInvestorTransactions = investorTransactions.length;
    let totalInvestorCommission = 0;

    investorTransactions.forEach(t => {
      // If commissionAmount is stored, use it. Otherwise, calculate on the fly using snapshot commissionRate or current default (2)
      if (t.commissionAmount !== undefined && t.commissionAmount !== null) {
        totalInvestorCommission += t.commissionAmount;
      } else {
        const rate = t.commissionRate ?? 2;
        totalInvestorCommission += (t.offerAmount * rate) / 100;
      }
    });

    // C. Withdrawal calculations
    const withdrawals = await AdminWithdrawal.find({}).sort({ createdAt: -1 }).populate('processedBy', 'fullName email');
    let totalAmountWithdrawn = 0;
    let pendingPlatformWithdrawals = 0;

    withdrawals.forEach(w => {
      if (w.status === 'paid') {
        totalAmountWithdrawn += w.amount || 0;
      } else if (w.status === 'pending' || w.status === 'processing') {
        pendingPlatformWithdrawals += w.amount || 0;
      }
    });

    // D. Final Totals
    const totalPlatformRevenue = totalMentorCommission + totalInvestorCommission;
    const availablePlatformBalance = Math.max(0, totalPlatformRevenue - totalAmountWithdrawn);
    const currentAvailableWithdrawalBalance = Math.max(0, availablePlatformBalance - pendingPlatformWithdrawals);

    return res.json({
      success: true,
      data: {
        totalMentorTransactions,
        totalMentorRevenue,
        totalMentorCommission,
        totalInvestorTransactions,
        totalInvestorCommission,
        totalPlatformCommission: totalMentorCommission + totalInvestorCommission,
        totalPlatformRevenue,
        availablePlatformBalance,
        pendingPlatformWithdrawals,
        totalAmountWithdrawn,
        currentAvailableWithdrawalBalance,
        mentorTransactions,
        investorTransactions,
        withdrawals,
      }
    });
  } catch (error) {
    console.error('Error fetching platform revenue dashboard:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};

// 4. POST /api/admin/platform-withdraw
export const requestAdminWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, withdrawalMethod, upiId, accountHolderName, bankName, accountNumber, ifscCode, otherDetails } = req.body;

    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount.' });
    }

    if (!['bank_transfer', 'upi', 'other'].includes(withdrawalMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal method.' });
    }

    if (withdrawalMethod === 'upi' && (!upiId || !upiId.trim())) {
      return res.status(400).json({ success: false, message: 'UPI ID is required.' });
    }

    if (withdrawalMethod === 'bank_transfer' && (!accountHolderName || !accountNumber || !ifscCode)) {
      return res.status(400).json({ success: false, message: 'Account holder, account number and IFSC code are required.' });
    }

    // Dynamic balance check
    // 1. Total Mentor Commissions
    const mentorTx = await MentorTransaction.find({ paymentStatus: 'paid' });
    const totalMentorCommission = mentorTx.reduce((sum, t) => sum + (t.platformCommission || 0), 0);

    // 2. Total Investor Commissions
    const investorTx = await FundingOffer.find({ status: { $in: ['funded', 'completed'] } });
    const totalInvestorCommission = investorTx.reduce((sum, t) => {
      if (t.commissionAmount !== undefined && t.commissionAmount !== null) return sum + t.commissionAmount;
      const rate = t.commissionRate ?? 2;
      return sum + ((t.offerAmount * rate) / 100);
    }, 0);

    // 3. Total Admin Withdrawn
    const adminWithdrawals = await AdminWithdrawal.find({ status: { $in: ['pending', 'processing', 'paid'] } });
    const existingWithdrawnOrPending = adminWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const totalRevenue = totalMentorCommission + totalInvestorCommission;
    const availableToWithdraw = Math.max(0, totalRevenue - existingWithdrawnOrPending);

    if (withdrawAmount > availableToWithdraw) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Maximum available to withdraw is ₹${availableToWithdraw.toLocaleString('en-IN')}`,
      });
    }

    const withdrawal = await AdminWithdrawal.create({
      amount: withdrawAmount,
      withdrawalMethod,
      upiId: withdrawalMethod === 'upi' ? upiId.trim() : '',
      accountHolderName: withdrawalMethod === 'bank_transfer' ? accountHolderName.trim() : '',
      bankName: withdrawalMethod === 'bank_transfer' ? (bankName || '').trim() : '',
      accountNumber: withdrawalMethod === 'bank_transfer' ? accountNumber.trim() : '',
      ifscCode: withdrawalMethod === 'bank_transfer' ? ifscCode.trim() : '',
      otherDetails: withdrawalMethod === 'other' ? (otherDetails || '').trim() : '',
      status: 'pending',
    });

    return res.status(201).json({ success: true, message: 'Withdrawal request submitted successfully', data: withdrawal });
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    return res.status(500).json({ success: false, message: 'Failed to request withdrawal' });
  }
};

// 5. PUT /api/admin/platform-withdrawals/:id/process
export const processAdminWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal ID.' });
    }

    const withdrawal = await AdminWithdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
    }

    if (withdrawal.status !== 'pending' && withdrawal.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: `Cannot process a withdrawal with status "${withdrawal.status}". Valid transition is Pending/Failed -> Processing.`,
      });
    }

    withdrawal.status = 'processing';
    await withdrawal.save();

    return res.json({ success: true, message: 'Platform withdrawal set to processing', data: withdrawal });
  } catch (error) {
    console.error('Error processing admin withdrawal:', error);
    return res.status(500).json({ success: false, message: 'Failed to process withdrawal' });
  }
};

// 6. PUT /api/admin/platform-withdrawals/:id/mark-paid
export const markAdminWithdrawalPaid = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, transactionReference, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal ID.' });
    }

    if (!['paid', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Status must be paid or failed.' });
    }

    if (status === 'paid' && (!transactionReference || !transactionReference.trim())) {
      return res.status(400).json({ success: false, message: 'Transaction reference ID is required for paid status.' });
    }

    const withdrawal = await AdminWithdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
    }

    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: `Cannot mark withdrawal as ${status} from current status "${withdrawal.status}".`,
      });
    }

    withdrawal.status = status as 'paid' | 'failed';
    withdrawal.transactionReference = status === 'paid' ? transactionReference.trim() : '';
    withdrawal.adminNotes = adminNotes ? adminNotes.trim() : '';
    withdrawal.processedBy = new mongoose.Types.ObjectId(req.user!.id);
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    return res.json({ success: true, message: `Platform withdrawal marked as ${status} successfully`, data: withdrawal });
  } catch (error) {
    console.error('Error completing admin withdrawal:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete withdrawal' });
  }
};
