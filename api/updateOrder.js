import clientPromise from './db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight request
  }

  if (req.method !== 'PUT') {
    return res.setHeader('Allow', ['PUT']).status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ecommerceDB');
    const orders = db.collection('orders');

    const { orderId, status, trackingNumber, deliveryDate } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ message: 'Missing required fields: orderId and status' });
    }

    const updateFields = {
      status,
      updatedAt: new Date(),
    };

    if (trackingNumber) updateFields.trackingNumber = trackingNumber;
    if (deliveryDate) updateFields.deliveryDate = new Date(deliveryDate);

    const result = await orders.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order updated successfully' });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
