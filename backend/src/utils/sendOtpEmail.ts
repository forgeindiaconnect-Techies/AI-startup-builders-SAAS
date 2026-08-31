import { sendEmail } from "../config/mailer.js";

export const sendOtpEmail = async (email: string, otp: string) => {
    await sendEmail({
        to: email,
        subject: "Your AI Startup Builder OTP",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>AI Startup Builder Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This OTP is valid for a limited time.</p>
      </div>
    `,
    });
};