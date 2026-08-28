import { Router } from 'express';
import { sendOTP, verifyOTPAndCreateUser, loginUser, getMe, updateMe, getAllUsersAdmin, updateUserApproval, updateUserSubscription, forgotPassword, resetPassword, getDeletedUsersAdmin } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', sendOTP);
router.post('/verify-otp', verifyOTPAndCreateUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/admin/users', protect, adminOnly, getAllUsersAdmin);
router.post('/admin/users/action', protect, adminOnly, updateUserApproval);
router.post('/admin/users/subscription', protect, adminOnly, updateUserSubscription);
router.get('/admin/deleted-users', protect, adminOnly, getDeletedUsersAdmin);

export default router;
