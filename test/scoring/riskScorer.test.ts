import { calculateRiskScore } from '../../src/scoring/riskScorer';
import { RULE_IDS, registerAllRules } from '../../src/scoring/rules';
import type { RiskReport } from '../../src/scoring/riskScorer';
import type { RuleId } from '../../src/scoring/rules';
import type { RuleConfig } from '../../src/scoring/config';
import type { NormalizedReservation } from '../../src/services/getReservationDetails';
import { updateConfig, getDefaultConfig } from '../../src/scoring/config';
import { RuleRegistry } from '../../src/scoring/ruleRegistry';
import { setupRiskScoringTest, teardownRiskScoringTest } from '../testUtils';

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
    setupRiskScoringTest();
    // Reset rule registry and config before each test
    RuleRegistry.resetInstance();
    registerAllRules(); // Register rules after resetting
    updateConfig(getDefaultConfig());
  });

  afterEach(() => {
    teardownRiskScoringTest();
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
        trip_count: 0,
        review_count: 0,
      },
    };

    const report: RiskReport = calculateRiskScore(reservation);

    // Only NO_TRIPS should match
    const ruleNames: RuleId[] = report.matched_rules.map((r) => r.name);
    expect(ruleNames).toHaveLength(1);
    expect(ruleNames).toContain(RULE_IDS.NO_TRIPS);

    // Verify score calculation using default weights
    expect(report.score).toBe(
      getDefaultConfig().rule_configs[RULE_IDS.NO_TRIPS].score
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
    expect(ruleNames).toContain(RULE_IDS.MISSING_LOCATION);
    expect(ruleNames).toContain(RULE_IDS.NO_PROFILE_PICTURE);
    expect(ruleNames).toContain(RULE_IDS.MISSING_EMAIL);
    expect(ruleNames).toContain(RULE_IDS.MISSING_PHONE);
    expect(ruleNames).toContain(RULE_IDS.NO_TRIPS);

    // Verify score matches default weights
    const expectedScore = Object.entries(getDefaultConfig().rule_configs)
      .filter(([key]) => ruleNames.includes(key as RuleId))
      .reduce((sum, [, config]) => sum + config.score, 0);

    expect(report.score).toBe(expectedScore);
    expect(report.level).toBe('high');
  });

  it('respects disabled rules', () => {
    // Disable the NO_TRIPS rule
    const defaultConfig = getDefaultConfig();
    const ruleConfigs = {
      ...defaultConfig.rule_configs,
      [RULE_IDS.NO_TRIPS]: {
        score: 10,
        enabled: false,
      },
    };

    updateConfig({
      rule_configs: ruleConfigs,
    });

    const reservation: NormalizedReservation = {
      ...baseReservation,
      guest: {
        ...baseReservation.guest,
        location: 'Christiansburg, VA',
        profile_picture: true,
        phone_numbers: ['18644508822'],
        email: 'test@example.com',
        trip_count: 0,
        review_count: 0,
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
    // Set thresholds so that:
    // 0-14: low risk
    // 15-29: medium risk
    // 30+: high risk
    updateConfig({
      thresholds: {
        medium: 15,
        high: 30,
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

    // With default thresholds this would be low risk,
    // but with our custom thresholds it should be medium
    expect(report.score).toBe(
      getDefaultConfig().rule_configs[RULE_IDS.MISSING_EMAIL].score
    );
    expect(report.level).toBe('medium');
    expect(report.config_used.thresholds).toEqual({ medium: 15, high: 30 });
  });

  it('correctly handles review and trip count relationships', () => {
    const reservation: NormalizedReservation = {
      ...baseReservation,
      guest: {
        ...baseReservation.guest,
        location: 'Christiansburg, VA',
        profile_picture: true,
        phone_numbers: ['18644508822'],
        email: 'test@example.com',
        trip_count: 3,
        review_count: 0,
      },
    };

    const report = calculateRiskScore(reservation);

    // Should match NO_REVIEWS since there are trips but no reviews
    const ruleNames = report.matched_rules.map((r) => r.name);
    expect(ruleNames).toContain(RULE_IDS.NO_REVIEWS);
    expect(report.score).toBe(
      getDefaultConfig().rule_configs[RULE_IDS.NO_REVIEWS].score
    );
  });

  it('handles negative reviews with other risk factors', () => {
    const reservation: NormalizedReservation = {
      ...baseReservation,
      guest: {
        ...baseReservation.guest,
        location: null,
        profile_picture: false,
        has_negative_reviews: true,
        trip_count: 5,
        review_count: 3,
      },
    };

    const report = calculateRiskScore(reservation);

    // Should match NEGATIVE_REVIEWS, MISSING_LOCATION, and NO_PROFILE_PICTURE
    const ruleNames = report.matched_rules.map((r) => r.name);
    expect(ruleNames).toContain(RULE_IDS.NEGATIVE_REVIEWS);
    expect(ruleNames).toContain(RULE_IDS.MISSING_LOCATION);
    expect(ruleNames).toContain(RULE_IDS.NO_PROFILE_PICTURE);

    // Calculate expected score
    const expectedScore =
      getDefaultConfig().rule_configs[RULE_IDS.NEGATIVE_REVIEWS].score +
      getDefaultConfig().rule_configs[RULE_IDS.MISSING_LOCATION].score +
      getDefaultConfig().rule_configs[RULE_IDS.NO_PROFILE_PICTURE].score +
      getDefaultConfig().rule_configs[RULE_IDS.MISSING_EMAIL].score +
      getDefaultConfig().rule_configs[RULE_IDS.MISSING_PHONE].score;

    expect(report.score).toBe(expectedScore);
    expect(report.level).toBe('high');
  });
});
