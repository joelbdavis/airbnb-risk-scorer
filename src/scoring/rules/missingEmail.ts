import { RiskRule } from '../ruleRegistry';

export const missingEmailRule: RiskRule = {
  id: 'missing-email',
  name: 'Missing Email',
  defaultScore: 15,
  defaultEnabled: true,
  rationale: 'Guest does not have an e-mail.',
  applies: (guest) => !guest.email,
  category: 'contact',
};
