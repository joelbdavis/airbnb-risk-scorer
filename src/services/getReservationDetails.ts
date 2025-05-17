import axios, { AxiosResponse } from 'axios';

interface StatusHistoryItem {
  category: string;
  status: string;
  changed_at: string;
}

interface ReservationStatusHistory {
  category: string;
  sub_category: string | null;
  changed_at: string;
}

interface ReservationStatus {
  current: {
    category: string;
    sub_category: string | null;
  };
  history: ReservationStatusHistory[];
}

interface Guests {
  total: number;
  adult_count: number;
  child_count: number;
  infant_count: number;
  pet_count: number;
}

interface Guest {
  id: string;
  location: string | null;
  profile_picture: string | null;
  email: string | null;
  phone_numbers: string[];
  first_name: string;
  last_name: string;
  language: string;
}

export interface ReservationResponse {
  id: string;
  code: string;
  platform: string;
  platform_id: string;
  booking_date: string;
  arrival_date: string;
  departure_date: string;
  check_in: string;
  check_out: string;
  nights: number;
  reservation_status: ReservationStatus;
  conversation_id: string;
  last_message_at: string;
  guests: Guests;
  guest: Guest;
  status: string;
  status_history: StatusHistoryItem[];
}

interface NormalizedGuest {
  id: string | null;
  name: string;
  review_count: number;
  trip_count: number;
  has_negative_reviews: boolean;
  profile_picture: boolean;
  phone_numbers: string[];
  email: string | null;
  location: string | null;
  language: string | null;
}

export interface NormalizedReservation
  extends Omit<ReservationResponse, 'guest'> {
  guest: NormalizedGuest;
  risk_factors?: {
    review_count: number;
    trip_count: number;
    has_negative_reviews: boolean;
  };
}

function normalizeGuest(raw: Guest): NormalizedGuest {
  return {
    id: raw.id ?? null,
    name: `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
    // TODO: These fields need to be populated from additional API calls or data sources
    review_count: 0,
    trip_count: 0,
    has_negative_reviews: false,
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

function normalizeReservation(
  response: ReservationResponse
): NormalizedReservation {
  const { guest, ...rest } = response;
  const normalizedGuest = normalizeGuest(guest);
  return {
    ...rest,
    guest: normalizedGuest,
    risk_factors: {
      review_count: normalizedGuest.review_count,
      trip_count: normalizedGuest.trip_count,
      has_negative_reviews: normalizedGuest.has_negative_reviews,
    },
  };
}

export async function getReservationDetails(
  uuid: string
): Promise<NormalizedReservation | null> {
  const url = `https://public.api.hospitable.com/v2/reservations/${uuid}`;

  try {
    const response: AxiosResponse<ReservationResponse> = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HOSPITABLE_API_KEY}`,
      },
    });
    console.log(`Reservation by ID ${JSON.stringify(response.data)}`);
    return normalizeReservation(response.data);
  } catch (error) {
    console.error(
      `Hospitable API error: ${error instanceof Error ? error.message : 'Unknown error'} on ${url}`
    );
    return null;
  }
}
