const pool = require("../config/db");

const createSubscription = async ({ userId, planId, stripeSubscriptionId, stripeCustomerId, periodStart, periodEnd }) => {
  const query = `
    INSERT INTO subscriptions
      (user_id, plan_id, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'active')
    RETURNING *
  `;
  const result = await pool.query(query, [userId, planId, stripeSubscriptionId, stripeCustomerId, periodStart, periodEnd]);
  return result.rows[0];
};

const getSubscriptionByUserId = async (userId) => {
  const query = `
    SELECT s.*, p.name AS plan_name, p.price_monthly, p.request_limit_daily,
           p.request_limit_monthly, p.max_projects, p.max_api_keys, p.features
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = $1 AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

const getSubscriptionByStripeId = async (stripeSubscriptionId) => {
  const query = `SELECT * FROM subscriptions WHERE stripe_subscription_id = $1`;
  const result = await pool.query(query, [stripeSubscriptionId]);
  return result.rows[0];
};

const updateSubscriptionStatus = async (stripeSubscriptionId, status, periodEnd = null) => {
  const query = `
    UPDATE subscriptions
    SET status = $1,
        current_period_end = COALESCE($2, current_period_end),
        updated_at = NOW()
    WHERE stripe_subscription_id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [status, periodEnd, stripeSubscriptionId]);
  return result.rows[0];
};

const cancelSubscription = async (userId) => {
  const query = `
    UPDATE subscriptions
    SET status = 'cancelled', cancel_at_period_end = TRUE, updated_at = NOW()
    WHERE user_id = $1 AND status = 'active'
    RETURNING *
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Ensure free plan subscription exists for new users
const ensureFreePlan = async (userId) => {
  const existing = await getSubscriptionByUserId(userId);
  if (existing) return existing;

  const freePlan = await pool.query(`SELECT id FROM plans WHERE name = 'free' LIMIT 1`);
  if (!freePlan.rows[0]) return null;

  const query = `
    INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
    VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '100 years')
    ON CONFLICT DO NOTHING
    RETURNING *
  `;
  const result = await pool.query(query, [userId, freePlan.rows[0].id]);
  return result.rows[0];
};

module.exports = {
  createSubscription,
  getSubscriptionByUserId,
  getSubscriptionByStripeId,
  updateSubscriptionStatus,
  cancelSubscription,
  ensureFreePlan,
};
