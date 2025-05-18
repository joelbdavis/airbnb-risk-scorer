import fs from 'fs';
import path from 'path';
import { calculateRiskScore, RiskReport } from '../../src/scoring/riskScorer';
import {
  ReservationResponse,
  NormalizedReservation,
} from '../../src/services/getReservationDetails';
import { RuleId } from '../../src/scoring/rules';

interface ExpectedValues {
  expected_rules: RuleId[];
  rationale: string[];
}

function normalizeGuest(raw: ReservationResponse['guest']) {
  return {
    id: raw.id ?? null,
    name: `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
    review_count: 0,
    trip_count: 0,
    has_negative_reviews: false,
    profile_picture:
      typeof raw.profile_picture === 'string' &&
      raw.profile_picture.trim() !== '',
    phone_numbers: Array.isArray(raw.phone_numbers) ? raw.phone_numbers : [],
    email:
      typeof raw.email === 'string' && raw.email.trim() !== ''
        ? raw.email
        : null,
    location:
      typeof raw.location === 'string' && raw.location.trim() !== ''
        ? raw.location
        : null,
    language: typeof raw.language === 'string' ? raw.language : null,
  };
}

function normalizeReservation(
  response: ReservationResponse
): NormalizedReservation {
  const { guest, ...rest } = response;
  const normalizedGuest = normalizeGuest(guest);
  return {
    ...rest,
    guest: normalizedGuest,
    risk_factors: {
      review_count: normalizedGuest.review_count,
      trip_count: normalizedGuest.trip_count,
      has_negative_reviews: normalizedGuest.has_negative_reviews,
    },
  };
}

describe('Risk scoring from testPayloads', () => {
  const payloadDir = path.join(__dirname, '../../testPayloads');

  const files = fs
    .readdirSync(payloadDir)
    .filter(
      (file) => file.endsWith('.json') && !file.endsWith('.expected.json')
    );

  files.forEach((filename) => {
    it(`matches expected rules for ${filename}`, () => {
      const base = path.basename(filename, '.json');
      const rawReservation = getReservationFromTestPayload(payloadDir, base);
      const reservation = normalizeReservation(rawReservation);
      const expected = getExpected(payloadDir, filename, base);
      const riskReport = calculateRiskScore(reservation);

      // Verify matched rules
      const matchedRuleNames = riskReport.matched_rules.map((r) => r.name);
      expect(new Set(matchedRuleNames)).toEqual(
        new Set(expected.expected_rules)
      );

      // Verify rationale
      const matchedRationale = riskReport.matched_rules.map((r) => r.rationale);
      expect(new Set(matchedRationale)).toEqual(new Set(expected.rationale));

      // Verify config was included
      expect(riskReport.config_used).toBeDefined();
      expect(riskReport.config_used.thresholds).toHaveProperty('medium');
      expect(riskReport.config_used.thresholds).toHaveProperty('high');
    });
  });
});

function getReservationFromTestPayload(
  payloadDir: string,
  base: string
): ReservationResponse {
  const payloadPath = path.join(payloadDir, `${base}.json`);
  const wrapper = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  return wrapper.data || wrapper;
}

function getExpected(
  payloadDir: string,
  filename: string,
  base: string
): ExpectedValues {
  const expectedPath = path.join(payloadDir, `${base}.expected.json`);

  if (!fs.existsSync(expectedPath)) {
    throw new Error(`Missing expected file for ${filename}`);
  }

  const expected = JSON.parse(
    fs.readFileSync(expectedPath, 'utf8')
  ) as ExpectedValues;

  if (
    !Array.isArray(expected.expected_rules) ||
    !Array.isArray(expected.rationale)
  ) {
    throw new Error(
      `Missing or invalid expected_rules or rationale in ${base}.expected.json`
    );
  }

  return expected;
}
