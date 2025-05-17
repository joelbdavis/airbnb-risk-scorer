const { calculateRiskScore } = require('../../src/scoring/riskScorer');

describe('Risk Scoring Algorithm', () => {
  it('scores guest with location, profile picture, email, phone number as low risk', () => {
    const reservation = {
      guest: {
        id: '368436487',
        location: 'Christiansburg, VA',
        profile_picture:
          'https://a0.muscache.com/im/pictures/user/User-368436487/original/5031a2bc-df41-4691-8d94-db07ee546628.jpeg?aki_policy=profile_x_medium',
        email: 'tcallaway@hotmail.com',
        phone_numbers: ['18644508822'],
        first_name: 'Taylor',
        last_name: 'Callaway',
        language: 'en',
      },
    };

    const score = calculateRiskScore(reservation);
    expect(score).toBeLessThanOrEqual(30); // adjust based on your logic
  });

  it('scores guest with no location, profile picture, email, nor phone number as high risk', () => {
    const reservation = {
      guest: {
        id: '368436487',
        location: null,
        profile_picture: null,
        email: null,
        phone_numbers: null,
        first_name: 'Taylor',
        last_name: 'Callaway',
        language: 'en',
      },
    };

    const score = calculateRiskScore(reservation);
    expect(score).toBeGreaterThanOrEqual(70);
  });
});
