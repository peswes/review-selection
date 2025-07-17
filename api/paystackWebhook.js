import clientPromise from './db.js';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser to handle raw data
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));

    req.on('end', async () => {
      const rawBody = Buffer.concat(chunks);
      const signature = req.headers['x-paystack-signature'];

      // Verify Paystack signature
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (hash !== signature) {
        console.error('Invalid Paystack signature.');
        return res.status(401).send('Unauthorized');
      }

      let event;
      try {
        event = JSON.parse(rawBody.toString());
      } catch (parseError) {
        console.error('Failed to parse webhook body:', parseError);
        return res.status(400).send('Invalid JSON');
      }

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

      return res.status(200).send('Webhook received');
    });

    req.on('error', err => {
      console.error('Error receiving webhook data:', err);
      return res.status(500).send('Error processing webhook');
    });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).send('Internal Server Error');
  }
}
