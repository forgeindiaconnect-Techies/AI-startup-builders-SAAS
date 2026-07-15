import { Router } from 'express';
import { sendOTP, verifyOTPAndCreateUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', sendOTP);
router.post('/verify-otp', verifyOTPAndCreateUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;
