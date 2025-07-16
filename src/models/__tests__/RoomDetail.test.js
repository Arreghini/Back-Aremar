const { DataTypes } = require('sequelize');

describe('DataTypes from Sequelize', () => {
  test('should export DataTypes object', () => {
    expect(DataTypes).toBeDefined();
    expect(typeof DataTypes).toBe('object');
  });

  test('should contain common data type definitions', () => {
    expect(DataTypes.STRING).toBeDefined();
    expect(DataTypes.INTEGER).toBeDefined();
    expect(DataTypes.BOOLEAN).toBeDefined();
    expect(DataTypes.DATE).toBeDefined();
  });

  test('should have string type variations', () => {
    expect(DataTypes.STRING.key).toBe('STRING');
    expect(DataTypes.TEXT.key).toBe('TEXT');
    expect(DataTypes.CHAR.key).toBe('CHAR');
  });

  test('should have numeric type variations', () => {
    expect(DataTypes.INTEGER.key).toBe('INTEGER');
    expect(DataTypes.FLOAT.key).toBe('FLOAT');
    expect(DataTypes.DECIMAL.key).toBe('DECIMAL');
  });

  test('should have date/time type variations', () => {
    expect(DataTypes.DATE.key).toBe('DATE');
    expect(DataTypes.TIME.key).toBe('TIME');
    expect(DataTypes.DATEONLY.key).toBe('DATEONLY');
  });
});
