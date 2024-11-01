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
}

module.exports = { RedisClient, redisClient };
