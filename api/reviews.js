// api/reviews.js
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await client.connect();
    const db = client.db('paresalamat_db');
    const reviewsCollection = db.collection('reviews');

    // GET: Fetch all reviews from the database
    if (req.method === 'GET') {
      // Sort by newest first
      const allReviews = await reviewsCollection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(allReviews);
    }

    // POST: Save a new review to the database
    if (req.method === 'POST') {
      const newReview = req.body;
      newReview.createdAt = new Date();
      await reviewsCollection.insertOne(newReview);
      return res.status(200).json({ message: 'Review saved successfully!' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    res.status(500).json({ message: 'Error with reviews database', error });
  } finally {
    await client.close();
  }
};
