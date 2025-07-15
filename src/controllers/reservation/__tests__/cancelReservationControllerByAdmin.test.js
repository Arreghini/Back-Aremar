jest.mock('../../../models', () => ({
  Reservation: {
    findByPk: jest.fn(),
    update: jest.fn(),
  }
}));

const { Reservation } = require('../../../models');
const cancelReservationByAdminController = require('../cancelReservationControllerByAdmin');

describe('cancelReservationControllerByAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('should throw error when models module is not found', () => {
    jest.isolateModules(() => {
      jest.doMock('../../../models', () => {
        throw new Error('Cannot find module');
      });

      expect(() => {
        jest.requireActual('../cancelReservationControllerByAdmin');
      }).toThrow('Cannot find module');
    });
  });

  test('should throw error when Reservation model is not defined', async () => {
    jest.resetModules();
    jest.doMock('../../../models', () => ({}));

    const cancelReservationByAdminController = require('../cancelReservationControllerByAdmin');

    await expect(cancelReservationByAdminController({ reservationId: 1, isAdmin: true }))
      .rejects.toThrow();
  });

  test('should successfully import Reservation model', () => {
    expect(Reservation).toBeDefined();
  });

  test('should maintain Reservation model reference after multiple imports', () => {
    const firstImport = require('../../../models').Reservation;
    const secondImport = require('../../../models').Reservation;
    expect(firstImport).toBe(secondImport);
  });
});
describe('cancelReservationByAdminController functionality', () => {
  test('should throw error when reservation is not found', async () => {
    Reservation.findByPk.mockResolvedValue(null);
    
    await expect(cancelReservationByAdminController({ 
      reservationId: 999,
      isAdmin: true 
    })).rejects.toThrow('Reserva no encontrada');
  });

  test('should throw error when reservation is already cancelled', async () => {
    Reservation.findByPk.mockResolvedValue({
      status: 'cancelled',
      update: jest.fn()
    });
    
    await expect(cancelReservationByAdminController({ 
      reservationId: 1,
      isAdmin: true 
    })).rejects.toThrow('Esta reserva ya ha sido cancelada');
  });

  test('should throw error when user is not admin', async () => {
    Reservation.findByPk.mockResolvedValue({
      status: 'active',
      update: jest.fn()
    });
    
    await expect(cancelReservationByAdminController({ 
      reservationId: 1,
      isAdmin: false 
    })).rejects.toThrow('No tienes permiso para cancelar esta reserva');
  });

  test('should successfully cancel reservation when user is admin', async () => {
    const mockUpdate = jest.fn();
    Reservation.findByPk.mockResolvedValue({
      status: 'active',
      update: mockUpdate
    });
    
    const result = await cancelReservationByAdminController({ 
      reservationId: 1,
      isAdmin: true 
    });
    
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' });
    expect(result).toBe('Reserva cancelada exitosamente');
  });

  test('should handle reservation update failure', async () => {
    const mockUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
    Reservation.findByPk.mockResolvedValue({
      status: 'active',
      update: mockUpdate
    });
    
    await expect(cancelReservationByAdminController({ 
      reservationId: 1,
      isAdmin: true 
    })).rejects.toThrow('Update failed');
  });
});
