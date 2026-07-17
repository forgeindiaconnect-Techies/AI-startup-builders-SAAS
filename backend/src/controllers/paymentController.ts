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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Create Payment Record
    const payment = await Payment.create({
      userId,
      founderName: user.fullName,
      planName,
      amount,
      paymentMethod,
      transactionId,
      screenshot,
      status: 'pending_verification'
    });

    // Update Subscription Status to pending
    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = new Subscription({ userId });
    }
    subscription.paymentStatus = 'pending';
    subscription.status = 'pending_verification';
    await subscription.save();

    res.status(201).json({ success: true, message: 'Payment submitted successfully. Awaiting admin verification.', payment });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ success: false, error: 'Server error while submitting payment.' });
  }
};

// 2. Get All Payments (Admin)
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).populate('userId', 'email mobile');
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching payments.' });
  }
};

// 3. Approve Payment (Admin)
export const approvePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
    if (payment.status !== 'pending_verification') return res.status(400).json({ success: false, error: 'Payment is not pending.' });

    payment.status = 'approved';
    await payment.save();

    // Activate the subscription
    const subscription = await Subscription.findOne({ userId: payment.userId });
    if (subscription) {
      subscription.planName = payment.planName;
      subscription.status = 'active';
      subscription.paymentStatus = 'approved';
      subscription.billingCycle = 'monthly';
      subscription.startDate = new Date();
      subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await subscription.save();
    }

    res.json({ success: true, message: 'Payment approved successfully.', payment });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ success: false, error: 'Server error while approving payment.' });
  }
};

// 4. Reject Payment (Admin)
export const rejectPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    payment.status = 'rejected';
    await payment.save();

    const subscription = await Subscription.findOne({ userId: payment.userId });
    if (subscription) {
      subscription.paymentStatus = 'rejected';
      subscription.status = 'expired';
      await subscription.save();
    }

    res.json({ success: true, message: 'Payment rejected successfully.', payment });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ success: false, error: 'Server error while rejecting payment.' });
  }
};
