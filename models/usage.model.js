const pool = require("../config/db");

const createUsageLog = async (apiKeyId, endpoint, method, statusCode = 200, responseTimeMs = null, ipAddress = null) => {
  const query = `
    INSERT INTO usage_logs (api_key_id, endpoint, method, status_code, response_time_ms, ip_address)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await pool.query(query, [apiKeyId, endpoint, method, statusCode, responseTimeMs, ipAddress]);
};

// Daily usage for the last N days (for a specific user's keys)
const getDailyUsage = async (userId, days = 7) => {
  const query = `
    SELECT
      DATE(ul.created_at) AS date,
      COUNT(*) AS request_count
    FROM usage_logs ul
    JOIN api_keys ak ON ul.api_key_id = ak.id
    JOIN projects p ON ak.project_id = p.id
    WHERE p.user_id = $1
      AND ul.created_at >= NOW() - INTERVAL '${parseInt(days, 10)} days'
    GROUP BY DATE(ul.created_at)
    ORDER BY date ASC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Hourly breakdown for today
const getHourlyUsageToday = async (userId) => {
  const query = `
    SELECT
      EXTRACT(HOUR FROM ul.created_at) AS hour,
      COUNT(*) AS request_count
    FROM usage_logs ul
    JOIN api_keys ak ON ul.api_key_id = ak.id
    JOIN projects p ON ak.project_id = p.id
    WHERE p.user_id = $1
      AND DATE(ul.created_at) = CURRENT_DATE
    GROUP BY hour
    ORDER BY hour ASC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Top endpoints by request count
const getTopEndpoints = async (userId, limit = 10) => {
  const query = `
    SELECT
      ul.endpoint,
      ul.method,
      COUNT(*) AS request_count
    FROM usage_logs ul
    JOIN api_keys ak ON ul.api_key_id = ak.id
    JOIN projects p ON ak.project_id = p.id
    WHERE p.user_id = $1
    GROUP BY ul.endpoint, ul.method
    ORDER BY request_count DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
};

// Overall summary counts
const getUsageSummary = async (userId) => {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE ul.created_at >= NOW() - INTERVAL '1 day')  AS today,
      COUNT(*) FILTER (WHERE ul.created_at >= NOW() - INTERVAL '7 days') AS last_7_days,
      COUNT(*) FILTER (WHERE ul.created_at >= NOW() - INTERVAL '30 days') AS last_30_days,
      COUNT(*) AS total
    FROM usage_logs ul
    JOIN api_keys ak ON ul.api_key_id = ak.id
    JOIN projects p ON ak.project_id = p.id
    WHERE p.user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Raw daily data for AI anomaly detection (last 30 days)
const getDailyCountsForAnomaly = async (userId, days = 30) => {
  const query = `
    SELECT
      DATE(ul.created_at) AS date,
      COUNT(*) AS count
    FROM usage_logs ul
    JOIN api_keys ak ON ul.api_key_id = ak.id
    JOIN projects p ON ak.project_id = p.id
    WHERE p.user_id = $1
      AND ul.created_at >= NOW() - INTERVAL '${parseInt(days, 10)} days'
    GROUP BY DATE(ul.created_at)
    ORDER BY date ASC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// System-wide stats for admin
const getSystemStats = async () => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users)           AS total_users,
      (SELECT COUNT(*) FROM projects)        AS total_projects,
      (SELECT COUNT(*) FROM api_keys WHERE is_active = TRUE) AS active_keys,
      (SELECT COUNT(*) FROM usage_logs WHERE created_at >= NOW() - INTERVAL '1 day') AS requests_today,
      (SELECT COUNT(*) FROM usage_logs WHERE created_at >= NOW() - INTERVAL '7 days') AS requests_7d,
      (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') AS active_subscriptions
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

module.exports = {
  createUsageLog,
  getDailyUsage,
  getHourlyUsageToday,
  getTopEndpoints,
  getUsageSummary,
  getDailyCountsForAnomaly,
  getSystemStats,
};