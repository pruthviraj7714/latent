import { createClient, RedisClientType } from 'redis';

export const client : RedisClientType = createClient();

client.connect();
