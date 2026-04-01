const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) {
      console.error("Redis: max retries reached, giving up.");
      return null; // stop retrying
    }
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetErrors = ["READONLY", "ECONNRESET"];
    if (targetErrors.some((e) => err.message.includes(e))) {
      return true;
    }
    return false;
  },
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});

module.exports = redis;
