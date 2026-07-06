import express from 'express';
import { generateStartup, regenerateStartup, chatStartup } from '../controllers/aiBuilderController.js';

const router = express.Router();

router.post('/generate/:startupId', generateStartup);
router.post('/regenerate/:startupId', regenerateStartup);
router.post('/chat/:startupId', chatStartup);

export default router;
