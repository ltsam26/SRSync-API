const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { getProfile, updateProfile, changePassword } = require("../controllers/user.controller");

router.get("/profile",  authMiddleware, getProfile);
router.put("/profile",  authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);

module.exports = router;