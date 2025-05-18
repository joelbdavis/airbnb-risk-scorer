import fs from 'fs';
import path from 'path';
import { DatabaseService } from '../src/services/database';
import { calculateRiskScore } from '../src/scoring/riskScorer';
import { registerAllRules } from '../src/scoring/rules';
import type { NormalizedReservation } from '../src/services/getReservationDetails';

// Initialize risk scoring rules
registerAllRules();

function normalizeTestReservation(data: any): NormalizedReservation {
  return {
    id: data.id,
    code: data.code,
    platform: data.platform,
    platform_id: data.platform_id,
    booking_date: data.booking_date,
    arrival_date: data.arrival_date,
    departure_date: data.departure_date,
    check_in: data.check_in,
    check_out: data.check_out,
    nights: data.nights,
    status: data.status,
    status_history: data.status_history,
    conversation_id: data.conversation_id,
    last_message_at: data.last_message_at,
    guests: data.guests,
    reservation_status: data.reservation_status,
    guest: {
      id: data.guest.id,
      name: `${data.guest.first_name} ${data.guest.last_name}`,
      review_count: 0, // We'll set these from the expected.json
      trip_count: 0, // We'll set these from the expected.json
      has_negative_reviews: false,
      profile_picture: !!data.guest.profile_picture,
      phone_numbers: data.guest.phone_numbers || [],
      email: data.guest.email,
      location: data.guest.location,
      language: data.guest.language,
    },
    risk_factors: {
      review_count: 0,
      trip_count: 0,
      has_negative_reviews: false,
    },
  };
}

async function loadTestData() {
  try {
    // Read test payloads
    const testPayloadsDir = path.join(process.cwd(), 'testPayloads');
    const files = fs
      .readdirSync(testPayloadsDir)
      .filter(
        (file) => file.endsWith('.json') && !file.endsWith('.expected.json')
      );

    // Process each reservation
    for (const file of files) {
      const filePath = path.join(testPayloadsDir, file);
      const expectedFilePath = filePath.replace('.json', '.expected.json');

      const payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const expected = JSON.parse(fs.readFileSync(expectedFilePath, 'utf-8'));

      // Normalize the reservation data
      const normalizedReservation = normalizeTestReservation(payload.data);

      // Update with expected values
      normalizedReservation.guest.review_count = expected.review_count || 0;
      normalizedReservation.guest.trip_count = expected.trip_count || 0;
      normalizedReservation.guest.has_negative_reviews =
        expected.has_negative_reviews || false;
      normalizedReservation.risk_factors = {
        review_count: expected.review_count || 0,
        trip_count: expected.trip_count || 0,
        has_negative_reviews: expected.has_negative_reviews || false,
      };

      // Calculate risk score
      const riskReport = calculateRiskScore(normalizedReservation);

      // Save to database
      DatabaseService.save(
        normalizedReservation.id,
        normalizedReservation,
        riskReport
      );

      console.log(`Processed reservation ${normalizedReservation.id}`);
    }

    console.log('All test reservations loaded into database');
  } catch (error) {
    console.error('Error loading test data:', error);
  }
}

// Run the script
loadTestData();
