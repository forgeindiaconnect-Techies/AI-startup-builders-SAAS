import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { Subscription } from '../models/Subscription.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Helper to generate JWT
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// 1. Register - Step 1: Send OTP
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp: otpCode,
      expiresAt
    });

    // MOCK EMAIL SENDING: Log to terminal for development
    console.log(`\n==============================================`);
    console.log(`📧 MOCK EMAIL SENT TO: ${email}`);
    console.log(`🔑 OTP CODE: ${otpCode}`);
    console.log(`==============================================\n`);

    // Return OTP in response for demo/dev mode (no real email service configured)
    res.status(200).json({ success: true, message: 'OTP sent successfully', demoOtp: otpCode });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 2. Verify OTP & Create Account — now auto-logs in and returns JWT
export const verifyOTPAndCreateUser = async (req: Request, res: Response) => {
  try {
    const {
      email, otp, password, role, fullName,
      mobile, currentRole, startupName, startupStage, industry, agreedToTerms,
      ...otherData
    } = req.body;

    if (!email || !otp || !password || !role || !fullName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Find valid OTP
    const validOtp = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!validOtp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Set approval status based on role
    const approvalStatus = (role === 'founder' || role === 'admin') ? 'approved' : 'pending';

    // Create User (or update if they started but didn't finish)
    let user = await User.findOne({ email: email.toLowerCase() });

    const founderFields = role === 'founder' ? { mobile, currentRole, startupName, startupStage, industry, agreedToTerms } : {};

    if (user) {
      user.fullName = fullName;
      user.passwordHash = passwordHash;
      user.role = role;
      user.isVerified = true;
      user.approvalStatus = approvalStatus;
      Object.assign(user, founderFields, otherData);
      await user.save();
    } else {
      user = await User.create({
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isVerified: true,
        approvalStatus,
        ...founderFields,
        ...otherData
      });
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: validOtp._id });

    // Initialize Subscription state
    let planType: 'free_trial' | 'monthly' | 'yearly' | 'none' = 'none';
    let subscriptionStatus: 'active' | 'expired' | 'trial' | 'none' = 'none';
    let trialUsed = false;
    let trialStart, trialEnd;

    if (role === 'founder') {
      // Automatic 24h Free Trial for Founders
      planType = 'free_trial';
      subscriptionStatus = 'trial';
      trialUsed = true;
      trialStart = new Date();
      trialEnd = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }

    await Subscription.create({
      userId: user._id,
      planType,
      subscriptionStatus,
      trialUsed,
      trialStart,
      trialEnd
    });

    // Auto-login: generate JWT token and return it
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in verifyOTPAndCreateUser:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 3. Login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, error: 'Email not verified' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Account suspended' });
    }

    if (user.approvalStatus === 'pending') {
      return res.status(403).json({ success: false, error: 'Account pending admin approval' });
    }

    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({ success: false, error: 'Account request rejected' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Update login count and last login
    user.loginCount += 1;
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id.toString(), user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 4. Get Current User Profile (with Subscription data)
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const subscription = await Subscription.findOne({ userId: user._id });

    // Check if trial expired and auto-update
    if (subscription && subscription.subscriptionStatus === 'trial') {
      if (subscription.trialEnd && new Date() > subscription.trialEnd) {
        subscription.subscriptionStatus = 'expired';
        subscription.planType = 'none';
        await subscription.save();
      }
    }

    res.json({
      success: true,
      user,
      subscription
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
