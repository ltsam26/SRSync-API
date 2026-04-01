const pool = require("../config/db");

// FIX: Now stores key_prefix for efficient lookup (avoids scanning all keys)
const createApiKey = async (projectId, keyHash, keyPrefix) => {
  const query = `
    INSERT INTO api_keys (project_id, key_hash, key_prefix)
    VALUES ($1, $2, $3)
    RETURNING id, created_at
  `;
  const values = [projectId, keyHash, keyPrefix];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getApiKeysByProjectId = async (projectId) => {
  const query = `
    SELECT id, is_active, created_at
    FROM api_keys
    WHERE project_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [projectId]);
  return result.rows;
};

// FIX: Lookup by prefix instead of fetching ALL active keys
// This reduces bcrypt comparisons from thousands to 1-2
const getActiveKeysByPrefix = async (prefix) => {
  const query = `
    SELECT id, project_id, key_hash, rate_limit, ip_whitelist
    FROM api_keys
    WHERE key_prefix = $1 AND is_active = TRUE
  `;
  const result = await pool.query(query, [prefix]);
  return result.rows;
};

const revokeApiKey = async (keyId) => {
  const query = `
    UPDATE api_keys
    SET is_active = FALSE
    WHERE id = $1
    RETURNING id, is_active
  `;
  const result = await pool.query(query, [keyId]);
  return result.rows[0];
};

const getApiKeyWithProject = async (keyId) => {
  const query = `
    SELECT ak.id, ak.project_id, p.user_id
    FROM api_keys ak
    JOIN projects p ON ak.project_id = p.id
    WHERE ak.id = $1
  `;
  const result = await pool.query(query, [keyId]);
  return result.rows[0];
};

// FIX: Single module.exports — the original file had two, first was overwriting the second
module.exports = {
  createApiKey,
  getApiKeysByProjectId,
  getActiveKeysByPrefix,
  revokeApiKey,
  getApiKeyWithProject,
};
