import { Router, Request, Response } from 'express';
import { calculateRiskScore } from '../scoring/riskScorer';
import { reservationStore } from '../services/reservationStore';
import { NormalizedReservation } from '../services/getReservationDetails';

const router = Router();

// Create a new reservation
router.post('/', (req: Request, res: Response) => {
  try {
    const guestData = req.body.guest;
    if (!guestData) {
      res.status(400).json({ error: 'Guest data is required' });
      return;
    }

    // Generate a unique ID for the reservation
    const reservationId = `manual-${Date.now()}`;

    // Create a minimal reservation with just the required fields
    const reservation: NormalizedReservation = {
      id: reservationId,
      code: `MAN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      platform: 'manual',
      platform_id: reservationId,
      booking_date: new Date().toISOString(),
      arrival_date: new Date().toISOString(),
      departure_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
      check_in: new Date().toISOString(),
      check_out: new Date(Date.now() + 86400000).toISOString(), // +1 day
      nights: 1,
      status: 'accepted',
      status_history: [],
      conversation_id: reservationId,
      last_message_at: new Date().toISOString(),
      guests: {
        total: 1,
        adult_count: 1,
        child_count: 0,
        infant_count: 0,
        pet_count: 0,
      },
      guest: guestData,
      reservation_status: {
        current: {
          category: 'accepted',
          sub_category: null,
        },
        history: [],
      },
    };

    // Calculate risk score
    const riskReport = calculateRiskScore(reservation);

    // Save to database
    reservationStore.save(reservationId, reservation, riskReport);

    // Return in the format expected by the frontend
    res.status(201).json({
      reservation,
      riskReport,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all reservations
router.get('/', (_req: Request, res: Response) => {
  try {
    const reservations = reservationStore.list();
    console.log(`Returning ${reservations.length} reservations`);
    res.json(reservations);
  } catch (err) {
    console.error('Error listing reservations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific reservation
router.get('/:id', (req: Request, res: Response) => {
  try {
    const stored = reservationStore.get(req.params.id);
    if (!stored) {
      console.log(`Reservation not found: ${req.params.id}`);
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }
    res.json(stored);
  } catch (err) {
    console.error('Error getting reservation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a reservation
router.put('/:id', (req: Request, res: Response) => {
  try {
    console.log('Updating reservation:', req.params.id, req.body);
    const stored = reservationStore.get(req.params.id);
    if (!stored) {
      console.log(`Reservation not found: ${req.params.id}`);
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    const updatedGuest = req.body.guest;
    if (!updatedGuest) {
      res.status(400).json({ error: 'Guest data is required' });
      return;
    }

    const updatedReservation: NormalizedReservation = {
      ...stored.reservation,
      guest: updatedGuest,
    };

    const riskReport = calculateRiskScore(updatedReservation);
    console.log('Updated risk report:', riskReport);

    reservationStore.save(
      updatedReservation.id,
      updatedReservation,
      riskReport
    );
    res.json({ reservation: updatedReservation, riskReport });
  } catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
