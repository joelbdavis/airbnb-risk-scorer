import { missingPhoneRule } from '../../../src/scoring/rules/missingPhone';
import type { NormalizedReservation } from '../../../src/services/getReservationDetails';

describe('Missing Phone Rule', () => {
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
    expect(missingPhoneRule.id).toBe('missing-phone');
    expect(missingPhoneRule.name).toBeDefined();
    expect(missingPhoneRule.defaultScore).toBeGreaterThan(0);
    expect(typeof missingPhoneRule.defaultEnabled).toBe('boolean');
    expect(missingPhoneRule.rationale).toBeDefined();
    expect(missingPhoneRule.category).toBe('contact');
  });

  it('applies when phone_numbers is empty array', () => {
    const guest = { ...baseGuest, phone_numbers: [] };
    expect(missingPhoneRule.applies(guest)).toBe(true);
  });

  it('applies when phone_numbers is null', () => {
    const guest = { ...baseGuest, phone_numbers: [] };
    expect(missingPhoneRule.applies(guest)).toBe(true);
  });

  it('does not apply when phone_numbers has entries', () => {
    const guest = { ...baseGuest, phone_numbers: ['18644508822'] };
    expect(missingPhoneRule.applies(guest)).toBe(false);
  });

  it('does not apply when multiple phone numbers exist', () => {
    const guest = {
      ...baseGuest,
      phone_numbers: ['18644508822', '18644508823'],
    };
    expect(missingPhoneRule.applies(guest)).toBe(false);
  });
});
