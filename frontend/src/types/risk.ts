export type RiskLevel = 'low' | 'medium' | 'high';

export interface NormalizedGuest {
  id: string;
  name: string;
  review_count: number;
  trip_count: number;
  has_negative_reviews: boolean;
  profile_picture: boolean;
  phone_numbers: string[];
  email: string | null;
  location: string | null;
  language: string;
}

export interface MatchedRule {
  name: string;
  score: number;
  rationale: string;
}

export interface RiskReport {
  score: number;
  level: RiskLevel;
  matched_rules: MatchedRule[];
  config_used?: {
    thresholds?: {
      medium: number;
      high: number;
    };
  };
}

interface StatusHistoryItem {
  timestamp: string;
  category: string;
  sub_category: string | null;
}

export interface NormalizedReservation {
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
  reservation_status: {
    current: {
      category: string;
      sub_category: string | null;
    };
    history: StatusHistoryItem[];
  };
  conversation_id: string;
  last_message_at: string;
  guests: {
    total: number;
    adult_count: number;
    child_count: number;
    infant_count: number;
    pet_count: number;
  };
  guest: NormalizedGuest;
  status: string;
  status_history: StatusHistoryItem[];
}

export interface StoredReservation {
  reservation: NormalizedReservation;
  riskReport: RiskReport;
  createdAt: string;
}
