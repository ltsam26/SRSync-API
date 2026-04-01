const pool = require("../config/db");

const getAllPlans = async () => {
  const query = `
    SELECT id, name, price_monthly, request_limit_daily,
           request_limit_monthly, max_projects, max_api_keys, features
    FROM plans
    WHERE is_active = TRUE
    ORDER BY price_monthly ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getPlanById = async (id) => {
  const query = `SELECT * FROM plans WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getPlanByName = async (name) => {
  const query = `SELECT * FROM plans WHERE name = $1`;
  const result = await pool.query(query, [name]);
  return result.rows[0];
};

const updatePlan = async (id, fields) => {
  const setClauses = [];
  const values = [];
  let i = 1;

  const allowed = ["price_monthly", "request_limit_daily", "request_limit_monthly", "features", "is_active"];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${i++}`);
      values.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return null;
  values.push(id);

  const query = `
    UPDATE plans SET ${setClauses.join(", ")}
    WHERE id = $${i}
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { getAllPlans, getPlanById, getPlanByName, updatePlan };
