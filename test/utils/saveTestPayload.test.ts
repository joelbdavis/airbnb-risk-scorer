import fs from 'fs';
import path from 'path';
import { saveTestPayload } from '../../src/utils/saveTestPayload';

jest.mock('fs');
jest.mock('path');

describe('saveTestPayload', () => {
  const mockPayload = {
    id: '123',
    code: 'TEST123',
    platform: 'airbnb',
    platform_id: 'TEST123',
    booking_date: '2025-03-15T15:56:12Z',
    guest: {
      id: '123',
      first_name: 'Test',
      last_name: 'User',
      language: 'en',
      phone_numbers: [],
      location: null,
      profile_picture: null,
      email: null,
    },
  };
  const mockFilePath = '/mock/path/testPayloads/reservation-123.json';

  beforeEach(() => {
    jest.clearAllMocks();
    (path.join as jest.Mock).mockReturnValue(mockFilePath);
  });

  it('should save payload when file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    saveTestPayload(mockPayload, '123');

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      JSON.stringify(mockPayload, null, 2)
    );
  });

  it('should skip saving when file already exists', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    saveTestPayload(mockPayload, '123');

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('should use "unknown" as id when reservationId is not provided', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    saveTestPayload(mockPayload);

    expect(path.join).toHaveBeenCalledWith(
      expect.any(String),
      '..',
      'testPayloads',
      'reservation-unknown.json'
    );
  });

  it('should handle write errors gracefully', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('Write error');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    saveTestPayload(mockPayload, '123');

    expect(consoleSpy).toHaveBeenCalledWith(
      '❌ Failed to write payload file: Write error'
    );
    consoleSpy.mockRestore();
  });
});
