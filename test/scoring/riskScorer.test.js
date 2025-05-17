const { calculateRiskScore } = require('../../src/scoring/riskScorer');

describe('Risk Scoring Algorithm', () => {
  it('scores guest with location, profile picture, email, phone number as low risk', () => {
    const reservation = {
      guest: {
        id: '368436487',
        location: 'Christiansburg, VA',
        profile_picture:
          'https://a0.muscache.com/im/pictures/user/User-368436487/original/5031a2bc-df41-4691-8d94-db07ee546628.jpeg?aki_policy=profile_x_medium',
        email: null,
        phone_numbers: ['18644508822'],
        first_name: 'Taylor',
        last_name: 'Callaway',
        language: 'en',
      },
    };

    const riskReport = calculateRiskScore(reservation);
    expect(riskReport.score).toBe(25); // adjust based on your logic
    expect(riskReport.level).toBe('low');
    expect(Array.isArray(riskReport.rationale)).toBe(true);
    expect(riskReport.rationale).toHaveLength(2);
    expect(riskReport.rationale).toContain(`Guest does not have an e-mail.`);
    expect(riskReport.rationale).toContain(`Guest does not have any trips.`);
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

    const riskReport = calculateRiskScore(reservation);
    expect(riskReport.score).toBe(60);
    expect(riskReport.level).toBe('high');
    expect(Array.isArray(riskReport.rationale)).toBe(true);
    expect(riskReport.rationale).toHaveLength(5);
    expect(riskReport.rationale).toContain(
      'Guest does not have a location defined.'
    );
    expect(riskReport.rationale).toContain(
      'Guest does not have a profile picture.'
    );
    expect(riskReport.rationale).toContain('Guest does not have an e-mail.');
    expect(riskReport.rationale).toContain(
      'Guest does not have a phone number.'
    );
    expect(riskReport.rationale).toContain('Guest does not have any trips.');
  });
});
