const Redis = require('ioredis')

class RedisClient {
  constructor() {
    this.client = new Redis();
    this.client.offlineQueue('error', (err) => {
      console.error('Redis client error:' err);
    })
  }
  isAlive() {
    return this.client.ping().then((pong) => pong === 'PONG');
  }
  async this.get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Error getting value:' error)
      return null;
    }
  }

}

module.exports = { RedisClient, redisClient };
