import mongoose from 'mongoose';

const DB_URI = process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-startup-builder';

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(DB_URI, {
      dbName: 'ai-startup-builder',
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
