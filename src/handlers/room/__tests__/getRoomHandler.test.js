const httpMocks = require('node-mocks-http');
const getRoom = require('../getRoomHandler'); 
const getRoomController = require('../../../controllers/room/getRoomController');

jest.mock('../../../controllers/room/getRoomController');

describe('getRoom handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRooms', () => {
    it('debe responder con status 200 y lista de habitaciones', async () => {
      const roomsMock = [{ id: 1 }, { id: 2 }];
      getRoomController.getAllRoomController.mockResolvedValue(roomsMock);

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await getRoom.getAllRooms(req, res);

      expect(getRoomController.getAllRoomController).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(roomsMock);
    });

    it('debe manejar error y responder status 500', async () => {
      getRoomController.getAllRoomController.mockRejectedValue(new Error('Error interno'));

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await getRoom.getAllRooms(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Error interno' });
    });
  });

  describe('getAvailableRooms', () => {
    it('debe responder con status 400 si faltan parámetros', async () => {
      const req = httpMocks.createRequest({ query: { roomTypeId: '1' } }); // incompleto
      const res = httpMocks.createResponse();

      await getRoom.getAvailableRooms(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: 'Faltan parámetros necesarios: roomType, checkInDate, checkOutDate, numberOfGuests',
      });
    });

    it('debe responder con status 200 y habitaciones disponibles', async () => {
      const roomsMock = [{ id: 1 }, { id: 2 }];
      getRoomController.getAvailableRoomsController.mockResolvedValue(roomsMock);

      const req = httpMocks.createRequest({
        query: {
          roomTypeId: '1',
          checkIn: '2025-08-01',
          checkOut: '2025-08-05',
          numberOfGuests: '2',
          reservationId: '123', // opcional
        },
      });
      const res = httpMocks.createResponse();

      await getRoom.getAvailableRooms(req, res);

      expect(getRoomController.getAvailableRoomsController).toHaveBeenCalledWith(
        '123', '1', '2025-08-01', '2025-08-05', '2'
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        success: true,
        totalRooms: roomsMock.length,
        rooms: roomsMock,
      });
    });

    it('debe manejar error y responder status 500', async () => {
      getRoomController.getAvailableRoomsController.mockRejectedValue(new Error('Error interno'));

      const req = httpMocks.createRequest({
        query: {
          roomTypeId: '1',
          checkIn: '2025-08-01',
          checkOut: '2025-08-05',
          numberOfGuests: '2',
        },
      });
      const res = httpMocks.createResponse();

      await getRoom.getAvailableRooms(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: 'Error en la búsqueda de habitaciones',
        error: 'Error interno',
      });
    });
  });

  describe('getAvailableRoomById', () => {
    it('debe responder con status 400 si faltan parámetros', async () => {
      const req = httpMocks.createRequest({ params: { roomId: '1' }, query: { checkIn: '2025-08-01' } }); // incompleto
      const res = httpMocks.createResponse();

      await getRoom.getAvailableRoomById(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: 'Faltan parámetros necesarios: roomId, checkInDate, checkOutDate, numberOfGuests',
      });
    });

    it('debe responder con status 200 y habitación disponible', async () => {
      const roomMock = { id: 1, name: 'Habitacion 1' };
      getRoomController.getAvailableRoomByIdController.mockResolvedValue(roomMock);

      const req = httpMocks.createRequest({
        params: { roomId: '1' },
        query: {
          checkIn: '2025-08-01',
          checkOut: '2025-08-05',
          numberOfGuests: '2',
        },
      });
      const res = httpMocks.createResponse();

      await getRoom.getAvailableRoomById(req, res);

      expect(getRoomController.getAvailableRoomByIdController).toHaveBeenCalledWith(
        '1', '2025-08-01', '2025-08-05', '2'
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        success: true,
        room: roomMock,
      });
    });

    it('debe manejar error y responder status 500', async () => {
      getRoomController.getAvailableRoomByIdController.mockRejectedValue(new Error('Error interno'));

      const req = httpMocks.createRequest({
        params: { roomId: '1' },
        query: {
          checkIn: '2025-08-01',
          checkOut: '2025-08-05',
          numberOfGuests: '2',
        },
      });
      const res = httpMocks.createResponse();

      await getRoom.getAvailableRoomById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: 'Error en la búsqueda de la habitación',
        error: 'Error interno',
      });
    });
  });
});
