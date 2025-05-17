import { getRiskLevel } from '../../src/scoring/riskLevel';

const cases = [
  [0, 'low'],
  [10, 'low'],
  [29, 'low'],
  [30, 'medium'],
  [45, 'medium'],
  [59, 'medium'],
  [60, 'high'],
  [85, 'high'],
  [100, 'high'],
] as const;

describe('getRiskLevel', () => {
  test.each(cases)(
    'returns "%s" risk level for score %i',
    (score: number, expectedLevel: ReturnType<typeof getRiskLevel>) => {
      expect(getRiskLevel(score)).toBe(expectedLevel);
    }
  );
});
