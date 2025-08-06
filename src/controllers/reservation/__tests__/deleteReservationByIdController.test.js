const { Reservation } = require('../../../models');
const deleteReservationByIdController = require('../deleteReservationByIdController');

jest.mock('../../../models');

describe('deleteReservationByIdController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ should successfully delete a pending reservation', async () => {
    const mockReservation = {
      id: '123',
      status: 'pendiente',
      destroy: jest.fn().mockResolvedValue()
    };

    Reservation.findByPk.mockResolvedValue(mockReservation);

    const result = await deleteReservationByIdController('123');

    expect(Reservation.findByPk).toHaveBeenCalledWith('123');
    expect(mockReservation.destroy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('❌ should throw error if reservation is not pending', async () => {
    const mockReservation = {
      id: '123',
      status: 'confirmada',
      destroy: jest.fn()
    };

    Reservation.findByPk.mockResolvedValue(mockReservation);

    await expect(deleteReservationByIdController('123')).rejects.toThrow(
      'Error al eliminar la reserva: Solo puedes eliminar reservas en estado pendiente'
    );

    expect(Reservation.findByPk).toHaveBeenCalledWith('123');
    expect(mockReservation.destroy).not.toHaveBeenCalled();
  });

  test('🔍 should return false when reservation is not found', async () => {
    Reservation.findByPk.mockResolvedValue(null);

    const result = await deleteReservationByIdController('nonexistent-id');

    expect(Reservation.findByPk).toHaveBeenCalledWith('nonexistent-id');
    expect(result).toBe(false);
  });

  test('💥 should handle database errors properly', async () => {
    Reservation.findByPk.mockRejectedValue(new Error('Database error'));

    await expect(deleteReservationByIdController('123')).rejects.toThrow(
      'Error al eliminar la reserva: Database error'
    );

    expect(Reservation.findByPk).toHaveBeenCalledWith('123');
  });

  test('🚫 should handle invalid reservation ID', async () => {
    await expect(deleteReservationByIdController()).rejects.toThrow(
      'Error al eliminar la reserva: ID inválido'
    );
    expect(Reservation.findByPk).not.toHaveBeenCalled();
  });

  test('🔥 should handle destroy method failure', async () => {
    const mockReservation = {
      id: '123',
      status: 'pendiente',
      destroy: jest.fn().mockRejectedValue(new Error('Destroy failed'))
    };

    Reservation.findByPk.mockResolvedValue(mockReservation);

    await expect(deleteReservationByIdController('123')).rejects.toThrow(
      'Error al eliminar la reserva: Destroy failed'
    );

    expect(Reservation.findByPk).toHaveBeenCalledWith('123');
    expect(mockReservation.destroy).toHaveBeenCalled();
  });
});
