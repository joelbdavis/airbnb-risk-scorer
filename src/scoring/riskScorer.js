// riskScorer.js
// Example JSON
// guest: {
//   id: '368436487',
//   location: null,
//   profile_picture: null,
//   email: null,
//   phone_numbers: null,
//   first_name: 'Taylor',
//   last_name: 'Callaway',
//   language: 'en',
// },

const { normalizeGuest } = require('../utils/normalizeGuest');
const { getRiskLevel } = require('./riskLevel');

function calculateRiskScore(reservation) {
  let score = 0; // where 100 is high risk and 0 is low risk
  const guest = normalizeGuest(reservation);
  const rationale = [];

  if (guest) {
    if (!guest.location) {
      score += 10;
      rationale.push(`Guest does not have a location defined.`);
    }
    if (!guest.profile_picture) {
      score += 10;
      rationale.push(`Guest does not have a profile picture.`);
    }
    if (!guest.email) {
      score += 15;
      rationale.push(`Guest does not have an e-mail.`);
    }
    if (guest.phone_numbers.length === 0) {
      score += 15;
      rationale.push(`Guest does not have a phone number.`);
    }
    if (guest.tripCount > 0 && guest.reviewCount === 0) {
      score += 30;
      rationale.push('Guest does not have any reviews.');
    }
    if (guest.tripCount === 0) {
      score += 10;
      rationale.push('Guest does not have any trips.');
    }
    if (guest.hasNegativeReviews) {
      score += 40;
      rationale.push('Guest has negative reviews.');
    }
  }
  const level = getRiskLevel(score);
  return {
    score,
    level,
    rationale,
  };
}

module.exports = { calculateRiskScore };
