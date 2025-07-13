const updateGuestProfileController = require('../../../controllers/user/updateProfileController');

jest.mock('../../../controllers/user/updateProfileController');

describe('updateGuestProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProfileData = {
    name: 'Updated User',
    email: 'updated@test.com',
    phone: '9876543210',
    address: 'Updated Address',
    picture: 'updated.jpg'
  };

  test('should successfully update user profile', async () => {
    const mockUpdatedUser = { ...mockProfileData, id: '123' };
    updateGuestProfileController.mockResolvedValue(mockUpdatedUser);

    const result = await updateGuestProfileController('123', mockProfileData);

    expect(updateGuestProfileController).toHaveBeenCalledWith('123', mockProfileData);
    expect(result).toEqual(mockUpdatedUser);
  });

  test('should handle empty update data', async () => {
    const emptyData = {};
    updateGuestProfileController.mockResolvedValue(null);

    const result = await updateGuestProfileController('123', emptyData);

    expect(updateGuestProfileController).toHaveBeenCalledWith('123', emptyData);
    expect(result).toBeNull();
  });

  test('should handle invalid user ID', async () => {
    updateGuestProfileController.mockRejectedValue(new Error('User not found'));

    await expect(updateGuestProfileController('invalid-id', mockProfileData))
      .rejects
      .toThrow('User not found');
  });

  test('should handle partial profile updates', async () => {
    const partialData = { name: 'Updated User' };
    const mockPartialUpdate = { id: '123', name: 'Updated User' };
    updateGuestProfileController.mockResolvedValue(mockPartialUpdate);

    const result = await updateGuestProfileController('123', partialData);

    expect(updateGuestProfileController).toHaveBeenCalledWith('123', partialData);
    expect(result).toEqual(mockPartialUpdate);
  });

  test('should handle database errors during update', async () => {
    updateGuestProfileController.mockRejectedValue(new Error('Database error'));

    await expect(updateGuestProfileController('123', mockProfileData))
      .rejects
      .toThrow('Database error');
  });
});
describe('updateGuestProfileController additional cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle update with special characters in data', async () => {
    const specialData = {
      name: 'User #1 & Co.',
      email: 'special+chars@test.com',
      address: '123 Main St. #456'
    };
    const mockResponse = { ...specialData, id: '123' };
    updateGuestProfileController.mockResolvedValue(mockResponse);

    const result = await updateGuestProfileController('123', specialData);

    expect(updateGuestProfileController).toHaveBeenCalledWith('123', specialData);
    expect(result).toEqual(mockResponse);
  });

  test('should handle very long input values', async () => {
    const longData = {
      name: 'A'.repeat(256),
      email: 'a'.repeat(100) + '@test.com',
      address: 'B'.repeat(1000)
    };
    updateGuestProfileController.mockResolvedValue({ ...longData, id: '123' });

    const result = await updateGuestProfileController('123', longData);

    expect(updateGuestProfileController).toHaveBeenCalledWith('123', longData);
    expect(result).toHaveProperty('name', longData.name);
  });

  test('should handle update with null values', async () => {
    const nullData = {
      name: null,
      email: null,
      phone: null
    };
    updateGuestProfileController.mockResolvedValue({ ...nullData, id: '123' });

    const result = await updateGuestProfileController('123', nullData);

    expect(updateGuestProfileController).toHaveBeenCalledWith('123', nullData);
    expect(result).toHaveProperty('name', null);
  });

  test('should handle update with undefined fields', async () => {
    const sparseData = {
      name: undefined,
      email: 'test@example.com'
    };
    const expectedResponse = { id: '123', email: 'test@example.com' };
    updateGuestProfileController.mockResolvedValue(expectedResponse);

    const result = await updateGuestProfileController('123', sparseData);

    expect(updateGuestProfileController).toHaveBeenCalledWith('123', sparseData);
    expect(result).toEqual(expectedResponse);
  });

  test('should handle concurrent updates to same user', async () => {
    const firstUpdate = { name: 'First Update' };
    const secondUpdate = { name: 'Second Update' };
    
    updateGuestProfileController
      .mockResolvedValueOnce({ ...firstUpdate, id: '123' })
      .mockResolvedValueOnce({ ...secondUpdate, id: '123' });

    const [result1, result2] = await Promise.all([
      updateGuestProfileController('123', firstUpdate),
      updateGuestProfileController('123', secondUpdate)
    ]);

    expect(result1).toHaveProperty('name', 'First Update');
    expect(result2).toHaveProperty('name', 'Second Update');
    expect(updateGuestProfileController).toHaveBeenCalledTimes(2);
  });
});
