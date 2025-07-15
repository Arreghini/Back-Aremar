const {
  getAllReservationController,
  getReservationByIdController,
  getReservationByUserIdController,
} = require('../getReservationController');

const { Reservation, Room, User, RoomType } = require('../../../models');

jest.mock('../../../models', () => ({
  Reservation: {
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
  Room: {
    findByPk: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  RoomType: {
    findByPk: jest.fn(),
  },
}));

describe('getReservationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReservation = {
    id: '123',
    userId: '456',
    roomId: '789',
    checkIn: '2023-01-01',
    checkOut: '2023-01-05',
    status: 'confirmed',
    totalPrice: 500,
    amountPaid: 200,
    numberOfGuests: 2,
    toJSON: function () {
      return { ...this };
    },
    room: { id: '789' },
  };

  const mockUserReservation = {
    ...mockReservation,
    user: { id: '456', name: 'John', email: 'john@example.com' },
  };

  test('should get all reservations with associated data', async () => {
    Reservation.findAll.mockResolvedValue([mockReservation]);

    const result = await getAllReservationController();

    expect(Reservation.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockReservation]);
  });

  test('should handle empty reservations list', async () => {
    Reservation.findAll.mockResolvedValue([]);

    const result = await getAllReservationController();

    expect(result).toEqual([]);
  });

  test('should get reservation by ID when provided', async () => {
    Reservation.findOne.mockResolvedValue(mockReservation);

    const result = await getReservationByIdController('123');

    expect(Reservation.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '123' },
      })
    );

    expect(result).toEqual({
      ...mockReservation,
      roomId: '789',
    });
  });

  test('should return error when reservation ID not found', async () => {
    Reservation.findOne.mockResolvedValue(null);

    await expect(getReservationByIdController('999')).rejects.toThrow('Reserva no encontrada');
  });

  test('should handle database errors', async () => {
    Reservation.findAll.mockRejectedValue(new Error('Database error'));

    await expect(getAllReservationController()).rejects.toThrow(
      'Hubo un problema al obtener las reservas. Inténtelo nuevamente más tarde.'
    );
  });

  test('should get reservations by user ID', async () => {
    Reservation.findAll.mockResolvedValue([mockReservation]);

    const result = await getReservationByUserIdController('456');

    expect(Reservation.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'google-oauth2|456' },
      })
    );

    expect(result).toEqual([
      {
        ...mockReservation,
        roomId: '789',
      },
    ]);
  });
});
