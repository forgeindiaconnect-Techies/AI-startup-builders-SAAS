const path = require('path');
const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
const fs = require('fs');

const envContent = fs.readFileSync(path.resolve(__dirname, '../backend/.env'), 'utf8');
const match = envContent.match(/MONGODB_URL=(.*)/);
const uri = match ? match[1].trim() : '';

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({
      $or: [{ fullName: /madhu/i }, { email: /madhu/i }]
    }).toArray();
    
    const invites = await db.collection('investorinvites').find({
      $or: [{ fullName: /madhu/i }, { email: /madhu/i }]
    }).toArray();

    const mentorInvites = await db.collection('mentorinvites').find({
      $or: [{ mentorName: /madhu/i }, { mentorEmail: /madhu/i }]
    }).toArray();

    console.log('USERS:', JSON.stringify(users, null, 2));
    console.log('INVESTOR INVITES:', JSON.stringify(invites, null, 2));
    console.log('MENTOR INVITES:', JSON.stringify(mentorInvites, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
