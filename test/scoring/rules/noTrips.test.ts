import { noTripsRule } from '../../../src/scoring/rules/noTrips';
import type { NormalizedReservation } from '../../../src/services/getReservationDetails';

describe('No Trips Rule', () => {
  const baseGuest = {
    id: '123',
    name: 'Test User',
    review_count: 0,
    trip_count: 0,
    has_negative_reviews: false,
    profile_picture: false,
    phone_numbers: [],
    email: null,
    location: null,
    language: 'en',
  };

  it('has correct metadata', () => {
    expect(noTripsRule.id).toBe('no-trips');
    expect(noTripsRule.name).toBeDefined();
    expect(noTripsRule.defaultScore).toBeGreaterThan(0);
    expect(typeof noTripsRule.defaultEnabled).toBe('boolean');
    expect(noTripsRule.rationale).toBeDefined();
    expect(noTripsRule.category).toBe('reputation');
  });

  it('applies when guest has no trips', () => {
    const guest = { ...baseGuest, trip_count: 0 };
    expect(noTripsRule.applies(guest)).toBe(true);
  });

  it('does not apply when guest has one trip', () => {
    const guest = { ...baseGuest, trip_count: 1 };
    expect(noTripsRule.applies(guest)).toBe(false);
  });

  it('does not apply when guest has multiple trips', () => {
    const guest = { ...baseGuest, trip_count: 5 };
    expect(noTripsRule.applies(guest)).toBe(false);
  });
});
