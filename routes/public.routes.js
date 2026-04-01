const express = require("express");
const router = express.Router();
const apiKeyMiddleware = require("../middlewares/apikey.middleware");
const rateLimitMiddleware = require("../middlewares/ratelimit.middleware");
const ipWhitelistMiddleware = require("../middlewares/ipwhitelist.middleware");
const { createUsageLog } = require("../models/usage.model");

// Log usage AFTER all checks pass (not before, so rejected requests aren't counted)
const usageLogMiddleware = async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
               req.socket?.remoteAddress ||
               null;
    await createUsageLog(req.apiKeyId, req.originalUrl, req.method, 200, null, ip);
  } catch (err) {
    console.error("Usage log error:", err.message);
  }
  next();
};

router.get(
  "/data",
  apiKeyMiddleware,         // 1. Validate API key
  ipWhitelistMiddleware,    // 2. Check IP whitelist
  rateLimitMiddleware,      // 3. Check rate limit (Redis sliding window)
  usageLogMiddleware,       // 4. Log usage (only if all checks pass)
  (req, res) => {
    res.status(200).json({
      message: "Public API accessed successfully using API Key",
      projectId: req.projectId,
      data: {
        info: "This is protected public data",
        timestamp: new Date(),
      },
    });
  }
);

module.exports = router;
