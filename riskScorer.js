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

function calculateRiskScore(reservation) {
  let score = 100; // where 100 is high risk and 0 is low risk

  if (reservation) {
    const guest = reservation.guest;
    if (guest) {
      if (guest.location) score -= 25;
      if (guest.profile_picture) score -= 25;
      if (guest.email) score -= 25;
      if (guest.phone_numbers?.length > 0) score -= 25;
    }
  }
  return score;
}

module.exports = { calculateRiskScore };
