const {
  getDailyUsage,
  getHourlyUsageToday,
  getTopEndpoints,
  getUsageSummary,
  getDailyCountsForAnomaly,
} = require("../models/usage.model");
const { detectAnomalies, predictNextDays } = require("../services/ai.analytics.service");

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const summary = await getUsageSummary(req.user.userId);
    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/usage?period=7  (days: 1, 7, 30)
const getUsage = async (req, res) => {
  try {
    const days = parseInt(req.query.period) || 7;
    if (![1, 7, 14, 30, 90].includes(days)) {
      return res.status(400).json({ message: "Invalid period. Use 1, 7, 14, 30, or 90" });
    }
    const [daily, hourly] = await Promise.all([
      getDailyUsage(req.user.userId, days),
      getHourlyUsageToday(req.user.userId),
    ]);
    res.status(200).json({ daily, hourly });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/top-endpoints
const getTopEndpointsHandler = async (req, res) => {
  try {
    const endpoints = await getTopEndpoints(req.user.userId, 10);
    res.status(200).json({ endpoints });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/anomalies
const getAnomalies = async (req, res) => {
  try {
    const rawData = await getDailyCountsForAnomaly(req.user.userId, 30);
    const anomalies = detectAnomalies(rawData);
    res.status(200).json({ anomalies, dataPoints: rawData.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/predict
const getPrediction = async (req, res) => {
  try {
    const rawData = await getDailyCountsForAnomaly(req.user.userId, 30);
    const prediction = predictNextDays(rawData, 7);
    res.status(200).json({ prediction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getSummary, getUsage, getTopEndpointsHandler, getAnomalies, getPrediction };
