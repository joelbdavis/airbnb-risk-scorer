import { missingEmailRule } from '../../../src/scoring/rules/missingEmail';
import type { NormalizedReservation } from '../../../src/services/getReservationDetails';

describe('Missing Email Rule', () => {
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
    expect(missingEmailRule.id).toBe('missing-email');
    expect(missingEmailRule.name).toBeDefined();
    expect(missingEmailRule.defaultScore).toBeGreaterThan(0);
    expect(typeof missingEmailRule.defaultEnabled).toBe('boolean');
    expect(missingEmailRule.rationale).toBeDefined();
    expect(missingEmailRule.category).toBe('contact');
  });

  it('applies when email is null', () => {
    const guest = { ...baseGuest, email: null };
    expect(missingEmailRule.applies(guest)).toBe(true);
  });

  it('applies when email is empty string', () => {
    const guest = { ...baseGuest, email: '' };
    expect(missingEmailRule.applies(guest)).toBe(true);
  });

  it('does not apply when email is present', () => {
    const guest = { ...baseGuest, email: 'test@example.com' };
    expect(missingEmailRule.applies(guest)).toBe(false);
  });

  it('does not apply when email has whitespace', () => {
    const guest = { ...baseGuest, email: '  test@example.com  ' };
    expect(missingEmailRule.applies(guest)).toBe(false);
  });
});
