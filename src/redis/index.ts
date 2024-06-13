import { createClient } from '@redis/client';
import { REDIS_PASSWORD, REDIS_URL } from '../constants';

export const createRedisClient = async () => {
  const client = await createClient({ url: REDIS_URL, password: REDIS_PASSWORD, database: 0 })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  return client;
};
