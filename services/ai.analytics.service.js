/**
 * AI Analytics Service
 *
 * Provides two capabilities using pure JavaScript statistics
 * (no external ML library needed):
 *
 * 1. detectAnomalies — Z-score based spike detection on daily request counts
 * 2. predictNextDays — Linear regression on historical daily data
 */

/**
 * Calculates mean and standard deviation for an array of numbers
 */
const stats = (values) => {
  const n = values.length;
  if (n === 0) return { mean: 0, std: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  return { mean, std: Math.sqrt(variance) };
};

/**
 * detectAnomalies
 *
 * Input: rawData = [{ date: "2024-01-01", count: "42" }, ...]
 * Output: array of anomalous days with z-score
 *
 * A day is anomalous if |zscore| > threshold (default 2.0 = 95th percentile)
 */
const detectAnomalies = (rawData, threshold = 2.0) => {
  if (!rawData || rawData.length < 7) {
    return { anomalies: [], message: "Not enough data (need at least 7 days)" };
  }

  const counts = rawData.map((d) => parseInt(d.count, 10));
  const { mean, std } = stats(counts);

  const anomalies = rawData
    .map((d, i) => {
      const count = counts[i];
      const zscore = std === 0 ? 0 : (count - mean) / std;
      return {
        date: d.date,
        count,
        zscore: parseFloat(zscore.toFixed(3)),
        isAnomaly: Math.abs(zscore) > threshold,
        type: zscore > threshold ? "spike" : zscore < -threshold ? "drop" : "normal",
      };
    })
    .filter((d) => d.isAnomaly);

  return {
    anomalies,
    totalDaysAnalyzed: rawData.length,
    mean: parseFloat(mean.toFixed(2)),
    std: parseFloat(std.toFixed(2)),
    threshold,
  };
};

/**
 * predictNextDays
 *
 * Uses simple linear regression (least squares) on the last N days
 * to project the next `forecastDays` days.
 *
 * Input: rawData = [{ date, count }]  (chronological order)
 * Output: [{ date, predictedCount }]
 */
const predictNextDays = (rawData, forecastDays = 7) => {
  if (!rawData || rawData.length < 3) {
    return { prediction: [], message: "Not enough data (need at least 3 days)" };
  }

  const n = rawData.length;
  const xs = rawData.map((_, i) => i);
  const ys = rawData.map((d) => parseInt(d.count, 10));

  // Least squares linear regression: y = slope * x + intercept
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  const ssXY = xs.reduce((sum, x, i) => sum + (x - xMean) * (ys[i] - yMean), 0);
  const ssXX = xs.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);

  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = yMean - slope * xMean;

  // Calculate R² (goodness of fit)
  const ssTot = ys.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssRes = ys.reduce((sum, y, i) => sum + Math.pow(y - (slope * xs[i] + intercept), 2), 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  // Generate future dates
  const lastDate = new Date(rawData[rawData.length - 1].date);
  const prediction = [];

  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);

    const predictedCount = Math.max(0, Math.round(slope * (n - 1 + i) + intercept));
    prediction.push({
      date: futureDate.toISOString().split("T")[0],
      predictedCount,
    });
  }

  return {
    prediction,
    model: {
      slope: parseFloat(slope.toFixed(4)),
      intercept: parseFloat(intercept.toFixed(2)),
      rSquared: parseFloat(rSquared.toFixed(4)),
      trend: slope > 0.5 ? "increasing" : slope < -0.5 ? "decreasing" : "stable",
    },
  };
};

module.exports = { detectAnomalies, predictNextDays };
