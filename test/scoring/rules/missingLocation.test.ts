import { missingLocationRule } from '../../../src/scoring/rules/missingLocation';
import type { NormalizedReservation } from '../../../src/services/getReservationDetails';

describe('Missing Location Rule', () => {
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
    expect(missingLocationRule.id).toBe('missing-location');
    expect(missingLocationRule.name).toBeDefined();
    expect(missingLocationRule.defaultScore).toBeGreaterThan(0);
    expect(typeof missingLocationRule.defaultEnabled).toBe('boolean');
    expect(missingLocationRule.rationale).toBeDefined();
    expect(missingLocationRule.category).toBe('identity');
  });

  it('applies when location is null', () => {
    const guest = { ...baseGuest, location: null };
    expect(missingLocationRule.applies(guest)).toBe(true);
  });

  it('applies when location is empty string', () => {
    const guest = { ...baseGuest, location: '' };
    expect(missingLocationRule.applies(guest)).toBe(true);
  });

  it('does not apply when location is present', () => {
    const guest = { ...baseGuest, location: 'New York, NY' };
    expect(missingLocationRule.applies(guest)).toBe(false);
  });

  it('does not apply when location has whitespace', () => {
    const guest = { ...baseGuest, location: '  New York, NY  ' };
    expect(missingLocationRule.applies(guest)).toBe(false);
  });
});
