import { calculateRiskScore } from '../../src/scoring/riskScorer';
import { RULE_KEYS } from '../../src/scoring/riskRules';
import type { RiskReport } from '../../src/scoring/riskScorer';
import type { RuleKey } from '../../src/scoring/riskRules';
import type { NormalizedReservation } from '../../src/services/getReservationDetails';

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

  it('scores guest with location, profile picture, email, phone number as low risk', () => {
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
    expect(report.score).toBe(10); // Only NO_TRIPS rule should match
    expect(report.level).toBe('low');
    expect(Array.isArray(report.matchedRules)).toBe(true);
    const ruleNames: RuleKey[] = report.matchedRules.map((r) => r.name);
    expect(ruleNames).toHaveLength(1);
    expect(ruleNames).toContain(RULE_KEYS.NO_TRIPS);
  });

  it('scores guest with no location, profile picture, email, nor phone number as high risk', () => {
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
