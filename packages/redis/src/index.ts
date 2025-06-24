import { createClient, RedisClientType } from 'redis';

const client : RedisClientType = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

client.connect().catch(console.error);

export { client };