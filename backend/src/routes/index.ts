import { Router, Request, Response } from 'express';

import aiBuilderRoutes from './aiBuilderRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import startupRoutes from './startupRoutes.js';
import fundingRoutes from './fundingRoutes.js';
import documentRoutes from './documentRoutes.js';
import authRoutes from './authRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import inviteRoutes from './inviteRoutes.js';
import ragRoutes from './ragRoutes.js';
import mentorRoutes from './mentorRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/startups', startupRoutes);
router.use('/funding', fundingRoutes);
router.use('/documents', documentRoutes);
router.use('/ai-builder', aiBuilderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/invites', inviteRoutes);
router.use('/rag', ragRoutes);
router.use('/mentors', mentorRoutes);

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'AI Startup Builder API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Placeholder routes for future implementation
router.get('/investors', (_req: Request, res: Response) => {
  res.json({ message: 'Investors endpoint - Coming soon' });
});

router.get('/ai/analyze', (_req: Request, res: Response) => {
  res.json({ message: 'AI Analysis endpoint - Coming soon' });
});

export default router;