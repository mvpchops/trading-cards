import { Redis } from 'ioredis';
import { Config } from './config/index.js';

let redisClient: Redis | undefined = undefined;

export const redis = () => {
    if (!redisClient) {
        redisClient = new Redis(Config.get({latest: true}).cacheURL);
    }
    return redisClient;
}
