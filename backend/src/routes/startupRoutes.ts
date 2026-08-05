import express from 'express';
import { createDraft, getStartup, getAllStartups, updateStartup, deleteStartup } from '../controllers/aiBuilderController.js';

const router = express.Router();

router.post('/create-draft', createDraft);
router.get('/', getAllStartups);
router.get('/:startupId', getStartup);
router.put('/:startupId', updateStartup);
router.delete('/:startupId', deleteStartup);

export default router;
