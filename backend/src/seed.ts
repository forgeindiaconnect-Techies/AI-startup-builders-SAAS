import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Subscription } from './models/Subscription.js';

dotenv.config();

const TEST_PASSWORD = 'Test@123';

const users = [
  {
    fullName: 'Rahul Founder',
    email: 'founder@test.com',
    role: 'founder' as const,
    mobile: '+919876543210',
    currentRole: 'CEO',
    startupName: 'TechVenture AI',
    startupStage: 'MVP',
    industry: 'Technology',
    agreedToTerms: true,
    profileCompleted: true,
  },
  {
    fullName: 'Priya Mentor',
    email: 'mentor@test.com',
    role: 'mentor' as const,
    expertise: 'Product Strategy, Growth Hacking',
    experienceYears: '10+',
    linkedin: 'https://linkedin.com/in/priya-mentor',
    bio: 'Serial entrepreneur with 3 exits. Passionate about helping early-stage startups.',
  },
  {
    fullName: 'Arjun Investor',
    email: 'investor@test.com',
    role: 'investor' as const,
    companyName: 'Venture Capital Partners',
    typicalCheckSize: '$500K - $2M',
    sectorsOfInterest: 'AI/ML, SaaS, FinTech',
    investmentThesis: 'Looking for strong teams solving real problems with scalable technology.',
  },
  {
    fullName: 'Admin User',
    email: 'admin@test.com',
    role: 'admin' as const,
  },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-startup-builder';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB\n');

    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`SKIP  ${userData.email} (already exists)`);
        continue;
      }

      const user = await User.create({
        ...userData,
        passwordHash,
        isVerified: true,
        status: 'active',
        approvalStatus: 'approved',
      });

      if (userData.role === 'founder') {
        await Subscription.create({
          userId: user._id,
          planName: 'free_trial',
          status: 'active',
          billingCycle: 'trial',
          paymentStatus: 'not_required',
          trialUsed: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }

      console.log(`CREATED  ${userData.role.padEnd(10)} ${userData.email}`);
    }

    console.log('\nDone! Use these credentials to log in:');
    console.log('─'.repeat(50));
    for (const u of users) {
      console.log(`  ${u.role.padEnd(10)} ${u.email}  /  ${TEST_PASSWORD}`);
    }
    console.log('─'.repeat(50));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
