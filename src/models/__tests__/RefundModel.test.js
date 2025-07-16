const { DataTypes } = require('sequelize');

// Mock más específico para Sequelize DataTypes
jest.mock('sequelize', () => ({
  DataTypes: {
    STRING: jest.fn((length) => `STRING(${length || 255})`),
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    DECIMAL: jest.fn((precision, scale) => `DECIMAL(${precision},${scale})`),
    TEXT: 'TEXT',
    ENUM: jest.fn((...values) => `ENUM(${values.join(',')})`),
  },
}));

describe('DataTypes Import', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should have DataTypes defined', () => {
    expect(DataTypes).toBeDefined();
  });

  test('should contain common Sequelize data types', () => {
    expect(DataTypes.STRING).toBeDefined();
    expect(DataTypes.INTEGER).toBeDefined();
    expect(DataTypes.BOOLEAN).toBeDefined();
    expect(DataTypes.DATE).toBeDefined();
  });

  test('should handle data type options', () => {
    const stringWithLength = DataTypes.STRING(255);
    expect(stringWithLength).toBeDefined();
    expect(DataTypes.STRING).toHaveBeenCalledWith(255);
  });

  test('should support decimal types', () => {
    const decimalType = DataTypes.DECIMAL(10, 2);
    expect(decimalType).toBeDefined();
    expect(DataTypes.DECIMAL).toHaveBeenCalledWith(10, 2);
  });

  test('should support text type', () => {
    expect(DataTypes.TEXT).toBeDefined();
  });

  test('should support enum type', () => {
    const enumType = DataTypes.ENUM('value1', 'value2');
    expect(enumType).toBeDefined();
    expect(DataTypes.ENUM).toHaveBeenCalledWith('value1', 'value2');
  });
});
