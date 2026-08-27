import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const DB_URI = process.env.MONGODB_URL || process.env.MONGODB_URI;

export const connectDB = async (): Promise<void> => {
  try {
    if (!DB_URI) {
      throw new Error('MONGODB_URL is not defined');
    }

    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 15000,
    });

    console.log('');
    console.log('📦 ═══════════════════════════════════════════');
    console.log(`   MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ ═══════════════════════════════════════════');
    console.error(`   MongoDB Connection Failed: ${(error as Error).message}`);
    console.error('═══════════════════════════════════════════════');
    console.error('');
    process.exit(1);
  }
};

export default DB_URI;
