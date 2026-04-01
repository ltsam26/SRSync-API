const pool = require("../config/db");

const createUser = async (email, passwordHash) => {
  const query = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, role, created_at
  `;
  const result = await pool.query(query, [email, passwordHash]);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findUserByPhone = async (phone) => {
  const query = `SELECT * FROM users WHERE phone = $1`;
  const result = await pool.query(query, [phone]);
  return result.rows[0];
};

const updateOtp = async (id, otpCode, expiresAt) => {
  const query = `UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3 returning *`;
  const result = await pool.query(query, [otpCode, expiresAt, id]);
  return result.rows[0];
};

const createUserWithOtp = async (email, phone, otpCode, expiresAt) => {
  // Need to bypass NOT NULL on password_hash by giving it a dummy string
  const query = `
    INSERT INTO users (email, phone, password_hash, otp_code, otp_expires_at)
    VALUES ($1, $2, 'otp_login_only', $3, $4)
    RETURNING *
  `;
  const result = await pool.query(query, [email, phone, otpCode, expiresAt]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const query = `SELECT id, email, name, role, is_active, created_at, updated_at FROM users WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateUser = async (id, fields) => {
  // fields: { name, email }
  const setClauses = [];
  const values = [];
  let i = 1;

  if (fields.name !== undefined) {
    setClauses.push(`name = $${i++}`);
    values.push(fields.name);
  }
  if (fields.email !== undefined) {
    setClauses.push(`email = $${i++}`);
    values.push(fields.email);
  }

  if (setClauses.length === 0) return null;
  values.push(id);

  const query = `
    UPDATE users SET ${setClauses.join(", ")}
    WHERE id = $${i}
    RETURNING id, email, name, role, updated_at
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updatePassword = async (id, newPasswordHash) => {
  const query = `
    UPDATE users SET password_hash = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [newPasswordHash, id]);
  return result.rows[0];
};

const getAllUsers = async ({ limit = 50, offset = 0 }) => {
  const query = `
    SELECT u.id, u.email, u.name, u.role, u.is_active, u.created_at,
           s.status AS subscription_status,
           p.name AS plan_name
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN plans p ON s.plan_id = p.id
    ORDER BY u.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const getTotalUserCount = async () => {
  const result = await pool.query(`SELECT COUNT(*) FROM users`);
  return parseInt(result.rows[0].count, 10);
};

const setUserActiveStatus = async (id, isActive) => {
  const query = `
    UPDATE users SET is_active = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, email, is_active
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0];
};

module.exports = {
  createUser,
  createUserWithOtp,
  findUserByEmail,
  findUserByPhone,
  updateOtp,
  findUserById,
  updateUser,
  updatePassword,
  getAllUsers,
  getTotalUserCount,
  setUserActiveStatus,
};