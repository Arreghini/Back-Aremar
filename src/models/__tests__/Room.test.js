const { DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');

describe('DataTypes', () => {
  let sequelize;

  beforeEach(() => {
    sequelize = new Sequelize('sqlite::memory:');
  });

  test('should define STRING type correctly', () => {
    const stringType = DataTypes.STRING;
    expect(stringType).toBeDefined();
    expect(typeof stringType).toBe('function');
  });

  test('should define INTEGER type correctly', () => {
    const integerType = DataTypes.INTEGER;
    expect(integerType).toBeDefined();
    expect(typeof integerType).toBe('function');
  });

  test('should define BOOLEAN type correctly', () => {
    const booleanType = DataTypes.BOOLEAN;
    expect(booleanType).toBeDefined();
    expect(typeof booleanType).toBe('function');
  });

  test('should define DATE type correctly', () => {
    const dateType = DataTypes.DATE;
    expect(dateType).toBeDefined();
    expect(typeof dateType).toBe('function');
  });

 test('should allow type with options', () => {
  const stringWithOptions = DataTypes.STRING(255);
  expect(stringWithOptions).toBeDefined();
  expect(typeof stringWithOptions).toBe('object');  // Cambiado de 'function' a 'object'
});

  test('should handle null values for types', () => {
    const model = sequelize.define('TestModel', {
      field: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });
    expect(model.rawAttributes.field.allowNull).toBe(true);
  });

  test('should handle default values for types', () => {
    const model = sequelize.define('TestModel', {
      field: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    });
    expect(model.rawAttributes.field.defaultValue).toBe(true);
  });
});
