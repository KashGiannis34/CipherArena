import nodemailer from "nodemailer";
const EMAIL_USER = process.env.EMAIL_USER; // Your Gmail address
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD; // Your Gmail app password
const APP_URL = process.env.APP_URL;

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
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

/**
 * Sends a password reset email to the user
 * @param {string} email - User's email address
 * @param {string} token - Reset token
 * @param {number} limit - Expiration time in minutes
 */
export async function sendPasswordResetEmail(email, token, limit) {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Cipher Arena: Password Reset Request",
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password. This link will expire in ${limit} minutes.</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Reset email could not be sent.");
  }
}
