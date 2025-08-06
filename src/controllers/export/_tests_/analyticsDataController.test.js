jest.mock('../../../models');
jest.mock('dayjs');

const analytics = require('../analyticsDataController');
const { Reservation, Room, RoomType, User } = require('../../../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

describe('analyticsDataController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAnalyticsData', () => {
    it('devuelve datos analíticos por habitación', async () => {
      Room.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      Reservation.sum.mockResolvedValue(1000);
      Reservation.findAll.mockResolvedValue([
        { checkIn: '2025-01-01', checkOut: '2025-01-03' }
      ]);
      Reservation.count.mockResolvedValue(2);

      const result = await analytics.getAnalyticsData('2025-01-01', '2025-01-10');

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('roomId');
      expect(result[0]).toHaveProperty('income');
      expect(result[0]).toHaveProperty('freeDays');
      expect(result[0]).toHaveProperty('occupiedDays');
      expect(result[0]).toHaveProperty('totalDays');
      expect(result[0]).toHaveProperty('occupancy');
      expect(result[0]).toHaveProperty('sumReservations');
    });
  });

  describe('getDailyRoomOccupancy', () => {
    it('devuelve ocupación diaria de habitaciones', async () => {
      Room.findAll.mockResolvedValue([{ id: 1 }]);
      Reservation.findAll.mockResolvedValue([
        { roomId: 1, checkIn: '2025-01-01', checkOut: '2025-01-03' }
      ]);

      // Mock básico de dayjs para simular fechas
      const fakeDayjs = (date) => {
        let d = new Date(date);
        return {
          format: () => d.toISOString().slice(0, 10),
          isSameOrBefore: (other) => d <= new Date(other),
          isSameOrAfter: (other) => d >= new Date(other),
          isBefore: (other) => d < new Date(other),
          add: (n, unit) => fakeDayjs(new Date(d.getTime() + n * 86400000)),
          valueOf: () => d.valueOf(),
        };
      };
      dayjs.mockImplementation(fakeDayjs);

      const result = await analytics.getDailyRoomOccupancy('2025-01-01', '2025-01-03');

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('roomId');
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('status');
    });
  });

  describe('getMonthlyOccupancy', () => {
    it('devuelve ocupación mensual', async () => {
      Room.findAll.mockResolvedValue([{ id: 1 }]);
      Reservation.sum.mockResolvedValue(500);
      Reservation.findAll.mockResolvedValue([
        { checkIn: '2025-01-01', checkOut: '2025-01-03' }
      ]);
      Reservation.count.mockResolvedValue(1);

      const result = await analytics.getMonthlyOccupancy(2025, 1);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('roomId');
      expect(result[0]).toHaveProperty('income');
      expect(result[0]).toHaveProperty('freeDays');
      expect(result[0]).toHaveProperty('sumReservations');
    });
  });

 describe('getRevenueByRoomType', () => {
 it('devuelve ingresos por tipo de habitación', async () => {
 // Reemplazar completamente la función para garantizar que funcione
 Room.findAll = jest.fn().mockResolvedValue([
 {
 id: 1,
   roomType: { name: 'Deluxe' },
 },
 {
 id: 2,
   roomType: { name: 'Standard' },
   },
    ]);

   Reservation.findAll.mockImplementation((options = {}) => {
  const where = options.where || {};
  const ids = where.roomId?.[Op.in] || [];
      if (ids.includes(1)) {
        return Promise.resolve([
          { checkIn: '2025-01-10', checkOut: '2025-01-15' },
        ]);
      }
      if (ids.includes(2)) {
        return Promise.resolve([
          { checkIn: '2025-01-05', checkOut: '2025-01-08' },
        ]);
      }
      return Promise.resolve([]);
    });

    Reservation.sum.mockImplementation((field, { where } = {}) => {
      if (!where) return 0;
      const ids = where.roomId?.[Op.in] || [];
      if (ids.includes(1)) return 500;
      if (ids.includes(2)) return 800;
      return 0;
    });

    Reservation.count.mockImplementation(({ where }) => {
      const ids = where.roomId?.[Op.in] || [];
      if (ids.includes(1)) return 1;
      if (ids.includes(2)) return 2;
      return 0;
    });

    const result = await analytics.getRevenueByRoomType('2025-01-01', '2025-01-31');

    expect(Array.isArray(result)).toBe(true);
    const types = result.map((r) => r.roomType);
    expect(types).toContain('Deluxe');
    expect(types).toContain('Standard');

    for (const r of result) {
      expect(r).toHaveProperty('income');
      expect(r).toHaveProperty('freeDays');
      expect(r).toHaveProperty('sumReservations');
    }
  });
});

  describe('getFrequentCustomers', () => {
    it('devuelve clientes frecuentes', async () => {
      Reservation.findAll.mockResolvedValue([
        {
          user: { id: 1, name: 'Juan', email: 'juan@mail.com' },
          totalPrice: 100,
        },
        {
          user: { id: 1, name: 'Juan', email: 'juan@mail.com' },
          totalPrice: 200,
        },
        {
          user: { id: 2, name: 'Ana', email: 'ana@mail.com' },
          totalPrice: 300,
        },
      ]);

      const result = await analytics.getFrequentCustomers('2025-01-01', '2025-01-10');

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('reservationCount');
      expect(result[0]).toHaveProperty('totalPrice');
      expect(result[0].reservationCount).toBeGreaterThanOrEqual(1);
    });
  });
});
