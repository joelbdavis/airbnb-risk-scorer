import { calculateRiskScore } from '../../src/scoring/riskScorer';
import { RULE_KEYS } from '../../src/scoring/riskRules';
import type { RiskReport } from '../../src/scoring/riskScorer';
import type { RuleKey } from '../../src/scoring/riskRules';

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

    const report: RiskReport = calculateRiskScore(reservation);
    expect(report.score).toBe(25); // adjust based on your logic
    expect(report.level).toBe('low');
    expect(Array.isArray(report.matchedRules)).toBe(true);
    const ruleNames: RuleKey[] = report.matchedRules.map((r) => r.name);
    expect(ruleNames).toHaveLength(2);
    expect(ruleNames).toContain(RULE_KEYS.MISSING_EMAIL);
    expect(ruleNames).toContain(RULE_KEYS.NO_TRIPS);
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

    const report = calculateRiskScore(reservation);
    expect(report.score).toBe(60);
    expect(report.level).toBe('high');
    expect(Array.isArray(report.matchedRules)).toBe(true);
    expect(report.matchedRules).toHaveLength(5);
    const ruleNames = report.matchedRules.map((r) => r.name);
    expect(ruleNames).toContain(RULE_KEYS.MISSING_LOCATION);
    expect(ruleNames).toContain(RULE_KEYS.NO_PROFILE_PICTURE);
    expect(ruleNames).toContain(RULE_KEYS.MISSING_EMAIL);
    expect(ruleNames).toContain(RULE_KEYS.MISSING_PHONE);
    expect(ruleNames).toContain(RULE_KEYS.NO_TRIPS);
  });
});
