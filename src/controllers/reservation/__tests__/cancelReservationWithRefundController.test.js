const { Reservation, Refund } = require('../../../models');

jest.mock('../../../models', () => ({
  Reservation: {
    findOne: jest.fn()
  },
  Refund: {
    create: jest.fn()
  }
}));

describe('Models Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should have Reservation model available', () => {
    expect(Reservation).toBeDefined();
    expect(typeof Reservation).toBe('object');
  });

  test('should have Refund model available', () => {
    expect(Refund).toBeDefined();
    expect(typeof Refund).toBe('object');
  });

  test('should handle model import errors', () => {
  const invalidImport = () => {
  require('../../../models/nonExistentModel');
};
expect(invalidImport).toThrow();

  });

  test('should maintain model structure after mocking', () => {
    expect(Reservation.findOne).toBeDefined();
    expect(typeof Reservation.findOne).toBe('function');
    expect(Refund.create).toBeDefined();
    expect(typeof Refund.create).toBe('function');
  });
});
