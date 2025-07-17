// // /api/sendNotification.js

// import nodemailer from 'nodemailer';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.setHeader('Allow', ['POST']).status(405).json({ message: 'Method not allowed' });
//   }

//   const { name, email, phone, message, subject } = req.body;

//   if (!email || !name || !message) {
//     return res.status(400).json({ message: 'Missing required fields: name, email, message are required' });
//   }

//   try {
//     // Setup the transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"WestK Enterprises" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: subject || 'Order Notification',
//       text: `
// Hello ${name},

// ${message}

// Phone Contact: ${phone || 'Not Provided'}

// Thank you for shopping with us!

// WestK Enterprises
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: 'Notification sent successfully' });

//   } catch (error) {
//     console.error('Error sending notification:', error);
//     res.status(500).json({ message: 'Failed to send notification' });
//   }
// }



// /api/sendNotification.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();  // Handle preflight requests
  }

  if (req.method !== 'POST') {
    return res.setHeader('Allow', ['POST']).status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, message, subject } = req.body;

  if (!email || !name || !message) {
    return res.status(400).json({ message: 'Missing required fields: name, email, message are required' });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials are missing');
    return res.status(500).json({ message: 'Email service not configured' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"WestK Enterprises" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || 'Order Update from WestK Enterprises',
      text: `
Hello ${name},

${message}

Phone Contact: ${phone || 'Not Provided'}

Thank you for shopping with us!

WestK Enterprises
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Notification sent successfully' });

  } catch (error) {
    console.error('Error sending notification:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to send notification' });
  }
}
