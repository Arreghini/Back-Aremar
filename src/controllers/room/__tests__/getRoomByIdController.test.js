const { Room } = require('../../../models');
const getRoomByIdController = require('../getRoomByIdController');

jest.mock('../../../models');

const mockRoom = {
  id: '123',
  name: 'Test Room',
};

describe('getRoomByIdController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should find room by id successfully', async () => {
    Room.findByPk.mockResolvedValue(mockRoom);
    const result = await getRoomByIdController('123');
    expect(Room.findByPk).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockRoom);
  });

  test('should return null when room is not found', async () => {
    Room.findByPk.mockResolvedValue(null);
    const result = await getRoomByIdController('999');
    expect(Room.findByPk).toHaveBeenCalledWith('999');
    expect(result).toBeNull();
  });

  test('should handle database errors', async () => {
    const error = new Error('Database error');
    Room.findByPk.mockRejectedValue(error);
    await expect(getRoomByIdController('123')).rejects.toThrow('Database error');
    expect(Room.findByPk).toHaveBeenCalledWith('123');
  });

  test('should handle invalid id parameter (undefined)', async () => {
    await expect(getRoomByIdController(undefined)).rejects.toThrow('Room ID must be a string');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle empty string id', async () => {
    await expect(getRoomByIdController('')).rejects.toThrow('Room ID is required');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle null id parameter', async () => {
    await expect(getRoomByIdController(null)).rejects.toThrow('Room ID must be a string');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle undefined room properties', async () => {
    const incompleteRoom = { id: '123', name: 'Test Room' };
    Room.findByPk.mockResolvedValue(incompleteRoom);
    const result = await getRoomByIdController('123');
    expect(Room.findByPk).toHaveBeenCalledWith('123');
    expect(result).toEqual(incompleteRoom);
  });

  test('should handle non-string id parameter', async () => {
    await expect(getRoomByIdController(123)).rejects.toThrow('Room ID must be a string');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle whitespace-only id parameter', async () => {
    await expect(getRoomByIdController('   ')).rejects.toThrow('Room ID is required');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle special characters in id parameter', async () => {
    const specialCharRoom = { ...mockRoom, id: '@#$%' };
    Room.findByPk.mockResolvedValue(specialCharRoom);
    const result = await getRoomByIdController('@#$%');
    expect(Room.findByPk).toHaveBeenCalledWith('@#$%');
    expect(result).toEqual(specialCharRoom);
  });

  test('should handle very long id parameter', async () => {
    const longId = 'a'.repeat(1000);
    const longIdRoom = { ...mockRoom, id: longId };
    Room.findByPk.mockResolvedValue(longIdRoom);
    const result = await getRoomByIdController(longId);
    expect(Room.findByPk).toHaveBeenCalledWith(longId);
    expect(result).toEqual(longIdRoom);
  });

  test('should handle unicode characters in id parameter', async () => {
    const unicodeId = '🏠-123-😊';
    const unicodeRoom = { ...mockRoom, id: unicodeId };
    Room.findByPk.mockResolvedValue(unicodeRoom);
    const result = await getRoomByIdController(unicodeId);
    expect(Room.findByPk).toHaveBeenCalledWith(unicodeId);
    expect(result).toEqual(unicodeRoom);
  });

  test('should handle multiple consecutive spaces in id parameter', async () => {
    await expect(getRoomByIdController('   \n\t   ')).rejects.toThrow('Room ID is required');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle error with custom error message', async () => {
    const customError = new Error('Custom database connection error');
    customError.code = 'ECONNREFUSED';
    Room.findByPk.mockRejectedValue(customError);
    await expect(getRoomByIdController('123')).rejects.toThrow('Custom database connection error');
    expect(Room.findByPk).toHaveBeenCalledWith('123');
  });

  test('should handle object with toString method as id parameter', async () => {
    const objWithToString = {
      toString: () => '123',
    };
    await expect(getRoomByIdController(objWithToString)).rejects.toThrow('Room ID must be a string');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle array as id parameter', async () => {
    await expect(getRoomByIdController(['123'])).rejects.toThrow('Room ID must be a string');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle boolean as id parameter', async () => {
    await expect(getRoomByIdController(true)).rejects.toThrow('Room ID must be a string');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should handle Symbol as id parameter', async () => {
    await expect(getRoomByIdController(Symbol('123'))).rejects.toThrow('Room ID must be a string');
    expect(Room.findByPk).not.toHaveBeenCalled();
  });
});
test('should handle function as id parameter', async () => {
  const funcId = () => '123';
  await expect(getRoomByIdController(funcId)).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle BigInt as id parameter', async () => {
  await expect(getRoomByIdController(BigInt(123))).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle Date object as id parameter', async () => {
  await expect(getRoomByIdController(new Date())).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle RegExp object as id parameter', async () => {
  await expect(getRoomByIdController(/123/)).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle Map object as id parameter', async () => {
  await expect(getRoomByIdController(new Map())).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle Set object as id parameter', async () => {
  await expect(getRoomByIdController(new Set())).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle Promise as id parameter', async () => {
  await expect(getRoomByIdController(Promise.resolve('123'))).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle Error object as id parameter', async () => {
  await expect(getRoomByIdController(new Error('123'))).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle WeakMap as id parameter', async () => {
  await expect(getRoomByIdController(new WeakMap())).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle WeakSet as id parameter', async () => {
  await expect(getRoomByIdController(new WeakSet())).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle Infinity as id parameter', async () => {
  await expect(getRoomByIdController(Infinity)).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle NaN as id parameter', async () => {
  await expect(getRoomByIdController(NaN)).rejects.toThrow('Room ID must be a string');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle string with only newline characters', async () => {
  await expect(getRoomByIdController('\n\n\n')).rejects.toThrow('Room ID is required');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle string with only tab characters', async () => {
  await expect(getRoomByIdController('\t\t\t')).rejects.toThrow('Room ID is required');
  expect(Room.findByPk).not.toHaveBeenCalled();
});

test('should handle string with mixed whitespace characters', async () => {
  await expect(getRoomByIdController('\n\t \r')).rejects.toThrow('Room ID is required');
  expect(Room.findByPk).not.toHaveBeenCalled();
});
