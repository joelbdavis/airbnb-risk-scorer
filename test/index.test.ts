import request from 'supertest';
import { app } from '../src/index';
import { calculateRiskScore } from '../src/scoring/riskScorer';
import { getReservationDetails } from '../src/services/getReservationDetails';
import { saveTestPayload } from '../src/utils/saveTestPayload';

jest.mock('../src/scoring/riskScorer');
jest.mock('../src/services/getReservationDetails');
jest.mock('../src/utils/saveTestPayload');

describe('Express App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /booking', () => {
    const mockPayload = {
      id: '123-456',
      guest: { name: 'Test Guest' },
    };

    it('should process booking webhook successfully', async () => {
      (getReservationDetails as jest.Mock).mockResolvedValue(mockPayload);
      (calculateRiskScore as jest.Mock).mockReturnValue({ score: 50 });

      const response = await request(app).post('/booking').send(mockPayload);

      expect(response.status).toBe(200);
      expect(saveTestPayload).toHaveBeenCalledWith(mockPayload, '123-456');
      expect(getReservationDetails).toHaveBeenCalledWith('123-456');
      expect(calculateRiskScore).toHaveBeenCalledWith(mockPayload);
    });

    it('should handle missing reservation ID', async () => {
      const response = await request(app).post('/booking').send({});

      expect(response.status).toBe(200);
      expect(saveTestPayload).not.toHaveBeenCalled();
      expect(getReservationDetails).not.toHaveBeenCalled();
      expect(calculateRiskScore).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      (getReservationDetails as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const response = await request(app).post('/booking').send(mockPayload);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Server error');
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
      expect(response.text).toBe('Not Found');
    });
  });
});
