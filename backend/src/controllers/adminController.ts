import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware.js';
import CommissionSettings, { ICommissionSettings } from '../models/CommissionSettings.js';
import AdminWithdrawal, { IAdminWithdrawal } from '../models/AdminWithdrawal.js';
import MentorTransaction, { IMentorTransaction } from '../models/MentorTransaction.js';
import FundingOffer, { IFundingOffer } from '../models/FundingOffer.js';

/**
 * Get current commission settings.
 * If no settings exist, create default settings.
 */
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

/**
 * Calculate total mentor commission.
 */
const getTotalMentorCommission = async (): Promise<number> => {
  const mentorTransactions = await MentorTransaction.find({
    paymentStatus: 'paid',
  });

  return mentorTransactions.reduce(
    (total: number, transaction: IMentorTransaction) =>
      total + Number(transaction.platformCommission || 0),
    0
  );
};

/**
 * Calculate total investor commission.
 */
const getTotalInvestorCommission = async (): Promise<number> => {
  const investorTransactions = await FundingOffer.find({
    status: { $in: ['funded', 'completed'] },
  });

  return investorTransactions.reduce((total: number, transaction: IFundingOffer) => {
    if (
      transaction.commissionAmount !== undefined &&
      transaction.commissionAmount !== null
    ) {
      return total + Number(transaction.commissionAmount);
    }

    const rate = Number(transaction.commissionRate ?? 2);
    const offerAmount = Number(transaction.offerAmount || 0);

    return total + (offerAmount * rate) / 100;
  }, 0);
};

/**
 * Calculate withdrawal amounts.
 */
const getWithdrawalTotals = async () => {
  const withdrawals = await AdminWithdrawal.find({});

  let paidTotal = 0;
  let pendingTotal = 0;
  let processingTotal = 0;

  let paidMentor = 0;
  let paidInvestor = 0;

  let pendingMentor = 0;
  let pendingInvestor = 0;

  let processingMentor = 0;
  let processingInvestor = 0;

  withdrawals.forEach((withdrawal: IAdminWithdrawal) => {
    const amount = Number(withdrawal.amount || 0);
    const source = withdrawal.payoutSource || 'all';

    if (withdrawal.status === 'paid') {
      paidTotal += amount;

      if (source === 'mentor') {
        paidMentor += amount;
      }

      if (source === 'investor') {
        paidInvestor += amount;
      }
    }

    if (withdrawal.status === 'pending') {
      pendingTotal += amount;

      if (source === 'mentor') {
        pendingMentor += amount;
      }

      if (source === 'investor') {
        pendingInvestor += amount;
      }
    }

    if (withdrawal.status === 'processing') {
      processingTotal += amount;

      if (source === 'mentor') {
        processingMentor += amount;
      }

      if (source === 'investor') {
        processingInvestor += amount;
      }
    }
  });

  return {
    withdrawals,

    paidTotal,
    pendingTotal,
    processingTotal,

    paidMentor,
    paidInvestor,

    pendingMentor,
    pendingInvestor,

    processingMentor,
    processingInvestor,
  };
};

/**
 * 1. GET /api/admin/commission-settings
 */
export const getCommissionSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const settings = await getActiveSettings();

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching commission settings:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
    });
  }
};

/**
 * 2. PUT /api/admin/commission-settings
 */
export const updateCommissionSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      mentorCommission,
      investorCommission,
      investorCommissionPayer,
    } = req.body;

    if (
      mentorCommission === undefined ||
      investorCommission === undefined ||
      !investorCommissionPayer
    ) {
      return res.status(400).json({
        success: false,
        message: 'All settings fields are required.',
      });
    }

    const mentorCommNum = Number(mentorCommission);
    const investorCommNum = Number(investorCommission);

    if (
      !Number.isFinite(mentorCommNum) ||
      mentorCommNum < 0 ||
      mentorCommNum > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Mentor commission must be between 0 and 100%.',
      });
    }

    if (
      !Number.isFinite(investorCommNum) ||
      investorCommNum < 0 ||
      investorCommNum > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Investor commission must be between 0 and 100%.',
      });
    }

    if (!['investor', 'founder'].includes(investorCommissionPayer)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investor commission payer option.',
      });
    }

    let settings = await CommissionSettings.findOne();

    if (!settings) {
      settings = new CommissionSettings();
    }

    settings.mentorCommission = mentorCommNum;
    settings.investorCommission = investorCommNum;
    settings.investorCommissionPayer =
      investorCommissionPayer as 'investor' | 'founder';

    await settings.save();

    return res.json({
      success: true,
      message: 'Platform settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Error updating commission settings:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
};

/**
 * 3. GET /api/admin/platform-revenue
 *
 * Shows:
 * - Mentor revenue
 * - Mentor commission
 * - Investor transactions
 * - Investor commission
 * - Total platform revenue
 * - Withdrawn amount
 * - Pending amount
 * - Processing amount
 * - Current withdrawable balance
 */
export const getPlatformRevenueDashboard = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    /**
     * -------------------------
     * MENTOR
     * -------------------------
     */
    const mentorTransactions = await MentorTransaction.find({
      paymentStatus: 'paid',
    }).sort({ createdAt: -1 });

    const totalMentorTransactions = mentorTransactions.length;

    const totalMentorRevenue = mentorTransactions.reduce(
      (total: number, transaction: IMentorTransaction) =>
        total + Number(transaction.sessionFee || 0),
      0
    );

    const totalMentorCommission = mentorTransactions.reduce(
      (total: number, transaction: IMentorTransaction) =>
        total + Number(transaction.platformCommission || 0),
      0
    );

    /**
     * -------------------------
     * INVESTOR
     * -------------------------
     */
    const investorTransactions = await FundingOffer.find({
      status: { $in: ['funded', 'completed'] },
    }).sort({ createdAt: -1 });

    const totalInvestorTransactions = investorTransactions.length;

    const totalInvestorCommission =
      await getTotalInvestorCommission();

    /**
     * -------------------------
     * WITHDRAWALS
     * -------------------------
     */
    const withdrawalTotals = await getWithdrawalTotals();

    /**
     * -------------------------
     * PLATFORM TOTALS
     * -------------------------
     */
    const totalPlatformRevenue =
      totalMentorCommission + totalInvestorCommission;

    const availablePlatformBalance = Math.max(
      0,
      totalPlatformRevenue - withdrawalTotals.paidTotal
    );

    const currentAvailableWithdrawalBalance = Math.max(
      0,
      availablePlatformBalance -
      withdrawalTotals.pendingTotal -
      withdrawalTotals.processingTotal
    );

    /**
     * Mentor available balance
     */
    const availableMentorBalance = Math.max(
      0,
      totalMentorCommission -
      withdrawalTotals.paidMentor -
      withdrawalTotals.pendingMentor -
      withdrawalTotals.processingMentor
    );

    /**
     * Investor available balance
     */
    const availableInvestorBalance = Math.max(
      0,
      totalInvestorCommission -
      withdrawalTotals.paidInvestor -
      withdrawalTotals.pendingInvestor -
      withdrawalTotals.processingInvestor
    );

    return res.json({
      success: true,

      data: {
        /**
         * Mentor
         */
        totalMentorTransactions,
        totalMentorRevenue,
        totalMentorCommission,
        availableMentorBalance,

        /**
         * Investor
         */
        totalInvestorTransactions,
        totalInvestorCommission,
        availableInvestorBalance,

        /**
         * Platform
         */
        totalPlatformCommission:
          totalMentorCommission + totalInvestorCommission,

        totalPlatformRevenue,

        availablePlatformBalance,

        /**
         * Withdrawals
         */
        totalAmountWithdrawn: withdrawalTotals.paidTotal,

        pendingPlatformWithdrawals:
          withdrawalTotals.pendingTotal,

        processingPlatformWithdrawals:
          withdrawalTotals.processingTotal,

        currentAvailableWithdrawalBalance,

        /**
         * Transaction lists
         */
        mentorTransactions,
        investorTransactions,
        withdrawals: withdrawalTotals.withdrawals,
      },
    });
  } catch (error) {
    console.error(
      'Error fetching platform revenue dashboard:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
    });
  }
};

/**
 * 4. POST /api/admin/platform-withdraw
 *
 * IMPORTANT:
 * New withdrawal is created as PENDING.
 *
 * Workflow:
 * Admin Request
 *      ↓
 * PENDING
 *      ↓
 * PROCESSING
 *      ↓
 * PAID / FAILED
 */
export const requestAdminWithdrawal = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      amount,
      withdrawalMethod,
      payoutSource,
      upiId,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      otherDetails,
    } = req.body;

    const withdrawAmount = Number(amount);

    /**
     * Validate amount
     */
    if (
      !Number.isFinite(withdrawAmount) ||
      withdrawAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount.',
      });
    }

    /**
     * Validate withdrawal method
     */
    if (
      !['bank_transfer', 'upi', 'other'].includes(
        withdrawalMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal method.',
      });
    }

    /**
     * Validate payout source
     */
    const source = payoutSource || 'all';

    if (!['all', 'mentor', 'investor'].includes(source)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payout source.',
      });
    }

    /**
     * UPI validation
     */
    if (
      withdrawalMethod === 'upi' &&
      (!upiId || !upiId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required.',
      });
    }

    /**
     * Bank validation
     */
    if (
      withdrawalMethod === 'bank_transfer' &&
      (!accountHolderName ||
        !accountNumber ||
        !ifscCode)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Account holder, account number and IFSC code are required.',
      });
    }

    /**
     * Get commissions
     */
    const totalMentorCommission =
      await getTotalMentorCommission();

    const totalInvestorCommission =
      await getTotalInvestorCommission();

    /**
     * Get existing withdrawals.
     *
     * pending + processing + paid
     * are reserved/used amounts.
     */
    const withdrawals = await AdminWithdrawal.find({
      status: {
        $in: ['pending', 'processing', 'paid'],
      },
    });

    let availableToWithdraw = 0;

    /**
     * MENTOR BALANCE
     */
    if (source === 'mentor') {
      const mentorWithdrawn = withdrawals
        .filter(
          (withdrawal: IAdminWithdrawal) =>
            withdrawal.payoutSource === 'mentor'
        )
        .reduce(
          (sum: number, withdrawal: IAdminWithdrawal) =>
            sum + Number(withdrawal.amount || 0),
          0
        );

      availableToWithdraw = Math.max(
        0,
        totalMentorCommission - mentorWithdrawn
      );
    }

    /**
     * INVESTOR BALANCE
     */
    else if (source === 'investor') {
      const investorWithdrawn = withdrawals
        .filter(
          (withdrawal: IAdminWithdrawal) =>
            withdrawal.payoutSource === 'investor'
        )
        .reduce(
          (sum: number, withdrawal: IAdminWithdrawal) =>
            sum + Number(withdrawal.amount || 0),
          0
        );

      availableToWithdraw = Math.max(
        0,
        totalInvestorCommission - investorWithdrawn
      );
    }

    /**
     * COMBINED PLATFORM BALANCE
     */
    else {
      const totalRevenue =
        totalMentorCommission +
        totalInvestorCommission;

      const alreadyReserved = withdrawals.reduce(
        (sum: number, withdrawal: IAdminWithdrawal) =>
          sum + Number(withdrawal.amount || 0),
        0
      );

      availableToWithdraw = Math.max(
        0,
        totalRevenue - alreadyReserved
      );
    }

    /**
     * Amount validation
     */
    if (withdrawAmount > availableToWithdraw) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Maximum available to withdraw is ₹${availableToWithdraw.toLocaleString(
          'en-IN'
        )}`,
        availableBalance: availableToWithdraw,
      });
    }

    /**
     * Create withdrawal.
     *
     * IMPORTANT:
     * Status = pending.
     *
     * DO NOT generate fake transaction reference here.
     */
    const withdrawal = await AdminWithdrawal.create({
      amount: withdrawAmount,

      withdrawalMethod,

      payoutSource: source,

      /**
       * UPI
       */
      upiId:
        withdrawalMethod === 'upi'
          ? upiId.trim()
          : '',

      /**
       * Bank
       */
      accountHolderName:
        withdrawalMethod === 'bank_transfer'
          ? accountHolderName.trim()
          : '',

      bankName:
        withdrawalMethod === 'bank_transfer'
          ? (bankName || '').trim()
          : '',

      accountNumber:
        withdrawalMethod === 'bank_transfer'
          ? accountNumber.trim()
          : '',

      ifscCode:
        withdrawalMethod === 'bank_transfer'
          ? ifscCode.trim()
          : '',

      /**
       * Other
       */
      otherDetails:
        withdrawalMethod === 'other'
          ? (otherDetails || '').trim()
          : '',

      /**
       * IMPORTANT
       * New request starts as pending.
       */
      status: 'pending',

      /**
       * Real transaction reference will be
       * added only after payment is completed.
       */
      transactionReference: '',

      /**
       * Admin who created the request.
       */
      processedBy: req.user?.id
        ? new mongoose.Types.ObjectId(req.user.id)
        : undefined,

      processedAt: undefined,
    });

    return res.status(201).json({
      success: true,
      message:
        'Withdrawal request submitted successfully. Status: Pending.',
      data: withdrawal,
    });
  } catch (error) {
    console.error(
      'Error requesting withdrawal:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to request withdrawal',
    });
  }
};

/**
 * 5. PUT /api/admin/platform-withdrawals/:id/process
 *
 * PENDING / FAILED
 *        ↓
 *    PROCESSING
 */
export const processAdminWithdrawal = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal ID.',
      });
    }

    const withdrawal =
      await AdminWithdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found.',
      });
    }

    /**
     * Only pending or failed can be processed.
     */
    if (
      withdrawal.status !== 'pending' &&
      withdrawal.status !== 'failed'
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot process withdrawal with status "${withdrawal.status}".`,
      });
    }

    withdrawal.status = 'processing';

    withdrawal.processedBy = req.user?.id
      ? new mongoose.Types.ObjectId(req.user.id)
      : withdrawal.processedBy;

    withdrawal.processedAt = new Date();

    await withdrawal.save();

    return res.json({
      success: true,
      message:
        'Platform withdrawal is now processing.',
      data: withdrawal,
    });
  } catch (error) {
    console.error(
      'Error processing admin withdrawal:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal',
    });
  }
};

/**
 * 6. PUT /api/admin/platform-withdrawals/:id/mark-paid
 *
 * PROCESSING / PENDING
 *        ↓
 *    PAID / FAILED
 */
export const markAdminWithdrawalPaid = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      status,
      transactionReference,
      adminNotes,
    } = req.body;

    /**
     * Validate ID
     */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal ID.',
      });
    }

    /**
     * Validate status
     */
    if (!['paid', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid status. Status must be paid or failed.',
      });
    }

    /**
     * Paid requires actual transaction reference.
     */
    if (
      status === 'paid' &&
      (!transactionReference ||
        !transactionReference.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Transaction reference ID is required for paid status.',
      });
    }

    /**
     * Find withdrawal
     */
    const withdrawal =
      await AdminWithdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found.',
      });
    }

    /**
     * Only pending or processing withdrawals
     * can be completed.
     *
     * Failed withdrawals can be retried through
     * processAdminWithdrawal().
     */
    if (
      withdrawal.status !== 'pending' &&
      withdrawal.status !== 'processing'
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot mark withdrawal as ${status} from current status "${withdrawal.status}".`,
      });
    }

    /**
     * Update status
     */
    withdrawal.status = status as 'paid' | 'failed';

    /**
     * Store real transaction reference
     * only when payment succeeds.
     */
    withdrawal.transactionReference =
      status === 'paid'
        ? transactionReference.trim()
        : '';

    /**
     * Admin notes
     */
    withdrawal.adminNotes = adminNotes
      ? adminNotes.trim()
      : '';

    /**
     * Admin who processed the withdrawal
     */
    withdrawal.processedBy = req.user?.id
      ? new mongoose.Types.ObjectId(req.user.id)
      : withdrawal.processedBy;

    withdrawal.processedAt = new Date();

    await withdrawal.save();

    return res.json({
      success: true,
      message:
        status === 'paid'
          ? 'Platform withdrawal marked as paid successfully.'
          : 'Platform withdrawal marked as failed.',
      data: withdrawal,
    });
  } catch (error) {
    console.error(
      'Error completing admin withdrawal:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to complete withdrawal',
    });
  }
};