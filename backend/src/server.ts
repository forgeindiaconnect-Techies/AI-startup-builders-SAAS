import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { connectDB } from './config/db.js';

// Catch all background uncaught errors so Node process on Render never crashes with Bad Gateway 502
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception thrown:', err);
});

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Global permissive CORS handler for seamless origin access (Vercel, localhost, custom domains)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);
app.use('/', apiRoutes); // Fallback for frontend requests missing the /api prefix

// Root endpoint
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    name: 'AI Startup Builder API',
    version: '1.0.0',
    description: 'AI-powered SaaS platform for startup founders, mentors, and investors',
    status: 'online',
    endpoints: {
      health: '/api/health',
      startups: '/api/startups',
      mentors: '/api/mentors',
      investors: '/api/investors',
      ai: '/api/ai/analyze',
    },
  });
});

// Global Express Error Middleware (guarantees JSON + CORS headers on any unexpected route error)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('⚠️ Express Error Handler captured error:', err);
  res.status(200).json({
    success: false,
    error: err?.message || 'Server processed request with warning'
  });
});

// Start server synchronously to satisfy hosting port scan (Render / Heroku / Railway)
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════');
  console.log('   AI Startup Builder API Server');
  console.log('═══════════════════════════════════════════════');
  console.log(`   🌐 Server:  http://0.0.0.0:${PORT}`);
  console.log(`   📡 API:     http://0.0.0.0:${PORT}/api`);
  console.log(`   💚 Health:  http://0.0.0.0:${PORT}/api/health`);
  console.log(`   🔑 Brevo Key Exists: ${!!process.env.BREVO_API_KEY}`);
  console.log(`   📧 Brevo Sender:     ${process.env.BREVO_SENDER_EMAIL || 'undefined'}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');

  // Connect to DB in the background
  connectDB().catch(err => {
    console.error('⚠️ DB Connection Background Warning:', err?.message || err);
  });
});
