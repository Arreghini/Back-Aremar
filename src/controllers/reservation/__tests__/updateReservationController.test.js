// __tests__/updateReservationController.test.js

const { Reservation, Room } = require('../../../models');
const updateReservationController = require('../updateReservationController');
const { processRefund } = require('../../../services/refundService');

// Mock MercadoPago
jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
  Preference: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
}));

jest.mock('../../../models', () => ({
  Reservation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Room: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../../services/refundService', () => ({
  processRefund: jest.fn(),
}));

// Mock console.error
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
  // Mock environment variables
  process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-token';
  process.env.CLOUDFLARED_URL = 'https://test.com';
});

afterEach(() => {
  consoleErrorSpy.mockClear();
});

describe('updateReservationController', () => {
  const mockRoom = { id: 1, price: 100 };
  const mockReservation = {
    id: 1,
    checkIn: '2024-07-20',
    checkOut: '2024-07-25',
    totalPrice: 500,
    amountPaid: 500,
    paymentId: 'paymentOld',
    update: jest.fn(),
  };

  describe('Validaciones básicas', () => {
    test('should throw error if roomId is missing', async () => {
      await expect(updateReservationController(1, { checkIn: '2024-08-01' })).rejects.toThrow(
        'El campo roomId es obligatorio.'
      );
    });

    test('should throw error if room not found', async () => {
      Room.findOne.mockResolvedValue(null);

      await expect(updateReservationController(1, { roomId: 99 })).rejects.toThrow(
        'No se encontró la habitación con id 99'
      );
    });

    test('should throw error if reservation not found', async () => {
      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(null);

      await expect(updateReservationController(1, { roomId: 1 })).rejects.toThrow(
        'No se encontró la reserva con id 1'
      );
    });
  });

  describe('Verificación de solapamiento de reservas', () => {
    test('should return error if room is booked in given dates', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-08-01',
        checkOut: '2024-08-10',
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      const overlappingReservation = [{ id: 2 }];

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue(overlappingReservation);

      const result = await updateReservationController(1, dataToUpdate);

      expect(result.success).toBe(false);
      expect(result.mensaje).toBe('La habitación ya está reservada en esas fechas.');
      expect(result.data).toBeNull();
    });

    test('should proceed when no overlapping reservations', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-08-01',
        checkOut: '2024-08-03',
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 200,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(result.success).toBe(true);
      expect(result.mensaje).toBe('Reserva actualizada exitosamente');
    });
  });

  describe('Cálculo de precios y días', () => {
    test('should calculate total price correctly for same number of days', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-25', // Same 5 days
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 500,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(result.success).toBe(true);
      expect(result.mensaje).toBe('Reserva actualizada exitosamente');
    });

    test('should calculate total price when original days is 0', async () => {
      const reservationWithZeroDays = {
        ...mockReservation,
        checkIn: '2024-07-20',
        checkOut: '2024-07-20', // 0 days
        totalPrice: 0,
      };

      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-08-01',
        checkOut: '2024-08-03', // 2 days
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 200,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(reservationWithZeroDays);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(result.success).toBe(true);
    });
  });

  describe('Reembolso parcial', () => {
    test('should process partial refund when days are reduced', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-22', // Reduced from 5 to 2 days
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });
      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 200,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(processRefund).toHaveBeenCalledWith({
        reservationId: 1,
        paymentId: 'paymentOld',
        amount: 300, // 3 days * 100
        reason: 'Reembolso parcial por cambio de fechas',
      });
      expect(result.success).toBe(true);
      expect(result.mensaje).toContain('con reembolso de $300.00');
    });

    test('should throw error if refund fails', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-22',
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      processRefund.mockResolvedValue({ success: false, mensaje: 'Error en reembolso' });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      await expect(updateReservationController(1, dataToUpdate)).rejects.toThrow(
        'Error en reembolso'
      );
    });

    test('should not process refund when new price is not less than amount paid', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-22',
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      const reservationWithLowAmountPaid = {
        ...mockReservation,
        amountPaid: 100, // Less than new total price
      };

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 200,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(reservationWithLowAmountPaid);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(processRefund).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.mensaje).toBe('Reserva actualizada exitosamente');
    });
  });

  describe('Pago adicional', () => {
    test('should create payment preference when days are increased', async () => {
      const { Preference } = require('mercadopago');
      const mockPreference = {
        create: jest.fn().mockResolvedValue({
          id: 'pref123',
          init_point: 'https://payment.link',
        }),
      };
      Preference.mockImplementation(() => mockPreference);

      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-30', // Increased from 5 to 10 days
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 1000,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(mockPreference.create).toHaveBeenCalledWith({
        body: {
          items: [
            {
              title: 'Reserva en habitación 1',
              description: 'Días adicionales: 5',
              quantity: 1,
              currency_id: 'ARS',
              unit_price: 500,
            },
          ],
          back_urls: {
            success: 'https://test.com/api/payment/redirect?status=approved&reservationId=1',
            failure: 'https://test.com/api/payment/redirect?status=failure&reservationId=1',
            pending: 'https://test.com/api/payment/redirect?status=pending&reservationId=1',
          },
          auto_return: 'approved',
        },
      });
      expect(result.success).toBe(true);
      expect(result.mensaje).toContain('Se requiere un pago adicional de $500.00');
      expect(result.data.paymentLink).toBe('https://payment.link');
    });

    test('should throw error if payment preference creation fails', async () => {
      const { Preference } = require('mercadopago');
      const mockPreference = {
        create: jest.fn().mockResolvedValue({}), // No id or init_point
      };
      Preference.mockImplementation(() => mockPreference);

      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-30',
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      await expect(updateReservationController(1, dataToUpdate)).rejects.toThrow(
        'No se recibió un ID de preferencia de pago'
      );
    });

    test('should not create payment preference when no additional payment needed', async () => {
      const { Preference } = require('mercadopago');
      const mockPreference = {
        create: jest.fn(),
      };
      Preference.mockImplementation(() => mockPreference);

      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-25', // Same days
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 500,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(mockPreference.create).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.mensaje).toBe('Reserva actualizada exitosamente');
      expect(result.data.paymentLink).toBeUndefined();
    });

    test('should handle when amountPaid is undefined', async () => {
      const { Preference } = require('mercadopago');
      const mockPreference = {
        create: jest.fn().mockResolvedValue({
          id: 'pref123',
          init_point: 'https://payment.link',
        }),
      };
      Preference.mockImplementation(() => mockPreference);

      const reservationWithoutAmountPaid = {
        ...mockReservation,
        amountPaid: undefined,
      };

      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-30',
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 1000,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(reservationWithoutAmountPaid);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(result.success).toBe(true);
      expect(result.mensaje).toContain('Se requiere un pago adicional de $1000.00');
    });
  });

  describe('Actualización de reserva', () => {
    test('should update reservation with correct fields', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-08-01',
        checkOut: '2024-08-03',
        numberOfGuests: 2,
        status: 'CONFIRMED', // Should be converted to lowercase
        paymentId: 'payment123',
      };

      const updatedReservation = {
        ...dataToUpdate,
        totalPrice: 200,
        status: 'confirmed',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue(updatedReservation);

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(mockReservation.update).toHaveBeenCalledWith(
        {
          paymentId: 'payment123',
          checkIn: '2024-08-01',
          checkOut: '2024-08-03',
          numberOfGuests: 2,
          roomId: 1,
          status: 'confirmed',
          totalPrice: 200,
        },
        {
          fields: [
            'paymentId',
            'checkIn',
            'checkOut',
            'numberOfGuests',
            'roomId',
            'status',
            'totalPrice',
          ],
        }
      );
      expect(result.success).toBe(true);
      expect(result.data.reservation).toEqual(updatedReservation);
    });

    test('should handle string numberOfGuests', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-08-01',
        checkOut: '2024-08-03',
        numberOfGuests: '3', // String instead of number
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        numberOfGuests: 3,
        totalPrice: 200,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(mockReservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          numberOfGuests: 3, // Should be parsed to number
        }),
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Manejo de errores', () => {
    test('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Room.findOne.mockRejectedValue(error);

      await expect(updateReservationController(1, { roomId: 1 })).rejects.toThrow(
        'Error al actualizar la reserva: Database connection failed'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al actualizar la reserva:', error.message);
    });

    test('should handle MercadoPago API errors', async () => {
      const { Preference } = require('mercadopago');
      const mockPreference = {
        create: jest.fn().mockRejectedValue(new Error('MercadoPago API error')),
      };
      Preference.mockImplementation(() => mockPreference);

      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-30',
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      await expect(updateReservationController(1, dataToUpdate)).rejects.toThrow(
        'Error al actualizar la reserva: MercadoPago API error'
      );
    });

    test('should handle refund service errors', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-22',
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      processRefund.mockRejectedValue(new Error('Refund service unavailable'));

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      await expect(updateReservationController(1, dataToUpdate)).rejects.toThrow(
        'Error al actualizar la reserva: Refund service unavailable'
      );
    });
  });

  describe('Casos edge', () => {
    test('should handle same check-in and check-out dates', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20',
        checkOut: '2024-07-20', // Same day
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 100,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(result.success).toBe(true);
    });

    test('should handle very short date ranges', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-20T10:00:00Z',
        checkOut: '2024-07-20T18:00:00Z', // Same day, different times
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 100,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(result.success).toBe(true);
    });

    test('should handle large date ranges', async () => {
      const dataToUpdate = {
        roomId: 1,
        checkIn: '2024-07-01',
        checkOut: '2024-08-31', // 61 days
        numberOfGuests: 2,
        status: 'confirmed',
        paymentId: 'payment123',
      };

      // Reset processRefund mock for this test
      processRefund.mockReset();
      processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

      mockReservation.update.mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 6100,
      });

      Room.findOne.mockResolvedValue(mockRoom);
      Reservation.findOne.mockResolvedValue(mockReservation);
      Reservation.findAll.mockResolvedValue([]);

      const result = await updateReservationController(1, dataToUpdate);

      expect(result.success).toBe(true);
    });
  });
});
