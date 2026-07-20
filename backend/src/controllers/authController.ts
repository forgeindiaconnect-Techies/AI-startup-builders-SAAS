import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { Subscription } from '../models/Subscription.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendOTPEmail } from '../utils/emailService.js';

// In-memory OTP store for demo/fallback (when MongoDB OTP lookup fails)
const demoPhoneOtpStore: Record<string, { otp: string; expiresAt: number }> = {};

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
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'email' });

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp: otpCode,
      type: 'email',
      expiresAt
    });

    // Send email using Nodemailer
    await sendOTPEmail(email.toLowerCase(), otpCode);

    res.status(200).json({ success: true, message: 'OTP sent successfully', otp: otpCode });
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
      expertise, experienceYears, linkedin, bio,
      companyName, investorType, preferredIndustry, minInvestment, maxInvestment,
      ...otherData
    } = req.body;

    if (!email || !otp || !password || !role || !fullName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Find valid OTP
    const validOtp = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: 'email',
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

    const roleFields: Record<string, any> = {};
    if (role === 'founder') {
      Object.assign(roleFields, { mobile, currentRole, startupName, startupStage, industry, agreedToTerms });
    } else if (role === 'mentor') {
      Object.assign(roleFields, { mobile, expertise, experienceYears, linkedin, bio });
    } else if (role === 'investor') {
      Object.assign(roleFields, { mobile, companyName, investorType, preferredIndustry, minInvestment, maxInvestment });
    }

    if (user) {
      user.fullName = fullName;
      user.passwordHash = passwordHash;
      user.role = role;
      user.isVerified = true;
      user.approvalStatus = approvalStatus;
      Object.assign(user, roleFields, otherData);
      await user.save();
    } else {
      user = await User.create({
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isVerified: true,
        approvalStatus,
        ...roleFields,
        ...otherData
      });
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: validOtp._id });

    // Initialize Subscription state
    let planName: 'free_trial' | 'pro' | 'premium_startup_builder' | 'none' = 'none';
    let status: 'active' | 'expired' | 'pending_verification' | 'cancelled' | 'none' = 'none';
    let paymentStatus: 'not_required' | 'pending' | 'approved' | 'rejected' = 'not_required';
    let trialUsed = false;
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (role === 'founder') {
      // Automatic 24h Free Trial for Founders
      planName = 'free_trial';
      status = 'active';
      paymentStatus = 'not_required';
      trialUsed = true;
      startDate = new Date();
      endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    }

    await Subscription.create({
      userId: user._id,
      planName,
      status,
      paymentStatus,
      billingCycle: 'trial',
      trialUsed,
      startDate,
      endDate
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

// ── Phone OTP ──────────────────────────────────────────────────────────────────

// 3. Send Phone OTP (demo mode: returns OTP in response)
export const sendPhoneOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Always store in in-memory map (works even without DB)
    demoPhoneOtpStore[phone] = { otp: otpCode, expiresAt: expiresAt.getTime() };

    // Also try to persist in DB (best effort)
    try {
      await OTP.deleteMany({ phone, type: 'phone' });
      await OTP.create({ phone, otp: otpCode, type: 'phone', expiresAt });
    } catch (dbErr) {
      console.warn('⚠️  DB OTP save failed (using in-memory fallback):', (dbErr as Error).message);
    }

    console.log(`📱 Phone OTP for ${phone}: ${otpCode}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone number',
      otp: otpCode, // demo mode — remove in production with real SMS
    });
  } catch (error) {
    console.error('Error in sendPhoneOTP:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 4. Verify Phone OTP
export const verifyPhoneOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
    }

    let verified = false;

    // Primary: Check DB
    try {
      const validOtp = await OTP.findOne({
        phone,
        otp,
        type: 'phone',
        expiresAt: { $gt: new Date() }
      });
      if (validOtp) {
        await OTP.deleteOne({ _id: validOtp._id });
        verified = true;
      }
    } catch (dbErr) {
      console.warn('⚠️  DB OTP check failed (using in-memory fallback):', (dbErr as Error).message);
    }

    // Fallback: Check in-memory store
    if (!verified) {
      const stored = demoPhoneOtpStore[phone];
      if (stored && stored.otp === otp && stored.expiresAt > Date.now()) {
        delete demoPhoneOtpStore[phone];
        verified = true;
      }
    }

    if (!verified) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP. Please request a new one.' });
    }

    res.status(200).json({ success: true, message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Error in verifyPhoneOTP:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 5. Complete Signup via Phone Verification (skips email OTP)
export const completePhoneSignup = async (req: Request, res: Response) => {
  try {
    const {
      email, password, role, fullName,
      mobile, currentRole, startupName, startupStage, industry, agreedToTerms,
      expertise, experienceYears, linkedin, bio,
      companyName, investorType, preferredIndustry, minInvestment, maxInvestment,
      ...otherData
    } = req.body;

    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const approvalStatus = (role === 'founder' || role === 'admin') ? 'approved' : 'pending';

    let user = await User.findOne({ email: email.toLowerCase() });

    const roleFields: Record<string, any> = {};
    if (role === 'founder') {
      Object.assign(roleFields, { mobile, currentRole, startupName, startupStage, industry, agreedToTerms });
    } else if (role === 'mentor') {
      Object.assign(roleFields, { mobile, expertise, experienceYears, linkedin, bio });
    } else if (role === 'investor') {
      Object.assign(roleFields, { mobile, companyName, investorType, preferredIndustry, minInvestment, maxInvestment });
    }

    if (user) {
      // Update existing user (re-registration or retry)
      user.fullName = fullName;
      user.passwordHash = passwordHash;
      user.role = role as 'founder' | 'mentor' | 'investor' | 'admin';
      user.isVerified = true;
      user.approvalStatus = approvalStatus as 'pending' | 'approved' | 'rejected';
      Object.assign(user, roleFields);
      await user.save();
    } else {
      user = await User.create({
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isVerified: true,
        approvalStatus,
        mobile,
        ...roleFields,
      });
    }

    // Upsert Subscription — avoids E11000 duplicate key error on retry
    const now = new Date();
    const trialEnd = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    const subData = role === 'founder'
      ? {
          planName: 'free_trial' as const,
          status: 'active' as const,
          paymentStatus: 'not_required' as const,
          billingCycle: 'trial' as const,
          trialUsed: true,
          startDate: now,
          endDate: trialEnd,
        }
      : {
          planName: 'none' as const,
          status: 'none' as const,
          paymentStatus: 'not_required' as const,
          billingCycle: 'trial' as const,
          trialUsed: false,
        };

    await Subscription.findOneAndUpdate(
      { userId: user._id },
      { $set: subData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error in completePhoneSignup:', error);
    // Specific duplicate email error
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists. Please log in.' });
    }
    res.status(500).json({ success: false, error: 'Server error: ' + (error.message || 'Unknown') });
  }
};

// 6. Login
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

    const subscription = await Subscription.findOne({ userId: user._id });

    // Check if trial expired and auto-update
    if (subscription && subscription.planName === 'free_trial' && subscription.status === 'active') {
      if (subscription.endDate && new Date() > subscription.endDate) {
        subscription.status = 'expired';
        await subscription.save();
      }
    }

    const flatUser = user.toObject();
    if (subscription) {
      Object.assign(flatUser, {
        plan: subscription.planName,
        subscriptionStatus: subscription.status,
        paymentStatus: subscription.paymentStatus,
        trialUsed: subscription.trialUsed,
        trialStartDate: subscription.startDate,
        trialEndDate: subscription.endDate
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id.toString(), user.role),
      user: flatUser,
      subscription
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Admin: Get all users with subscription data
export const getAllUsersAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
    const usersWithSubs = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findOne({ userId: user._id });
        const userObj = user.toObject();
        if (subscription) {
          Object.assign(userObj, {
            plan: subscription.planName,
            subscriptionStatus: subscription.status,
            paymentStatus: subscription.paymentStatus,
            trialUsed: subscription.trialUsed,
            trialEndDate: subscription.endDate,
            subscriptionStartDate: subscription.startDate,
            subscriptionEndDate: subscription.endDate,
          });
        }
        return userObj;
      })
    );
    res.json({ success: true, users: usersWithSubs });
  } catch (error) {
    console.error('Error in getAllUsersAdmin:', error);
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
    if (subscription && subscription.planName === 'free_trial' && subscription.status === 'active') {
      if (subscription.endDate && new Date() > subscription.endDate) {
        subscription.status = 'expired';
        await subscription.save();
      }
    }

    const flatUser = user.toObject();
    if (subscription) {
      Object.assign(flatUser, {
        plan: subscription.planName,
        subscriptionStatus: subscription.status,
        paymentStatus: subscription.paymentStatus,
        trialUsed: subscription.trialUsed,
        trialStartDate: subscription.startDate,
        trialEndDate: subscription.endDate
      });
    }

    res.json({
      success: true,
      user: flatUser,
      subscription
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
