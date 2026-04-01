const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { createCheckoutSession, verifyPayment } = require("../controllers/payment.controller");

// The checkout endpoint requires authentication
router.post("/checkout", express.json(), authMiddleware, createCheckoutSession);

// The verify endpoint requires authentication to verify Razorpay signature
router.post("/verify", express.json(), authMiddleware, verifyPayment);

module.exports = router;
