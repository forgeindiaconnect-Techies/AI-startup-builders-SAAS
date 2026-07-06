import express from 'express';
import { createDraft, getStartup } from '../controllers/aiBuilderController.js';

const router = express.Router();

router.post('/create-draft', createDraft);
router.get('/:startupId', getStartup);

export default router;
