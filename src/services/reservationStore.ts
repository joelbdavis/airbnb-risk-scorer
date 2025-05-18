import type { NormalizedReservation } from './getReservationDetails';
import type { RiskReport } from '../scoring/riskScorer';

interface StoredReservation {
  reservation: NormalizedReservation;
  riskReport: RiskReport;
  createdAt: Date;
}

// In-memory store for development
const reservations = new Map<string, StoredReservation>();

export const reservationStore = {
  save: (
    id: string,
    reservation: NormalizedReservation,
    riskReport: RiskReport
  ) => {
    reservations.set(id, {
      reservation,
      riskReport,
      createdAt: new Date(),
    });
  },

  get: (id: string): StoredReservation | undefined => {
    return reservations.get(id);
  },

  list: (): StoredReservation[] => {
    return Array.from(reservations.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  },
};
