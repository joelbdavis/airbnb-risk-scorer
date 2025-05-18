import type { RiskRule } from '../ruleRegistry';

export const missingPhoneRule: RiskRule = {
  id: 'missing-phone',
  name: 'Missing Phone',
  defaultScore: 15,
  defaultEnabled: true,
  rationale: 'Guest has not provided a phone number.',
  applies: (guest) => !guest.phone_numbers?.length,
  category: 'contact',
};
