import { sendEmail } from "../config/mailer.js";

const formatDate = (d?: Date) => {
  if (!d) return "Not specified";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const sendMentorInviteEmail = async ({
  mentorName,
  mentorEmail,
  inviteLink,
  message,
  expertise,
  expiresAt,
}: {
  mentorName: string;
  mentorEmail: string;
  inviteLink: string;
  message?: string;
  expertise?: string;
  expiresAt?: Date;
}) => {
  await sendEmail({
    to: mentorEmail,
    subject: "Mentor Invitation - AI Startup Builder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaec; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #6C4CF1; margin: 0; font-size: 22px;">AI Startup Builder</h1>
          <p style="color: #6b7280; margin: 4px 0 0; font-size: 13px;">Mentor Invitation</p>
        </div>

        <h2 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Hello ${mentorName},</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          You have been invited to join <strong>AI Startup Builder</strong> as a mentor.
          Help founders validate ideas, avoid mistakes, and grow their startups with your expertise.
        </p>

        ${
          expertise
            ? `<div style="background: #f5f3ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
                 <span style="color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Invited Expertise</span>
                 <p style="color: #4c1d95; font-weight: bold; margin: 4px 0 0; font-size: 14px;">${expertise}</p>
               </div>`
            : ""
        }

        ${
          message
            ? `<div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
                 <span style="color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Message from the Admin</span>
                 <p style="color: #374151; margin: 4px 0 0; font-size: 14px; line-height: 1.5;">${message}</p>
               </div>`
            : ""
        }

        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          Click the button below to open the mentor signup page and complete your profile:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${inviteLink}"
             style="display: inline-block; background: linear-gradient(90deg, #6C4CF1, #5B21B6); color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: bold;">
            Complete Mentor Signup
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 20px;">
          Or copy this link into your browser:<br/>
          <a href="${inviteLink}" style="color: #6C4CF1; word-break: break-all;">${inviteLink}</a>
        </p>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 8px;">
          This invite link expires on <strong>${formatDate(expiresAt)}</strong>.
        </p>

        <hr style="border: 0; border-top: 1px solid #eaeaec; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">
          If you didn't expect this invitation, you can safely ignore this email.
          &copy; ${new Date().getFullYear()} AI Startup Builder. All rights reserved.
        </p>
      </div>
    `,
  });
};
