import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to Google & Cloudflare DNS to prevent ECONNREFUSED querySrv errors on ISPs/hosting
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS fails
}

// Fallback to Google & Cloudflare DNS to prevent ECONNREFUSED querySrv errors on ISPs/hosting
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS fails
}

const DB_CONFIG = {
  uri: process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-startup-builder',
};

// Helper to programmatically resolve mongodb+srv URIs using custom DNS if default DNS fails
const resolveMongoSrvUri = (uri: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!uri.startsWith('mongodb+srv://')) {
      return resolve(uri);
    }
    
    // Parse parts: mongodb+srv://[user:pass]@[host]/[db]?[options]
    const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)([^?]*)(.*)$/);
    if (!match) return resolve(uri);
    
    const [, credentials, srvHost, path, query] = match;
    
    dns.resolveSrv(`_mongodb._tcp.${srvHost}`, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        // Fallback to custom DNS set
        try {
          dns.setServers(['8.8.8.8', '1.1.1.1']);
        } catch {}
        dns.resolveSrv(`_mongodb._tcp.${srvHost}`, (err2, addresses2) => {
          if (err2 || !addresses2 || addresses2.length === 0) {
            // Can't resolve, return original and let Mongoose try
            return resolve(uri);
          }
          const hosts = addresses2.map(addr => `${addr.name}:${addr.port}`).join(',');
          const resolvedUri = `mongodb://${credentials}@${hosts}${path || '/'}${query || ''}${query ? '&' : '?'}ssl=true&authSource=admin`;
          resolve(resolvedUri);
        });
      } else {
        const hosts = addresses.map(addr => `${addr.name}:${addr.port}`).join(',');
        const resolvedUri = `mongodb://${credentials}@${hosts}${path || '/'}${query || ''}${query ? '&' : '?'}ssl=true&authSource=admin`;
        resolve(resolvedUri);
      }
    });
  });
};

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('bufferCommands', false);

    // Resolve DNS SRV records using custom DNS servers if default DNS fails
    const finalUri = await resolveMongoSrvUri(DB_CONFIG.uri);

    const conn = await mongoose.connect(finalUri, {
      dbName: 'ai-startup-builder',
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 15000,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });
    console.log('');
    console.log('📦 ═══════════════════════════════════════════');
    console.log(`   MongoDB Connected (Primary): ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.warn('⚠️ Primary database connection failed:', (error as Error).message);
    
    // Fallback to local MongoDB
    const localUri = 'mongodb://localhost:27017/ai-startup-builder';
    console.log(`Attempting connection to local MongoDB fallback: ${localUri}`);
    try {
      const conn = await mongoose.connect(localUri, {
        dbName: 'ai-startup-builder',
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 15000,
      });
      console.log('');
      console.log('📦 ═══════════════════════════════════════════');
      console.log(`   MongoDB Connected (Local Fallback): ${conn.connection.host}`);
      console.log(`   Database Name: ${conn.connection.name}`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
    } catch (localError) {
      console.warn('❌ Local database fallback also failed:', (localError as Error).message);
      console.log('⚡ Server running in disconnected in-memory mode.');
    }
  }
};

export default DB_CONFIG;
