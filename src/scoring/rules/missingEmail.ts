import type { RiskRule } from '../ruleRegistry';

export const missingEmailRule: RiskRule = {
  id: 'missing-email',
  name: 'Missing Email',
  defaultScore: 15,
  defaultEnabled: true,
  rationale: 'Guest has not provided an email address.',
  applies: (guest) => !guest.email,
  category: 'contact',
};
