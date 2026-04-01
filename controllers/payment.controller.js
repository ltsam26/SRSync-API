const Razorpay = require("razorpay");
const crypto = require("crypto");
const { getPlanById } = require("../models/plan.model");
const { createSubscription } = require("../models/subscription.model");
const { createPaymentRecord } = require("../models/payment.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

// POST /api/payments/checkout
// Creates a Razorpay Order for upgrading to a paid plan
const createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ message: "planId is required" });

    const plan = await getPlanById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    if (plan.price_monthly === 0) {
      return res.status(400).json({ message: "Free plan does not require checkout" });
    }

    const options = {
      amount: Math.round(plan.price_monthly * 100), // amount in smallest currency unit
      currency: "USD",
      receipt: `receipt_${req.user.userId}_${Date.now()}`,
      notes: {
        userId: String(req.user.userId),
        planId: String(planId),
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    });
  } catch (error) {
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
};

// POST /api/payments/verify
// Verifies Razorpay signature and creates subscription
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "secret_placeholder")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Fetch the order from Razorpay to retrieve custom metadata notes
      const order = await razorpay.orders.fetch(razorpay_order_id);

      const userId = order.notes.userId;
      const planId = parseInt(order.notes.planId);

      // Create subscription in PostgreSQL database
      // Re-using the stripe column names to preserve the schema integrity without needing another DB migration
      const sub = await createSubscription({
        userId,
        planId,
        stripeSubscriptionId: razorpay_payment_id, 
        stripeCustomerId: razorpay_order_id,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days active
      });

      // Insert billing history record
      await createPaymentRecord({
        userId,
        subscriptionId: sub.id,
        amount: order.amount / 100,
        currency: order.currency,
        status: "succeeded",
        stripePaymentIntentId: razorpay_payment_id,
        stripeInvoiceId: razorpay_order_id,
      });

      res.status(200).json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

module.exports = { createCheckoutSession, verifyPayment };
