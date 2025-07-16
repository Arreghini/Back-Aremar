const { DataTypes } = require('sequelize');

describe('DataTypes', () => {
  test('should have STRING type defined', () => {
    expect(DataTypes.STRING).toBeDefined();
  });

  test('should have INTEGER type defined', () => {
    expect(DataTypes.INTEGER).toBeDefined();
  });

  test('should have BOOLEAN type defined', () => {
    expect(DataTypes.BOOLEAN).toBeDefined();
  });

  test('should have DATE type defined', () => {
    expect(DataTypes.DATE).toBeDefined();
  });

  test('should have FLOAT type defined', () => {
    expect(DataTypes.FLOAT).toBeDefined();
  });

  test('should have TEXT type defined', () => {
    expect(DataTypes.TEXT).toBeDefined();
  });

  test('STRING should be a function', () => {
    expect(typeof DataTypes.STRING).toBe('function');
  });

  test('INTEGER should be a function', () => {
    expect(typeof DataTypes.INTEGER).toBe('function');
  });

  test('STRING should accept length parameter', () => {
    const stringType = DataTypes.STRING(255);
    expect(stringType).toBeDefined();
  });

  test('INTEGER should accept options parameter', () => {
    const integerType = DataTypes.INTEGER({ unsigned: true });
    expect(integerType).toBeDefined();
  });
});
