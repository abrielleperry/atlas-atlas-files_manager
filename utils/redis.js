import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('connect', () => {
      console.log('Redis client Connected');
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          console.error(`Error getting key ${key}:`, err);
          return reject(err);
        }
        return resolve(value);
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err) => {
        if (err) {
          console.error(`Error setting key ${key}:`, err);
          return reject(err);
        }
        return resolve();
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) {
          console.error(`Error deleting key ${key}:`, err);
          return reject(err);
        }
        return resolve();
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
