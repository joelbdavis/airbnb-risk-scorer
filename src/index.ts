import 'dotenv/config';
import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import cors from 'cors';
import { calculateRiskScore } from './scoring/riskScorer';
import {
  getReservationDetails,
  NormalizedReservation,
  ReservationResponse,
} from './services/getReservationDetails';
import { saveTestPayload } from './utils/saveTestPayload';
import { reservationStore } from './services/reservationStore';
import { registerAllRules } from './scoring/rules';
import { RuleRegistry } from './scoring/ruleRegistry';
import reservationsRouter from './routes/reservations';

// Register all rules at startup
console.log('Initializing risk scoring rules...');
registerAllRules();
console.log(
  'Available rules:',
  RuleRegistry.getInstance()
    .getAllRules()
    .map((r) => r.id)
);

// Webhook payload type
interface WebhookPayload {
  id?: string;
  data?: {
    id?: string;
    guest?: {
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
    };
  };
}

export const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })
);

// Add response timeout middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// Basic routes
app.get('/', (_req: Request, res: Response) => {
  res.send('Airbnb Risk Scorer API is running');
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Mount the reservations router
app.use('/reservations', reservationsRouter);

// Webhook handler
const handleBookingWebhook: RequestHandler = async (req, res, next) => {
  try {
    console.log('Received booking webhook:', req.body);

    const reservationId = req.body?.id;
    if (!reservationId) {
      res.status(400).json({
        error: 'Missing reservation ID',
      });
      return;
    }

    // Save the raw payload
    await saveTestPayload(req.body, reservationId);

    try {
      // Get reservation details
      const normalizedReservation = await getReservationDetails(reservationId);

      if (!normalizedReservation) {
        res.status(404).json({
          error: 'Reservation not found',
        });
        return;
      }

      // Calculate risk score
      const riskReport = calculateRiskScore(normalizedReservation);

      // Save to database
      reservationStore.save(reservationId, normalizedReservation, riskReport);

      res.status(200).json({
        reservation_id: reservationId,
        ...riskReport,
      });
    } catch (error) {
      console.error('Error processing reservation:', error);
      res.status(500).json({
        error: 'Server error',
      });
    }
  } catch (error) {
    next(error instanceof Error ? error : new Error('Unknown error'));
  }
};

app.post('/booking', handleBookingWebhook);

// Error handling middleware - must be before 404 handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Server error' });
});

// 404 handler - must be last
app.use((_req: Request, res: Response, _next: NextFunction) => {
  console.log(`⚠️ No matching route: ${_req.method} ${_req.originalUrl}`);
  res.status(404).json({ error: 'Not found' });
});

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}
