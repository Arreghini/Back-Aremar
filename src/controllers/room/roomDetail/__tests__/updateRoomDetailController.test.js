// src/controllers/room/roomDetail/__tests__/updateRoomDetailController.test.js

const { RoomDetail } = require('../../../../models');
const updateRoomDetailController = require('../updateRoomDetailController');

jest.mock('../../../../models');

describe('updateRoomDetailController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update room detail successfully', async () => {
    const mockRoomDetail = {
      id: 1,
      roomId: 123,
      amenities: ['WiFi', 'TV'],
      images: ['image1.jpg', 'image2.jpg'],
      update: jest.fn().mockResolvedValue(true),
    };

    RoomDetail.findOne.mockResolvedValue(mockRoomDetail);

    const updatedData = {
      amenities: ['WiFi', 'TV', 'AC'],
      images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
    };

    const result = await updateRoomDetailController(1, updatedData);

    expect(result).toBeTruthy();
    expect(RoomDetail.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockRoomDetail.update).toHaveBeenCalledWith(updatedData);
  });

  test('should throw error when room detail not found', async () => {
    RoomDetail.findOne.mockResolvedValue(null);

    await expect(updateRoomDetailController(999, { amenities: ['WiFi'] }))
      .rejects
      .toThrow('Room detail not found');
  });

  test('should handle database errors', async () => {
    RoomDetail.findOne.mockRejectedValue(new Error('Unexpected DB error'));

    await expect(updateRoomDetailController(1, { amenities: ['TV'] }))
      .rejects
      .toThrow('Database connection failed');
  });

  test('should handle invalid room ID', async () => {
    await expect(updateRoomDetailController(null, {}))
      .rejects
      .toThrow('Invalid room ID');
  });

  test('should handle empty update data', async () => {
    const mockRoomDetail = {
      id: 1,
      roomId: 123,
      update: jest.fn().mockResolvedValue(true),
    };

    RoomDetail.findOne.mockResolvedValue(mockRoomDetail);

    await expect(updateRoomDetailController(1, {}))
      .resolves
      .toBeTruthy();
  });
});
