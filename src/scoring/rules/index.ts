import { ruleRegistry } from '../ruleRegistry';
import { missingLocationRule } from './missingLocation';
import { noProfilePictureRule } from './noProfilePicture';
import { missingEmailRule } from './missingEmail';
import { missingPhoneRule } from './missingPhone';
import { noReviewsRule } from './noReviews';
import { noTripsRule } from './noTrips';
import { negativeReviewsRule } from './negativeReviews';

// Register all rules
export function registerAllRules(): void {
  ruleRegistry.registerRule(missingLocationRule);
  ruleRegistry.registerRule(noProfilePictureRule);
  ruleRegistry.registerRule(missingEmailRule);
  ruleRegistry.registerRule(missingPhoneRule);
  ruleRegistry.registerRule(noReviewsRule);
  ruleRegistry.registerRule(noTripsRule);
  ruleRegistry.registerRule(negativeReviewsRule);
}

// Export rule IDs as constants
export const RULE_IDS = {
  MISSING_LOCATION: 'missing-location',
  NO_PROFILE_PICTURE: 'no-profile-picture',
  MISSING_EMAIL: 'missing-email',
  MISSING_PHONE: 'missing-phone',
  NO_REVIEWS: 'no-reviews',
  NO_TRIPS: 'no-trips',
  NEGATIVE_REVIEWS: 'negative-reviews',
} as const;

export type RuleId = (typeof RULE_IDS)[keyof typeof RULE_IDS];
