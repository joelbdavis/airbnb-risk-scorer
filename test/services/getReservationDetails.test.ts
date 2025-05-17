import axios from 'axios';
import { getReservationDetails } from '../../src/services/getReservationDetails';

jest.mock('axios');

describe('getReservationDetails', () => {
  const mockUuid = '123-456';
  const mockApiKey = 'test-api-key';
  const mockApiResponse = {
    data: {
      id: mockUuid,
      code: 'TEST123',
      platform: 'airbnb',
      platform_id: 'TEST123',
      booking_date: '2025-03-15T15:56:12Z',
      arrival_date: '2025-05-18T00:00:00-04:00',
      departure_date: '2025-05-23T00:00:00-04:00',
      check_in: '2025-05-18T16:00:00-04:00',
      check_out: '2025-05-23T10:00:00-04:00',
      nights: 5,
      reservation_status: {
        current: {
          category: 'accepted',
          sub_category: null,
        },
        history: [],
      },
      conversation_id: '123',
      last_message_at: '2025-03-15T15:56:12Z',
      guests: {
        total: 2,
        adult_count: 2,
        child_count: 0,
        infant_count: 0,
        pet_count: 0,
      },
      guest: {
        id: '123',
        first_name: 'Test',
        last_name: 'Guest',
        language: 'en',
        phone_numbers: [],
        location: null,
        profile_picture: null,
        email: null,
      },
      status: 'accepted',
      status_history: [],
    },
  };

  const expectedNormalizedResponse = {
    id: mockUuid,
    code: 'TEST123',
    platform: 'airbnb',
    platform_id: 'TEST123',
    booking_date: '2025-03-15T15:56:12Z',
    arrival_date: '2025-05-18T00:00:00-04:00',
    departure_date: '2025-05-23T00:00:00-04:00',
    check_in: '2025-05-18T16:00:00-04:00',
    check_out: '2025-05-23T10:00:00-04:00',
    nights: 5,
    reservation_status: {
      current: {
        category: 'accepted',
        sub_category: null,
      },
      history: [],
    },
    conversation_id: '123',
    last_message_at: '2025-03-15T15:56:12Z',
    guests: {
      total: 2,
      adult_count: 2,
      child_count: 0,
      infant_count: 0,
      pet_count: 0,
    },
    guest: {
      id: '123',
      name: 'Test Guest',
      review_count: 0,
      trip_count: 0,
      has_negative_reviews: false,
      profile_picture: false,
      phone_numbers: [],
      email: null,
      location: null,
      language: 'en',
    },
    status: 'accepted',
    status_history: [],
    risk_factors: {
      review_count: 0,
      trip_count: 0,
      has_negative_reviews: false,
    },
  };

  beforeEach(() => {
    process.env.HOSPITABLE_API_KEY = mockApiKey;
    jest.clearAllMocks();
  });

  it('should fetch and normalize reservation details', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

    const result = await getReservationDetails(mockUuid);
    expect(result).toEqual(expectedNormalizedResponse);
    expect(axios.get).toHaveBeenCalledWith(
      `https://public.api.hospitable.com/v2/reservations/${mockUuid}`,
      {
        headers: {
          Authorization: `Bearer ${mockApiKey}`,
        },
      }
    );
  });

  it('should return null on API error', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const result = await getReservationDetails(mockUuid);
    expect(result).toBeNull();
  });

  it('should handle non-Error objects in catch block', async () => {
    const error = 'String error';
    (axios.get as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await getReservationDetails(mockUuid);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown error')
    );
    consoleSpy.mockRestore();
  });
});
