// /api/createOrder.js

import clientPromise from './db';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ecommerceDB');
    const orders = db.collection('orders');

    const {
      name,
      email,
      phone,
      country,
      state,
      address,
      deliveryOption,
      finalTotal,
      cartItems
    } = req.body;

    if (!name || !email || !phone || !address || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create order object
    const order = {
      name,
      email,
      phone,
      country,
      state,
      address,
      deliveryOption,
      finalTotal,
      cartItems,
      status: 'Pending',
      createdAt: new Date()
    };

    // Save to database
    await orders.insertOne(order);

    // Send confirmation email
    await sendOrderConfirmationEmail(name, email, order);

    res.status(201).json({ message: 'Order created and confirmation sent' });
    
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function sendOrderConfirmationEmail(name, email, order) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const productSummary = order.cartItems.map(item => 
    `- ${item.name} (Qty: ${item.quantity}, Price: ₦${item.price})`
  ).join('\n');

  const message = `
Hello ${name},

Thank you for your order! Here are your order details:

${productSummary}

Delivery Option: ₦${order.deliveryOption}
Final Total: ₦${order.finalTotal}

We will contact you shortly to arrange delivery.

Thank you for shopping with us!
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Order Confirmation',
    text: message
  };

  await transporter.sendMail(mailOptions);
}
