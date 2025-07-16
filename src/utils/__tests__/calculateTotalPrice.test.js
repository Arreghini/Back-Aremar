const calculateTotalPrice = require('../calculateTotalPrice');
const { Room } = require('../../models');

// Mock del modelo Room
jest.mock('../../models', () => ({
  Room: {
    findByPk: jest.fn()
  }
}));

describe('calculateTotalPrice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería calcular el precio total correctamente para una estadía de varios días', async () => {
    const mockRoom = {
      id: 1,
      name: 'Habitación Test',
      price: 100
    };
    
    Room.findByPk.mockResolvedValue(mockRoom);
    
    const roomId = 1;
    const checkIn = '2024-01-01';
    const checkOut = '2024-01-05'; // 4 días
    
    const result = await calculateTotalPrice(roomId, checkIn, checkOut);
    
    expect(Room.findByPk).toHaveBeenCalledWith(roomId);
    expect(result).toBe(400); // 100 * 4 días
  });

  it('debería calcular el precio total para una estadía de un día', async () => {
    const mockRoom = {
      id: 2,
      name: 'Habitación Económica',
      price: 75
    };
    
    Room.findByPk.mockResolvedValue(mockRoom);
    
    const roomId = 2;
    const checkIn = '2024-01-01';
    const checkOut = '2024-01-02'; // 1 día
    
    const result = await calculateTotalPrice(roomId, checkIn, checkOut);
    
    expect(Room.findByPk).toHaveBeenCalledWith(roomId);
    expect(result).toBe(75); // 75 * 1 día
  });

  it('debería manejar fechas con diferentes formatos', async () => {
    const mockRoom = {
      id: 3,
      name: 'Suite Premium',
      price: 200
    };
    
    Room.findByPk.mockResolvedValue(mockRoom);
    
    const roomId = 3;
    const checkIn = new Date('2024-01-01');
    const checkOut = new Date('2024-01-04'); // 3 días
    
    const result = await calculateTotalPrice(roomId, checkIn, checkOut);
    
    expect(Room.findByPk).toHaveBeenCalledWith(roomId);
    expect(result).toBe(600); // 200 * 3 días
  });

  it('debería redondear hacia arriba los días parciales', async () => {
    const mockRoom = {
      id: 4,
      name: 'Habitación Estándar',
      price: 120
    };
    
    Room.findByPk.mockResolvedValue(mockRoom);
    
    const roomId = 4;
    const checkIn = '2024-01-01T10:00:00';
    const checkOut = '2024-01-02T14:00:00'; // Más de 1 día pero menos de 2
    
    const result = await calculateTotalPrice(roomId, checkIn, checkOut);
    
    expect(Room.findByPk).toHaveBeenCalledWith(roomId);
    expect(result).toBe(240); // 120 * 2 días (redondeado hacia arriba)
  });

  it('debería lanzar error si la habitación no existe', async () => {
    Room.findByPk.mockResolvedValue(null);
    
    const roomId = 999;
    const checkIn = '2024-01-01';
    const checkOut = '2024-01-02';
    
    await expect(calculateTotalPrice(roomId, checkIn, checkOut))
      .rejects
      .toThrow(); // La función original fallará al intentar acceder a room.price
  });

  it('debería manejar errores de base de datos', async () => {
    Room.findByPk.mockRejectedValue(new Error('Error de conexión a la base de datos'));
    
    const roomId = 1;
    const checkIn = '2024-01-01';
    const checkOut = '2024-01-02';
    
    await expect(calculateTotalPrice(roomId, checkIn, checkOut))
      .rejects
      .toThrow('Error de conexión a la base de datos');
  });

  it('debería calcular correctamente para estadías largas', async () => {
    const mockRoom = {
      id: 5,
      name: 'Departamento Mensual',
      price: 80
    };
    
    Room.findByPk.mockResolvedValue(mockRoom);
    
    const roomId = 5;
    const checkIn = '2024-01-01';
    const checkOut = '2024-01-31'; // 30 días
    
    const result = await calculateTotalPrice(roomId, checkIn, checkOut);
    
    expect(Room.findByPk).toHaveBeenCalledWith(roomId);
    expect(result).toBe(2400); // 80 * 30 días
  });
});
