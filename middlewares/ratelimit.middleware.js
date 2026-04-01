const redis = require("../config/redis");

/**
 * Redis Sliding Window Rate Limiter
 *
 * Uses a sorted set per API key where each member is a unique request ID
 * and the score is the Unix timestamp in ms.
 * This gives an accurate rolling window count without fixed resets.
 */
const rateLimitMiddleware = async (req, res, next) => {
  try {
    const apiKeyId = req.apiKeyId;

    if (!apiKeyId) {
      return res.status(500).json({ message: "API key context missing" });
    }

    const MAX_REQUESTS = req.apiKeyRateLimit || 100;
    const WINDOW_MS = 24 * 60 * 60 * 1000; // 24-hour sliding window
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const redisKey = `ratelimit:${apiKeyId}`;

    // Atomic pipeline: remove expired entries + count + add new entry
    const pipeline = redis.pipeline();

    // Remove requests older than the window
    pipeline.zremrangebyscore(redisKey, 0, windowStart);

    // Count requests in the current window
    pipeline.zcard(redisKey);

    // Add this request with current timestamp as score
    const requestId = `${now}-${Math.random()}`;
    pipeline.zadd(redisKey, now, requestId);

    // Expire the key after 24h to auto-clean
    pipeline.expire(redisKey, Math.ceil(WINDOW_MS / 1000));

    const results = await pipeline.exec();

    // results[1] = [err, count] from zcard (before this request was added)
    const requestCount = results[1][1];

    // Set standard rate limit headers
    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS - requestCount - 1));
    res.setHeader("X-RateLimit-Reset", Math.ceil((now + WINDOW_MS) / 1000)); // Unix epoch

    if (requestCount >= MAX_REQUESTS) {
      // Remove the entry we just added since we're rejecting it
      await redis.zrem(redisKey, requestId);
      return res.status(429).json({
        message: "Rate limit exceeded. Resets in a 24-hour sliding window.",
        limit: MAX_REQUESTS,
        used: requestCount,
        retryAfter: "Check X-RateLimit-Reset header",
      });
    }

    next();
  } catch (error) {
    // Redis failure: fall back gracefully (fail open) — don't block the request
    console.error("Rate limit Redis error, failing open:", error.message);
    next();
  }
};

module.exports = rateLimitMiddleware;
