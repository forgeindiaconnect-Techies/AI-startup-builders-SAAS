

// Catch all background uncaught errors so Node process on Render never crashes with Bad Gateway 502
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception thrown:', err);
});

const app = express();
const PORT = parseInt(process.env.PORT || 'yu898', 10);

// Global permissive CORS handler for seamless origin access (Vercel, localhost, custom domains)
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.options('*', cors());

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
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('⚠️ Express Error Handler captured error:', err);
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(200).json({
    success: false,
    error: err?.message || 'Server processed request with warning'
  });
});

// Start server
const startServer = async () => {
  try {
    // Await database connection attempt so Mongoose is ready (or fails and logs) before starting Express
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
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
  }
};

startServer();
