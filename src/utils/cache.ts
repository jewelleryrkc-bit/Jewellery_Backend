// utils/cache-advanced.ts
import { redis } from "./redis";

type CacheOptions = {
  key: string;
  ttl?: number;
  index?: string; // "product:reviews", "user:profile", etc.
  validate?: (data: any) => boolean;
};

export async function getOrSetCache<T>(
  fetcher: () => Promise<T>,
  { key, ttl = 300, index, validate }: CacheOptions
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ Cache hit: ${key}`);
      return JSON.parse(cached);
    }

    console.log(`❌ Cache miss: ${key}`);
    const fresh = await fetcher();

    if (!fresh) {
      console.warn("⚠️ Empty fetcher result");
      return fresh;
    }

    if (validate && !validate(fresh)) {
      console.warn("🚫 Failed validation, not caching");
      return fresh;
    }

    // await redis.set(key, JSON.stringify(fresh), "EX", ttl);
    await redis.set(key, JSON.stringify(fresh), { EX: ttl })

    // Add to index for group tracking
    if (index) {
      // await redis.sadd(`index:${index}`, key);
      await redis.sAdd(`index:${index}`, key);
      console.log(`📇 Indexed ${key} under index:${index}`);
    }

    return fresh;
  } catch (err) {
    console.error("❌ Cache error:", err);
    return fetcher(); // fallback
  }
}

export async function invalidateProductData(productId: string, slug: string, category?: string) {
  const invalidations = [
    `product.id:${productId}`,
    `product:${productId}`,
    `product:slug:${slug}`,
    `product:${slug}`,
    `reviews:${productId}`, // if you're caching this
    `product:top-rated`,
    ...(category ? [`product:ByCategory:${category}`, `products:ByCategory`] : []),
  ];

  await Promise.all(invalidations.map(index => invalidateIndex(index)));
}

export async function invalidateIndex(index: string) {
  // const keys = await redis.smembers(`index:${index}`);
  const keys = await redis.sMembers(`index:${index}`) || [];

  if (keys.length>0) {
    // await redis.del(...keys);
    await redis.del(keys as unknown as string);
    console.log(`Deleted keys from index:${index}`, keys);
  }
  await redis.del(`index:${index}`); // cleanup index itself
}
