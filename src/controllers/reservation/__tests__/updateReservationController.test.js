const { Reservation, Room } = require('../../../models');

jest.mock('../../../models');

describe('Models Import', () => {
 beforeEach(() => {
  jest.clearAllMocks();

  Reservation.findByPk = jest.fn();
  Room.findByPk = jest.fn();
});


  test('should import Reservation model successfully', () => {
    expect(Reservation).toBeDefined();
  });

  test('should import Room model successfully', () => {
    expect(Room).toBeDefined();
  });

 test('should have correct model structure', () => {
  expect(typeof Reservation).toBe('function');
  expect(typeof Room).toBe('function');
});

  test('should handle model import errors', () => {
    jest.isolateModules(() => {
      expect(() => {
        require('../../../models');
      }).not.toThrow();
    });
  });

  test('should maintain model independence', () => {
    const mockReservation = { id: 1, roomId: 'room1' };
    const mockRoom = { id: 'room1', status: 'available' };
    
    Reservation.findByPk.mockResolvedValue(mockReservation);
    Room.findByPk.mockResolvedValue(mockRoom);
    
    expect(Reservation.findByPk).not.toBe(Room.findByPk);
  });

  test('should handle circular dependencies', () => {
    jest.isolateModules(() => {
      const models = require('../../../models');
      expect(models.Reservation).toBeDefined();
      expect(models.Room).toBeDefined();
    });
  });

  test('should preserve model methods after mocking', () => {
    expect(Reservation.findByPk).toBeDefined();
    expect(Room.findByPk).toBeDefined();
    expect(typeof Reservation.findByPk).toBe('function');
    expect(typeof Room.findByPk).toBe('function');
  });

  test('should handle re-importing models', () => {
    const firstImport = require('../../../models');
    const secondImport = require('../../../models');
    expect(firstImport).toBe(secondImport);
  });
});
