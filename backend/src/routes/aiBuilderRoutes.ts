import express from 'express';
import { generateStateless, regenerateStartup, chatStartup, generateLegalDocs, generateLogo } from '../controllers/aiBuilderController.js';

const router = express.Router();

router.post('/generate-stateless', generateStateless);
router.post('/regenerate/:startupId', regenerateStartup);
router.post('/chat', chatStartup);
router.post('/chat/:startupId', chatStartup);
router.post('/generate-legal-docs', generateLegalDocs);
router.post('/generate-logo', generateLogo);

export default router;
