import { NormalizedReservation } from './getReservationDetails';
import { RiskReport } from '../scoring/riskScorer';
import { DatabaseService, StoredReservation } from './database';

class ReservationStore {
  save(
    reservationId: string,
    reservation: NormalizedReservation,
    riskReport: RiskReport
  ): void {
    DatabaseService.save(reservationId, reservation, riskReport);
  }

  get(id: string): StoredReservation | null {
    return DatabaseService.get(id);
  }

  list(): StoredReservation[] {
    return DatabaseService.list();
  }
}

export const reservationStore = new ReservationStore();
