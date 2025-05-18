import { noReviewsRule } from '../../../src/scoring/rules/noReviews';
import type { NormalizedReservation } from '../../../src/services/getReservationDetails';

describe('No Reviews Rule', () => {
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
    expect(noReviewsRule.id).toBe('no-reviews');
    expect(noReviewsRule.name).toBeDefined();
    expect(noReviewsRule.defaultScore).toBeGreaterThan(0);
    expect(typeof noReviewsRule.defaultEnabled).toBe('boolean');
    expect(noReviewsRule.rationale).toBeDefined();
    expect(noReviewsRule.category).toBe('reputation');
  });

  it('applies when guest has trips but no reviews', () => {
    const guest = { ...baseGuest, trip_count: 3, review_count: 0 };
    expect(noReviewsRule.applies(guest)).toBe(true);
  });

  it('does not apply when guest has no trips', () => {
    const guest = { ...baseGuest, trip_count: 0, review_count: 0 };
    expect(noReviewsRule.applies(guest)).toBe(false);
  });

  it('does not apply when guest has reviews', () => {
    const guest = { ...baseGuest, trip_count: 3, review_count: 2 };
    expect(noReviewsRule.applies(guest)).toBe(false);
  });

  it('does not apply when guest has equal reviews and trips', () => {
    const guest = { ...baseGuest, trip_count: 3, review_count: 3 };
    expect(noReviewsRule.applies(guest)).toBe(false);
  });
});
