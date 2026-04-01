const bcrypt = require("bcrypt");
const { findUserById, updateUser, updatePassword } = require("../models/user.model");

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({ message: "Provide name or email to update" });
    }
    const updated = await updateUser(req.user.userId, { name, email });
    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/user/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const { findUserByEmail } = require("../models/user.model");
    const user = await findUserByEmail(req.user.email);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updatePassword(req.user.userId, newHash);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
