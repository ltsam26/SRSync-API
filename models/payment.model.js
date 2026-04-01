const pool = require("../config/db");

const createPaymentRecord = async ({ userId, subscriptionId, amount, currency, status, stripePaymentIntentId, stripeInvoiceId }) => {
  const query = `
    INSERT INTO payments
      (user_id, subscription_id, amount, currency, status, stripe_payment_intent_id, stripe_invoice_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await pool.query(query, [
    userId, subscriptionId, amount, currency, status,
    stripePaymentIntentId, stripeInvoiceId,
  ]);
  return result.rows[0];
};

const getPaymentsByUserId = async (userId, limit = 20) => {
  const query = `
    SELECT id, amount, currency, status, created_at, stripe_invoice_id
    FROM payments
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
};

module.exports = { createPaymentRecord, getPaymentsByUserId };
