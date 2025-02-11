import nodemailer from 'nodemailer';

async function sendEmail() {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER, // Your Gmail address
        pass: EMAIL_PASSWORD, // Use your generated App Password
      },
    });

    // Email options
    const mailOptions = {
      from: EMAIL_USER,
      to: "akashtechnion@gmail.com",
      subject: "Test Email",
      text: "Hello, this is a test email sent using Nodemailer and Gmail SMTP.",
    };

    // Send email
    try {
      const info = await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  // Run the function
  sendEmail();
