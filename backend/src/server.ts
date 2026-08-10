import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { connectDB } from './config/db.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ai-startup-builder-saas.vercel.app',      // Primary Vercel frontend
  'https://ai-startup-builders-saas-coral.vercel.app', // Old Vercel frontend
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain, localhost, or listed origin
    if (
      origin.includes('localhost') ||
      origin.endsWith('.vercel.app') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    // Return true instead of throwing error callback so browser receives proper CORS headers even on bad requests
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
