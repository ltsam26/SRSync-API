const {
  getAllUsers,
  getTotalUserCount,
  setUserActiveStatus,
} = require("../models/user.model");
const { getSystemStats } = require("../models/usage.model");
const { updatePlan, getAllPlans } = require("../models/plan.model");

// GET /api/admin/users?limit=50&offset=0
const getUsers = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const [users, total] = await Promise.all([
      getAllUsers({ limit, offset }),
      getTotalUserCount(),
    ]);
    res.status(200).json({ users, total, limit, offset });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/users/:id/status
const setUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive (boolean) is required" });
    }
    // Prevent admin from disabling themselves
    if (id === req.user.userId) {
      return res.status(400).json({ message: "Cannot change your own status" });
    }
    const updated = await setUserActiveStatus(id, isActive);
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: `User ${isActive ? "enabled" : "disabled"}`, user: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const stats = await getSystemStats();
    res.status(200).json({ stats });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/plans
const getPlans = async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/plans/:id
const updatePlanHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updated = await updatePlan(id, fields);
    if (!updated) return res.status(404).json({ message: "Plan not found or nothing to update" });
    res.status(200).json({ message: "Plan updated", plan: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers, setUserStatus, getStats, getPlans, updatePlanHandler };
