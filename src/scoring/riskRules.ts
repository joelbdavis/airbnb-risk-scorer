import { NormalizedReservation } from '../services/getReservationDetails';

type NormalizedGuest = NormalizedReservation['guest'];

export interface RiskRule {
  /** Points added to risk score if rule matches */
  score: number;
  /** Human-readable explanation of why this rule increases risk */
  rationale: string;
  /** Function that determines if this rule applies to a guest */
  applies: (guest: NormalizedGuest) => boolean;
}

export const RULE_KEYS = {
  MISSING_LOCATION: 'missing-location',
  NO_PROFILE_PICTURE: 'no-profile-picture',
  MISSING_EMAIL: 'missing-email',
  MISSING_PHONE: 'missing-phone',
  NO_REVIEWS: 'no-reviews',
  NO_TRIPS: 'no-trips',
  NEGATIVE_REVIEWS: 'negative-reviews',
} as const;

export type RuleKey = (typeof RULE_KEYS)[keyof typeof RULE_KEYS];

export const riskRules: Record<RuleKey, RiskRule> = {
  [RULE_KEYS.MISSING_LOCATION]: {
    score: 10,
    rationale: 'Guest does not have a location defined.',
    applies: (guest) => !guest.location,
  },
  [RULE_KEYS.NO_PROFILE_PICTURE]: {
    score: 10,
    rationale: 'Guest does not have a profile picture.',
    applies: (guest) => !guest.profile_picture,
  },
  [RULE_KEYS.MISSING_EMAIL]: {
    score: 15,
    rationale: 'Guest does not have an e-mail.',
    applies: (guest) => !guest.email,
  },
  [RULE_KEYS.MISSING_PHONE]: {
    score: 15,
    rationale: 'Guest does not have a phone number.',
    applies: (guest) =>
      Array.isArray(guest.phone_numbers) && guest.phone_numbers.length === 0,
  },
  [RULE_KEYS.NO_REVIEWS]: {
    score: 30,
    rationale: 'Guest does not have any reviews.',
    applies: (guest) => guest.trip_count > 0 && guest.review_count === 0,
  },
  [RULE_KEYS.NO_TRIPS]: {
    score: 10,
    rationale: 'Guest does not have any trips.',
    applies: (guest) => guest.trip_count === 0,
  },
  [RULE_KEYS.NEGATIVE_REVIEWS]: {
    score: 40,
    rationale: 'Guest has negative reviews.',
    applies: (guest) => guest.has_negative_reviews,
  },
};
