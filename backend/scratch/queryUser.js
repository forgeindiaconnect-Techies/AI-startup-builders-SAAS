import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URL;

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  role: String,
  status: String,
  approvalStatus: String,
});

const User = mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB.");
    
    const users = await User.find({ email: { $regex: 'renu', $options: 'i' } });
    console.log(`Found ${users.length} users matching 'renu':`);
    for (const u of users) {
      console.log({
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status,
        approvalStatus: u.approvalStatus,
      });
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
