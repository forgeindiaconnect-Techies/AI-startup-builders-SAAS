import { Router } from 'express';
import {
  getFounderWithdrawals,
  requestFounderWithdrawal,
  getAdminWithdrawals,
  updateWithdrawalStatus,
} from '../controllers/withdrawalController.js';

const router = Router();

router.get('/founder', getFounderWithdrawals);
router.post('/founder/request', requestFounderWithdrawal);
router.get('/admin', getAdminWithdrawals);
router.patch('/admin/:id/status', updateWithdrawalStatus);

export default router;
