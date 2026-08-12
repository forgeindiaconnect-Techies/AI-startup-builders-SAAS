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
router.use('/plagiarism', plagiarismRoutes);
router.use('/originality', originalityRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'AI Startup Builder API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Test Brevo email endpoint
router.get('/test-email', async (req: Request, res: Response) => {
  try {
    const targetEmail = (req.query.to as string) || process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com';
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'AI-startup';

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'BREVO_API_KEY environment variable is not defined in backend .env'
      });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: targetEmail,
          },
        ],
        subject: 'AI Startup Builder Test Email',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6C4CF1;">Brevo Test Email</h2>
            <p>Your Brevo email integration is working properly!</p>
            <p><strong>Sent To:</strong> ${targetEmail}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    console.log('Brevo status:', response.status);
    console.log('Brevo response:', data);

    return res.status(response.status).json({
      status: response.status,
      success: response.ok,
      brevoResponse: data,
    });
  } catch (error: any) {
    console.error('Email test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to trigger Brevo test email',
    });
  }
});

export default router;