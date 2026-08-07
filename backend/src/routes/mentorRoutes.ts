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
  completeSession,
  submitFeedback,
  getBookingFeedback,
} from '../controllers/mentorController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

// All mentor endpoints require an authenticated user
router.use(protect);

router.get('/', getAvailableMentors);
router.get('/bookings', getMyBookings);
router.get('/mentor/bookings', getMentorBookings);
router.post('/book', createBooking);

router.put('/admin/:id', adminOnly, updateMentorProfileAdmin);

router.get('/bookings/:id/feedback', getBookingFeedback);
router.post('/bookings/:id/cancel', cancelBooking);
router.post('/bookings/:id/reschedule', rescheduleBooking);
router.post('/bookings/:id/complete', completeSession);
router.post('/bookings/:id/feedback', submitFeedback);

router.get('/:id/availability', getMentorAvailability);
router.get('/:id', getMentorProfile);

export default router;
