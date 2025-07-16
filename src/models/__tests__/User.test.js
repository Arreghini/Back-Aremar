const { DataTypes } = require('sequelize');

describe('DataTypes', () => {
  test('should export expected Sequelize data types', () => {
    expect(DataTypes.STRING).toBeDefined();
    expect(DataTypes.INTEGER).toBeDefined();
    expect(DataTypes.BOOLEAN).toBeDefined();
    expect(DataTypes.DATE).toBeDefined();
  });

  test('should have correct type for STRING', () => {
    const stringType = DataTypes.STRING;
    expect(stringType.key).toBe('STRING');
  });

  test('should allow STRING with length specification', () => {
    const stringType = DataTypes.STRING(100);
    expect(stringType.options.length).toBe(100);
  });

  test('should have correct type for INTEGER', () => {
    const intType = DataTypes.INTEGER;
    expect(intType.key).toBe('INTEGER');
  });

  test('should support unsigned integers', () => {
    const unsigned = DataTypes.INTEGER.UNSIGNED;
    expect(unsigned._unsigned).toBe(true);
  });

  test('should handle BOOLEAN type correctly', () => {
    const boolType = DataTypes.BOOLEAN;
    expect(boolType.key).toBe('BOOLEAN');
  });

});
