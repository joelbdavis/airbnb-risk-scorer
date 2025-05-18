import type { RiskRule } from '../ruleRegistry';

export const negativeReviewsRule: RiskRule = {
  id: 'negative-reviews',
  name: 'Negative Reviews',
  defaultScore: 40,
  defaultEnabled: true,
  rationale: 'Guest has received negative reviews.',
  applies: (guest) => guest.has_negative_reviews,
  category: 'reputation',
};
