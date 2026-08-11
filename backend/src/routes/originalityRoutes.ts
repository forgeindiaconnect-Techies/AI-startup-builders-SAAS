import { Router } from 'express';
import {
  analyzeOriginality,
  getOriginalityHistory,
  getOriginalityReportById,
  deleteOriginalityReport,
} from '../controllers/originalityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all originality check endpoints with auth middleware
router.post('/analyze', protect, analyzeOriginality);
router.get('/history', protect, getOriginalityHistory);
router.get('/:id', protect, getOriginalityReportById);
router.delete('/:id', protect, deleteOriginalityReport);

export default router;
