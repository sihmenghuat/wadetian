// test-smtp.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.TEST_EMAIL || 'your@email.com',
      subject: 'SMTP Test',
      text: 'This is a test email from a minimal Node.js script.',
    });
    console.log('Test email sent:', info.response);
  } catch (err) {
    console.error('Error sending test email:', err);
  }
}

main();
