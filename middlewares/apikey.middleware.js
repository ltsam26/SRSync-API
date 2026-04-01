const bcrypt = require("bcrypt");
const { getActiveKeysByPrefix } = require("../models/apikey.model");

const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ message: "API key is missing" });
    }

    // Use prefix to narrow DB lookup (avoids scanning all keys)
    const prefix = apiKey.substring(0, 8);
    const candidateKeys = await getActiveKeysByPrefix(prefix);

    let validKey = null;
    for (const keyRecord of candidateKeys) {
      const isMatch = await bcrypt.compare(apiKey, keyRecord.key_hash);
      if (isMatch) {
        validKey = keyRecord;
        break;
      }
    }

    if (!validKey) {
      return res.status(403).json({ message: "Invalid or revoked API key" });
    }

    // Attach key context for downstream middleware
    req.projectId          = validKey.project_id;
    req.apiKeyId           = validKey.id;
    req.apiKeyRateLimit    = validKey.rate_limit || 100;
    req.apiKeyIpWhitelist  = validKey.ip_whitelist || []; // used by ipwhitelist.middleware

    next();
  } catch (error) {
    res.status(500).json({
      message: "API key verification failed",
      error: error.message,
    });
  }
};

module.exports = apiKeyMiddleware;
