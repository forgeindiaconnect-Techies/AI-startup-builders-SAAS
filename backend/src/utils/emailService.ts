import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "renugopal603@gmail.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "AI-startup";

export const sendOTPEmail = async (to: string, otpCode: string) => {
  // If API key is not configured, fallback to console log
  if (!BREVO_API_KEY) {
    console.warn('\n⚠️ BREVO_API_KEY not configured in .env');
    console.warn(`📧 WOULD HAVE SENT EMAIL TO: ${to}`);
    console.warn(`🔑 OTP CODE: ${otpCode}\n`);
    return true; // Pretend it succeeded for development
  }

  const subject = 'Your Verification Code - AI Startup Builder';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
      <h2 style="color: #6C4CF1; text-align: center;">AI Startup Builder</h2>
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">Please use the verification code below to complete your registration. This code is valid for 1 minute.</p>
      
      <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #333; margin: 0;">${otpCode}</h1>
      </div>
      
      <p style="font-size: 14px; color: #666; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eaeaec; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} AI Startup Builder. All rights reserved.</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✉️ OTP Email sent via Brevo to ${to}: ${data.messageId || 'Success'}`);
    return true;
  } catch (error) {
    // Do NOT throw — log the error and fall back to console so registration still works
    console.error(`❌ Failed to send email to ${to}:`, error);
    console.warn(`🔑 FALLBACK OTP for ${to}: ${otpCode}`);
    return false; // Caller can decide, but registration won't crash
  }
};
