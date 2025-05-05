import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASSWORD, APP_URL } from "$env/static/private"

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER, // Your Gmail email
    pass: EMAIL_PASSWORD, // Your App Password (not your actual Gmail password)
  },
});

/**
 * Sends a verification email to the user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 */
export async function sendVerificationEmail(email, token, limit) {
  const verificationLink = `${APP_URL}/verify?token=${token}`;

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Cipher Arena: Verify Your Email",
    html: `
      <h1>Email Verification</h1>
      <p>Click the link below to verify your email. This link will expire in ${limit} minutes.</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent.");
  }
}
