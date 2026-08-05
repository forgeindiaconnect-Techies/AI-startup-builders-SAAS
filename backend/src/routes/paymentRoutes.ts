import { Router } from 'express';
import { submitPayment, getAllPayments, approvePayment, rejectPayment } from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

// Founder routes
router.post('/submit', protect, submitPayment);

// Founders see their own payments, admins see all (scoped in controller)
router.get('/', protect, getAllPayments);

// Admin routes
router.post('/:paymentId/approve', protect, adminOnly, approvePayment);
router.post('/:paymentId/reject', protect, adminOnly, rejectPayment);

export default router;
