// /api/sendNotification.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, message, subject } = req.body;

  if (!email || !name || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Configure nodemailer transport (use your real SMTP settings)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address (set as env variable)
        pass: process.env.EMAIL_PASS, // Your email app password (set as env variable)
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject || 'Order Notification',
      text: `Dear ${name},\n\n${message}\n\nThank you for shopping with us!\n`,
    };

    await transporter.sendMail(mailOptions);

    // Optionally, send SMS notification here if you have an SMS API like Twilio

    res.status(200).json({ message: 'Notification sent successfully' });

  } catch (err) {
    console.error('Notification Error:', err);
    res.status(500).json({ message: 'Failed to send notification' });
  }
}
