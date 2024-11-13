import express from 'express';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const redisAlive = redisClient.isAlive();
    const dbAlive = await dbClient.checkConnection();

    res.status(200).json({ redis: redisAlive, db: dbAlive });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    res.status(200).json({ users: usersCount, files: filesCount });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
