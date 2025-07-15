const { Room, RoomType, Reservation } = require('../../../models');
const createReservationController = require('../createReservationController');

jest.mock('../../../models');

describe('createReservationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoom = {
    id: 1,
    status: 'available',
    roomType: {
      name: 'Deluxe',
      price: 100
    }
  };

  const mockReservationData = {
    userId: 1,
    roomId: 1,
    checkIn: '2024-01-01',
    checkOut: '2024-01-03',
    numberOfGuests: 2
  };

  test('should throw error when userId is missing', async () => {
    const invalidData = { ...mockReservationData, userId: null };
    await expect(createReservationController(invalidData)).rejects.toThrow('El campo userId es obligatorio para crear una reserva.');
  });

  test('should throw error when room is not found', async () => {
    Room.findOne.mockResolvedValue(null);
    await expect(createReservationController(mockReservationData)).rejects.toThrow('Habitación no encontrada');
  });

  test('should throw error when room is not available', async () => {
    Room.findOne.mockResolvedValue(mockRoom);
    Room.findAll.mockResolvedValue([]);
    await expect(createReservationController(mockReservationData)).rejects.toThrow('La habitación seleccionada no está disponible');
  });

  test('should calculate correct total price for multiple nights', async () => {
    Room.findOne.mockResolvedValue(mockRoom);
    Room.findAll.mockResolvedValue([mockRoom]);
    Reservation.create.mockImplementation(data => data);

    const result = await createReservationController(mockReservationData);
    expect(result.totalPrice).toBe(200);
  });

  test('should handle minimum one night stay', async () => {
    Room.findOne.mockResolvedValue(mockRoom);
    Room.findAll.mockResolvedValue([mockRoom]);
    Reservation.create.mockImplementation(data => data);

    const sameDay = {
      ...mockReservationData,
      checkIn: '2024-01-01',
      checkOut: '2024-01-01'
    };

    const result = await createReservationController(sameDay);
    expect(result.totalPrice).toBe(100);
  });

  test('should create reservation with correct status', async () => {
    Room.findOne.mockResolvedValue(mockRoom);
    Room.findAll.mockResolvedValue([mockRoom]);
    Reservation.create.mockImplementation(data => data);

    const result = await createReservationController(mockReservationData);
    expect(result.status).toBe('pending');
  });

  test('should include all required fields in created reservation', async () => {
    Room.findOne.mockResolvedValue(mockRoom);
    Room.findAll.mockResolvedValue([mockRoom]);
    Reservation.create.mockImplementation(data => data);

    const result = await createReservationController(mockReservationData);
    
    expect(result).toEqual(expect.objectContaining({
      roomId: mockReservationData.roomId,
      checkIn: mockReservationData.checkIn,
      checkOut: mockReservationData.checkOut,
      userId: mockReservationData.userId,
      numberOfGuests: mockReservationData.numberOfGuests,
      status: 'pending'
    }));
  });

  test('should round total price to whole number', async () => {
    const roomWithDecimalPrice = {
      ...mockRoom,
      roomType: {
        ...mockRoom.roomType,
        price: 99.99
      }
    };

    Room.findOne.mockResolvedValue(roomWithDecimalPrice);
    Room.findAll.mockResolvedValue([roomWithDecimalPrice]);
    Reservation.create.mockImplementation(data => data);

    const result = await createReservationController(mockReservationData);
    expect(Number.isInteger(result.totalPrice)).toBe(true);
  });
});
