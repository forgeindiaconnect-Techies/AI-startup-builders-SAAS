import { Router } from 'express';
import { sendOTP, verifyOTPAndCreateUser, loginUser, getMe, getAllUsersAdmin, updateUserApproval } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', sendOTP);
router.post('/verify-otp', verifyOTPAndCreateUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/admin/users', protect, adminOnly, getAllUsersAdmin);
router.post('/admin/users/action', protect, adminOnly, updateUserApproval);

export default router;
