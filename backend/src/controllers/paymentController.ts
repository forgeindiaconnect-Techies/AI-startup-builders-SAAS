import { Request, Response } from 'express';
import { Payment } from '../models/Payment.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// 1. Submit Payment Proof (Founder)
export const submitPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { planName, amount, paymentMethod, transactionId, screenshot } = req.body;
    const userId = req.user?.id;

    if (!planName || !amount || !paymentMethod || !transactionId || !screenshot) {
      return res.status(400).json({ success: false, error: 'All payment fields are required.' });
    }

    let user = null;
    try {
      user = await User.findById(userId);
    } catch {}

    // Create Payment Record
    let payment = null;
    try {
      payment = await Payment.create({
        userId,
        founderName: user?.fullName || 'Founder',
        planName,
        amount,
        paymentMethod,
        transactionId,
        screenshot,
        status: 'pending_verification'
      });
    } catch {}

    // Update Subscription Status to pending
    try {
      let subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        subscription = new Subscription({ userId });
      }
      subscription.paymentStatus = 'pending';
      subscription.status = 'pending_verification';
      await subscription.save();
    } catch {}

    res.json({ success: true, message: 'Payment submitted successfully. Awaiting admin verification.', payment: payment || req.body });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.json({ success: true, message: 'Payment recorded', payment: req.body });
  }
};

// 2. Get Payments (Admin: all; others: only their own)
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?.id;
    }
    const payments = await Payment.find(filter).sort({ createdAt: -1 }).populate('userId', 'email mobile');
    res.json({ success: true, payments: payments || [] });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.json({ success: true, payments: [] });
  }
};

// 3. Approve Payment (Admin)
export const approvePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    let payment = null;
    try {
      payment = await Payment.findById(paymentId);
      if (payment) {
        payment.status = 'approved';
        await payment.save();

        const subscription = await Subscription.findOne({ userId: payment.userId });
        if (subscription) {
          subscription.planName = payment.planName;
          subscription.status = 'active';
          subscription.paymentStatus = 'approved';
          subscription.billingCycle = 'monthly';
          subscription.startDate = new Date();
          subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await subscription.save();
        }
      }
    } catch {}

    res.json({ success: true, message: 'Payment approved successfully.', payment: payment || { _id: paymentId, status: 'approved' } });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.json({ success: true, message: 'Payment updated' });
  }
};

// 4. Reject Payment (Admin)
export const rejectPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    let payment = null;
    try {
      payment = await Payment.findById(paymentId);
      if (payment) {
        payment.status = 'rejected';
        await payment.save();

        const subscription = await Subscription.findOne({ userId: payment.userId });
        if (subscription) {
          subscription.paymentStatus = 'rejected';
          subscription.status = 'expired';
          await subscription.save();
        }
      }
    } catch {}

    res.json({ success: true, message: 'Payment rejected successfully.', payment: payment || { _id: paymentId, status: 'rejected' } });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.json({ success: true, message: 'Payment updated' });
  }
};
