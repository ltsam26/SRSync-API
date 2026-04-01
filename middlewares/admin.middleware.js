/**
 * Admin Role Guard Middleware
 *
 * Must be used AFTER authMiddleware (which populates req.user).
 * Checks that the authenticated user has role = 'admin'.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Admin access required",
    });
  }

  next();
};

module.exports = adminMiddleware;
