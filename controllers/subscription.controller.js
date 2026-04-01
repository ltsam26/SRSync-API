const { getAllPlans } = require("../models/plan.model");
const {
  getSubscriptionByUserId,
  cancelSubscription,
} = require("../models/subscription.model");
const { getPaymentsByUserId } = require("../models/payment.model");

// GET /api/plans  (public)
const getPlans = async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/subscriptions/me
const getMySubscription = async (req, res) => {
  try {
    const subscription = await getSubscriptionByUserId(req.user.userId);
    const payments = await getPaymentsByUserId(req.user.userId, 10);
    res.status(200).json({ subscription, payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/subscriptions/cancel
const cancelMySubscription = async (req, res) => {
  try {
    const cancelled = await cancelSubscription(req.user.userId);
    if (!cancelled) {
      return res.status(404).json({ message: "No active subscription found" });
    }
    res.status(200).json({ message: "Subscription cancelled at period end", subscription: cancelled });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getPlans, getMySubscription, cancelMySubscription };
