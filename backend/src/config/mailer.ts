import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const MAIL_USER = process.env.MAIL_USER || "";
const MAIL_PASS = process.env.MAIL_PASS || "";

if (!MAIL_USER || !MAIL_PASS) {
    console.warn("⚠️ WARNING: MAIL_USER or MAIL_PASS is missing in environment variables. Email sending will fail.");
}

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
    },
});

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