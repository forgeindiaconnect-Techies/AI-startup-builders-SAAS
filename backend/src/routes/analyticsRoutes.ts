import { Router } from 'express';
import { getAdminAnalyticsData } from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/admin/data', protect, adminOnly, getAdminAnalyticsData);

export default router;
