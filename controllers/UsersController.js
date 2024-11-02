const express = require('express');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const router = express.Router();
const uri = 'mongodb+srv://frankblation:SpSyKfYRMX4bsSjm@atlascluster.dkfih.mongodb.net/';
const client = new MongoClient(uri);

client.connect();

router.post('/users', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const db = client.db('your_database_name');
  const usersCollection = db.collection('users');

  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Already exist' });
  }

  const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

  const newUser = {
    email,
    password: hashedPassword,
  };

  const result = await usersCollection.insertOne(newUser);

  res.status(201).json({ id: result.insertedId, email });
});

module.exports = router;
