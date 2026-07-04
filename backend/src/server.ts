import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (_req, res) => {
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
    await connectDB();

    app.listen(PORT, () => {
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
