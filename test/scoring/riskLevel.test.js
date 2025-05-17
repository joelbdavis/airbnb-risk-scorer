const { getRiskLevel } = require('../../src/scoring/riskLevel');

describe('getRiskLevel', () => {
  test.each([
    [0, 'low'],
    [10, 'low'],
    [29, 'low'],
    [30, 'medium'],
    [45, 'medium'],
    [59, 'medium'],
    [60, 'high'],
    [85, 'high'],
    [100, 'high'],
  ])('returns "%s" risk level for score %i', (score, expectedLevel) => {
    expect(getRiskLevel(score)).toBe(expectedLevel);
  });
});
