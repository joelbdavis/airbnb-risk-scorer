import { RiskRule } from '../ruleRegistry';

export const missingPhoneRule: RiskRule = {
  id: 'missing-phone',
  name: 'Missing Phone',
  defaultScore: 15,
  defaultEnabled: true,
  rationale: 'Guest does not have a phone number.',
  applies: (guest) =>
    Array.isArray(guest.phone_numbers) && guest.phone_numbers.length === 0,
  category: 'contact',
};
