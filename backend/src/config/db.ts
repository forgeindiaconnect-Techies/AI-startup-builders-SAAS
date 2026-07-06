import mongoose from 'mongoose';

const DB_CONFIG = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-startup-builder',
};

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(DB_CONFIG.uri);
    console.log('');
    console.log('📦 ═══════════════════════════════════════════');
    console.log(`   MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default DB_CONFIG;
