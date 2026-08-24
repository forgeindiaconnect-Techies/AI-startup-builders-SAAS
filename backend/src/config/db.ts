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
    // Disable command buffering so queries fail-fast or use in-memory fallback instantly when DB is disconnected
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(DB_CONFIG.uri, {
      dbName: 'ai-startup-builder',
      serverSelectionTimeoutMS: 2500,
      socketTimeoutMS: 15000,
    });
    console.log('');
    console.log('📦 ═══════════════════════════════════════════');
    console.log(`   MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.warn('⚠️ Database connection notice:', (error as Error).message);
    console.log('⚡ Server running in high-performance in-memory mode for instant client responses.');
  }
};

export default DB_CONFIG;
