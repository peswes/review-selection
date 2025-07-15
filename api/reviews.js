import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "shopDB";
const collectionName = "reviews";

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const reviews = db.collection(collectionName);

    if (req.method === "POST") {
      const { productId, name, comment, rating } = req.body;

      if (!productId || !name || !comment || !rating) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const review = {
        productId,
        name,
        comment,
        rating: parseInt(rating),
        date: new Date()
      };

      await reviews.insertOne(review);
      return res.status(201).json({ message: "Review submitted successfully." });

    } else if (req.method === "GET") {
      const { productId } = req.query;

      if (!productId) {
        return res.status(400).json({ message: "productId query is required." });
      }

      const productReviews = await reviews
        .find({ productId })
        .sort({ date: -1 })
        .toArray();

      return res.status(200).json(productReviews);

    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
}
