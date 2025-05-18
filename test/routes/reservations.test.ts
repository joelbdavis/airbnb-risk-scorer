import request from 'supertest';
import { app } from '../../src/index';
import { reservationStore } from '../../src/services/reservationStore';

describe('Reservation Routes', () => {
  beforeEach(() => {
    // Clear the store before each test
    jest.spyOn(reservationStore, 'list').mockReturnValue([]);
  });

  describe('POST /reservations', () => {
    it('should create a new reservation with valid guest data', async () => {
      const guestData = {
        id: '12345',
        name: 'Test Guest',
        review_count: 0,
        trip_count: 0,
        has_negative_reviews: false,
        profile_picture: false,
        phone_numbers: [],
        email: 'test@example.com',
        location: 'Test Location',
        language: 'en',
      };

      const response = await request(app)
        .post('/reservations')
        .send({ guest: guestData })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('reservation');
      expect(response.body).toHaveProperty('riskReport');
      expect(response.body).toHaveProperty('createdAt');

      // Verify reservation data
      expect(response.body.reservation.guest).toEqual(guestData);
      expect(response.body.reservation.platform).toBe('manual');
      expect(response.body.reservation.id).toMatch(/^manual-\d+$/);

      // Verify risk report structure
      expect(response.body.riskReport).toHaveProperty('score');
      expect(response.body.riskReport).toHaveProperty('level');
      expect(response.body.riskReport).toHaveProperty('matched_rules');
    });

    it('should return 400 if guest data is missing', async () => {
      const response = await request(app)
        .post('/reservations')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Guest data is required',
      });
    });

    it('should calculate correct risk score for high-risk guest', async () => {
      const guestData = {
        id: '12345',
        name: 'High Risk Guest',
        review_count: 0,
        trip_count: 0,
        has_negative_reviews: true,
        profile_picture: false,
        phone_numbers: [],
        email: null,
        location: null,
        language: 'en',
      };

      const response = await request(app)
        .post('/reservations')
        .send({ guest: guestData })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.riskReport.level).toBe('high');
      expect(response.body.riskReport.matched_rules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'missing-location' }),
          expect.objectContaining({ name: 'no-profile-picture' }),
          expect.objectContaining({ name: 'missing-email' }),
          expect.objectContaining({ name: 'missing-phone' }),
          expect.objectContaining({ name: 'no-trips' }),
          expect.objectContaining({ name: 'negative-reviews' }),
        ])
      );
    });

    it('should calculate correct risk score for low-risk guest', async () => {
      const guestData = {
        id: '12345',
        name: 'Low Risk Guest',
        review_count: 5,
        trip_count: 5,
        has_negative_reviews: false,
        profile_picture: true,
        phone_numbers: ['1234567890'],
        email: 'low.risk@example.com',
        location: 'Safe Location',
        language: 'en',
      };

      const response = await request(app)
        .post('/reservations')
        .send({ guest: guestData })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.riskReport.level).toBe('low');
      expect(response.body.riskReport.matched_rules).toHaveLength(0);
    });
  });
});
