import mongoose from 'mongoose';

const DB_CONFIG = {
  uri: process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-startup-builder',
};

export const connectDB = async (): Promise<void> => {
  try {
    // Disable buffering globally so Mongoose fails fast on operations if disconnected
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(DB_CONFIG.uri, {
      dbName: 'ai-startup-builder', // always use this DB, regardless of URI
    });
    console.log('');
    console.log('📦 ═══════════════════════════════════════════');
    console.log(`   MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('⚠️ Server will continue without database. API routes requiring DB will return errors.');
  }
};

export default DB_CONFIG;
