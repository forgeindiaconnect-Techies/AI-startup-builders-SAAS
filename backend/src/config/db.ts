import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to Google & Cloudflare DNS to prevent ECONNREFUSED querySrv errors on ISPs/hosting
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS fails
}

const DB_CONFIG = {
  uri: process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-startup-builder',
};

export const connectDB = async (): Promise<void> => {
  try {
    // Keep bufferCommands enabled so queries queue gracefully during initial connection startup
    mongoose.set('bufferCommands', true);

    const conn = await mongoose.connect(DB_CONFIG.uri, {
      dbName: 'ai-startup-builder',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('');
    console.log('📦 ═══════════════════════════════════════════');
    console.log(`   MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    console.error('⚠️ Server will continue serving requests gracefully.');
  }
};

export default DB_CONFIG;
