// src/utils/normalizeGuest.js

function normalizeGuest(reservation) {
  const raw = reservation?.guest || {};

  return {
    // Optional: preserve original guest ID or name for logs
    id: raw.id ?? null,
    name: `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
    profile_picture:
      typeof raw.profile_picture === 'string' &&
      raw.profile_picture.trim() !== '',
    phone_numbers: Array.isArray(raw.phone_numbers) ? raw.phone_numbers : [],
    email:
      typeof raw.email === 'string' && raw.email.trim() !== ''
        ? raw.email
        : null,
    location:
      typeof raw.location === 'string' && raw.location.trim() !== ''
        ? raw.location
        : null,
    language: typeof raw.language === 'string' ? raw.language : null,

    // These are aspirational values that I wish I could get. So I'm going to default them for now in the hopes that I can figure out a way to get them later on.
    reviewCount: raw.reviewCount ?? 0,
    tripCount: raw.tripCount ?? 0,
    hasNegativeReviews: raw.hasNegativeReviews ?? false,
  };
}

module.exports = { normalizeGuest };
