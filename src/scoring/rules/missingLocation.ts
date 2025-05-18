import type { RiskRule } from '../ruleRegistry';

export const missingLocationRule: RiskRule = {
  id: 'missing-location',
  name: 'Missing Location',
  defaultScore: 10,
  defaultEnabled: true,
  rationale: 'Guest does not have a location defined.',
  applies: (guest) =>
    !guest.location ||
    (typeof guest.location === 'string' && guest.location.trim() === ''),
  category: 'identity',
};
