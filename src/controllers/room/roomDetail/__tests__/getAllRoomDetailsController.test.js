
const getAllRoomDetailsController = require('../../roomDetail/getAllRoomDetailsController');
const { RoomDetail } = require('../../../../models');

jest.mock('../../../../models', () => ({
  RoomDetail: {
    findAll: jest.fn(),
  },
}));

describe('getAllRoomDetailsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver todos los roomDetails cuando no hay errores', async () => {
    const mockRoomDetails = [
      { id: 1, name: 'Detalle 1' },
      { id: 2, name: 'Detalle 2' },
    ];
    RoomDetail.findAll.mockResolvedValue(mockRoomDetails);

    const result = await getAllRoomDetailsController();

    expect(RoomDetail.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockRoomDetails);
  });

  it('debe lanzar un error si findAll falla', async () => {
    const mockError = new Error('Error en base de datos');
    RoomDetail.findAll.mockRejectedValue(mockError);

    await expect(getAllRoomDetailsController()).rejects.toThrow('Error en base de datos');
    expect(RoomDetail.findAll).toHaveBeenCalledTimes(1);
  });
});
