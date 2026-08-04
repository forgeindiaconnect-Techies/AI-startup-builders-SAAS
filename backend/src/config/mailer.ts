import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const MAIL_USER = process.env.MAIL_USER || process.env.SMTP_USER || "";
const MAIL_PASS = process.env.MAIL_PASS || process.env.SMTP_PASS || "";

if (!MAIL_USER || !MAIL_PASS) {
    console.warn("⚠️ WARNING: MAIL_USER or MAIL_PASS is missing in environment variables. Email sending will fail.");
}

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    family: 4, // Force IPv4 - prevents ETIMEDOUT/ENETUNREACH on Render
    connectionTimeout: 8000,
    socketTimeout: 8000,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
    },
} as any);

export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) => {
    return transporter.sendMail({
        from: `"AI Startup Builder" <${MAIL_USER}>`,
        to,
        subject,
        html,
    });
};