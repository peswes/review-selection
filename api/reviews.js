// api/reviews.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "shopDB";
const collectionName = "reviews";

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const reviews = db.collection(collectionName);

    if (req.method === "POST") {
      const { name, comment, rating } = req.body;
      if (!name || !comment || !rating) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const review = {
        name,
        comment,
        rating: parseInt(rating),
        date: new Date()
      };

      await reviews.insertOne(review);
      return res.status(201).json({ message: "Review submitted successfully." });

    } else if (req.method === "GET") {
      const allReviews = await reviews.find().sort({ date: -1 }).toArray();
      return res.status(200).json(allReviews);

    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
}
