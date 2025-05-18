import request from 'supertest';
import { app } from '../src/index';
import { saveTestPayload } from '../src/utils/saveTestPayload';
import { getReservationDetails } from '../src/services/getReservationDetails';
import { calculateRiskScore } from '../src/scoring/riskScorer';

jest.mock('../src/utils/saveTestPayload');
jest.mock('../src/services/getReservationDetails');
jest.mock('../src/scoring/riskScorer');

describe('Express App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /booking', () => {
    it('should process booking webhook successfully', async () => {
      const mockPayload = {
        id: '123-456',
        guest: { name: 'Test Guest' },
      };

      (saveTestPayload as jest.Mock).mockResolvedValue(undefined);
      (getReservationDetails as jest.Mock).mockResolvedValue({
        id: '123-456',
        guest: { name: 'Test Guest' },
      });
      (calculateRiskScore as jest.Mock).mockReturnValue({
        score: 50,
        level: 'medium',
      });

      const response = await request(app).post('/booking').send(mockPayload);

      expect(response.status).toBe(200);
      expect(saveTestPayload).toHaveBeenCalledWith(mockPayload, '123-456');
      expect(getReservationDetails).toHaveBeenCalledWith('123-456');
      expect(calculateRiskScore).toHaveBeenCalledWith({
        id: '123-456',
        guest: { name: 'Test Guest' },
      });
    });

    it('should handle missing reservation ID', async () => {
      const response = await request(app).post('/booking').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing reservation ID' });
      expect(saveTestPayload).not.toHaveBeenCalled();
      expect(getReservationDetails).not.toHaveBeenCalled();
      expect(calculateRiskScore).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const mockPayload = {
        id: '123-456',
        guest: { name: 'Test Guest' },
      };

      (saveTestPayload as jest.Mock).mockResolvedValue(undefined);
      (getReservationDetails as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const response = await request(app).post('/booking').send(mockPayload);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });

    it('should handle missing reservation details', async () => {
      const mockPayload = {
        id: '123-456',
        guest: { name: 'Test Guest' },
      };

      (saveTestPayload as jest.Mock).mockResolvedValue(undefined);
      (getReservationDetails as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/booking').send(mockPayload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Reservation not found' });
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Airbnb Risk Scorer API is running');
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
