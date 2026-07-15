import { Router, Request, Response } from 'express';
import aiBuilderRoutes from './aiBuilderRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import startupRoutes from './startupRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/startups', startupRoutes);
router.use('/ai-builder', aiBuilderRoutes);
router.use('/notifications', notificationRoutes);

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
router.get('/startups', (_req: Request, res: Response) => {
  res.json({ message: 'Startups endpoint - Coming soon' });
});

router.get('/mentors', (_req: Request, res: Response) => {
  res.json({ message: 'Mentors endpoint - Coming soon' });
});

router.get('/investors', (_req: Request, res: Response) => {
  res.json({ message: 'Investors endpoint - Coming soon' });
});

router.get('/ai/analyze', (_req: Request, res: Response) => {
  res.json({ message: 'AI Analysis endpoint - Coming soon' });
});

export default router;
