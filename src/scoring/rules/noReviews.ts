import type { RiskRule } from '../ruleRegistry';

export const noReviewsRule: RiskRule = {
  id: 'no-reviews',
  name: 'No Reviews',
  defaultScore: 30,
  defaultEnabled: true,
  rationale: 'Guest has trips but has not received any reviews.',
  applies: (guest) => guest.trip_count > 0 && guest.review_count === 0,
  category: 'reputation',
};
