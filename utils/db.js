// utils/db.js

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    // Connect to the database and initialize it
    this.client.connect()
      .then(() => {
        console.log('Connected to MongoDB');
        this.db = this.client.db(database); // Initialize the db property here
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async checkConnection() {
    return !!this.db;
  }

  async nbUsers() {
    if (!this.db) {
      throw new Error('Database not initialized. Please ensure you are connected to MongoDB.');
    }
    try {
      const usersCollection = this.db.collection('users');
      return await usersCollection.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.db) {
      throw new Error('Database not initialized. Please ensure you are connected to MongoDB.');
    }
    try {
      const filesCollection = this.db.collection('files');
      return await filesCollection.countDocuments();
    } catch (error) {
      console.error('Error counting files:', error);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
