import fs from 'fs';
import path from 'path';
import { ReservationResponse } from '../services/getReservationDetails';

interface Payload extends Partial<ReservationResponse> {
  data?: ReservationResponse[];
}

export function saveTestPayload(
  payload: Payload,
  reservationId?: string
): void {
  const id = reservationId || 'unknown';
  const fileName = `reservation-${id}.json`;
  const filePath = path.join(__dirname, '..', 'testPayloads', fileName);

  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
      console.log(`📦 Saved webhook payload to ${filePath}`);
    } else {
      console.log(`🔁 Payload for reservation ${id} already exists. Skipping.`);
    }
  } catch (err) {
    console.error(
      `❌ Failed to write payload file: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}
