
// /api/saveOrder.js

import clientPromise from './db';

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

    await orders.insertOne(order);

    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
