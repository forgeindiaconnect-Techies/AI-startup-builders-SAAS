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
      <p style="font-size: 16px; color: #333;">Please use the 6-digit verification code below to complete your registration. This code is valid for <strong>10 minutes</strong>.</p>
      
      <div style="background-color: #f4f4f5; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
        <p style="font-size: 12px; color: #666; margin-top: 0; margin-bottom: 8px; font-weight: 700; text-transform: uppercase;">Your Verification Code</p>
        <h1 style="font-size: 36px; letter-spacing: 6px; color: #6C4CF1; margin: 0; font-weight: 800;">${otpCode}</h1>
      </div>
      
      <p style="font-size: 14px; color: #666; text-align: center;">If you didn't request this verification code, please safely ignore this email.</p>
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

export const sendPasswordResetEmail = async (to: string, otpCode: string) => {
  // If API key is not configured, fallback to console log
  if (!BREVO_API_KEY) {
    console.warn('\n⚠️ BREVO_API_KEY not configured in .env');
    console.warn(`📧 WOULD HAVE SENT PASSWORD RESET EMAIL TO: ${to}`);
    console.warn(`🔑 RESET OTP CODE: ${otpCode}\n`);
    return true; // Pretend it succeeded for development
  }

  const subject = 'Reset Your Password - AI Startup Builder';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
      <h2 style="color: #6C4CF1; text-align: center;">AI Startup Builder</h2>
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">Please use the verification code below to reset your password. This code is valid for 10 minutes.</p>

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
    console.log(`✉️ Password reset email sent via Brevo to ${to}: ${data.messageId || 'Success'}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${to}:`, error);
    console.warn(`🔑 FALLBACK RESET OTP for ${to}: ${otpCode}`);
    return false; // Caller can decide, but reset won't crash
  }
};

export const sendInvestorInviteEmail = async (
  to: string,
  fullName: string,
  inviteUrl: string,
  adminNotes?: string
) => {
  if (!BREVO_API_KEY) {
    console.warn('\n⚠️ BREVO_API_KEY not configured in .env');
    console.warn(`📧 WOULD HAVE SENT INVESTOR INVITE EMAIL TO: ${to}`);
    console.warn(`🔗 INVITE URL: ${inviteUrl}\n`);
    return true;
  }

  const subject = "You're Invited to Join Our Investor Network - AI Startup Builder";
  const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #6C4CF1; font-size: 26px; margin: 0; font-weight: 800; tracking-tight: -0.5px;">AI Startup Builder</h1>
        <p style="color: #D97706; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; margin-bottom: 0;">Exclusive Investor Network Invitation</p>
      </div>

      <p style="font-size: 16px; color: #111827; font-weight: 700; margin-bottom: 12px;">Dear ${fullName},</p>

      <p style="font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 16px;">
        You have been personally invited by our platform administrators to join the <strong>AI Startup Builder Investor Network</strong>.
      </p>

      <p style="font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
        AI Startup Builder connects accredited angel investors, VCs, and family offices with pre-validated, high-potential AI startups. As an onboarded investor, you gain direct access to structured pitch decks, AI-assisted market research, financial models, and direct founder deal-flow.
      </p>

      <div style="background-color: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
        <p style="font-size: 14px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 20px;">
          Click the button below to accept your invitation and complete your investor profile:
        </p>
        <a href="${inviteUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6C4CF1 0%, #5B21B6 100%); color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(108, 76, 241, 0.35);">
          Accept Invitation & Create Investor Account &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #6B7280; margin-bottom: 6px; font-weight: 600;">
        Direct Invitation URL:
      </p>
      <div style="background-color: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px; word-break: break-all; margin-bottom: 24px;">
        <a href="${inviteUrl}" style="color: #6C4CF1; font-size: 12px; font-family: monospace; text-decoration: underline;">
          ${inviteUrl}
        </a>
      </div>

      ${adminNotes ? `
        <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
          <p style="font-size: 12px; color: #92400E; margin: 0;"><strong>Note from Administrator:</strong> ${adminNotes}</p>
        </div>
      ` : ''}

      <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 28px 0;" />
      <p style="font-size: 11px; color: #9CA3AF; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} AI Startup Builder. All rights reserved.<br />
        This email was sent to <strong>${to}</strong> because an administrator created an invitation for you.
      </p>
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
        to: [{ email: to, name: fullName }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✉️ Investor Invite Email sent via Brevo to ${to}: ${data.messageId || 'Success'}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send investor invite email to ${to}:`, error);
    return false;
  }
};
