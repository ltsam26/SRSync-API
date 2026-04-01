const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { getSummary, getUsage, getTopEndpointsHandler, getAnomalies, getPrediction } = require("../controllers/analytics.controller");

router.get("/summary",       authMiddleware, getSummary);
router.get("/usage",         authMiddleware, getUsage);
router.get("/top-endpoints", authMiddleware, getTopEndpointsHandler);
router.get("/anomalies",     authMiddleware, getAnomalies);
router.get("/predict",       authMiddleware, getPrediction);

module.exports = router;
