import dotenv from 'dotenv';
import { sendEmail } from '../config/mailer.js';

dotenv.config();

export const sendOTPEmail = async (to: string, otpCode: string): Promise<boolean> => {
  const subject = 'Your Verification Code - AI Startup Builder';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px; background: #ffffff;">
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
    const res = await sendEmail({ to, subject, html: htmlContent });
    return res !== null;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${to}:`, error);
    console.warn(`🔑 FALLBACK OTP for ${to}: ${otpCode}`);
    return false;
  }
};

export const sendPasswordResetEmail = async (to: string, otpCode: string): Promise<boolean> => {
  const subject = 'Reset Your Password - AI Startup Builder';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px; background: #ffffff;">
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
    const res = await sendEmail({ to, subject, html: htmlContent });
    return res !== null;
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${to}:`, error);
    console.warn(`🔑 FALLBACK RESET OTP for ${to}: ${otpCode}`);
    return false;
  }
};

export const sendInvestorInviteEmail = async (
  to: string,
  fullName: string,
  inviteUrl: string,
  adminNotes?: string
): Promise<boolean> => {
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
    const res = await sendEmail({ to, subject, html: htmlContent });
    return res !== null;
  } catch (error) {
    console.error(`❌ Failed to send investor invite email to ${to}:`, error);
    return false;
  }
};

export const sendMeetingInviteEmail = async ({
  to,
  fullName,
  meetingDate,
  meetingTime,
  videoUrl,
  passcode
}: {
  to: string;
  fullName: string;
  meetingDate: string;
  meetingTime: string;
  videoUrl: string;
  passcode: string;
}): Promise<boolean> => {
  const subject = "Investor Accreditation & Meeting Invitation - AI Startup Builder";
  const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #6C4CF1; font-size: 26px; margin: 0; font-weight: 800; tracking-tight: -0.5px;">AI Startup Builder</h1>
        <p style="color: #D97706; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; margin-bottom: 0;">Investor Accreditation & Interview Meeting</p>
      </div>

      <p style="font-size: 16px; color: #111827; font-weight: 700; margin-bottom: 12px;">Dear ${fullName},</p>

      <p style="font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 16px;">
        An administrator from <strong>AI Startup Builder</strong> has scheduled or updated your virtual accreditation interview. Below are the meeting details and video connection link:
      </p>

      <div style="background-color: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin: 28px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6B7280; width: 140px; border-bottom: 1px solid #E5E7EB;">Meeting Date:</td>
            <td style="padding: 8px 0; font-weight: 700; border-bottom: 1px solid #E5E7EB;">${meetingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6B7280; border-bottom: 1px solid #E5E7EB;">Meeting Time:</td>
            <td style="padding: 8px 0; font-weight: 700; color: #6C4CF1; border-bottom: 1px solid #E5E7EB;">${meetingTime} IST (UTC+05:30)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6B7280; border-bottom: 1px solid #E5E7EB;">Duration:</td>
            <td style="padding: 8px 0; font-weight: 700; border-bottom: 1px solid #E5E7EB;">45 Minutes</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6B7280; border-bottom: 1px solid #E5E7EB;">Video Call Link:</td>
            <td style="padding: 8px 0; font-weight: 700; border-bottom: 1px solid #E5E7EB;">
              <a href="${videoUrl}" target="_blank" style="color: #6C4CF1; text-decoration: underline;">
                Join Video Call
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6B7280;">Passcode:</td>
            <td style="padding: 8px 0; font-weight: 700; font-family: monospace;">${passcode}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${videoUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6C4CF1 0%, #5B21B6 100%); color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(108, 76, 241, 0.35);">
          Join Meeting &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #6B7280; line-height: 1.6; margin-bottom: 24px;">
        If you have any conflict with the scheduled time, please contact our support team or administrator as soon as possible to request a reschedule.
      </p>

      <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 28px 0;" />
      <p style="font-size: 11px; color: #9CA3AF; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} AI Startup Builder. All rights reserved.<br />
        Sent to <strong>${to}</strong> as part of the investor accreditation process.
      </p>
    </div>
  `;

  try {
    const res = await sendEmail({ to, subject, html: htmlContent });
    return res !== null;
  } catch (error) {
    console.error(`❌ Failed to send meeting invite email to ${to}:`, error);
    return false;
  }
};

export const sendMentorInviteEmail = async (options: {
  mentorName: string;
  mentorEmail: string;
  inviteLink: string;
  message?: string;
  expertise?: string;
  expiresAt?: Date;
}): Promise<boolean> => {
  const { mentorName, mentorEmail, inviteLink, message } = options;
  const subject = "You're Invited to Join Our Mentor Network - AI Startup Builder";
  const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6C4CF1;">Hello ${mentorName},</h2>
      <p>You have been invited to join AI Startup Builder as a Mentor.</p>
      <p><a href="${inviteLink}" style="background-color: #6C4CF1; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a></p>
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
    </div>
  `;

  try {
    const res = await sendEmail({ to: mentorEmail, subject, html: htmlContent });
    return res !== null;
  } catch (error) {
    console.error('Failed to send mentor invite email:', error);
    return false;
  }
};
