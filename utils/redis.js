const Redis = require('ioredis')

class RedisClient {
  constructor() {
    this.client = new Redis();
    this.client.offlineQueue('error', (err) => {
      console.error('Redis client error:' err);
    })
  }
}

module.exports = { RedisClient, redisClient };
