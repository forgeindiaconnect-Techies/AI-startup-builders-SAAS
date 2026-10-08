import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'AI-startup';

if (!BREVO_API_KEY) {
  console.warn('WARNING: BREVO_API_KEY is missing in environment variables. Email sending will fail.');
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!BREVO_API_KEY) {
    console.warn(`[BREVO API KEY MISSING] Would have sent to ${to}: ${subject}`);
    return null;
  }

  // If key starts with xsmtpsib, use SMTP via Nodemailer
  if (BREVO_API_KEY.startsWith('xsmtpsib-')) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
          user: BREVO_SENDER_EMAIL,
          pass: BREVO_API_KEY,
        },
      });

      const info = await transporter.sendMail({
        from: `"${BREVO_SENDER_NAME}" <${BREVO_SENDER_EMAIL}>`,
        to,
        subject,
        html,
      });

      console.log(`Email sent via Brevo SMTP to ${to}: ${info.messageId}`);
      return info;
    } catch (smtpErr) {
      console.error(`Failed to send email to ${to} via Brevo SMTP:`, smtpErr);
      throw smtpErr;
    }
  }

  // Otherwise default to Brevo REST API v3
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json() as { messageId?: string };
    console.log(`Email sent via Brevo to ${to}: ${data.messageId || 'Success'}`);
    return data;
  } catch (error) {
    console.error(`Failed to send email to ${to} via Brevo:`, error);
    throw error;
  }
};

