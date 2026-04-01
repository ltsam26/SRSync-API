/**
 * IP Whitelist Middleware
 *
 * If an API key has ip_whitelist set (non-empty array), only requests
 * from those IPs are allowed. Empty array = no restriction.
 */
const ipWhitelistMiddleware = (req, res, next) => {
  try {
    const ipWhitelist = req.apiKeyIpWhitelist; // set by apikey.middleware

    // No whitelist configured — allow all
    if (!ipWhitelist || ipWhitelist.length === 0) {
      return next();
    }

    // Get real IP (handles proxies / load balancers)
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "";

    const normalizedClientIp = clientIp.replace("::ffff:", ""); // strip IPv4-in-IPv6

    if (!ipWhitelist.includes(normalizedClientIp)) {
      return res.status(403).json({
        message: `Access denied: IP ${normalizedClientIp} is not whitelisted for this API key`,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "IP whitelist check failed", error: error.message });
  }
};

module.exports = ipWhitelistMiddleware;
