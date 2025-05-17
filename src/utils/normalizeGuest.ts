export interface NormalizedGuest {
  id: string | null;
  name: string;
  reviewCount: number;
  tripCount: number;
  hasNegativeReviews: boolean;
  profile_picture: boolean;
  phone_numbers: string[];
  email: string | null;
  location: string | null;
  language: string | null;
}

export function normalizeGuest(reservation: any): NormalizedGuest {
  const raw = reservation?.guest || {};

  return {
    id: raw.id ?? null,
    name: `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
    reviewCount: raw.reviewCount ?? 0,
    tripCount: raw.tripCount ?? 0,
    hasNegativeReviews: raw.hasNegativeReviews ?? false,
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
  };
}
