const { v4: uuidv4 } = require('uuid');
jest.mock('uuid');

describe('UUID Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate a valid UUID', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    uuidv4.mockReturnValue(mockUUID);

    const generatedUUID = uuidv4();
    
    expect(generatedUUID).toBe(mockUUID);
    expect(uuidv4).toHaveBeenCalledTimes(1);
  });

  test('should generate unique UUIDs on multiple calls', () => {
    const mockUUID1 = '123e4567-e89b-12d3-a456-426614174000';
    const mockUUID2 = '987fcdeb-51a2-34ef-8901-234567890123';
    
    uuidv4
      .mockReturnValueOnce(mockUUID1)
      .mockReturnValueOnce(mockUUID2);

    const firstUUID = uuidv4();
    const secondUUID = uuidv4();

    expect(firstUUID).toBe(mockUUID1);
    expect(secondUUID).toBe(mockUUID2);
    expect(firstUUID).not.toBe(secondUUID);
    expect(uuidv4).toHaveBeenCalledTimes(2);
  });

  test('should handle multiple UUID generations in sequence', () => {
    const mockUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-34ef-8901-234567890123',
      'abc12345-6789-def0-1234-567890abcdef'
    ];

    mockUUIDs.forEach(uuid => {
      uuidv4.mockReturnValueOnce(uuid);
      expect(uuidv4()).toBe(uuid);
    });

    expect(uuidv4).toHaveBeenCalledTimes(3);
  });
});
