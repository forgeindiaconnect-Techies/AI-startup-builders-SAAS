import mongoose from 'mongoose';

const DB_URI = "mongodb+srv://renugopal:renu123@cluster0.4e4hikr.mongodb.net/ai-startup-builder?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(DB_URI);
  console.log("Connected to MongoDB!");
  
  const startup = await mongoose.connection.db.collection('startups').findOne({ _id: new mongoose.Types.ObjectId('6a928855373c1c0b6da81c45') });
  console.log("Startup details:", JSON.stringify(startup, null, 2));
  
  await mongoose.disconnect();
}

run().catch(console.error);
