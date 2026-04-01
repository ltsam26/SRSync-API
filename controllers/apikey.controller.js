const crypto = require("crypto");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const {
  createApiKey,
  getApiKeysByProjectId,
  revokeApiKey,
  getApiKeyWithProject,
} = require("../models/apikey.model");

const generateApiKey = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user.userId;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // FIX: Verify the user actually owns this project before generating a key
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND user_id = $2",
      [projectId, userId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ message: "Project not found or unauthorized" });
    }

    // Generate secure random API key
    const rawApiKey = crypto.randomBytes(32).toString("hex");

    // FIX: Store key_prefix (first 8 chars) for efficient lookup
    const keyPrefix = rawApiKey.substring(0, 8);

    const saltRounds = 10;
    const keyHash = await bcrypt.hash(rawApiKey, saltRounds);

    // FIX: Pass keyPrefix as third argument (model now accepts it)
    const apiKey = await createApiKey(projectId, keyHash, keyPrefix);

    res.status(201).json({
      message: "API key generated successfully. Save it — shown only once.",
      apiKey: rawApiKey, // shown ONLY once, never stored in plain text
      keyInfo: apiKey,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProjectApiKeys = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // FIX: Ownership check — user must own the project to see its keys
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND user_id = $2",
      [projectId, userId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ message: "Project not found or unauthorized" });
    }

    const keys = await getApiKeysByProjectId(projectId);

    res.status(200).json({
      message: "API keys fetched successfully",
      keys,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const revokeKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user.userId;

    if (!keyId) {
      return res.status(400).json({ message: "API Key ID is required" });
    }

    const keyData = await getApiKeyWithProject(keyId);

    if (!keyData) {
      return res.status(404).json({ message: "API key not found" });
    }

    // Security check: ensure user owns the project
    if (keyData.user_id !== userId) {
      return res.status(403).json({
        message: "Unauthorized: You do not own this API key",
      });
    }

    const revoked = await revokeApiKey(keyId);

    res.status(200).json({
      message: "API key revoked successfully",
      key: revoked,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to revoke API key",
      error: error.message,
    });
  }
};

module.exports = {
  generateApiKey,
  getProjectApiKeys,
  revokeKey,
};
