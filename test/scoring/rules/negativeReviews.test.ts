import { negativeReviewsRule } from '../../../src/scoring/rules/negativeReviews';
import type { NormalizedReservation } from '../../../src/services/getReservationDetails';

describe('Negative Reviews Rule', () => {
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
    expect(negativeReviewsRule.id).toBe('negative-reviews');
    expect(negativeReviewsRule.name).toBeDefined();
    expect(negativeReviewsRule.defaultScore).toBeGreaterThan(0);
    expect(typeof negativeReviewsRule.defaultEnabled).toBe('boolean');
    expect(negativeReviewsRule.rationale).toBeDefined();
    expect(negativeReviewsRule.category).toBe('reputation');
  });

  it('applies when guest has negative reviews', () => {
    const guest = { ...baseGuest, has_negative_reviews: true };
    expect(negativeReviewsRule.applies(guest)).toBe(true);
  });

  it('does not apply when guest has no negative reviews', () => {
    const guest = { ...baseGuest, has_negative_reviews: false };
    expect(negativeReviewsRule.applies(guest)).toBe(false);
  });

  it('does not apply when guest has positive reviews', () => {
    const guest = {
      ...baseGuest,
      has_negative_reviews: false,
      review_count: 5,
      trip_count: 5,
    };
    expect(negativeReviewsRule.applies(guest)).toBe(false);
  });
});
