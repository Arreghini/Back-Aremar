const { Reservation } = require('../../../models');
const updateReservationByAdminController = require('../confirmedReservationByAdminController');

jest.mock('../../../models', () => ({
  Reservation: {
    findByPk: jest.fn()
  }
}));

describe('updateReservationByAdminController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReservation = {
    id: '123',
    status: 'pending',
    save: jest.fn()
  };

  const mockUpdatedData = {
    date: '2024-01-01',
    time: '10:00'
  };

  test('should update and confirm reservation successfully', async () => {
    mockReservation.save.mockResolvedValue({ ...mockReservation, ...mockUpdatedData, status: 'confirmed' });
    Reservation.findByPk.mockResolvedValue(mockReservation);

    const result = await updateReservationByAdminController('123', mockUpdatedData);

    expect(Reservation.findByPk).toHaveBeenCalledWith('123');
    expect(mockReservation.save).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: { ...mockReservation, ...mockUpdatedData, status: 'confirmed' },
      message: 'Reserva actualizada exitosamente'
    });
  });

  test('should throw error if reservation is not found', async () => {
    Reservation.findByPk.mockResolvedValue(null);

    await expect(updateReservationByAdminController('123', mockUpdatedData))
      .rejects
      .toThrow('Error al actualizar la reserva: Reserva no encontrada');
    
    expect(mockReservation.save).not.toHaveBeenCalled();
  });

  test('should handle database errors during update', async () => {
    Reservation.findByPk.mockResolvedValue(mockReservation);
    mockReservation.save.mockRejectedValue(new Error('Database error'));

    await expect(updateReservationByAdminController('123', mockUpdatedData))
      .rejects
      .toThrow('Error al actualizar la reserva: Database error');
  });

  test('should update reservation with empty update data', async () => {
    mockReservation.save.mockResolvedValue({ ...mockReservation, status: 'confirmed' });
    Reservation.findByPk.mockResolvedValue(mockReservation);

    const result = await updateReservationByAdminController('123', {});

    expect(result.data.status).toBe('confirmed');
    expect(mockReservation.save).toHaveBeenCalled();
  });

  test('should preserve existing fields while updating status', async () => {
    const fullReservation = {
      ...mockReservation,
      customerName: 'John Doe',
      serviceType: 'haircut',
      save: jest.fn()
    };
    
    fullReservation.save.mockResolvedValue({ ...fullReservation, status: 'confirmed' });
    Reservation.findByPk.mockResolvedValue(fullReservation);

    const result = await updateReservationByAdminController('123', mockUpdatedData);

    expect(result.data.customerName).toBe('John Doe');
    expect(result.data.serviceType).toBe('haircut');
    expect(result.data.status).toBe('confirmed');
  });
});
