import type { RiskRule } from '../ruleRegistry';

export const noTripsRule: RiskRule = {
  id: 'no-trips',
  name: 'No Trips',
  defaultScore: 10,
  defaultEnabled: true,
  rationale: 'Guest has not completed any trips.',
  applies: (guest) => guest.trip_count === 0,
  category: 'reputation',
};
