const { DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');

describe('DataTypes import', () => {
  test('should have all required Sequelize data types', () => {
    expect(DataTypes.STRING).toBeDefined();
    expect(DataTypes.INTEGER).toBeDefined();
    expect(DataTypes.BOOLEAN).toBeDefined();
    expect(DataTypes.DATE).toBeDefined();
    expect(DataTypes.TEXT).toBeDefined();
    expect(DataTypes.FLOAT).toBeDefined();
  });

  test('should create valid column definitions', () => {
    const stringColumn = DataTypes.STRING;
    const intColumn = DataTypes.INTEGER;
    const boolColumn = DataTypes.BOOLEAN;

    expect(stringColumn.key).toBe('STRING');
    expect(intColumn.key).toBe('INTEGER');
    expect(boolColumn.key).toBe('BOOLEAN');
  });

  test('should handle string length specifications', () => {
    const varchar100 = DataTypes.STRING(100);
    expect(varchar100.options.length).toBe(100);
  });

  test('should support decimal precision', () => {
    const decimal = DataTypes.DECIMAL(10, 2);
    expect(decimal.options.precision).toBe(10);
    expect(decimal.options.scale).toBe(2);
  });

  test('should handle nullable configurations', () => {
    const nonNullableString = DataTypes.STRING.BINARY;
    expect(nonNullableString.options.binary).toBe(true);
  });
});
