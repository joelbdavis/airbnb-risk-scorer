import request from 'supertest';
import { app } from '../src/index';
import { saveTestPayload } from '../src/utils/saveTestPayload';
import { getReservationDetails } from '../src/services/getReservationDetails';
import { calculateRiskScore } from '../src/scoring/riskScorer';
import { DatabaseService } from '../src/services/database';

// Mock dependencies
jest.mock('../src/utils/saveTestPayload');
jest.mock('../src/services/getReservationDetails');
jest.mock('../src/scoring/riskScorer');
jest.mock('../src/services/database');

describe('Express App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Airbnb Risk Scorer API is running');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /booking', () => {
    const mockPayload = {
      id: '123-456',
      guest: { name: 'Test Guest' },
    };

    it('should process booking webhook successfully', async () => {
      const mockRiskReport = {
        score: 30,
        level: 'medium',
        matched_rules: [],
      };

      (calculateRiskScore as jest.Mock).mockReturnValue(mockRiskReport);
      (getReservationDetails as jest.Mock).mockResolvedValue(mockPayload);
      (DatabaseService.save as jest.Mock).mockImplementation(() => {});

      const response = await request(app).post('/booking').send(mockPayload);

      expect(response.status).toBe(200);
      expect(saveTestPayload).toHaveBeenCalledWith(mockPayload, '123-456');
      expect(getReservationDetails).toHaveBeenCalledWith('123-456');
      expect(calculateRiskScore).toHaveBeenCalledWith({
        id: '123-456',
        guest: { name: 'Test Guest' },
      });
      expect(DatabaseService.save).toHaveBeenCalledWith(
        '123-456',
        mockPayload,
        mockRiskReport
      );
    });

    it('should handle API errors gracefully', async () => {
      (getReservationDetails as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const response = await request(app).post('/booking').send(mockPayload);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });

    it('should handle missing reservation details', async () => {
      (getReservationDetails as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/booking').send(mockPayload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Reservation not found' });
    });
  });

  describe('GET /reservations/:id', () => {
    it('should return reservation details', async () => {
      const mockStoredReservation = {
        reservation: { id: '123', guest: { name: 'Test' } },
        riskReport: { score: 30, level: 'medium' },
      };

      (DatabaseService.get as jest.Mock).mockReturnValue(mockStoredReservation);

      const response = await request(app).get('/reservations/123');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStoredReservation);
    });

    it('should handle missing reservation', async () => {
      (DatabaseService.get as jest.Mock).mockReturnValue(null);

      const response = await request(app).get('/reservations/123');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Reservation not found' });
    });
  });

  describe('GET /reservations', () => {
    it('should return all reservations', async () => {
      const mockReservations = [
        {
          reservation: { id: '123', guest: { name: 'Test' } },
          riskReport: { score: 30, level: 'medium' },
        },
      ];

      (DatabaseService.list as jest.Mock).mockReturnValue(mockReservations);

      const response = await request(app).get('/reservations');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReservations);
    });
  });

  describe('404 Handler', () => {
    it('should handle unknown routes', async () => {
      const response = await request(app).get('/unknown');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Not found' });
    });
  });
});
