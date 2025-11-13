// src/utils/redis.ts

import { createClient, RedisClientType } from "redis";

export const redis : RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redis.on("error", (err) => console.error("Redis Client Error", err));
console.log("🧠 Redis connecting to:", redis.options?.url);

export const connectRedisClient = async () => {
  if (!redis.isOpen) {
    await redis.connect();
    console.log("Connected to Redis",redis.options?.url);
  }
};


// import Redis from "ioredis";

// const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// export const redis = new Redis(redisUrl);

// console.log("Connected to Redis at:", redisUrl);


