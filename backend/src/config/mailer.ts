import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const SMTP_USER = process.env.SMTP_USER || process.env.MAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.MAIL_PASS;

const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "renugopal603@gmail.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "AI-startup";

if (!SMTP_USER || !SMTP_PASS) {
    console.log("ℹ️ Info: SMTP credentials not configured. Will use Brevo as primary sender.");
    if (!BREVO_API_KEY) {
        console.warn("⚠️ WARNING: Neither SMTP credentials nor BREVO_API_KEY are configured in environment variables. Email sending will log to console only.");
    }
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
    // 1. Try Nodemailer SMTP if credentials are provided in .env
    if (SMTP_USER && SMTP_PASS) {
        try {
            console.log(`✉️ Attempting to send email via SMTP (${SMTP_USER}) to ${to}...`);
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASS
                }
            });
            const info = await transporter.sendMail({
                from: `"AI Startup Builder" <${SMTP_USER}>`,
                to,
                subject,
                html
            });
            console.log(`✉️ Email sent via SMTP to ${to} successfully: ${info.messageId}`);
            return info;
        } catch (smtpError: any) {
            console.error(`❌ SMTP sending failed to ${to}, falling back to Brevo:`, smtpError.message);
        }
    }

    // 2. Fallback to Brevo API
    if (!BREVO_API_KEY) {
        console.warn(`\n⚠️ [EMAIL SERVICE] No sending provider configured. Would have sent email to: ${to}`);
        console.warn(`📧 Subject: ${subject}`);
        console.warn(`📝 Content Snippet: ${html.substring(0, 100)}...\n`);
        return null;
    }

    try {
        console.log(`✉️ Attempting to send email via Brevo to ${to}...`);
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
                to: [
                    {
                        email: to
                    }
                ],
                subject: subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`✉️ Email sent via Brevo to ${to} successfully: ${data.messageId || 'Success'}`);
        return data;
    } catch (error: any) {
        console.error(`❌ Failed to send email to ${to} via Brevo:`, error.message);
        throw error;
    }
};