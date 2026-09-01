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
import plagiarismRoutes from './plagiarismRoutes.js';
import originalityRoutes from './originalityRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import dataroomRoutes from './dataroomRoutes.js';
import investorMessageRoutes from './investorMessageRoutes.js';
import investorMeetingRoutes from './investorMeetingRoutes.js';
import adminRoutes from './adminRoutes.js';
import withdrawalRoutes from './withdrawalRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/startups', startupRoutes);
router.use('/funding', fundingRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/documents', documentRoutes);
router.use('/ai-builder', aiBuilderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/invites', inviteRoutes);
router.use('/rag', ragRoutes);
router.use('/mentors', mentorRoutes);
router.use('/plagiarism', plagiarismRoutes);
router.use('/originality', originalityRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dataroom', dataroomRoutes);
router.use('/investor-meetings', investorMeetingRoutes);
router.use('/admin', adminRoutes);
router.use('/', investorMessageRoutes);

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'AI Startup Builder API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

import { getApprovedInvestors } from '../controllers/investorController.js';

router.get('/investors', getApprovedInvestors);

router.get('/ai/analyze', (_req: Request, res: Response) => {
  res.json({ message: 'AI Analysis endpoint - Coming soon' });
});

export default router;