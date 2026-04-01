const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const { getUsers, setUserStatus, getStats, getPlans, updatePlanHandler } = require("../controllers/admin.controller");

// All admin routes require JWT + admin role
router.use(authMiddleware, adminMiddleware);

router.get("/users",              getUsers);
router.put("/users/:id/status",   setUserStatus);
router.get("/stats",              getStats);
router.get("/plans",              getPlans);
router.put("/plans/:id",          updatePlanHandler);

module.exports = router;
