import { Router } from 'express';
import { submitPayment, getAllPayments, approvePayment, rejectPayment } from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

// Founder routes
router.post('/submit', protect, submitPayment);

// Admin routes
router.get('/', protect, adminOnly, getAllPayments);
router.post('/:paymentId/approve', protect, adminOnly, approvePayment);
router.post('/:paymentId/reject', protect, adminOnly, rejectPayment);

export default router;
