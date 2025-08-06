const { getSoldVsUnsoldByDay } = require('../analyticsGraphController');
const { Reservation, Room } = require('../../../models');
const dayjs = require('dayjs');

jest.mock('../../../models');
jest.mock('dayjs');

describe('getSoldVsUnsoldByDay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calcula ingresos vendidos y no vendidos por día', async () => {
    // Mock de habitaciones
    Room.findAll = jest.fn().mockResolvedValue([
      { id: 1, price: 100 },
      { id: 2, price: 200 }
    ]);
    // Mock de reservas
    Reservation.findAll = jest.fn().mockResolvedValue([
      { roomId: 1, checkIn: '2025-01-01', checkOut: '2025-01-03', totalPrice: 200 }
    ]);
    // Mock de dayjs para simular avance de fechas
    const fakeDayjs = (date) => {
      let d = new Date(date);
      return {
        format: () => d.toISOString().slice(0, 10),
        isSameOrBefore: (other) => d <= new Date(other),
        isSameOrAfter: (other) => d >= new Date(other),
        isBefore: (other) => d < new Date(other),
        diff: (other, unit) => {
          if (unit === 'day') {
            return Math.floor((d - new Date(other)) / (1000 * 60 * 60 * 24));
          }
          return 0;
        },
        add: (n, unit) => fakeDayjs(new Date(d.getTime() + n * 24 * 60 * 60 * 1000)),
        valueOf: () => d.valueOf(),
      };
    };
    dayjs.mockImplementation(fakeDayjs);

    const result = await getSoldVsUnsoldByDay('2025-01-01', '2025-01-03');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('sold');
    expect(result[0]).toHaveProperty('unsold');
    // El primer día debe tener ingresos vendidos y no vendidos calculados
    expect(typeof result[0].sold).toBe('number');
    expect(typeof result[0].unsold).toBe('number');
  });

  it('devuelve 0 vendidos y suma de precios como no vendidos si no hay reservas', async () => {
    // Configurar mocks antes de llamar a la función
    Room.findAll = jest.fn().mockResolvedValue([
      { id: 1, price: 100 },
      { id: 2, price: 200 }
    ]);
    Reservation.findAll = jest.fn().mockResolvedValue([]);
    
    const fakeDayjs = (date) => {
      let d = new Date(date);
      return {
        format: () => d.toISOString().slice(0, 10),
        isSameOrBefore: (other) => d <= new Date(other),
        isSameOrAfter: (other) => d >= new Date(other),
        isBefore: (other) => d < new Date(other),
        diff: (other, unit) => 1,
        add: (n, unit) => fakeDayjs(new Date(d.getTime() + n * 24 * 60 * 60 * 1000)),
        valueOf: () => d.valueOf(),
      };
    };
    dayjs.mockImplementation(fakeDayjs);

    const result = await getSoldVsUnsoldByDay('2025-01-01', '2025-01-01');
    expect(result[0].sold).toBe(0);
    expect(result[0].unsold).toBe(300); // promedio de precios (100+200)/2 * 2 habitaciones libres = 150 * 2
  });
});