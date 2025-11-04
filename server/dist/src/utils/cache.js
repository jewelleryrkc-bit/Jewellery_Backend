"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrSetCache = getOrSetCache;
exports.invalidateProductData = invalidateProductData;
exports.invalidateIndex = invalidateIndex;
const redis_1 = require("./redis");
async function getOrSetCache(fetcher, { key, ttl = 300, index, validate }) {
    try {
        const cached = await redis_1.redis.get(key);
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
        await redis_1.redis.set(key, JSON.stringify(fresh), "EX", ttl);
        if (index) {
            await redis_1.redis.sadd(`index:${index}`, key);
            console.log(`📇 Indexed ${key} under index:${index}`);
        }
        return fresh;
    }
    catch (err) {
        console.error("❌ Cache error:", err);
        return fetcher();
    }
}
async function invalidateProductData(productId, slug, category) {
    const invalidations = [
        `product.id:${productId}`,
        `product:${productId}`,
        `product:slug:${slug}`,
        `product:${slug}`,
        `reviews:${productId}`,
        `product:top-rated`,
        ...(category ? [`product:ByCategory:${category}`, `products:ByCategory`] : []),
    ];
    await Promise.all(invalidations.map(index => invalidateIndex(index)));
}
async function invalidateIndex(index) {
    const keys = await redis_1.redis.smembers(`index:${index}`);
    if (keys.length) {
        await redis_1.redis.del(...keys);
        console.log(`🧹 Deleted keys from index:${index}`, keys);
    }
    await redis_1.redis.del(`index:${index}`);
}
//# sourceMappingURL=cache.js.map