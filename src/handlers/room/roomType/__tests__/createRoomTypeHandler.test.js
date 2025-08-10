// src/handlers/room/roomType/__tests__/getRoomTypeHandler.test.js
const getRoomTypeHandler = require('../getRoomTypeHandler');
const getRoomTypeController = require('../../../../controllers/room/roomType/getRoomTypeController');

jest.mock('../../../../controllers/room/roomType/getRoomTypeController');

describe('getRoomTypeHandler', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('debe devolver 200 y los tipos de habitación si todo va bien', async () => {
    const fakeRoomTypes = [
      { id: 1, name: 'Suite' },
      { id: 2, name: 'Doble' },
    ];

    getRoomTypeController.mockResolvedValue(fakeRoomTypes);

    await getRoomTypeHandler(mockReq, mockRes);

    expect(getRoomTypeController).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: fakeRoomTypes,
      message: 'Tipos de habitación obtenidos exitosamente',
    });
  });

  it('debe devolver 500 si ocurre un error', async () => {
    const fakeError = new Error('Fallo en DB');
    getRoomTypeController.mockRejectedValue(fakeError);

    await getRoomTypeHandler(mockReq, mockRes);

    expect(getRoomTypeController).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Error al obtener los tipos de habitación',
      details: 'Fallo en DB',
    });
  });
});
