import mongoose from 'mongoose';
import dns from 'dns';

// Fix Node.js Windows SRV lookup issues
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const DB_URI = "mongodb+srv://renugopal:renu123@cluster0.4e4hikr.mongodb.net/ai-startup-builder?retryWrites=true&w=majority&appName=Cluster0";

async function checkDatabase() {
  console.log("Connecting to MongoDB Atlas cluster...");
  await mongoose.connect(DB_URI);
  console.log("✅ Successfully connected to MongoDB Atlas!");

  const db = mongoose.connection.db;
  console.log(`Connected Database Name: "${db.databaseName}"`);

  // List all collections
  const collections = await db.listCollections().toArray();
  console.log("\n--- Collections & Document Counts ---");
  
  if (collections.length === 0) {
    console.log("No collections found in this database yet.");
  } else {
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- Collection "${col.name}": ${count} document(s)`);
    }

    // Sample one startup if available
    if (collections.some(c => c.name === 'startups')) {
      const sampleStartup = await db.collection('startups').findOne({});
      if (sampleStartup) {
        console.log("\n--- Sample Startup Data Stored in MongoDB ---");
        console.log("ID:", sampleStartup._id);
        console.log("Startup Name:", sampleStartup.startupName);
        console.log("Industry:", sampleStartup.industry);
        console.log("AI Generated Data Present:", sampleStartup.aiGenerated ? "Yes (Pitch Deck, Business Plan, Branding)" : "No");
      }
    }
  }

  await mongoose.disconnect();
  console.log("\nDisconnected cleanly.");
}

checkDatabase().catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1);
});
