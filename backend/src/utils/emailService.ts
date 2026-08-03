import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Force Node.js to use IPv4 first for DNS lookups (prevents ENETUNREACH IPv6 errors on Render)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore on older Node versions
}

// Create a transporter using SMTP
// Force IPv4 and short timeouts to prevent hanging on Render (which blocks IPv6 SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  family: 4, // Force IPv4 — prevents ENETUNREACH on Render
  connectionTimeout: 8000,  // fail fast after 8s (not 40s)
  socketTimeout: 8000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as any);

export const sendOTPEmail = async (to: string, otpCode: string) => {
  // If SMTP is not configured, fallback to console log
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('\n⚠️ SMTP credentials not configured in .env');
    console.warn(`📧 WOULD HAVE SENT EMAIL TO: ${to}`);
    console.warn(`🔑 OTP CODE: ${otpCode}\n`);
    return true; // Pretend it succeeded for development
  }

  const mailOptions = {
    from: `"AI Startup Builder" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Verification Code - AI Startup Builder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
        <h2 style="color: #6C4CF1; text-align: center;">AI Startup Builder</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Please use the verification code below to complete your registration. This code is valid for 10 minutes.</p>
        
        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #333; margin: 0;">${otpCode}</h1>
        </div>
        
        <p style="font-size: 14px; color: #666; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaec; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} AI Startup Builder. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    // Do NOT throw — log the error and fall back to console so registration still works
    console.error(`❌ Failed to send email to ${to}:`, error);
    console.warn(`🔑 FALLBACK OTP for ${to}: ${otpCode}`);
    return false; // Caller can decide, but registration won't crash
  }
};
