import { noProfilePictureRule } from '../../../src/scoring/rules/noProfilePicture';
import type { NormalizedReservation } from '../../../src/services/getReservationDetails';

describe('No Profile Picture Rule', () => {
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
    expect(noProfilePictureRule.id).toBe('no-profile-picture');
    expect(noProfilePictureRule.name).toBeDefined();
    expect(noProfilePictureRule.defaultScore).toBeGreaterThan(0);
    expect(typeof noProfilePictureRule.defaultEnabled).toBe('boolean');
    expect(noProfilePictureRule.rationale).toBeDefined();
    expect(noProfilePictureRule.category).toBe('identity');
  });

  it('applies when profile_picture is false', () => {
    const guest = { ...baseGuest, profile_picture: false };
    expect(noProfilePictureRule.applies(guest)).toBe(true);
  });

  it('does not apply when profile_picture is true', () => {
    const guest = { ...baseGuest, profile_picture: true };
    expect(noProfilePictureRule.applies(guest)).toBe(false);
  });
});
