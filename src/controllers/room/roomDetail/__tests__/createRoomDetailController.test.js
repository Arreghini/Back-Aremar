// src/controllers/room/roomDetail/__tests__/createRoomDetailController.test.js
jest.mock('../../../../models');
const { RoomDetail } = require('../../../../models');
const createRoomDetailController = require('../createRoomDetailController');

describe('createRoomDetailController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería crear RoomDetail correctamente', async () => {
    const input = {
      roomId: 'P2D3',
      description: 'Departamento frente al mar',
      capacity: 4,
      price: 150.00,
    };

    const expected = { id: 1, ...input };
    RoomDetail.create.mockResolvedValue(expected);

    const result = await createRoomDetailController(input);

    expect(RoomDetail.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(expected);
  });

  test('debería lanzar error si no se envía data', async () => {
    await expect(createRoomDetailController({}))
      .rejects
      .toThrow('Missing data to create room detail');
  });

  test('debería manejar errores del modelo', async () => {
    RoomDetail.create.mockRejectedValue(new Error('DB error'));

    await expect(createRoomDetailController({ roomId: 'P2D3' }))
      .rejects
      .toThrow('DB error');
  });
});
