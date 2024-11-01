const Redis = require('redis');

class RedisClient {
  constructor() {
    this.client = new Redis();
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }

  isAlive() {
    return this.client.ping().then((pong) => pong === 'PONG');
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Error getting value:', error);
      return null;
    }
  }

  async set(key, value, durationInSeconds) {
    try {
      await this.client.setex(key, durationInSeconds, value);
    } catch (error) {
      console.error('Error setting value:', error);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  }
}

const redisClient = new RedisClient();

module.exports = { RedisClient, redisClient };
