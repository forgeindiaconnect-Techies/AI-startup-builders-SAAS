import { Router } from 'express';
import {
  getCommissionSettings,
  updateCommissionSettings,
  getPlatformRevenueDashboard,
  requestAdminWithdrawal,
  processAdminWithdrawal,
  markAdminWithdrawalPaid,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin endpoints with auth and admin-only checks
router.use(protect, adminOnly);

router.get('/commission-settings', getCommissionSettings);
router.put('/commission-settings', updateCommissionSettings);
router.get('/platform-revenue', getPlatformRevenueDashboard);
router.post('/platform-withdraw', requestAdminWithdrawal);
router.put('/platform-withdrawals/:id/process', processAdminWithdrawal);
router.put('/platform-withdrawals/:id/mark-paid', markAdminWithdrawalPaid);

export default router;
