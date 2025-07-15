// /api/paystackWebhook.js

import clientPromise from './db';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const config = {
  api: {
    bodyParser: false, // Paystack sends raw data
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const chunks = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const rawBody = Buffer.concat(chunks);
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET)
        .update(rawBody)
        .digest('hex');

      const signature = req.headers['x-paystack-signature'];

      if (hash !== signature) {
        console.error('Invalid Paystack signature.');
        return res.status(401).send('Unauthorized');
      }

      const event = JSON.parse(rawBody.toString());
      console.log('Paystack Webhook Event:', event);

      if (event.event === 'charge.success') {
        const reference = event.data.reference;

        const client = await clientPromise;
        const db = client.db('ecommerceDB');
        const orders = db.collection('orders');

        const result = await orders.updateOne(
          { paymentReference: reference },
          { $set: { status: 'Paid', paidAt: new Date() } }
        );

        if (result.modifiedCount === 0) {
          console.warn('Order not found or already updated for reference:', reference);
        } else {
          console.log('Order updated to Paid for reference:', reference);
        }
      }

      res.status(200).send('Webhook received');
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
}
