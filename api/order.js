// api/order.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

module.exports = async (req, res) => {
  // Allow requests from your website
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await client.connect();
    const db = client.db('paresalamat_db'); // This is your database name
    const orders = db.collection('orders'); // This is your collection name

    const newOrder = req.body;
    newOrder.createdAt = new Date();

    await orders.insertOne(newOrder);
    res.status(200).json({ message: 'Order saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving order', error });
  } finally {
    await client.close();
  }
};