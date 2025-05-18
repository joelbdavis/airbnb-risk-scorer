import { RuleRegistry } from '../ruleRegistry';
import { missingLocationRule } from './missingLocation';
import { noProfilePictureRule } from './noProfilePicture';
import { missingEmailRule } from './missingEmail';
import { missingPhoneRule } from './missingPhone';
import { noReviewsRule } from './noReviews';
import { noTripsRule } from './noTrips';
import { negativeReviewsRule } from './negativeReviews';

// Register all rules
export function registerAllRules(): void {
  console.log('Registering all rules...');
  const registry = RuleRegistry.getInstance();

  console.log(
    'Before registration, rules:',
    registry.getAllRules().map((r) => r.id)
  );

  registry.registerRule(missingLocationRule);
  registry.registerRule(noProfilePictureRule);
  registry.registerRule(missingEmailRule);
  registry.registerRule(missingPhoneRule);
  registry.registerRule(noReviewsRule);
  registry.registerRule(noTripsRule);
  registry.registerRule(negativeReviewsRule);

  console.log(
    'After registration, rules:',
    registry.getAllRules().map((r) => r.id)
  );
  console.log(
    'Rule details:',
    registry.getAllRules().map((r) => ({
      id: r.id,
      score: r.defaultScore,
      enabled: r.defaultEnabled,
      applies: r.applies.toString(),
    }))
  );
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
