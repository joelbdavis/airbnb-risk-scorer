import { calculateRiskScore } from '../../src/scoring/riskScorer';
import { RULE_KEYS } from '../../src/scoring/riskRules';
import type { RiskReport } from '../../src/scoring/riskScorer';
import type { RuleKey } from '../../src/scoring/riskRules';
import type { NormalizedReservation } from '../../src/services/getReservationDetails';
import { updateConfig, getDefaultConfig } from '../../src/scoring/config';

describe('Risk Scoring Algorithm', () => {
  const baseReservation: NormalizedReservation = {
    id: '123-456',
    code: 'TEST123',
    platform: 'airbnb',
    platform_id: 'TEST123',
    booking_date: '2025-03-15T15:56:12Z',
    arrival_date: '2025-05-18T00:00:00-04:00',
    departure_date: '2025-05-23T00:00:00-04:00',
    check_in: '2025-05-18T16:00:00-04:00',
    check_out: '2025-05-23T10:00:00-04:00',
    nights: 5,
    reservation_status: {
      current: {
        category: 'accepted',
        sub_category: null,
      },
      history: [],
    },
    conversation_id: '123',
    last_message_at: '2025-03-15T15:56:12Z',
    guests: {
      total: 2,
      adult_count: 2,
      child_count: 0,
      infant_count: 0,
      pet_count: 0,
    },
    status: 'accepted',
    status_history: [],
    guest: {
      id: '368436487',
      name: 'Taylor Callaway',
      review_count: 0,
      trip_count: 0,
      has_negative_reviews: false,
      profile_picture: false,
      phone_numbers: [],
      email: null,
      location: null,
      language: 'en',
    },
    risk_factors: {
      review_count: 0,
      trip_count: 0,
      has_negative_reviews: false,
    },
  };

  beforeEach(() => {
    // Reset to default configuration before each test
    updateConfig(getDefaultConfig());
  });

  it('matches expected rules for low-risk guest', () => {
    const reservation: NormalizedReservation = {
      ...baseReservation,
      guest: {
        ...baseReservation.guest,
        location: 'Christiansburg, VA',
        profile_picture: true,
        phone_numbers: ['18644508822'],
        email: 'test@example.com',
      },
    };

    const report: RiskReport = calculateRiskScore(reservation);

    // Only NO_TRIPS should match
    const ruleNames: RuleKey[] = report.matched_rules.map((r) => r.name);
    expect(ruleNames).toHaveLength(1);
    expect(ruleNames).toContain(RULE_KEYS.NO_TRIPS);

    // Verify score calculation using default weights
    expect(report.score).toBe(
      getDefaultConfig().rule_weights[RULE_KEYS.NO_TRIPS].score
    );
    expect(report.level).toBe('low');
  });

  it('matches expected rules for high-risk guest', () => {
    const reservation: NormalizedReservation = {
      ...baseReservation,
      guest: {
        ...baseReservation.guest,
        location: null,
        profile_picture: false,
        phone_numbers: [],
        email: null,
      },
    };

    const report = calculateRiskScore(reservation);

    // Should match multiple risk rules
    const ruleNames = report.matched_rules.map((r) => r.name);
    expect(ruleNames).toContain(RULE_KEYS.MISSING_LOCATION);
    expect(ruleNames).toContain(RULE_KEYS.NO_PROFILE_PICTURE);
    expect(ruleNames).toContain(RULE_KEYS.MISSING_EMAIL);
    expect(ruleNames).toContain(RULE_KEYS.MISSING_PHONE);
    expect(ruleNames).toContain(RULE_KEYS.NO_TRIPS);

    // Verify score matches default weights
    const expectedScore = Object.entries(getDefaultConfig().rule_weights)
      .filter(([key]) => ruleNames.includes(key as RuleKey))
      .reduce((sum, [, weight]) => sum + weight.score, 0);

    expect(report.score).toBe(expectedScore);
    expect(report.level).toBe('high');
  });

  it('respects disabled rules', () => {
    // Disable the NO_TRIPS rule
    updateConfig({
      rule_weights: {
        ...getDefaultConfig().rule_weights,
        [RULE_KEYS.NO_TRIPS]: {
          score: 10,
          enabled: false,
        },
      },
    });

    const reservation: NormalizedReservation = {
      ...baseReservation,
      guest: {
        ...baseReservation.guest,
        location: 'Christiansburg, VA',
        profile_picture: true,
        phone_numbers: ['18644508822'],
        email: 'test@example.com',
      },
    };

    const report = calculateRiskScore(reservation);

    // NO_TRIPS rule should not match since it's disabled
    const ruleNames = report.matched_rules.map((r) => r.name);
    expect(ruleNames).toHaveLength(0);
    expect(report.score).toBe(0);
    expect(report.level).toBe('low');
  });

  it('uses custom thresholds', () => {
    // Set very low thresholds
    updateConfig({
      thresholds: {
        medium: 5,
        high: 15,
      },
    });

    const reservation: NormalizedReservation = {
      ...baseReservation,
      guest: {
        ...baseReservation.guest,
        location: 'Christiansburg, VA',
        profile_picture: true,
        phone_numbers: ['18644508822'],
        email: null, // This should trigger MISSING_EMAIL (15 points)
        trip_count: 5, // Avoid NO_TRIPS rule
        review_count: 3, // Avoid NO_REVIEWS rule
      },
    };

    const report = calculateRiskScore(reservation);

    // With default thresholds this would be medium risk,
    // but with our custom thresholds it should be high
    expect(report.score).toBe(
      getDefaultConfig().rule_weights[RULE_KEYS.MISSING_EMAIL].score
    );
    expect(report.level).toBe('high');
    expect(report.config_used.thresholds).toEqual({ medium: 5, high: 15 });
  });
});
