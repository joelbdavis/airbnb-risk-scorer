// src/scoring/riskLevel.js

function getRiskLevel(score) {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

module.exports = { getRiskLevel };
