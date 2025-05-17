import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { calculateRiskScore } from './scoring/riskScorer';
import {
  getReservationDetails,
  ReservationResponse,
} from './services/getReservationDetails';
import { saveTestPayload } from './utils/saveTestPayload';

interface WebhookPayload extends Omit<ReservationResponse, 'data'> {
  data?: ReservationResponse[];
}

export const app = express();
app.use(express.json());

app.post(
  '/booking',
  async (req: Request<{}, {}, WebhookPayload>, res: Response) => {
    try {
      const reservationId = req.body?.id;
      console.log(`ReservationId = ${reservationId}`);
      if (reservationId) {
        saveTestPayload(req.body, reservationId);
        const reservation = await getReservationDetails(reservationId);
        if (reservation) {
          const riskScore = calculateRiskScore(reservation);
        }
      }
      console.log(`Returning 200 to Webhook.`);
      res.sendStatus(200);
    } catch (err) {
      console.error(
        'Webhook error:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      res.status(500).send('Server error');
    }
  }
);

app.get('/', (_req: Request, res: Response) => {
  res.send('Airbnb Risk Scorer API is running');
});

app.use((_req: Request, res: Response, _next: NextFunction) => {
  console.log(`⚠️ No matching route: ${_req.method} ${_req.originalUrl}`);
  res.status(404).send('Not Found');
});

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}
