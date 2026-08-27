import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createDraft, getStartup, getAllStartups, updateStartup, deleteStartup } from '../controllers/aiBuilderController.js';

const router = express.Router();

router.use(protect);

router.post('/create-draft', createDraft);
router.get('/', getAllStartups);
router.get('/:startupId', getStartup);
router.put('/:startupId', updateStartup);
router.delete('/:startupId', deleteStartup);

export default router;
