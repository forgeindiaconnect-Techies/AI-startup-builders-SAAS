import { Router } from 'express';
import {
  getAvailableMentors,
  getMentorProfile,
  updateMentorProfileAdmin,
  getMentorAvailability,
  createBooking,
  getMyBookings,
  getMentorBookings,
  cancelBooking,
  rescheduleBooking,
  scheduleSession,
  acceptSession,
  completeSession,
  submitSessionReview,
  getMentorSessionReviews,
  getMySubmittedReviews,
  submitFeedback,
  getBookingFeedback,
  getMentorEarnings,
  getAdminMentorEarnings,
  updatePayoutStatus,
  getMentorPaymentSettings,
} from '../controllers/mentorController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

// All mentor endpoints require an authenticated user
router.use(protect);

router.get('/', getAvailableMentors);
router.get('/bookings', getMyBookings);
router.get('/mentor/bookings', getMentorBookings);
router.get('/mentor/earnings', getMentorEarnings);
router.post('/book', createBooking);
router.post('/reviews', submitSessionReview);
router.get('/reviews/me', getMentorSessionReviews);
router.get('/reviews/mine', getMySubmittedReviews);

// Admin routes
router.get('/admin/earnings', adminOnly, getAdminMentorEarnings);
router.put('/admin/transactions/:id/payout', adminOnly, updatePayoutStatus);
router.get('/admin/:id/payment-settings', adminOnly, getMentorPaymentSettings);
router.put('/admin/:id', adminOnly, updateMentorProfileAdmin);

router.get('/bookings/:id/feedback', getBookingFeedback);
router.post('/bookings/:id/cancel', cancelBooking);
router.post('/bookings/:id/reschedule', rescheduleBooking);
router.post('/bookings/:id/schedule', scheduleSession);
router.post('/bookings/:id/accept', acceptSession);
router.post('/bookings/:id/complete', completeSession);
router.post('/bookings/:id/feedback', submitFeedback);

router.get('/:id/availability', getMentorAvailability);
router.get('/:id', getMentorProfile);

export default router;
