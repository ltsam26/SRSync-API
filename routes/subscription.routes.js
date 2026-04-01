const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { getPlans, getMySubscription, cancelMySubscription } = require("../controllers/subscription.controller");

// Public — anyone can see available plans
router.get("/plans", getPlans);

// Protected
router.get("/me",     authMiddleware, getMySubscription);
router.post("/cancel", authMiddleware, cancelMySubscription);

module.exports = router;
