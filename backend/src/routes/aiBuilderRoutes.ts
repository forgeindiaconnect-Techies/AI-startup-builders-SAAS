import express from 'express';
import { generateStateless, regenerateStartup, chatStartup, generateLegalDocs } from '../controllers/aiBuilderController.js';

const router = express.Router();

router.post('/generate-stateless', generateStateless);
router.post('/regenerate/:startupId', regenerateStartup);
router.post('/chat/:startupId', chatStartup);
router.post('/generate-legal-docs', generateLegalDocs);

export default router;
