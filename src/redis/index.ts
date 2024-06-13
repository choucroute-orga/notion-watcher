import { createClient } from '@redis/client';
import { REDIS_URL } from '../constants';

export const createRedisClient = async () => {
  const client = await createClient({ url: REDIS_URL })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  return client;
};
