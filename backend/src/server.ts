import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-startup-builders-saas-coral.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[],
  credentials: true,
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
    endpoints: {
      health: '/api/health',
      startups: '/api/startups',
      mentors: '/api/mentors',
      investors: '/api/investors',
      ai: '/api/ai/analyze',
    },
  });
});

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      // Connect to DB in the background
      connectDB();

      console.log('');
      console.log('🚀 ═══════════════════════════════════════════');
      console.log('   AI Startup Builder API Server');
      console.log('═══════════════════════════════════════════════');
      console.log(`   🌐 Server:  http://localhost:${PORT}`);
      console.log(`   📡 API:     http://localhost:${PORT}/api`);
      console.log(`   💚 Health:  http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
